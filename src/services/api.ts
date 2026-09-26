import { UserRole, StudentProfile, JobMatchResult, AssessmentSummary } from '../types';

let authToken: string | null = localStorage.getItem('kaushal_token');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem('kaushal_token', token);
  else localStorage.removeItem('kaushal_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({ error: 'Network response was not ok' }));
    throw new Error(errorJson.error || `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  login: (email?: string, role?: UserRole) =>
    request<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    }),

  getCurrentUser: () =>
    request<{ user: any; token?: string }>('/api/auth/me'),

  // Student
  getStudentProfile: () =>
    request<{ profile: StudentProfile; gapAnalysis: any }>('/api/student/profile'),

  updateStudentProfile: (data: Partial<StudentProfile>) =>
    request<{ message: string; profile: StudentProfile }>('/api/student/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  uploadResume: (payload: { resumeText?: string; base64Pdf?: string; fileName?: string }) =>
    request<any>('/api/student/resume/upload', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getStudentSkillGaps: () =>
    request<any>('/api/student/skill-gaps'),

  getStudentJobMatches: () =>
    request<{ matches: JobMatchResult[]; studentTargetRole: string }>('/api/student/jobs/match'),

  getStudentRoadmap: () =>
    request<any>('/api/student/roadmap'),

  updateRoadmapProgress: (moduleId: string, isCompleted: boolean) =>
    request<any>('/api/student/roadmap/progress', {
      method: 'POST',
      body: JSON.stringify({ moduleId, isCompleted }),
    }),

  getAssessments: () =>
    request<{ assessments: AssessmentSummary[] }>('/api/student/assessments'),

  getAssessmentDetails: (id: string) =>
    request<any>(`/api/student/assessments/${id}`),

  submitAssessment: (id: string, answers: Record<string, number>) =>
    request<any>(`/api/student/assessments/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),

  askCareerCopilot: (query: string, history?: { role: 'user' | 'assistant'; content: string }[]) =>
    request<{
      query: string;
      answer: string;
      isLive: boolean;
      provider: string;
      model: string;
      fallbackUsed: boolean;
      dataSource: string;
      groundedContext: any;
    }>('/api/student/copilot', {
      method: 'POST',
      body: JSON.stringify({ query, history }),
    }),

  // Institute
  getInstituteOverview: () =>
    request<any>('/api/institute/overview'),

  getInstituteCourses: () =>
    request<any>('/api/institute/courses'),

  getCurriculumAudit: (courseId: string) =>
    request<any>(`/api/institute/curriculum/${courseId}`),

  uploadCurriculum: (payload: { courseId: string; syllabusRaw: string; academicYear?: string }) =>
    request<any>('/api/institute/curriculum/upload', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getEmployerFeedback: () =>
    request<any>('/api/institute/employer-feedback'),

  // Employer
  getEmployerJobs: () =>
    request<any>('/api/employer/jobs'),

  generateAIJobRequirements: (prompt: string) =>
    request<any>('/api/employer/jobs/ai-generate', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }),

  createJob: (jobData: any) =>
    request<any>('/api/employer/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    }),

  getCandidateMatchesForJob: (jobId: string) =>
    request<any>(`/api/employer/candidates/match/${jobId}`),

  submitEmployerSurvey: (surveyData: any) =>
    request<any>('/api/employer/survey', {
      method: 'POST',
      body: JSON.stringify(surveyData),
    }),

  // Admin
  getAdminOverview: () =>
    request<any>('/api/admin/overview'),

  getAdminLabourMarket: () =>
    request<any>('/api/admin/labour-market'),

  getAdminHeatmap: (state?: string, skillId?: string) => {
    const params = new URLSearchParams();
    if (state && state !== 'All India') params.set('state', state);
    if (skillId) params.set('skillId', skillId);
    return request<any>(`/api/admin/heatmap?${params.toString()}`);
  },

  getAdminShortages: () =>
    request<any>('/api/admin/shortages'),

  getAdminEmergingSkills: () =>
    request<any>('/api/admin/emerging-skills'),

  getAdminTrainingSupply: () =>
    request<any>('/api/admin/training-supply'),

  // Public / Shared Market
  getCanonicalSkills: () =>
    request<{ skills: any[] }>('/api/market/skills'),

  normalizeSkill: (rawText: string) =>
    request<any>('/api/market/normalize-skill', {
      method: 'POST',
      body: JSON.stringify({ rawText }),
    }),
};
