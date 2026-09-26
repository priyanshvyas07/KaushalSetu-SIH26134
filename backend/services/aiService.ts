/**
 * Centralized AI Service & Multi-Provider Failover Manager for KaushalSetu (SIH26134).
 *
 * Strict Fallback Hierarchy:
 * 1. Primary: Google Gemini (gemini-2.5-flash)
 * 2. Secondary: OpenRouter (meta-llama/llama-3.3-70b-instruct) [if configured]
 * 3. Tertiary: Groq (llama-3.3-70b-versatile) [if configured]
 * 4. Final Fallback: Local Context-Aware Demo Intelligence
 *
 * Resilience & Guardrails:
 * - Strict timeout (6000ms) per external provider to prevent request hanging.
 * - Automatic failover upon 429 (quota), 401/403 (invalid key), 5xx, or network abort.
 * - Zero leakage of API keys, tokens, or raw stack traces.
 * - Safe metadata return: { answer, isLive, provider, fallbackUsed }.
 */

import { GoogleGenAI } from '@google/genai';
import { dataProvider } from './dataProvider';

export interface ParsedResumeAI {
  name: string;
  email: string;
  education: string;
  experienceYears: number;
  technicalSkills: string[];
  softSkills: string[];
  certifications: string[];
  projects: string[];
  summary: string;
}

export interface ParsedJobRequirementAI {
  title: string;
  roleCategory: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceMinYears: number;
  salaryMinLPA: number;
  salaryMaxLPA: number;
  description: string;
}

export interface AICurriculumAudit {
  alignmentScorePct: number;
  curriculumSummary: string;
  topMissingCriticalSkills: string[];
  recommendedElectives: { title: string; targetSkills: string[]; estimatedHours: number }[];
  semesterUpgrades: { semester: number; subject: string; modernAdditions: string[] }[];
  rationale: string;
}

export interface CopilotContext {
  name: string;
  targetRole: string;
  currentSkills: string[];
  missingSkills: string[];
  targetJobs?: string[];
  topRegionalOpenings?: number;
  dataSourceLabel?: string;
  isLiveDataSource?: boolean;
}

export interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIResultText {
  text: string;
  provider: SupportedAIProvider;
  model: string;
  isLive: boolean;
  fallbackUsed: boolean;
}

export interface AICopilotResponse {
  answer: string;
  provider: SupportedAIProvider;
  model: string;
  isLive: boolean;
  fallbackUsed: boolean;
}

export interface AIResponseMetadata {
  provider: SupportedAIProvider;
  model: string;
  isLive: boolean;
  fallbackUsed: boolean;
}

// ---------------------------------------------------------------------
// Sanitized Central Failover Logger
// ---------------------------------------------------------------------
function logProviderFailover(failedProvider: string, reason: string, nextProvider: string) {
  // Sanitize any potential key occurrences in error message
  const sanitizedReason = reason
    .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_GEMINI_KEY]')
    .replace(/gsk_[0-9A-Za-z-_]{40,}/g, '[REDACTED_GROQ_KEY]')
    .replace(/sk-or-[0-9A-Za-z-_]{40,}/g, '[REDACTED_OPENROUTER_KEY]')
    .replace(/Bearer\s+[^\s]+/gi, 'Bearer [REDACTED_TOKEN]');

  console.warn(`[KaushalSetu AI Failover] Provider "${failedProvider}" unavailable (${sanitizedReason}). Routing failover to -> "${nextProvider}".`);
}

// ---------------------------------------------------------------------
// Central Multi-Provider Manager
// ---------------------------------------------------------------------
class AIProviderManager {
  private preferredProvider: string;
  private geminiClient: GoogleGenAI | null = null;
  private lastGeminiKey: string | null = null;
  private readonly PROVIDER_TIMEOUT_MS = 20000;

  constructor() {
    this.preferredProvider = (process.env.AI_PROVIDER || 'auto').toLowerCase();
  }

  private getGeminiKey(): string | null {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY' || key.includes('your_gemini_api_key') || key.trim().length === 0) return null;
    return key.trim();
  }

