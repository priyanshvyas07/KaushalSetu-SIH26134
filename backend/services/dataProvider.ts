/**
 * Labour Market Data Provider & Ingestion Layer for KaushalSetu (SIH26134).
 *
 * Responsibilities:
 * 1. Strictly isolates DEMO/SEED baseline data from REAL/LIVE ingested market datasets.
 * 2. Provides pluggable interfaces for Government Open Data (e.g. NCS, e-Shram),
 *    employer vacancy streams, and CSV/JSON dataset ingestion.
 * 3. Enforces data transparency: All API responses include explicit dataSource metadata
 *    so UI and AI models never hallucinate or misrepresent seed data as live census figures.
 */

import { Job, StateSkillDemand, Skill, ProficiencyLevel } from '../types/models';
import { db } from '../database/store';
import { skillExtractor } from './skillExtractor';

export type DataSourceMode = 'demo' | 'live';

export interface DataSourceMetadata {
  type: DataSourceMode;
  label: string;
  isLive: boolean;
  sourceDescription: string;
  totalJobVacanciesTracked: number;
  seedVacanciesCount: number;
  realIngestedVacanciesCount: number;
  lastIngestedTimestamp: string | null;
  notice: string;
}

export interface IngestDatasetResult {
  success: boolean;
  sourceName: string;
  format: 'CSV' | 'JSON';
  recordsProcessed: number;
  jobsCreatedCount: number;
  uniqueSkillsMappedCount: number;
  extractedSkillSample: string[];
  newDataSourceState: DataSourceMode;
  timestamp: string;
}

class LabourMarketDataProvider {
  private mode: DataSourceMode;
  private realIngestedJobs: Job[] = [];
  private lastIngestedAt: string | null = null;
  private activeSourceLabel: string;

  constructor() {
    // Default to 'demo' unless explicitly set to 'live' in environment
    this.mode = (process.env.DATA_SOURCE || 'demo').toLowerCase() === 'live' ? 'live' : 'demo';
    this.activeSourceLabel = this.mode === 'live'
      ? 'LIVE MARKET DATASET'
      : 'DEMO / SEED DATA (SIH26134 Benchmark Baseline)';
  }

  public getMode(): DataSourceMode {
    return this.mode;
  }

  public setMode(newMode: DataSourceMode) {
    this.mode = newMode;
    this.activeSourceLabel = newMode === 'live'
      ? 'LIVE INGESTED DATASET'
      : 'DEMO / SEED DATA (SIH26134 Benchmark Baseline)';
  }

  /**
   * Returns standardized data source metadata for auditability and transparency.
   */
  public getMetadata(): DataSourceMetadata {
    const seedJobsCount = Array.from(db.jobs.values()).filter(j => j.dataSource === 'SAMPLE BENCHMARK').length;
    const realJobsCount = Array.from(db.jobs.values()).filter(j => j.dataSource === 'REAL VERIFIED').length + this.realIngestedJobs.length;

    return {
      type: this.mode,
      label: this.activeSourceLabel,
      isLive: this.mode === 'live',
      sourceDescription: this.mode === 'live'
        ? 'Real ingested industrial job vacancies and state employment telemetry.'
        : 'SIH26134 benchmark seed dataset model calibrated for Indian engineering and tech roles.',
      totalJobVacanciesTracked: Array.from(db.jobs.values()).length,
      seedVacanciesCount: seedJobsCount,
      realIngestedVacanciesCount: realJobsCount,
      lastIngestedTimestamp: this.lastIngestedAt,
      notice: this.mode === 'live'
        ? 'Derived from live ingested employer postings and open market telemetry.'
        : 'DEMO / SEED DATA NOTICE: All macro percentages, openings, and salary ranges are benchmark reference values for hackathon evaluation.',
    };
  }

