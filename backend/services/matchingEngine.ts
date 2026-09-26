import { Job, StudentProfile, Skill } from '../types/models';
import { db } from '../database/store';

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

export class MatchingEngineService {
  /**
   * Deterministically calculates match score between a student's skills and a job's requirements.
   * Explainable formula:
   * RequiredWeight = 0.70, PreferredWeight = 0.30
   * Match% = (MatchedRequired / TotalRequired * 0.70 + MatchedPreferred / TotalPreferred * 0.30) * 100
   */
  public matchStudentToJob(student: StudentProfile, job: Job): JobMatchResult {
    const studentSkillMap = new Map(
      student.skills.map(s => [s.skillId, s])
    );

    const requiredJobSkills = job.skills.filter(s => s.isRequired);
    const preferredJobSkills = job.skills.filter(s => !s.isRequired);

    let matchedRequiredCount = 0;
    let matchedPreferredCount = 0;

    const strongSkills: SkillMatchDetail[] = [];
    const missingSkills: SkillMatchDetail[] = [];
    const weakSkills: SkillMatchDetail[] = [];

    // Evaluate each job skill requirement
    for (const jobSkill of job.skills) {
      const skillObj = db.getSkillById(jobSkill.skillId) || {
        id: jobSkill.skillId,
        canonicalName: jobSkill.skillId,
        category: 'Backend',
        description: '',
        marketDemandLevel: 'HIGH',
        averageSalaryBumpPct: 20
      };

      const studentHas = studentSkillMap.get(jobSkill.skillId);

      if (!studentHas) {
        // Missing skill
        const priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' = jobSkill.isRequired
          ? (skillObj.marketDemandLevel === 'HIGH' ? 'CRITICAL' : 'HIGH')
          : 'MEDIUM';

        missingSkills.push({
          skill: skillObj,
          status: 'MISSING',
          isRequired: jobSkill.isRequired,
          requiredProficiency: jobSkill.minProficiency,
          marketDemand: skillObj.marketDemandLevel,
          gapPriority: priority,
          explanation: jobSkill.isRequired
            ? `Mandatory requirement for this role (${jobSkill.minProficiency} level needed). Industry demand is ${skillObj.marketDemandLevel}.`
            : `Preferred skill. Would boost candidate rating.`,
        });
      } else {
        // Student has the skill, check proficiency
        const isProficient = this.isProficiencySufficient(
          studentHas.proficiency,
          jobSkill.minProficiency
        );

        if (isProficient) {
          if (jobSkill.isRequired) matchedRequiredCount++;
          else matchedPreferredCount++;

          const isStrong = studentHas.verified && (studentHas.proficiency === 'ADVANCED' || studentHas.proficiency === 'INTERMEDIATE');
          const detail: SkillMatchDetail = {
            skill: skillObj,
            status: isStrong ? 'STRONG' : 'MATCHED',
            isRequired: jobSkill.isRequired,
            studentProficiency: studentHas.proficiency,
            requiredProficiency: jobSkill.minProficiency,
            marketDemand: skillObj.marketDemandLevel,
            gapPriority: 'LOW',
            explanation: `Candidate verified at ${studentHas.proficiency} level (meets ${jobSkill.minProficiency} threshold).`,
          };

          if (isStrong) strongSkills.push(detail);
        } else {
          // Weak proficiency
          weakSkills.push({
            skill: skillObj,
            status: 'WEAK',
            isRequired: jobSkill.isRequired,
            studentProficiency: studentHas.proficiency,
            requiredProficiency: jobSkill.minProficiency,
            marketDemand: skillObj.marketDemandLevel,
            gapPriority: 'HIGH',
            explanation: `Candidate has ${studentHas.proficiency} proficiency, but job explicitly requires ${jobSkill.minProficiency}.`,
          });
        }
      }
    }

    // Mathematical formula calculation
    const totalRequired = Math.max(1, requiredJobSkills.length);
    const requiredMatchFraction = matchedRequiredCount / totalRequired;

    let overallMatchPct = 0;
    let preferredMatchFraction = 1.0;

    if (preferredJobSkills.length > 0) {
      preferredMatchFraction = matchedPreferredCount / preferredJobSkills.length;
      overallMatchPct = Math.round((requiredMatchFraction * 0.70 + preferredMatchFraction * 0.30) * 100);
    } else {
      overallMatchPct = Math.round(requiredMatchFraction * 100);
    }

    const requiredMatchPct = Math.round(requiredMatchFraction * 100);
    const preferredMatchPct = Math.round(preferredMatchFraction * 100);

    const matchBreakdownExplanation = `Score computed mathematically: ${matchedRequiredCount}/${totalRequired} mandatory skills met (${requiredMatchPct}% required weight) + ${matchedPreferredCount}/${Math.max(1, preferredJobSkills.length)} preferred skills met (${preferredMatchPct}% preferred weight). Identified ${missingSkills.length} missing skill gaps.`;

    return {
      job,
      overallMatchPct,
      requiredMatchPct,
      preferredMatchPct,
      matchedSkillsCount: matchedRequiredCount + matchedPreferredCount,
      totalRequiredCount: totalRequired,
      strongSkills,
      missingSkills,
      weakSkills,
      matchBreakdownExplanation,
    };
  }

  private isProficiencySufficient(has: string, needed: string): boolean {
    const rank: Record<string, number> = {
      BEGINNER: 1,
      INTERMEDIATE: 2,
      ADVANCED: 3,
    };
    return (rank[has] || 1) >= (rank[needed] || 1);
  }

  /**
   * Evaluates skill gaps between a student and their chosen Target Role across the whole market
   */
  public evaluateRoleSkillGaps(student: StudentProfile, targetRole: string): {
    targetRole: string;
    marketSkillsNeeded: { skill: Skill; marketDemand: string; isMissing: boolean; isWeak: boolean }[];
    strongCount: number;
    missingCount: number;
    overallPreparednessPct: number;
  } {
    // Find all jobs for this role to derive composite market requirements
    const matchingJobs = db.getAllJobs().filter(
      j => j.roleCategory.toLowerCase().includes(targetRole.toLowerCase()) ||
           targetRole.toLowerCase().includes(j.roleCategory.toLowerCase())
    );

    const jobsToUse = matchingJobs.length > 0 ? matchingJobs : db.getAllJobs().slice(0, 3);

    const marketSkillFrequency = new Map<string, number>();
    for (const job of jobsToUse) {
      for (const js of job.skills) {
        marketSkillFrequency.set(js.skillId, (marketSkillFrequency.get(js.skillId) || 0) + (js.isRequired ? 2 : 1));
      }
    }

    const studentSkillIds = new Set(student.skills.map(s => s.skillId));

    const marketSkillsNeeded: { skill: Skill; marketDemand: string; isMissing: boolean; isWeak: boolean }[] = [];
    let strongCount = 0;
    let missingCount = 0;

    for (const [skillId] of marketSkillFrequency.entries()) {
      const skill = db.getSkillById(skillId);
      if (!skill) continue;

      const has = studentSkillIds.has(skillId);
      const isMissing = !has;
      if (isMissing) {
        missingCount++;
      } else {
        strongCount++;
      }

      marketSkillsNeeded.push({
        skill,
        marketDemand: skill.marketDemandLevel,
        isMissing,
        isWeak: false,
      });
    }

    const total = marketSkillsNeeded.length || 1;
    const overallPreparednessPct = Math.round((strongCount / total) * 100);

    return {
      targetRole,
      marketSkillsNeeded,
      strongCount,
      missingCount,
      overallPreparednessPct,
    };
  }
}

export const matchingEngine = new MatchingEngineService();