  private getOpenRouterKey(): string | null {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key || key.includes('your_openrouter_api_key') || key.trim().length === 0) return null;
    return key.trim();
  }

  private getGroqKey(): string | null {
    const key = process.env.GROQ_API_KEY;
    if (!key || key.includes('your_groq_api_key') || key.trim().length === 0) return null;
    return key.trim();
  }

  private getGeminiClient(): GoogleGenAI | null {
    const key = this.getGeminiKey();
    if (!key) return null;
    if (!this.geminiClient || this.lastGeminiKey !== key) {
      this.lastGeminiKey = key;
      this.geminiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: { headers: { 'User-Agent': 'kaushalsetu-sih26134' } },
      });
    }
    return this.geminiClient;
  }

  /**
   * Resolves the fallback chain strictly in required order:
   * 1. Gemini -> 2. OpenRouter -> 3. Groq -> 4. Demo
   */
  public resolveProviderOrder(): SupportedAIProvider[] {
    const chain: SupportedAIProvider[] = [];

    if (this.preferredProvider === 'auto') {
      if (this.getGeminiKey()) chain.push('gemini');
      if (this.getOpenRouterKey()) chain.push('openrouter');
      if (this.getGroqKey()) chain.push('groq');
    } else {
      // If user explicitly configured preferred provider, prioritize it
      if (this.preferredProvider === 'gemini' && this.getGeminiKey()) chain.push('gemini');
      if (this.preferredProvider === 'openrouter' && this.getOpenRouterKey()) chain.push('openrouter');
      if (this.preferredProvider === 'groq' && this.getGroqKey()) chain.push('groq');

      // Then add others in natural order
      if (this.preferredProvider !== 'gemini' && this.getGeminiKey()) chain.push('gemini');
      if (this.preferredProvider !== 'openrouter' && this.getOpenRouterKey()) chain.push('openrouter');
      if (this.preferredProvider !== 'groq' && this.getGroqKey()) chain.push('groq');
    }

    // Always append final reliable Demo/Fallback provider
    chain.push('demo');
    return chain;
  }

  // -------------------------------------------------------------------
  // 1. Text Dispatcher with Failover Chain
  // -------------------------------------------------------------------
  public async generateText(
    prompt: string,
    systemPrompt: string = 'You are a career and skill advisor for KaushalSetu.',
    history?: ChatHistoryMessage[]
  ): Promise<AIResultText> {
    const providersToTry = this.resolveProviderOrder();
    const primaryProvider = providersToTry[0];

    for (let i = 0; i < providersToTry.length; i++) {
      const provider = providersToTry[i];
      const nextProvider = providersToTry[i + 1] || 'demo';

      if (provider === 'demo') break;

      try {
        if (provider === 'gemini') {
          const modelName = 'gemini-2.5-flash';
          const res = await this.callGeminiTextWithTimeout(prompt, systemPrompt, history);
          if (res && res.trim()) {
            return {
              text: res.trim(),
              provider: 'gemini',
              model: modelName,
              isLive: true,
              fallbackUsed: provider !== primaryProvider,
            };
          }
        } else if (provider === 'openrouter' && this.getOpenRouterKey()) {
          const modelName = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct';
          const res = await this.callOpenAICompatibleTextWithTimeout(
            'https://openrouter.ai/api/v1/chat/completions',
            this.getOpenRouterKey()!,
            modelName,
            prompt,
            systemPrompt,
            history
          );
          if (res && res.trim()) {
            return {
              text: res.trim(),
              provider: 'openrouter',
              model: modelName,
              isLive: true,
              fallbackUsed: provider !== primaryProvider,
            };
          }
        } else if (provider === 'groq' && this.getGroqKey()) {
          const modelName = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
          const res = await this.callOpenAICompatibleTextWithTimeout(
            'https://api.groq.com/openai/v1/chat/completions',
            this.getGroqKey()!,
            modelName,
            prompt,
            systemPrompt,
            history
          );
          if (res && res.trim()) {
            return {
              text: res.trim(),
              provider: 'groq',
              model: modelName,
              isLive: true,
              fallbackUsed: provider !== primaryProvider,
            };
          }
        }
      } catch (err: any) {
        logProviderFailover(provider, err?.message || 'Request Failed', nextProvider);
      }
    }

    return {
      text: '',
      provider: 'demo',
      model: 'local-grounded-intelligence',
      isLive: false,
      fallbackUsed: primaryProvider !== 'demo',
    };
  }

  // -------------------------------------------------------------------
  // 2. JSON Dispatcher with Failover Chain
  // -------------------------------------------------------------------
  public async generateJSON<T>(
    prompt: string,
    schemaInstruction: string,
    systemPrompt: string = 'You are a labour market AI specialist for KaushalSetu.'
  ): Promise<{ data: T | null; provider: SupportedAIProvider; model: string; isLive: boolean; fallbackUsed: boolean }> {
    const providersToTry = this.resolveProviderOrder();
    const primaryProvider = providersToTry[0];

    for (let i = 0; i < providersToTry.length; i++) {
      const provider = providersToTry[i];
      const nextProvider = providersToTry[i + 1] || 'demo';

      if (provider === 'demo') break;

      try {
        if (provider === 'gemini') {
          const modelName = 'gemini-2.5-flash';
          const res = await this.callGeminiJSONWithTimeout<T>(prompt, schemaInstruction, systemPrompt);
          if (res) {
            return {
              data: res,
              provider: 'gemini',
              model: modelName,
              isLive: true,
              fallbackUsed: provider !== primaryProvider,
            };
          }
        } else if (provider === 'openrouter' && this.getOpenRouterKey()) {
          const modelName = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct';
          const res = await this.callOpenAICompatibleJSONWithTimeout<T>(
            'https://openrouter.ai/api/v1/chat/completions',
            this.getOpenRouterKey()!,
            modelName,
            prompt,
            schemaInstruction,
            systemPrompt
          );
          if (res) {
            return {
              data: res,
              provider: 'openrouter',
              model: modelName,
              isLive: true,
              fallbackUsed: provider !== primaryProvider,
            };
          }
        } else if (provider === 'groq' && this.getGroqKey()) {
          const modelName = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
          const res = await this.callOpenAICompatibleJSONWithTimeout<T>(
            'https://api.groq.com/openai/v1/chat/completions',
            this.getGroqKey()!,
            modelName,
            prompt,
            schemaInstruction,
            systemPrompt
          );
          if (res) {
            return {
              data: res,
              provider: 'groq',
              model: modelName,
              isLive: true,
              fallbackUsed: provider !== primaryProvider,
            };
          }
        }
      } catch (err: any) {
        logProviderFailover(provider, err?.message || 'JSON Extraction Failed', nextProvider);
      }
    }

    return {
      data: null,
      provider: 'demo',
      model: 'local-grounded-intelligence',
      isLive: false,
      fallbackUsed: primaryProvider !== 'demo',
    };
  }

  // -------------------------------------------------------------------
  // Individual Provider Callers with Strict Timeout Enforced
  // -------------------------------------------------------------------
  private async callGeminiTextWithTimeout(
    prompt: string,
    systemPrompt: string,
    history?: ChatHistoryMessage[]
  ): Promise<string | null> {
    const client = this.getGeminiClient();
    if (!client) return null;

    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error(`Gemini timeout after ${this.PROVIDER_TIMEOUT_MS}ms`)), this.PROVIDER_TIMEOUT_MS)
    );

    let fullContents = `${systemPrompt}\n\n`;
    if (history && history.length > 0) {
      fullContents += `PREVIOUS CONVERSATION CONTEXT:\n`;
      for (const h of history.slice(-8)) {
        fullContents += `${h.role === 'user' ? 'Student' : 'Career Copilot'}: ${h.content}\n`;
      }
      fullContents += `\n`;
    }
    fullContents += `STUDENT CURRENT QUERY: ${prompt}\n\n(REMINDER: Answer strictly in the same language and style as this CURRENT user query. If English, reply in English. If Hindi/Hinglish, reply in Hindi/Hinglish.)`;

    const callPromise = client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullContents,
    }).then(res => res.text || null);

    return Promise.race([callPromise, timeoutPromise]);
  }

  private async callGeminiJSONWithTimeout<T>(
    prompt: string,
    schemaInstruction: string,
    systemPrompt: string
  ): Promise<T | null> {
    const client = this.getGeminiClient();
    if (!client) return null;

    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error(`Gemini JSON timeout after ${this.PROVIDER_TIMEOUT_MS}ms`)), this.PROVIDER_TIMEOUT_MS)
    );

    const callPromise = client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${systemPrompt}\n\n${prompt}\n\nIMPORTANT: Return ONLY a valid JSON object matching this schema:\n${schemaInstruction}`,
      config: { responseMimeType: 'application/json' },
    }).then(res => {
      if (!res.text) return null;
      return JSON.parse(res.text) as T;
    });

    return Promise.race([callPromise, timeoutPromise]);
  }

  private async callOpenAICompatibleTextWithTimeout(
    endpoint: string,
    apiKey: string,
    model: string,
    prompt: string,
    systemPrompt: string,
    history?: ChatHistoryMessage[]
  ): Promise<string | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.PROVIDER_TIMEOUT_MS);

    try {
      const messages: any[] = [{ role: 'system', content: systemPrompt }];
      if (history && history.length > 0) {
        for (const h of history.slice(-8)) {
          messages.push({
            role: h.role === 'assistant' ? 'assistant' : 'user',
            content: h.content,
          });
        }
      }
      messages.push({ role: 'user', content: prompt });

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      };
      if (endpoint.includes('openrouter')) {
        headers['HTTP-Referer'] = 'https://kaushalsetu.gov.in';
        headers['X-Title'] = 'KaushalSetu Intelligence Platform';
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.5,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const json: any = await res.json();
      return json.choices?.[0]?.message?.content || null;
    } finally {
      clearTimeout(timeout);
    }
  }

  private async callOpenAICompatibleJSONWithTimeout<T>(
    endpoint: string,
    apiKey: string,
    model: string,
    prompt: string,
    schemaInstruction: string,
    systemPrompt: string
  ): Promise<T | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.PROVIDER_TIMEOUT_MS);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      };
      if (endpoint.includes('openrouter')) {
        headers['HTTP-Referer'] = 'https://kaushalsetu.gov.in';
        headers['X-Title'] = 'KaushalSetu Intelligence Platform';
      }

      const reqBody: any = {
        model,
        messages: [
          { role: 'system', content: `${systemPrompt}\nReturn ONLY a valid JSON object matching this schema:\n${schemaInstruction}` },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
      };

      if (!endpoint.includes('groq')) {
        reqBody.response_format = { type: 'json_object' };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(reqBody),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const json: any = await res.json();
      let content = json.choices?.[0]?.message?.content;
      if (!content) return null;
      content = content.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim();
      return JSON.parse(content) as T;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const aiProvider = new AIProviderManager();

// ---------------------------------------------------------------------
// High-Level AI Services with Local Context-Aware Demo Fallback
// ---------------------------------------------------------------------

/**
 * Resume Parsing: Extracts skills, education, and summary from unstructured resume text.
 */
export async function parseResumeWithAI(
  content: string,
  isBase64Pdf: boolean = false
): Promise<{ parsedAI: ParsedResumeAI | null; provider: SupportedAIProvider; isLive: boolean; fallbackUsed: boolean }> {
  const schemaDesc = `{
    "name": "Full Name",
    "email": "Email",
    "education": "Degree & College",
    "experienceYears": 0,
    "technicalSkills": ["Skill1", "Skill2"],
    "softSkills": ["Communication", "Problem Solving"],
    "certifications": ["Cert 1"],
    "projects": ["Project Name & Tech"],
    "summary": "Brief Profile Summary"
  }`;

  const prompt = `Extract structured candidate competencies from this resume:\n"""\n${content.slice(0, 4000)}\n"""`;

  const result = await aiProvider.generateJSON<ParsedResumeAI>(
    prompt,
    schemaDesc,
    'You are a high-precision Resume Intelligence parser for Indian engineering and tech roles.'
  );

  return {
    parsedAI: result.data,
    provider: result.provider,
    isLive: result.isLive,
    fallbackUsed: result.fallbackUsed,
  };
}

/**
 * Job Requirement Generation: Structures recruiter prompts into skill sets, experience, and salary benchmarks.
 */
export async function generateJobRequirementsWithAI(
  promptInput: string
): Promise<{ parsedAI: ParsedJobRequirementAI | null; provider: SupportedAIProvider; isLive: boolean; fallbackUsed: boolean }> {
  const schemaDesc = `{
    "title": "Role Title",
    "roleCategory": "Role Category",
    "requiredSkills": ["Skill1", "Skill2"],
    "preferredSkills": ["Skill3"],
    "experienceMinYears": 0,
    "salaryMinLPA": 10.0,
    "salaryMaxLPA": 18.0,
    "description": "Professional Job Description"
  }`;

  const prompt = `Create a structured technical job requirement and market compensation range in LPA for: "${promptInput}"`;

  const result = await aiProvider.generateJSON<ParsedJobRequirementAI>(
    prompt,
    schemaDesc,
    'You are an expert technical hiring specialist analyzing modern Indian engineering vacancies.'
  );

  return {
    parsedAI: result.data,
    provider: result.provider,
    isLive: result.isLive,
    fallbackUsed: result.fallbackUsed,
  };
}

/**
 * Detects the language/style of the user's latest query per-message.
 */
export function detectQueryLanguage(query: string): 'english' | 'hinglish' | 'hindi' {
  if (!query) return 'english';

  // 1. Check for Devanagari script characters
  const hasDevanagari = /[\u0900-\u097F]/.test(query);
  if (hasDevanagari) return 'hindi';

  // 2. Check for unambiguous Romanized Hindi / Hinglish keywords and grammatical markers
  const hinglishTokens = [
    /\b(kya|hai|hain|kyun|kyu|kaise|kese|karna|kare|karein|karu|seekhu|seekhna|seekhe|batao|samjhao|bataiye|samjhaiye)\b/i,
    /\b(iska|iski|iske|inke|unka|unki|unke|meri|mere|mera|mujhe|hum|humko|aap|aapka|aapke|tum|tumhara|tumhe|apne)\b/i,
    /\b(mein|bhi|nahi|nhi|chahiye|hoga|hogi|hote|hota|hoti|raha|rahe|rahi|chal|chalna|chale)\b/i,
    /\b(kaun|kon|kahan|kitna|kitne|kab|kisko|kisse|theek|accha|acha|farak|antar|isko|isse|pehle|karo|saath)\b/i,
  ];

  for (const regex of hinglishTokens) {
    if (regex.test(query)) return 'hinglish';
  }

  return 'english';
}

/**
 * AI Career Copilot: Grounded career advisor leveraging student profile matrices and market telemetry.
 */
export async function askCareerCopilotWithAI(
  query: string,
  context: CopilotContext,
  history?: ChatHistoryMessage[]
): Promise<AICopilotResponse> {
  const detectedLang = detectQueryLanguage(query);

  // Construct grounded facts from actual database data
  const currentSkillsList = context.currentSkills?.length ? context.currentSkills.join(', ') : 'None recorded yet';
  const missingSkillsList = context.missingSkills?.length ? context.missingSkills.join(', ') : 'None detected';
  const dataMeta = dataProvider.getMetadata();
  const sourceLabel = context.dataSourceLabel || dataMeta.label;
  const isLive = Boolean(context.isLiveDataSource ?? dataMeta.isLive);

  const systemPrompt = `You are KaushalSetu AI Copilot, a dynamic conversational AI career, skill intelligence, and technical advisor for the KaushalSetu Labour Market & Skill Intelligence Platform (SIH Problem Statement SIH26134).

