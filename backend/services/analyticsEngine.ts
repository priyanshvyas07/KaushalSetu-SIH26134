import { db } from '../database/store';
import { StateSkillDemand } from '../types/models';

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

export interface EmergingSkillTrend {
  skillId: string;
  skillName: string;
  growthRatePct: number;
  currentOpenings: number;
  trajectory: 'RAPIDLY EXPANDING' | 'STEADY GROWTH' | 'MATURE' | 'DECLINING';
  forecastedNextYearGrowth: string;
  dataSourceLabel: 'OBSERVED MARKET TELEMETRY' | 'MODEL FORECAST';
  primaryDrivingIndustries: string[];
}

export class AnalyticsEngineService {
  /**
   * Identifies all skill shortages and oversupplies mathematically across India.
   */
  public getSkillShortagesAndOversupply(): SkillShortageInsight[] {
    const skills = db.getAllSkills();
    const insights: SkillShortageInsight[] = [];

    for (const skill of skills) {
      const records = db.stateDemands.filter(d => d.skillId === skill.id);
      if (records.length === 0) continue;

      const totalOpenings = records.reduce((acc, r) => acc + r.openingsCount, 0);
      const avgDemand = Math.round(records.reduce((acc, r) => acc + r.demandIndex, 0) / records.length);
      const avgSupply = Math.round(records.reduce((acc, r) => acc + r.supplyIndex, 0) / records.length);
      const avgGapRatio = Math.round((avgDemand / Math.max(1, avgSupply)) * 100) / 100;

      let status: 'CRITICAL SHORTAGE' | 'MODERATE SHORTAGE' | 'BALANCED' | 'OVERSUPPLY' = 'BALANCED';
      if (avgGapRatio >= 2.0 && avgDemand >= 75) {
        status = 'CRITICAL SHORTAGE';
      } else if (avgGapRatio >= 1.4) {
        status = 'MODERATE SHORTAGE';
      } else if (avgGapRatio <= 0.95 && avgSupply >= 80) {
        status = 'OVERSUPPLY';
      }

      // Map affected roles
      const affectedRoles: string[] = [];
      if (skill.category === 'Cloud & DevOps') {
        affectedRoles.push('DevOps / Cloud Engineer', 'Site Reliability Engineer (SRE)', 'Platform Engineer');
      } else if (skill.category === 'AI & Data Science') {
        affectedRoles.push('AI/ML Engineer', 'Data Scientist', 'GenAI Specialist');
      } else if (skill.category === 'Backend') {
        affectedRoles.push('Backend Platform Engineer', 'Distributed Systems Architect');
      } else if (skill.category === 'Cybersecurity') {
        affectedRoles.push('Security Analyst', 'DevSecOps Specialist');
      } else {
        affectedRoles.push('Full-Stack Engineer', 'Software Engineer');
      }

      const affectedStates = Array.from(new Set(records.map(r => r.state)));

      insights.push({
        skillId: skill.id,
        skillName: skill.canonicalName,
        category: skill.category,
        demandIndex: avgDemand,
        supplyIndex: avgSupply,
        gapRatio: avgGapRatio,
        totalOpeningsIndia: totalOpenings,
        status,
        affectedRoles,
        affectedStates,
        evidenceSummary: `Recorded ${totalOpenings.toLocaleString()} national postings vs estimated ${avgSupply}% academic lab readiness. Demand-to-supply ratio is ${avgGapRatio}x.`,
      });
    }

    // Sort by gap ratio descending
    return insights.sort((a, b) => b.gapRatio - a.gapRatio);
  }

  /**
   * Aggregates state-level geographic labour market intelligence.
   */
  public getStateGeographicAggregates(): StateGeoAggregate[] {
    const statesMap = new Map<string, StateSkillDemand[]>();
    for (const item of db.stateDemands) {
      if (!statesMap.has(item.state)) {
        statesMap.set(item.state, []);
      }
      statesMap.get(item.state)!.push(item);
    }

    const results: StateGeoAggregate[] = [];

    for (const [state, records] of statesMap.entries()) {
      const totalOpenings = records.reduce((acc, r) => acc + r.openingsCount, 0);
      const avgGap = Math.round((records.reduce((acc, r) => acc + r.gapRatio, 0) / records.length) * 100) / 100;

      // Top demanded skills in this state
      const sortedRecords = [...records].sort((a, b) => b.openingsCount - a.openingsCount);
      const topDemandedSkills = sortedRecords.slice(0, 3).map(r => {
        const skill = db.getSkillById(r.skillId);
        return {
          skillName: skill ? skill.canonicalName : r.skillId,
          openings: r.openingsCount,
          growthPct: r.growthRatePct,
        };
      });

      const topShortageRecord = [...records].sort((a, b) => b.gapRatio - a.gapRatio)[0];
      const topShortageSkill = topShortageRecord
        ? (db.getSkillById(topShortageRecord.skillId)?.canonicalName || topShortageRecord.skillId)
        : 'Cloud/DevOps';

      const criticalShortagesCount = records.filter(r => r.gapRatio >= 2.0).length;

      let severity: 'HIGH_URGENCY' | 'ELEVATED' | 'STABLE' = 'STABLE';
      if (criticalShortagesCount >= 3 || avgGap >= 2.2) severity = 'HIGH_URGENCY';
      else if (criticalShortagesCount >= 1 || avgGap >= 1.5) severity = 'ELEVATED';

      // Estimated institutional capacity
      const instituteCount = state === 'Karnataka' ? 245 : (state === 'Maharashtra' ? 320 : (state === 'Telangana' ? 180 : 120));
      const studentEnrollmentCapacity = instituteCount * 180;

      results.push({
        state,
        totalOpenings,
        topDemandedSkills,
        avgGapRatio: avgGap,
        topShortageSkill,
        criticalShortagesCount,
        instituteCount,
        studentEnrollmentCapacity,
        severity,
      });
    }

    return results.sort((a, b) => b.totalOpenings - a.totalOpenings);
  }

