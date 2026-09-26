import { Router, Request, Response } from 'express';
import { db } from '../database/store';
import { generateJobRequirementsWithGemini } from '../services/geminiService';
import { skillExtractor } from '../services/skillExtractor';
import { matchingEngine } from '../services/matchingEngine';
import { dataProvider } from '../services/dataProvider';
import { Job, JobSkill, ProficiencyLevel } from '../types/models';

export const employerRouter = Router();

// 1. Overview & Postings
employerRouter.get('/jobs', (req: Request, res: Response) => {
  const jobs = db.getAllJobs();
  res.json({
    jobs,
    _dataSource: dataProvider.getMetadata(),
  });
});

// 2. AI Job Requirement Generator
const handleJobAnalysis = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Hiring prompt is required (e.g. "I need a junior DevOps engineer").' });
      return;
    }

    const aiGenerated = await generateJobRequirementsWithGemini(prompt);

    // Normalize generated skills
    const requiredNormalized = skillExtractor.normalizeSkills(aiGenerated?.requiredSkills || ['Linux', 'Docker', 'Git', 'AWS']);
    const preferredNormalized = skillExtractor.normalizeSkills(aiGenerated?.preferredSkills || ['Kubernetes', 'Terraform']);

    res.json({
      title: aiGenerated?.title || 'DevOps Platform Engineer',
      roleCategory: aiGenerated?.roleCategory || 'DevOps / Cloud Engineer',
      description: aiGenerated?.description || 'Build and automate cloud infrastructure, container deployments, and CI/CD pipelines.',
      experienceMinYears: aiGenerated?.experienceMinYears ?? 1,
      salaryMinLPA: aiGenerated?.salaryMinLPA ?? 10,
      salaryMaxLPA: aiGenerated?.salaryMaxLPA ?? 16,
      requiredSkills: requiredNormalized.map(s => ({
        skillId: s.id,
        skillName: s.canonicalName,
        category: s.category,
        isRequired: true,
        minProficiency: 'INTERMEDIATE' as ProficiencyLevel,
      })),
      preferredSkills: preferredNormalized.map(s => ({
        skillId: s.id,
        skillName: s.canonicalName,
        category: s.category,
        isRequired: false,
        minProficiency: 'BEGINNER' as ProficiencyLevel,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'AI Job generation failed.' });
  }
};

employerRouter.post('/jobs/ai-generate', handleJobAnalysis);
employerRouter.post('/job/analyze', handleJobAnalysis);

// 3. Save / Create Job
employerRouter.post('/jobs', (req: Request, res: Response) => {
  try {
    const {
      title,
      roleCategory,
      locationCity,
      locationState,
      experienceMinYears,
      salaryMinLPA,
      salaryMaxLPA,
      description,
      skills,
    } = req.body;

    if (!title || !description || !skills || !Array.isArray(skills)) {
      res.status(400).json({ error: 'Title, description, and skills are required.' });
      return;
    }

    const newJob: Job = {
      id: `job-${Date.now()}`,
      employerId: 'usr-employer-1',
      employerName: 'Razorpay',
      title,
      roleCategory: roleCategory || 'Software Engineering',
      locationCity: locationCity || 'Bengaluru',
      locationState: locationState || 'Karnataka',
      experienceMinYears: Number(experienceMinYears) || 0,
      salaryMinLPA: Number(salaryMinLPA) || 8,
      salaryMaxLPA: Number(salaryMaxLPA) || 16,
      description,
      postedAt: new Date().toISOString(),
      dataSource: 'REAL VERIFIED',
      skills: skills.map((s: any) => ({
        skillId: s.skillId,
        isRequired: Boolean(s.isRequired),
        minProficiency: s.minProficiency || 'INTERMEDIATE',
      })),
    };

    db.createJob(newJob);

    res.status(201).json({
      message: 'Job posting published successfully.',
      job: newJob,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create job.' });
  }
});

// 4. Candidate Matching for Job
const handleCandidateMatching = (req: Request, res: Response) => {
  const jobId = req.params.jobId || (req.query.jobId as string);
  let job = jobId ? db.getJobById(jobId) : undefined;
  if (!job) {
    job = db.getAllJobs()[0];
  }
  if (!job) {
    res.status(404).json({ error: 'Job not found.' });
    return;
  }

  // Evaluate all students in database
  const profiles = Array.from(db.studentProfiles.values());
  const candidateMatches = profiles.map(profile => {
    const user = db.getUserById(profile.userId);
    const match = matchingEngine.matchStudentToJob(profile, job!);

    return {
      candidateId: profile.id,
      candidateName: user?.name || 'Anonymous Candidate',
      education: profile.education,
      targetRole: profile.targetRole,
      overallMatchPct: match.overallMatchPct,
      requiredMatchPct: match.requiredMatchPct,
      preferredMatchPct: match.preferredMatchPct,
      matchedSkillsCount: match.matchedSkillsCount,
      totalRequiredCount: match.totalRequiredCount,
      strongSkills: match.strongSkills,
      missingSkills: match.missingSkills,
      weakSkills: match.weakSkills,
      matchBreakdownExplanation: match.matchBreakdownExplanation,
    };
  });

  candidateMatches.sort((a, b) => b.overallMatchPct - a.overallMatchPct);

  res.json({
    job,
    totalCandidatesEvaluated: candidateMatches.length,
    matches: candidateMatches,
  });
};

employerRouter.get('/candidates/match/:jobId', handleCandidateMatching);
employerRouter.get('/matching', handleCandidateMatching);

// 5. Submit Employer Skill Survey
employerRouter.post('/survey', (req: Request, res: Response) => {
  try {
    const {
      employerName,
      industry,
      hardToHireSkills,
      emergingSkills,
      fresherGaps,
      recommendedCertifications,
      additionalRemarks,
    } = req.body;

    if (!employerName || !industry) {
      res.status(400).json({ error: 'Employer name and industry are required.' });
      return;
    }

    const surveySubmission = {
      id: `es-${Date.now()}`,
      employerId: 'usr-employer-1',
      employerName,
      industry,
      hardToHireSkills: Array.isArray(hardToHireSkills) ? hardToHireSkills : [hardToHireSkills].filter(Boolean),
      emergingSkills: Array.isArray(emergingSkills) ? emergingSkills : [emergingSkills].filter(Boolean),
      fresherGaps: Array.isArray(fresherGaps) ? fresherGaps : [fresherGaps].filter(Boolean),
      recommendedCertifications: Array.isArray(recommendedCertifications) ? recommendedCertifications : [recommendedCertifications].filter(Boolean),
      additionalRemarks: additionalRemarks || '',
      submittedAt: new Date().toISOString(),
    };

    db.addSurvey(surveySubmission);

    res.status(201).json({
      message: 'Industry requirements survey submitted and incorporated into central intelligence engine.',
      survey: surveySubmission,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Survey submission failed.' });
  }
});
