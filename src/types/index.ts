export type UserRole = 'STUDENT' | 'INSTITUTE' | 'EMPLOYER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  organizationName?: string;
}

export interface Skill {
  id: string;
  canonicalName: string;
  category: string;
  description: string;
  marketDemandLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  averageSalaryBumpPct: number;
}

export interface StudentSkill {
  skillId: string;
  skillName?: string;
  category?: string;
  proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  verified: boolean;
  source: 'RESUME' | 'ASSESSMENT' | 'SELF';
  lastEvaluated?: string;
  marketDemand?: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  targetRole: string;
  preferredLocation: string;
  experienceLevel: string;
  education: string;
  bio: string;
  profileCompletionPct: number;
  skills: StudentSkill[];
  resumeText?: string;
  resumeFileName?: string;
  savedRoadmapProgress?: Record<string, boolean>;
}

export interface SkillMatchDetail {
  skill: Skill;
  status: 'STRONG' | 'MATCHED' | 'WEAK' | 'MISSING';
  isRequired: boolean;
  studentProficiency?: string;
  requiredProficiency?: string;
  marketDemand: string;
  gapPriority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: string;
}

export interface Job {
  id: string;
  employerId: string;
  employerName: string;
  title: string;
  roleCategory: string;
  locationCity: string;
  locationState: string;
  experienceMinYears: number;
  salaryMinLPA: number;
  salaryMaxLPA: number;
  description: string;
  postedAt: string;
  dataSource: 'REAL VERIFIED' | 'SAMPLE BENCHMARK';
  skills: {
    skillId: string;
    isRequired: boolean;
    minProficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  }[];
}

export interface JobMatchResult {
  job: Job;
  overallMatchPct: number;
  requiredMatchPct: number;
  preferredMatchPct: number;
  matchedSkillsCount: number;
  totalRequiredCount: number;
  strongSkills: SkillMatchDetail[];
  missingSkills: SkillMatchDetail[];
  weakSkills: SkillMatchDetail[];
  matchBreakdownExplanation: string;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface AssessmentSummary {
  id: string;
  skillId: string;
  skillName: string;
  title: string;
  durationMinutes: number;
  questionsCount: number;
  hasAttempted: boolean;
  lastScore?: number;
  passed: boolean;
}

export interface CurriculumComparisonRow {
  skill: Skill;
  marketDemand: 'HIGH' | 'MEDIUM' | 'LOW';
  openingsInIndia: number;
  coverageStatus: 'COVERED' | 'MISSING' | 'PARTIAL';
  coverageDepth?: 'CONCEPTUAL' | 'PRACTICAL' | 'CAPSTONE';
  semesterTaught?: number;
  hoursDedicated?: number;
  urgency: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
}

export interface CurriculumAlignmentReport {
  curriculumId: string;
  courseTitle: string;
  alignmentScore: number;
  scoreCalculationMethod: string;
  totalMarketSkillsEvaluated: number;
  coveredMarketSkillsCount: number;
  missingHighDemandSkillsCount: number;
  comparisonTable: CurriculumComparisonRow[];
  aiCurriculumRecommendations: {
    category: 'SKILLS_TO_ADD' | 'MODULES_TO_UPDATE' | 'TOPICS_TO_REDUCE' | 'PRACTICAL_PROJECTS' | 'CERTIFICATIONS';
    title: string;
    details: string;
    marketEvidence: string;
  }[];
  trainingSupplyVsDemandSummary: {
    highDemandLowSupply: string[];
    highDemandHighSupply: string[];
    lowDemandHighSupply: string[];
  };
}

export interface SkillShortageInsight {
  skillId: string;
  skillName: string;
  category: string;
  demandIndex: number;
  supplyIndex: number;
  gapRatio: number;
  totalOpeningsIndia: number;
  status: 'CRITICAL SHORTAGE' | 'MODERATE SHORTAGE' | 'BALANCED' | 'OVERSUPPLY';
  affectedRoles: string[];
  affectedStates: string[];
  evidenceSummary: string;
}

export interface StateGeoAggregate {
  state: string;
  totalOpenings: number;
  topDemandedSkills: { skillName: string; openings: number; growthPct: number }[];
  avgGapRatio: number;
  topShortageSkill: string;
  criticalShortagesCount: number;
  instituteCount: number;
  studentEnrollmentCapacity: number;
  severity: 'HIGH_URGENCY' | 'ELEVATED' | 'STABLE';
}