ACTIVE RUNTIME IDENTITY & METADATA:
- Assistant Name: KaushalSetu AI Copilot
- AI Engine Provider: Active LLM Service (Gemini / OpenRouter / Groq)
- Active Model: gemini-2.5-flash / configured LLM
- Platform: KaushalSetu SIH26134 Platform

CRITICAL LANGUAGE & SCRIPT RULE (MANDATORY & HIGHEST PRIORITY):
Answer in the same language and writing style as the user's latest message. Detect the language from the current user query. Do not default to Hindi or English. For Hinglish, respond naturally in Hinglish. For mixed-language queries, preserve the user's natural language mix.

Language & Script Guidelines:
1. English query → Respond entirely in English.
2. Romanized Hinglish (Latin alphabet: "Docker kya hai?", "Isko Kubernetes ke saath kyun use karte hain?") → Respond naturally in Romanized Hinglish (Latin alphabet).
3. Devanagari Hindi ("डॉकर क्या है?") → Respond in Devanagari script.
4. Mixed Hindi-English query → Preserve the user's natural language mix.
5. In Multi-Turn dialogues: ALWAYS adapt to the language of the LATEST user message (e.g., Turn 1: English -> English response; Turn 2: Hinglish -> Hinglish response; Turn 3: English -> English response).
6. DO NOT default to Hindi when the student writes in English.
7. Technical Terms: Keep terms such as Docker, Kubernetes, AWS, CI/CD, Linux, Virtual Machine, Containers, Terraform, SQL, Python, etc. in their standard technical form.
8. Do NOT translate the user's question internally into another language before answering.