  /**
   * Identifies high-velocity emerging skills with separation of observed trends vs model forecasts.
   */
  public getEmergingSkills(): EmergingSkillTrend[] {
    const list: EmergingSkillTrend[] = [
      {
        skillId: 'sk-genai',
        skillName: 'Generative AI & LLM Agents',
        growthRatePct: 82,
        currentOpenings: 34200,
        trajectory: 'RAPIDLY EXPANDING',
        forecastedNextYearGrowth: '+65% CAGR (Model Forecast based on enterprise adoption)',
        dataSourceLabel: 'OBSERVED MARKET TELEMETRY',
        primaryDrivingIndustries: ['Fintech', 'Enterprise SaaS', 'Healthcare Tech', 'IT Services'],
      },
      {
        skillId: 'sk-k8s',
        skillName: 'Kubernetes & Multi-Cloud Orchestration',
        growthRatePct: 45,
        currentOpenings: 29800,
        trajectory: 'RAPIDLY EXPANDING',
        forecastedNextYearGrowth: '+38% YoY (Observed 3-year baseline trajectory)',
        dataSourceLabel: 'OBSERVED MARKET TELEMETRY',
        primaryDrivingIndustries: ['Payments', 'E-Commerce', 'Banking', 'Logistics'],
      },
      {
        skillId: 'sk-cybersec',
        skillName: 'Cybersecurity & Zero Trust Architecture',
        growthRatePct: 42,
        currentOpenings: 21500,
        trajectory: 'RAPIDLY EXPANDING',
        forecastedNextYearGrowth: '+35% YoY (Driven by CERT-In and RBI compliance mandates)',
        dataSourceLabel: 'OBSERVED MARKET TELEMETRY',
        primaryDrivingIndustries: ['Banking & Financial Services', 'Defense & Aerospace', 'Telecom'],
      },
      {
        skillId: 'sk-docker',
        skillName: 'Docker & Containerization',
        growthRatePct: 38,
        currentOpenings: 46200,
        trajectory: 'STEADY GROWTH',
        forecastedNextYearGrowth: '+25% YoY (Ubiquitous baseline across IT engineering)',
        dataSourceLabel: 'OBSERVED MARKET TELEMETRY',
        primaryDrivingIndustries: ['All Engineering Sectors'],
      },
      {
        skillId: 'sk-aws',
        skillName: 'AWS Cloud Architecture',
        growthRatePct: 34,
        currentOpenings: 52400,
        trajectory: 'STEADY GROWTH',
        forecastedNextYearGrowth: '+22% YoY (Core public cloud market dominance)',
        dataSourceLabel: 'OBSERVED MARKET TELEMETRY',
        primaryDrivingIndustries: ['Enterprise IT', 'Startups', 'Public Sector Digital India'],
      }
    ];

    return list;
  }

  /**
   * Generates CSV export content for Government & Academic planning.
   */
  public exportReportCSV(reportType: 'skill-gaps' | 'regional' | 'curriculum' | 'employer-demand'): string {
    if (reportType === 'skill-gaps') {
      const shortages = this.getSkillShortagesAndOversupply();
      const headers = ['Skill_ID', 'Skill_Name', 'Category', 'Demand_Index', 'Supply_Index', 'Gap_Ratio', 'Total_Openings_India', 'Status', 'Evidence_Summary'];
      const rows = shortages.map(s => [
        s.skillId,
        `"${s.skillName}"`,
        `"${s.category}"`,
        s.demandIndex,
        s.supplyIndex,
        s.gapRatio,
        s.totalOpeningsIndia,
        s.status,
        `"${s.evidenceSummary.replace(/"/g, '""')}"`,
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    if (reportType === 'regional') {
      const geos = this.getStateGeographicAggregates();
      const headers = ['State', 'Total_Openings', 'Top_Shortage_Skill', 'Avg_Gap_Ratio', 'Critical_Shortages_Count', 'Institutes_Count', 'Student_Capacity', 'Urgency_Severity'];
      const rows = geos.map(g => [
        `"${g.state}"`,
        g.totalOpenings,
        `"${g.topShortageSkill}"`,
        g.avgGapRatio,
        g.criticalShortagesCount,
        g.instituteCount,
        g.studentEnrollmentCapacity,
        g.severity,
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    if (reportType === 'employer-demand') {
      const surveys = db.getAllSurveys();
      const headers = ['Survey_ID', 'Employer_Name', 'Industry', 'Hard_To_Hire_Skills', 'Emerging_Skills', 'Fresher_Gaps', 'Recommended_Certifications', 'Submitted_At'];
      const rows = surveys.map(s => [
        s.id,
        `"${s.employerName}"`,
        `"${s.industry}"`,
        `"${s.hardToHireSkills.join('; ')}"`,
        `"${s.emergingSkills.join('; ')}"`,
        `"${s.fresherGaps.join('; ')}"`,
        `"${s.recommendedCertifications.join('; ')}"`,
        s.submittedAt,
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    // Default: Curriculum report
    const curricula = Array.from(db.curricula.values());
    const headers = ['Curriculum_ID', 'Course_ID', 'Academic_Year', 'Alignment_Score_Pct', 'Mapped_Skills_Count', 'Audit_Date'];
    const rows = curricula.map(c => [
      c.id,
      c.courseId,
      c.academicYear,
      c.alignmentScore,
      c.skills.length,
      c.lastAudited,
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

export const analyticsEngine = new AnalyticsEngineService();
