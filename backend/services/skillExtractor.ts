import { Skill } from '../types/models';
import { CANONICAL_SKILLS, SKILL_ALIASES, normalizeSkillText } from '../data/taxonomy';
import { parseResumeWithGemini, ParsedResumeAI } from './geminiService';

export interface ExtractedSkillResult {
  skill: Skill;
  extractedFromText: string;
  source: 'DICTIONARY' | 'AI_MODEL';
  confidence: number;
}

export class SkillExtractorService {
  /**
   * Deterministically extract normalized skills from freeform text using
   * boundary-aware regex matching against canonical names and aliases.
   */
  public extractFromText(text: string): ExtractedSkillResult[] {
    if (!text || typeof text !== 'string') return [];

    const foundSkillsMap = new Map<string, ExtractedSkillResult>();
    const lowerText = ` ${text.toLowerCase()} `;

    // 1. Check all canonical skills
    for (const skill of CANONICAL_SKILLS) {
      const escaped = skill.canonicalName.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:[^a-z0-9]|^)${escaped}(?:[^a-z0-9]|$)`, 'i');
      if (regex.test(lowerText)) {
        foundSkillsMap.set(skill.id, {
          skill,
          extractedFromText: skill.canonicalName,
          source: 'DICTIONARY',
          confidence: 0.98,
        });
      }
    }

    // 2. Check all aliases
    for (const aliasEntry of SKILL_ALIASES) {
      if (foundSkillsMap.has(aliasEntry.skillId)) continue;

      const escaped = aliasEntry.alias.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:[^a-z0-9]|^)${escaped}(?:[^a-z0-9]|$)`, 'i');
      if (regex.test(lowerText)) {
        const canonical = CANONICAL_SKILLS.find(s => s.id === aliasEntry.skillId);
        if (canonical) {
          foundSkillsMap.set(canonical.id, {
            skill: canonical,
            extractedFromText: aliasEntry.alias,
            source: 'DICTIONARY',
            confidence: 0.95,
          });
        }
      }
    }

    return Array.from(foundSkillsMap.values());
  }

  /**
   * Normalizes an array of raw skill string inputs (e.g. ['ReactJS', 'k8s', 'AWS Cloud'])
   * into canonical skills.
   */
  public normalizeSkills(rawSkills: string[]): Skill[] {
    const unique = new Map<string, Skill>();
    for (const raw of rawSkills) {
      const normalized = normalizeSkillText(raw);
      if (normalized && !unique.has(normalized.id)) {
        unique.set(normalized.id, normalized);
      }
    }
    return Array.from(unique.values());
  }

  /**
   * Hybrid deep resume extraction: Runs fast dictionary scan + Gemini 3.8 Flash
   * to discover context, education, certifications, and projects.
   */
  public async extractFromResumeHybrid(
    rawText: string,
    isBase64Pdf: boolean = false
  ): Promise<{
    parsedAI: ParsedResumeAI | null;
    normalizedSkills: Skill[];
  }> {
    const aiParsed = await parseResumeWithGemini(rawText, isBase64Pdf);

    const skillsToNormalize: string[] = [];

    // Combine deterministic extraction from text with AI-extracted strings
    const directResults = this.extractFromText(rawText);
    for (const res of directResults) {
      skillsToNormalize.push(res.skill.canonicalName);
    }

    if (aiParsed && Array.isArray(aiParsed.technicalSkills)) {
      skillsToNormalize.push(...aiParsed.technicalSkills);
    }

    const normalizedSkills = this.normalizeSkills(skillsToNormalize);

    return {
      parsedAI: aiParsed,
      normalizedSkills,
    };
  }
}

export const skillExtractor = new SkillExtractorService();
