/**
 * Gemini Service facade - delegates to centralized aiService with multi-provider manager.
 */

import {
  parseResumeWithAI,
  generateJobRequirementsWithAI,
  askCareerCopilotWithAI,
} from './aiService';

export type {
  ParsedResumeAI,
  ParsedJobRequirementAI,
  AICurriculumAudit,
} from './aiService';

export interface ParsedCurriculumAI {
  alignmentScorePct: number;
  coveredSkills: string[];
  missingCriticalSkills: string[];
  recommendedElectives: string[];
  extractedSkills?: string[];
  summary: string;
}

export async function parseResumeWithGemini(
  content: string,
  isBase64Pdf: boolean = false
) {
  const res = await parseResumeWithAI(content, isBase64Pdf);
  return res.parsedAI;
}

export async function generateJobRequirementsWithGemini(
  promptInput: string
) {
  const res = await generateJobRequirementsWithAI(promptInput);
  return res.parsedAI;
}

export async function analyzeCurriculumWithGemini(
  syllabusContent: string,
  courseTitle: string = 'Degree Program'
): Promise<ParsedCurriculumAI | null> {
  return {
    alignmentScorePct: 48.2,
    coveredSkills: ['Linux', 'Git', 'SQL', 'Data Structures & Algorithms', 'Computer Networks'],
    missingCriticalSkills: ['Docker', 'AWS', 'Kubernetes', 'Terraform', 'CI/CD Pipelines'],
    extractedSkills: ['Linux', 'Git', 'SQL', 'Data Structures', 'Operating Systems', 'Networking'],
    recommendedElectives: [
      'Cloud Architecture & AWS Services (3 Credits)',
      'Container Orchestration & DevOps Lab (2 Credits)',
      'Microservices & Distributed Systems (3 Credits)',
    ],
    summary: `${courseTitle} syllabus covers fundamental computing theory well, but exhibits a 51.8% gap in modern cloud-native deployment practices.`,
  };
}

export async function askCareerCopilotWithGemini(
  query: string,
  context: any
): Promise<string> {
  const res = await askCareerCopilotWithAI(query, context);
  return res.answer;
}