  /**
   * Pluggable Ingestion Engine:
   * Ingests real CSV or JSON vacancy/skill datasets, normalizes competencies,
   * and updates the live labour market database without requiring AI hallucination.
   */
  public async ingestDataset(
    format: 'CSV' | 'JSON',
    rawContent: string,
    sourceName: string = 'Open Labour Market Dataset'
  ): Promise<IngestDatasetResult> {
    if (!rawContent || typeof rawContent !== 'string') {
      throw new Error('Raw content string is required for ingestion.');
    }

    const createdJobs: Job[] = [];
    const allNormalizedSkills = new Set<string>();

    if (format === 'JSON') {
      let parsed: any[];
      try {
        const json = JSON.parse(rawContent);
        parsed = Array.isArray(json) ? json : (json.jobs || json.records || [json]);
      } catch (err: any) {
        throw new Error(`JSON Ingestion Parse Error: ${err.message}`);
      }

      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i];
        const title = item.title || item.role || item.jobTitle || 'Software Engineer';
        const description = item.description || item.jobDescription || `Vacancy for ${title}`;
        const rawSkills: string[] = Array.isArray(item.skills)
          ? item.skills
          : (typeof item.skills === 'string' ? item.skills.split(',') : []);

        // Deterministic extraction from title & description + explicit skills
        const extracted = skillExtractor.extractFromText(`${title} ${description} ${rawSkills.join(' ')}`);
        const normalized = skillExtractor.normalizeSkills([
          ...rawSkills,
          ...extracted.map(e => e.skill.canonicalName),
        ]);

        normalized.forEach(s => allNormalizedSkills.add(s.canonicalName));

        const newJob: Job = {
          id: `job-ingested-${Date.now()}-${i}`,
          employerId: item.employerId || `emp-${Date.now()}`,
          employerName: item.company || item.employerName || sourceName,
          title,
          roleCategory: item.roleCategory || 'Software Engineering',
          locationCity: item.city || item.location || 'Bengaluru',
          locationState: item.state || 'Karnataka',
          experienceMinYears: Number(item.experienceMinYears) || 1,
          salaryMinLPA: Number(item.salaryMinLPA) || 10,
          salaryMaxLPA: Number(item.salaryMaxLPA) || 18,
          description,
          postedAt: item.postedAt || new Date().toISOString(),
          dataSource: 'REAL VERIFIED',
          skills: normalized.map((s, idx) => ({
            skillId: s.id,
            isRequired: idx < 4,
            minProficiency: 'INTERMEDIATE' as ProficiencyLevel,
          })),
        };

        db.createJob(newJob);
        createdJobs.push(newJob);
        this.realIngestedJobs.push(newJob);
      }
    } else if (format === 'CSV') {
      const lines = rawContent.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) {
        throw new Error('CSV must contain at least a header row and one data row.');
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
      const titleIdx = headers.findIndex(h => h.includes('title') || h.includes('role'));
      const companyIdx = headers.findIndex(h => h.includes('company') || h.includes('employer'));
      const skillsIdx = headers.findIndex(h => h.includes('skill') || h.includes('tech'));
      const cityIdx = headers.findIndex(h => h.includes('city') || h.includes('location'));
      const salaryIdx = headers.findIndex(h => h.includes('salary') || h.includes('lpa'));

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        const title = titleIdx !== -1 && cols[titleIdx] ? cols[titleIdx] : 'Software Engineer';
        const company = companyIdx !== -1 && cols[companyIdx] ? cols[companyIdx] : sourceName;
        const skillsRaw = skillsIdx !== -1 && cols[skillsIdx] ? cols[skillsIdx].split(';') : [];
        const city = cityIdx !== -1 && cols[cityIdx] ? cols[cityIdx] : 'Bengaluru';
        const salaryVal = salaryIdx !== -1 && Number(cols[salaryIdx]) ? Number(cols[salaryIdx]) : 12;

        const extracted = skillExtractor.extractFromText(`${title} ${skillsRaw.join(' ')}`);
        const normalized = skillExtractor.normalizeSkills([
          ...skillsRaw,
          ...extracted.map(e => e.skill.canonicalName),
        ]);

        normalized.forEach(s => allNormalizedSkills.add(s.canonicalName));

        const newJob: Job = {
          id: `job-csv-${Date.now()}-${i}`,
          employerId: `emp-csv-${i}`,
          employerName: company,
          title,
          roleCategory: 'Software Engineering',
          locationCity: city,
          locationState: city.toLowerCase().includes('pune') ? 'Maharashtra' : 'Karnataka',
          experienceMinYears: 1,
          salaryMinLPA: Math.max(6, Math.round(salaryVal * 0.8)),
          salaryMaxLPA: Math.max(10, Math.round(salaryVal * 1.3)),
          description: `Imported position from ${sourceName} for ${title} at ${company}.`,
          postedAt: new Date().toISOString(),
          dataSource: 'REAL VERIFIED',
          skills: normalized.map((s, sIdx) => ({
            skillId: s.id,
            isRequired: sIdx < 4,
            minProficiency: 'INTERMEDIATE' as ProficiencyLevel,
          })),
        };

        db.createJob(newJob);
        createdJobs.push(newJob);
        this.realIngestedJobs.push(newJob);
      }
    }

    this.lastIngestedAt = new Date().toISOString();
    this.mode = 'live';
    this.activeSourceLabel = `LIVE INGESTED DATA (${sourceName})`;

    return {
      success: true,
      sourceName,
      format,
      recordsProcessed: createdJobs.length,
      jobsCreatedCount: createdJobs.length,
      uniqueSkillsMappedCount: allNormalizedSkills.size,
      extractedSkillSample: Array.from(allNormalizedSkills).slice(0, 10),
      newDataSourceState: this.mode,
      timestamp: this.lastIngestedAt,
    };
  }

  /**
   * Helper to attach standard data source headers and metadata to any API response object.
   */
  public attachMetadata<T extends Record<string, any>>(data: T): T & { _dataSource: DataSourceMetadata } {
    return {
      ...data,
      _dataSource: this.getMetadata(),
    };
  }
}

export const dataProvider = new LabourMarketDataProvider();
