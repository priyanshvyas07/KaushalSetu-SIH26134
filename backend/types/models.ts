export type UserRole = 'STUDENT' | 'INSTITUTE' | 'EMPLOYER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  organizationName?: string;
  createdAt: string;
}

export type SkillDemandLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type SkillCategory =
  | 'Frontend'
  | 'Backend'
  | 'Cloud & DevOps'
  | 'AI & Data Science'
  | 'Cybersecurity'
  | 'Mobile & Embedded'
  | 'Core Engineering'
  | 'Soft Skills & Leadership';

export interface Skill {
  id: string;
  canonicalName: string;
  category: SkillCategory;
  description: string;
  marketDemandLevel: SkillDemandLevel;
  averageSalaryBumpPct: number;
}

export interface SkillAlias {
  skillId: string;
  alias: string;
}

export type ProficiencyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface StudentSkill {
  skillId: string;
  proficiency: ProficiencyLevel;
  verified: boolean;
  source: 'RESUME' | 'ASSESSMENT' | 'SELF';
  lastEvaluated?: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  targetRole: string;
  preferredLocation: string;
  experienceLevel: 'Fresher (0-1 yrs)' | 'Junior (1-3 yrs)' | 'Mid-Level (3-5 yrs)' | 'Senior (5+ yrs)';
  education: string;
  bio: string;
  profileCompletionPct: number;
  skills: StudentSkill[];
  resumeText?: string;
  resumeFileName?: string;
  savedRoadmapProgress?: Record<string, boolean>;
}

export interface JobSkill {
  skillId: string;
  isRequired: boolean;
  minProficiency: ProficiencyLevel;
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
  skills: JobSkill[];
  postedAt: string;
  dataSource: 'REAL VERIFIED' | 'SAMPLE BENCHMARK';
}

export interface Course {
  id: string;
  instituteId: string;
  title: string;
  department: string;
  degreeLevel: string;
  durationSemesters: number;
  enrolledStudents: number;
  targetIndustryRoles: string[];
}

export interface CurriculumSkill {
  skillId: string;
  coverageDepth: 'CONCEPTUAL' | 'PRACTICAL' | 'CAPSTONE';
  semesterTaught: number;
  hoursDedicated: number;
}

export interface Curriculum {
  id: string;
  courseId: string;
  academicYear: string;
  syllabusRaw: string;
  skills: CurriculumSkill[];
  alignmentScore: number;
  lastAudited: string;
}

export interface StateSkillDemand {
  state: string;
  skillId: string;
  openingsCount: number;
  growthRatePct: number;
  demandIndex: number; // 0-100
  supplyIndex: number; // 0-100
  gapRatio: number;    // Demand / Supply
  dataSource: 'REAL VERIFIED' | 'SAMPLE BENCHMARK';
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface Assessment {
  id: string;
  skillId: string;
  skillName: string;
  title: string;
  questions: AssessmentQuestion[];
  durationMinutes: number;
}

export interface AssessmentResult {
  id: string;
  studentId: string;
  assessmentId: string;
  skillId: string;
  score: number;
  total: number;
  passed: boolean;
  evaluatedAt: string;
}

export interface EmployerSurveySubmission {
  id: string;
  employerId: string;
  employerName: string;
  industry: string;
  hardToHireSkills: string[];
  emergingSkills: string[];
  fresherGaps: string[];
  recommendedCertifications: string[];
  additionalRemarks: string;
  submittedAt: string;
}

export interface AIRecommendation {
  id: string;
  targetRoleType: 'STUDENT' | 'INSTITUTE' | 'GOVT';
  title: string;
  actionSummary: string;
  evidenceData: Record<string, any>;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  confidenceScore: number;
  dataSourceLabel: 'OBSERVED MARKET DATA' | 'SAMPLE BENCHMARK' | 'MODEL FORECAST';
}