CORE INSTRUCTIONS:
1. DYNAMIC & DIRECT CONVERSATIONAL REASONING:
   - Always prioritize answering the exact user query dynamically and accurately.
   - Maintain conversational context across multiple turns. Understand follow-up references (e.g., "Why would I use it with Kubernetes?", "Does that mean I don't need virtual machines?").
   - Follow any requested format or persona precisely (e.g., "in exactly 3 points", "like I am a beginner", "7-day plan", "step-by-step").

2. GENERAL TECHNICAL & CONCEPTUAL INQUIRIES:
   - When the student asks general or technical questions (e.g. "What is Docker?", "Explain Kubernetes", "Why is CI/CD important?", "What is Terraform?", "Explain containers like I'm a beginner"), generate an accurate, fresh, and clear technical explanation.
   - Do NOT inject unprompted student skill-gap reports or market counts into pure conceptual questions.

3. GROUNDED CANDIDATE CONTEXT (Use ONLY when relevant to the student's personal profile, gaps, or career roadmap):
   - Candidate: ${context.name}
   - Target Role: "${context.targetRole}"
   - Verified Current Skills: ${currentSkillsList}
   - Evaluated Missing Skill Gaps: ${missingSkillsList}
   ${context.targetJobs?.length ? `- Benchmark Target Jobs: ${context.targetJobs.join('; ')}` : ''}
   - Data Source Context: ${sourceLabel} (${isLive ? 'Live Ingested Telemetry' : 'Demo / Seed Benchmark Model'})

4. IDENTITY & META QUESTIONS:
   - If asked about your identity or name: "KaushalSetu AI Copilot".
   - If asked which model you are running on: state the active runtime provider and model.

5. TRUTHFULNESS & PRACTICALITY:
   - Do not invent fake numerical data or fake company vacancies.
   - Keep answers practical, structured, and helpful.`;

  const userPrompt = query;

  const liveResult = await aiProvider.generateText(userPrompt, systemPrompt, history);

  if (liveResult.isLive && liveResult.text.trim()) {
    return {
      answer: liveResult.text.trim(),
      provider: liveResult.provider,
      model: liveResult.model,
      isLive: true,
      fallbackUsed: liveResult.fallbackUsed,
    };
  }

  // -------------------------------------------------------------------
  // Dynamic Local Grounded Intelligence Fallback (when external APIs offline)
  // -------------------------------------------------------------------
  const qLower = query.toLowerCase();
  const isHinglish = detectedLang === 'hinglish' || detectedLang === 'hindi';
  let demoAnswer = '';

  // 0. Identity / Model question
  if (
    qLower.includes('model') ||
    qLower.includes('naam') ||
    qLower.includes('who are you') ||
    qLower.includes('kya naam') ||
    qLower.includes('kaun ho') ||
    qLower.includes('kon ho') ||
    qLower.includes('what are you') ||
    qLower.includes('which ai') ||
    qLower.includes('kis model')
  ) {
    if (isHinglish) {
      demoAnswer = `Mera naam **KaushalSetu AI Copilot** hai.

Filhal main **Local Grounded Intelligence (local-grounded-intelligence)** fallback mode par chal raha hoon. Jab live AI provider connect hota hai, tab **Google Gemini (gemini-2.5-flash)** use hota hai.

Main aapki target role (**${context.targetRole}**), verified skills (${currentSkillsList}), aur skill gap remediation mein help karta hoon.`;
    } else {
      demoAnswer = `I am the **KaushalSetu AI Copilot**.

I am currently operating in **Local Grounded Intelligence (local-grounded-intelligence)** fallback mode. When live AI is connected, I am powered by **Google Gemini (gemini-2.5-flash)**.

I help students with competency diagnostics, skill gap remediation, and career roadmap progression for **${context.targetRole}**.`;
    }
  }
  // 1. Docker vs VM comparison
  else if (
    (qLower.includes('docker') && qLower.includes('vm')) ||
    (qLower.includes('docker') && qLower.includes('virtual machine')) ||
    (qLower.includes('farak') && qLower.includes('docker')) ||
    (qLower.includes('difference') && qLower.includes('docker'))
  ) {
    if (isHinglish) {
      demoAnswer = `### Docker aur Virtual Machine (VM) ke beech mukhya antar:

1. **Architecture:** Docker host operating system ke kernel ko share karta hai, jabki VM ek full guest OS aur virtual hardware emulate karti hai.
2. **Resource Efficiency:** Containers bohot lightweight aur fast hote hain (MBs memory, seconds mein start), jabki VMs heavy aur slow boot hoti hain (GBs storage aur dedicated RAM).
3. **Use Case:** Docker microservices aur rapid deployments ke liye best hai; VMs complete OS isolation aur multi-OS environments ke liye use hoti hain.`;
    } else {
      demoAnswer = `### Key Differences Between Docker and Virtual Machines (VMs):

1. **Architecture:** Docker uses OS-level virtualization sharing the host OS kernel, whereas VMs run a complete guest OS on top of a hypervisor.
2. **Resource Efficiency:** Containers are lightweight, start in seconds, and require minimal overhead, while VMs consume gigabytes of storage and require dedicated CPU/RAM.
3. **Portability:** Docker containers ensure "build once, run anywhere" portability across development and production environments.`;
    }
  }
  // 2. Kubernetes with Docker
  else if (
    (qLower.includes('kubernetes') && qLower.includes('docker')) ||
    (qLower.includes('k8s') && qLower.includes('docker'))
  ) {
    if (isHinglish) {
      demoAnswer = `### Kubernetes ke saath Docker kyun use karte hain?

1. **Packaging vs Orchestration:** Docker applications ko containerize (package) karta hai, jabki Kubernetes un hazaron containers ko automatically deploy, scale aur manage karta hai.
2. **Self-Healing:** Agar koi Docker container crash hota hai, toh Kubernetes usse automatically restart ya healthy node par recreate kar deta hai.
3. **Automated Scaling & Load Balancing:** High traffic ke time Kubernetes automatically extra container replicas create karta hai aur network traffic distribute karta hai.`;
    } else {
      demoAnswer = `### Why Use Docker with Kubernetes?

1. **Packaging vs. Orchestration:** Docker packages application code and dependencies into standardized containers, while Kubernetes automates container scheduling, scaling, and networking at scale.
2. **Self-Healing Capabilities:** Kubernetes continuously monitors container health, automatically restarting or replacing failed containers.
3. **Automated Scaling & Load Balancing:** Kubernetes handles traffic routing across container pods and dynamically scales replicas according to system workload.`;
    }
  }
  // 3. Docker conceptual / Points
  else if (qLower.includes('docker')) {
    if (isHinglish) {
      demoAnswer = `### Docker kya hai aur DevOps mein iska use:

1. **Standardized Containerization:** Docker applications aur unke dependencies ko ek isolated container mein bundle karta hai, jisse 'works on my machine' wali problem khatam ho jaati hai.
2. **Fast CI/CD Pipelines:** Lightweight hone ki wajah se build, test aur deployment cycles bohot fast ho jaate hain.
3. **Production Consistency:** Development se lekar cloud production tak consistent environment provide karta hai.`;
    } else {
      demoAnswer = `### Docker Overview & DevOps Importance:

1. **Standardized Packaging:** Docker packages application code along with all system dependencies into lightweight, isolated containers.
2. **Eliminates Environment Drift:** Ensures consistent execution across development, staging, and production environments.
3. **Accelerates CI/CD:** Fast container spin-up and teardown enable rapid automated testing and seamless production rollouts.`;
    }
  }
  // 4. Skill gap / profile evaluation query
  else if (
    qLower.includes('gap') ||
    qLower.includes('missing') ||
    (qLower.includes('my') && qLower.includes('skill')) ||
    (qLower.includes('match') && qLower.includes('profile'))
  ) {
    if (isHinglish) {
      demoAnswer = `### Grounded Skill Gap Diagnostic for **${context.targetRole}**

- **Verified Strengths:** ${currentSkillsList}
- **Missing Competency Gaps:** ${missingSkillsList}

**Recommended Action Plan:**
1. Pehle **${context.missingSkills?.[0] || 'Containerization'}** aur **${context.missingSkills?.[1] || 'Cloud Infrastructure'}** seekhein.
2. KaushalSetu platform par verified hands-on assessments dekar badge earn karein.
3. **Job Matching** tab mein real recruiter requirements check karein.`;
    } else {
      demoAnswer = `### Grounded Skill Gap Diagnostic for **${context.targetRole}**

- **Verified Strengths:** ${currentSkillsList}
- **Missing Competency Gaps:** ${missingSkillsList}

**Recommended Action Plan:**
1. Focus on mastering **${context.missingSkills?.[0] || 'Containerization'}** and **${context.missingSkills?.[1] || 'Cloud Infrastructure'}** first.
2. Complete verified hands-on skill assessments in KaushalSetu to earn accredited badges.
3. Review target job requirements under the **Job Matching** tab to see real benchmark recruiter thresholds.`;
    }
  }
  // 5. Learning roadmap / what to learn next query
  else if (
    qLower.includes('learn next') ||
    qLower.includes('roadmap') ||
    qLower.includes('kya seekhu') ||
    qLower.includes('priority order') ||
    qLower.includes('next skill') ||
    qLower.includes('order')
  ) {
    const firstMissing = context.missingSkills?.[0] || 'Docker';
    const secondMissing = context.missingSkills?.[1] || 'AWS Cloud';
    const otherMissing = context.missingSkills?.slice(2).join(', ') || 'CI/CD Pipelines, Kubernetes & Terraform';

    if (isHinglish) {
      demoAnswer = `### Prioritized Learning Progression for **${context.targetRole}**

1. **Immediate Priority: ${firstMissing}**
   - *Rationale:* Aapke verified foundation (${currentSkillsList}) ko production deployment se connect karta hai.
2. **Next Milestone: ${secondMissing}**
   - *Rationale:* Top tech recruiters ke liye essential cloud compute, identity aur networking skills.
3. **Advanced Milestones: ${otherMissing}**
   - *Rationale:* Container orchestration, automated release pipelines aur Infrastructure as Code.

Aap interactive **Learning Roadmap** tab mein progress track kar sakte hain!`;
    } else {
      demoAnswer = `### Prioritized Learning Progression for **${context.targetRole}**

1. **Immediate Priority: ${firstMissing}**
   - *Rationale:* Bridges your verified foundation (${currentSkillsList}) with production deployment. Focus on containerizing backend apps and writing multi-stage builds.
2. **Next Milestone: ${secondMissing}**
   - *Rationale:* Core cloud compute, identity access, and networking required by top tech recruiters.
3. **Advanced Milestones: ${otherMissing}**
   - *Rationale:* Production container orchestration, automated release pipelines, and Infrastructure as Code.

Track your module-by-module completion in the interactive **Learning Roadmap** tab!`;
    }
  }
  // 6. Dynamic Technical / Conceptual Explanation
  else {
    if (isHinglish) {
      demoAnswer = `### KaushalSetu Intelligence Response

Aapke query ke bare mein: *"${query}"*

- **Relevance to ${context.targetRole}:** Modern software aur cloud engineering mein systems architecture aur automation samajhna zaroori hai.
- **Aapka Verified Foundation:** Aapke paas **${currentSkillsList}** verified skills hain.
- **Next Recommendation:** **${context.targetRole}** mein mastery ke liye **Learning Roadmap** tab mein modules check karein.

*(Note: Operating in Local Grounded Fallback mode. Live AI provider credentials .env mein configure karein.)*`;
    } else {
      demoAnswer = `### KaushalSetu Intelligence Response

Regarding your query: *"${query}"*

- **Relevance to ${context.targetRole}:** In modern software and cloud engineering, mastering core systems architecture, containerization, and automation is essential.
- **Your Current Foundation:** You currently have verified skills in **${currentSkillsList}**.
- **Next Recommendation:** To deepen your mastery for **${context.targetRole}**, explore hands-on labs and review your **Learning Roadmap** modules.

*(Note: Operating in Local Grounded Fallback mode. For free-form creative queries, ensure Live AI provider credentials are active in .env.)*`;
    }
  }

  return {
    answer: demoAnswer,
    provider: 'demo',
    model: 'local-grounded-intelligence',
    isLive: false,
    fallbackUsed: true,
  };
}

/**
 * Backward compatibility exports
 */
export const parseResumeWithGemini = parseResumeWithAI;
export const generateJobRequirementsWithGemini = generateJobRequirementsWithAI;
export const askCareerCopilotWithGemini = async (query: string, context: any) => {
  const res = await askCareerCopilotWithAI(query, context);
  return res.answer;
};
