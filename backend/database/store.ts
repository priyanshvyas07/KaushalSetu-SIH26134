import {
  User,
  StudentProfile,
  Job,
  Course,
  Curriculum,
  StateSkillDemand,
  Assessment,
  AssessmentResult,
  EmployerSurveySubmission,
  AIRecommendation,
  Skill
} from '../types/models';
import { CANONICAL_SKILLS } from '../data/taxonomy';
import {
  SEED_USERS,
  SEED_STUDENT_PROFILE,
  SEED_JOBS,
  SEED_COURSES,
  SEED_CURRICULA,
  SEED_STATE_DEMANDS,
  SEED_ASSESSMENTS,
  SEED_EMPLOYER_SURVEYS,
  SEED_RECOMMENDATIONS
} from '../data/seedData';

class DatabaseStore {
  public users: Map<string, User> = new Map();
  public studentProfiles: Map<string, StudentProfile> = new Map();
  public skills: Map<string, Skill> = new Map();
  public jobs: Map<string, Job> = new Map();
  public courses: Map<string, Course> = new Map();
  public curricula: Map<string, Curriculum> = new Map();
  public stateDemands: StateSkillDemand[] = [];
  public assessments: Map<string, Assessment> = new Map();
  public assessmentResults: AssessmentResult[] = [];
  public employerSurveys: EmployerSurveySubmission[] = [];
  public recommendations: AIRecommendation[] = [];

  constructor() {
    this.resetToSeed();
  }

  public resetToSeed() {
    this.users.clear();
    this.studentProfiles.clear();
    this.skills.clear();
    this.jobs.clear();
    this.courses.clear();
    this.curricula.clear();
    this.assessments.clear();
    this.assessmentResults = [];
    this.employerSurveys = [];
    this.recommendations = [];

    // Load canonical skills
    for (const skill of CANONICAL_SKILLS) {
      this.skills.set(skill.id, skill);
    }

    // Load users
    for (const user of SEED_USERS) {
      this.users.set(user.id, { ...user });
    }

    // Load student profile
    this.studentProfiles.set(SEED_STUDENT_PROFILE.userId, JSON.parse(JSON.stringify(SEED_STUDENT_PROFILE)));

    // Load jobs
    for (const job of SEED_JOBS) {
      this.jobs.set(job.id, JSON.parse(JSON.stringify(job)));
    }

    // Load courses
    for (const course of SEED_COURSES) {
      this.courses.set(course.id, JSON.parse(JSON.stringify(course)));
    }

    // Load curricula
    for (const curriculum of SEED_CURRICULA) {
      this.curricula.set(curriculum.id, JSON.parse(JSON.stringify(curriculum)));
    }

    // Load state demands
    this.stateDemands = JSON.parse(JSON.stringify(SEED_STATE_DEMANDS));

    // Load assessments
    for (const asmt of SEED_ASSESSMENTS) {
      this.assessments.set(asmt.id, JSON.parse(JSON.stringify(asmt)));
    }

    // Load surveys
    this.employerSurveys = JSON.parse(JSON.stringify(SEED_EMPLOYER_SURVEYS));

    // Load recommendations
    this.recommendations = JSON.parse(JSON.stringify(SEED_RECOMMENDATIONS));
  }

  // User queries
  public getUserByEmail(email: string): User | undefined {
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) return u;
    }
    return undefined;
  }

  public getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  public createUser(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  // Student queries
  public getStudentProfileByUserId(userId: string): StudentProfile | undefined {
    return this.studentProfiles.get(userId);
  }

  public saveStudentProfile(profile: StudentProfile): StudentProfile {
    this.studentProfiles.set(profile.userId, profile);
    return profile;
  }

  // Job queries
  public getAllJobs(): Job[] {
    return Array.from(this.jobs.values()).sort(
      (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
    );
  }

  public getJobById(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  public createJob(job: Job): Job {
    this.jobs.set(job.id, job);
    return job;
  }

  // Skills queries
  public getAllSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  public getSkillById(id: string): Skill | undefined {
    return this.skills.get(id);
  }

  // Course & Curricula queries
  public getAllCourses(): Course[] {
    return Array.from(this.courses.values());
  }

  public getCurriculaForCourse(courseId: string): Curriculum | undefined {
    for (const cur of this.curricula.values()) {
      if (cur.courseId === courseId) return cur;
    }
    return undefined;
  }

  public saveCurriculum(curriculum: Curriculum): Curriculum {
    this.curricula.set(curriculum.id, curriculum);
    return curriculum;
  }

  // Assessments
  public getAllAssessments(): Assessment[] {
    return Array.from(this.assessments.values());
  }

  public getAssessmentById(id: string): Assessment | undefined {
    return this.assessments.get(id);
  }

  public addAssessmentResult(result: AssessmentResult): void {
    this.assessmentResults.push(result);
  }

  public getAssessmentResultsForStudent(studentId: string): AssessmentResult[] {
    return this.assessmentResults.filter(r => r.studentId === studentId);
  }

  // Surveys
  public getAllSurveys(): EmployerSurveySubmission[] {
    return this.employerSurveys;
  }

  public addSurvey(survey: EmployerSurveySubmission): void {
    this.employerSurveys.unshift(survey);
  }

  // Recommendations
  public getRecommendations(targetRoleType?: 'STUDENT' | 'INSTITUTE' | 'GOVT'): AIRecommendation[] {
    if (!targetRoleType) return this.recommendations;
    return this.recommendations.filter(r => r.targetRoleType === targetRoleType);
  }

  public addRecommendation(rec: AIRecommendation): void {
    this.recommendations.unshift(rec);
  }
}

export const db = new DatabaseStore();
