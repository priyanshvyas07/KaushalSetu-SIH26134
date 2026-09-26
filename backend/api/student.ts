import { Router, Request, Response } from 'express';
import { db } from '../database/store';
import { skillExtractor } from '../services/skillExtractor';
import { matchingEngine } from '../services/matchingEngine';
import { askCareerCopilotWithAI } from '../services/aiService';
import { dataProvider } from '../services/dataProvider';
import { ProficiencyLevel, StudentSkill } from '../types/models';

export const studentRouter = Router();

// Helper to get active student profile
function getActiveProfile(req: Request) {
  // Try default student user id
  let profile = db.studentProfiles.get('usr-student-1');
  if (!profile) {
    profile = Array.from(db.studentProfiles.values())[0];
  }
  return profile;
}

// 1. Overview & Profile
studentRouter.get('/profile', (req: Request, res: Response) => {
  const profile = getActiveProfile(req);
  if (!profile) {
    res.status(404).json({ error: 'Profile not found.' });
    return;
  }

  // Enrich skill details
  const enrichedSkills = profile.skills.map(s => {
    const skillDetail = db.getSkillById(s.skillId);
    return {
      ...s,
      skillName: skillDetail ? skillDetail.canonicalName : s.skillId,
      category: skillDetail?.category || 'General',
      marketDemand: skillDetail?.marketDemandLevel || 'HIGH',
    };
  });

  // Calculate gaps against current target role
  const gapAnalysis = matchingEngine.evaluateRoleSkillGaps(profile, profile.targetRole);

  res.json({
    profile: {
      ...profile,
      skills: enrichedSkills,
    },
    gapAnalysis,
    _dataSource: dataProvider.getMetadata(),
  });
});

// Update profile target career & preferences
studentRouter.put('/profile', (req: Request, res: Response) => {
  const profile = getActiveProfile(req);
  if (!profile) {
    res.status(404).json({ error: 'Profile not found.' });
    return;
  }

  const { targetRole, preferredLocation, experienceLevel, education, bio } = req.body;
  if (targetRole) profile.targetRole = targetRole;
  if (preferredLocation) profile.preferredLocation = preferredLocation;
  if (experienceLevel) profile.experienceLevel = experienceLevel;
  if (education) profile.education = education;
  if (bio) profile.bio = bio;

  // Recalculate completion
  let completion = 50;
  if (profile.education) completion += 15;
  if (profile.skills.length >= 3) completion += 20;
  if (profile.resumeText) completion += 15;
  profile.profileCompletionPct = Math.min(100, completion);

  db.saveStudentProfile(profile);

  res.json({
    message: 'Profile updated successfully.',
    profile,
  });
});

// 2. Resume Intelligence: Upload & Parse
const handleResumeUpload = async (req: Request, res: Response) => {
  try {
    const profile = getActiveProfile(req);
    if (!profile) {
      res.status(404).json({ error: 'Profile not found.' });
      return;
    }

    const { resumeText, base64Pdf, fileName } = req.body;
    if (!resumeText && !base64Pdf) {
      res.status(400).json({ error: 'Please provide resumeText or base64Pdf data.' });
      return;
    }

    const rawContent = base64Pdf || resumeText;
    const isPdf = Boolean(base64Pdf);

    const extraction = await skillExtractor.extractFromResumeHybrid(rawContent, isPdf);

    // Save resume text and update student skills with normalized skills
    profile.resumeFileName = fileName || 'Uploaded_Resume.pdf';
    profile.resumeText = resumeText || (extraction.parsedAI ? extraction.parsedAI.summary : 'Resume uploaded in PDF format.');

    const existingSkillIds = new Set(profile.skills.map(s => s.skillId));

    const newlyAddedSkills: StudentSkill[] = [];
    for (const skill of extraction.normalizedSkills) {
      if (!existingSkillIds.has(skill.id)) {
        existingSkillIds.add(skill.id);
        const newStudentSkill: StudentSkill = {
          skillId: skill.id,
          proficiency: 'INTERMEDIATE',
          verified: false,
          source: 'RESUME',
          lastEvaluated: new Date().toISOString(),
        };
        profile.skills.push(newStudentSkill);
        newlyAddedSkills.push(newStudentSkill);
      }
    }

    profile.profileCompletionPct = Math.min(100, profile.profileCompletionPct + 15);
    db.saveStudentProfile(profile);

    res.json({
      message: `Resume parsed successfully. Extracted ${extraction.normalizedSkills.length} normalized skills (${newlyAddedSkills.length} new).`,
      parsedAI: extraction.parsedAI,
      normalizedSkills: extraction.normalizedSkills,
      newlyAddedCount: newlyAddedSkills.length,
      currentSkillsCount: profile.skills.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Resume parsing failed.' });
  }
};

studentRouter.post('/resume/upload', handleResumeUpload);
studentRouter.post('/resume/parse', handleResumeUpload);
studentRouter.post('/analyze-resume', handleResumeUpload);

// 2.1 Get Student Skills
studentRouter.get('/skills', (req: Request, res: Response) => {
  const profile = getActiveProfile(req);
  if (!profile) {
    res.status(404).json({ error: 'Profile not found.' });
    return;
  }
  const enrichedSkills = profile.skills.map(s => {
    const skillDetail = db.getSkillById(s.skillId);
    return {
      ...s,
      skillName: skillDetail ? skillDetail.canonicalName : s.skillId,
      category: skillDetail?.category || 'General',
      marketDemand: skillDetail?.marketDemandLevel || 'HIGH',
    };
  });
  res.json({ skills: enrichedSkills, count: enrichedSkills.length });
});

// 3. Skill Gap Analysis
const handleSkillGaps = (req: Request, res: Response) => {
  const profile = getActiveProfile(req);
  if (!profile) {
    res.status(404).json({ error: 'Profile not found.' });
    return;
  }

  const roleGaps = matchingEngine.evaluateRoleSkillGaps(profile, profile.targetRole);

  res.json({
    roleGaps,
    targetRole: profile.targetRole,
    studentSkillsCount: profile.skills.length,
    dataSource: 'SAMPLE BENCHMARK - Aggregated from Indian Tech Roles',
  });
};

studentRouter.get('/skill-gaps', handleSkillGaps);
studentRouter.get('/skill-gap', handleSkillGaps);

// 4. Job Matching
const handleJobMatching = (req: Request, res: Response) => {
  const profile = getActiveProfile(req);
  if (!profile) {
    res.status(404).json({ error: 'Profile not found.' });
    return;
  }

  const allJobs = db.getAllJobs();
  const matchedJobs = allJobs.map(job => matchingEngine.matchStudentToJob(profile, job));

  // Sort by overall match descending
  matchedJobs.sort((a, b) => b.overallMatchPct - a.overallMatchPct);

  res.json({
    matches: matchedJobs,
    studentTargetRole: profile.targetRole,
  });
};

studentRouter.get('/jobs/match', handleJobMatching);
studentRouter.get('/jobs', handleJobMatching);

// 5. Learning Roadmap
studentRouter.get('/roadmap', (req: Request, res: Response) => {
  const profile = getActiveProfile(req);
  if (!profile) {
    res.status(404).json({ error: 'Profile not found.' });
    return;
  }

  // Pre-configured structured roadmap stages tailored to cloud/devops & software engineering
  const roadmapStages = [
    {
      id: 'stage-1',
      title: 'Foundation: Operating Systems & Networking',
      level: 'BEGINNER',
      modules: [
        { id: 'mod-linux-sys', title: 'Linux Administration, File Permissions & Shell Scripting', skill: 'Linux', estimatedHours: 18, isCompleted: true },
        { id: 'mod-git-branching', title: 'Git Branching Strategies & Conventional Commits', skill: 'Git', estimatedHours: 8, isCompleted: true },
        { id: 'mod-networking', title: 'TCP/IP, HTTP/HTTPS Protocols & DNS Resolution', skill: 'Linux', estimatedHours: 12, isCompleted: true }
      ]
    },
    {
      id: 'stage-2',
      title: 'Intermediate: Containerization & Cloud Fundamentals',
      level: 'INTERMEDIATE',
      modules: [
        {
          id: 'mod-docker-basics',
          title: 'Dockerfiles, Layer Caching & Multi-Stage Production Builds',
          skill: 'Docker',
          estimatedHours: 20,
          isCompleted: Boolean(profile.savedRoadmapProgress?.['mod-docker-basics'])
        },
        {
          id: 'mod-docker-compose',
          title: 'Multi-Container Microservices with Docker Compose',
          skill: 'Docker',
          estimatedHours: 14,
          isCompleted: Boolean(profile.savedRoadmapProgress?.['mod-docker-compose'])
        },
        {
          id: 'mod-aws-core',
          title: 'AWS VPCs, Subnets, EC2 Instance Profiles & IAM Roles',
          skill: 'AWS',
          estimatedHours: 24,
          isCompleted: Boolean(profile.savedRoadmapProgress?.['mod-aws-core'])
        }
      ]
    },
    {
      id: 'stage-3',
      title: 'Advanced: Container Orchestration & Infrastructure as Code',
      level: 'ADVANCED',
      modules: [
        {
          id: 'mod-k8s-pods',
          title: 'Kubernetes Pods, ReplicaSets, Deployments & Service Ingress',
          skill: 'Kubernetes',
          estimatedHours: 28,
          isCompleted: Boolean(profile.savedRoadmapProgress?.['mod-k8s-pods'])
        },
        {
          id: 'mod-terraform-iac',
          title: 'Terraform State Management, Providers & Reusable Cloud Modules',
          skill: 'Terraform',
          estimatedHours: 20,
          isCompleted: Boolean(profile.savedRoadmapProgress?.['mod-terraform-iac'])
        },
        {
          id: 'mod-ci-cd-pipelines',
          title: 'GitHub Actions Matrix Workflows & Automated ECR/EKS Deployments',
          skill: 'CI/CD Pipelines',
          estimatedHours: 16,
          isCompleted: Boolean(profile.savedRoadmapProgress?.['mod-ci-cd-pipelines'])
        }
      ]
    },
    {
      id: 'stage-4',
      title: 'Production Capstone & Assessment',
      level: 'CAPSTONE',
      modules: [
        {
          id: 'mod-capstone-deploy',
          title: 'Deploy Scalable Microservices with Observability (Prometheus/Grafana)',
          skill: 'DevOps / Cloud Engineer',
          estimatedHours: 35,
          isCompleted: Boolean(profile.savedRoadmapProgress?.['mod-capstone-deploy'])
        },
        {
          id: 'mod-assessment-verify',
          title: 'Pass Verified Docker & AWS Skill Assessments to earn Badge',
          skill: 'Docker',
          estimatedHours: 4,
          isCompleted: Boolean(profile.savedRoadmapProgress?.['mod-assessment-verify'])
        }
      ]
    }
  ];

  let totalModules = 0;
  let completedModules = 0;
  for (const st of roadmapStages) {
    for (const m of st.modules) {
      totalModules++;
      if (m.isCompleted) completedModules++;
    }
  }

  res.json({
    stages: roadmapStages,
    progressPct: Math.round((completedModules / totalModules) * 100),
    totalModules,
    completedModules,
  });
});

// Toggle roadmap progress
studentRouter.post('/roadmap/progress', (req: Request, res: Response) => {
  const profile = getActiveProfile(req);
  if (!profile) {
    res.status(404).json({ error: 'Profile not found.' });
    return;
  }

  const { moduleId, isCompleted } = req.body;
  if (!moduleId) {
    res.status(400).json({ error: 'Missing moduleId.' });
    return;
  }

  if (!profile.savedRoadmapProgress) {
    profile.savedRoadmapProgress = {};
  }
  profile.savedRoadmapProgress[moduleId] = Boolean(isCompleted);
  db.saveStudentProfile(profile);

  res.json({
    message: 'Roadmap progress updated.',
    savedProgress: profile.savedRoadmapProgress,
  });
});

// 6. Skill Assessments
studentRouter.get('/assessments', (req: Request, res: Response) => {
  const profile = getActiveProfile(req);
  const assessments = db.getAllAssessments();
  const results = profile ? db.getAssessmentResultsForStudent(profile.id) : [];

  const enriched = assessments.map(a => {
    const existingResult = results.find(r => r.assessmentId === a.id);
    return {
      id: a.id,
      skillId: a.skillId,
      skillName: a.skillName,
      title: a.title,
      durationMinutes: a.durationMinutes,
      questionsCount: a.questions.length,
      hasAttempted: Boolean(existingResult),
      lastScore: existingResult?.score,
      passed: existingResult?.passed || false,
    };
  });

  res.json({ assessments: enriched });
});

studentRouter.get('/assessments/:id', (req: Request, res: Response) => {
  const assessment = db.getAssessmentById(req.params.id);
  if (!assessment) {
    res.status(404).json({ error: 'Assessment not found.' });
    return;
  }

  // Do not expose correct answers during quiz attempt
  const sanitizedQuestions = assessment.questions.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options,
  }));

  res.json({
    id: assessment.id,
    skillId: assessment.skillId,
    skillName: assessment.skillName,
    title: assessment.title,
    durationMinutes: assessment.durationMinutes,
    questions: sanitizedQuestions,
  });
});

studentRouter.post('/assessments/:id/submit', (req: Request, res: Response) => {
  const profile = getActiveProfile(req);
  if (!profile) {
    res.status(404).json({ error: 'Profile not found.' });
    return;
  }

  const assessment = db.getAssessmentById(req.params.id);
  if (!assessment) {
    res.status(404).json({ error: 'Assessment not found.' });
    return;
  }

  const { answers } = req.body; // Map: questionId -> selectedOptionIndex
  if (!answers || typeof answers !== 'object') {
    res.status(400).json({ error: 'Answers must be provided.' });
    return;
  }

  let correctCount = 0;
  const questionFeedback: any[] = [];

  for (const q of assessment.questions) {
    const userSelected = answers[q.id];
    const isCorrect = userSelected === q.correctOptionIndex;
    if (isCorrect) correctCount++;

    questionFeedback.push({
      questionId: q.id,
      question: q.question,
      userSelected,
      correctOptionIndex: q.correctOptionIndex,
      isCorrect,
      explanation: q.explanation,
    });
  }

  const scorePct = Math.round((correctCount / assessment.questions.length) * 100);
  const passed = scorePct >= 66; // 66% passing mark

  const result = {
    id: `res-${Date.now()}`,
    studentId: profile.id,
    assessmentId: assessment.id,
    skillId: assessment.skillId,
    score: scorePct,
    total: 100,
    passed,
    evaluatedAt: new Date().toISOString(),
  };

  db.addAssessmentResult(result);

  // If passed, verify or add this skill to student profile
  if (passed) {
    const existingSkill = profile.skills.find(s => s.skillId === assessment.skillId);
    if (existingSkill) {
      existingSkill.verified = true;
      existingSkill.source = 'ASSESSMENT';
      existingSkill.proficiency = 'INTERMEDIATE';
      existingSkill.lastEvaluated = new Date().toISOString();
    } else {
      profile.skills.push({
        skillId: assessment.skillId,
        proficiency: 'INTERMEDIATE',
        verified: true,
        source: 'ASSESSMENT',
        lastEvaluated: new Date().toISOString(),
      });
    }
    db.saveStudentProfile(profile);
  }

  res.json({
    result,
    passed,
    scorePct,
    correctCount,
    totalQuestions: assessment.questions.length,
    questionFeedback,
    verifiedSkillUpdated: passed,
  });
});

// 7. AI Career Copilot
studentRouter.post('/copilot', async (req: Request, res: Response) => {
  try {
    const profile = getActiveProfile(req);
    const { query, history } = req.body;
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query text is required.' });
      return;
    }

    const currentSkillNames = (profile?.skills || []).map(s => {
      const sk = db.getSkillById(s.skillId);
      return sk ? sk.canonicalName : s.skillId;
    });

    const gapEval = profile ? matchingEngine.evaluateRoleSkillGaps(profile, profile.targetRole) : null;
    const missingSkills = (gapEval?.marketSkillsNeeded || [])
      .filter(m => m.isMissing)
      .map(m => m.skill.canonicalName);

    const targetJobs = db.getAllJobs().slice(0, 3).map(j => `${j.title} at ${j.employerName}`);

    const context = {
      name: profile?.userId || 'Student Candidate',
      targetRole: profile?.targetRole || 'Software / Cloud Engineer',
      currentSkills: currentSkillNames,
      missingSkills,
      targetJobs,
      topRegionalOpenings: 32000,
    };

    const meta = dataProvider.getMetadata();
    const aiResult = await askCareerCopilotWithAI(
      query,
      {
        ...context,
        dataSourceLabel: meta.label,
        isLiveDataSource: meta.isLive,
      },
      Array.isArray(history) ? history : undefined
    );

    res.json({
      query,
      answer: aiResult.answer,
      isLive: aiResult.isLive,
      provider: aiResult.provider,
      model: aiResult.model,
      fallbackUsed: aiResult.fallbackUsed,
      dataSource: meta.label,
      groundedContext: {
        targetRole: context.targetRole,
        evaluatedMissingSkills: missingSkills,
        currentSkills: currentSkillNames,
        provider: aiResult.provider,
        model: aiResult.model,
        isLive: aiResult.isLive,
        dataSource: meta.label,
      },
      _dataSource: meta,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Copilot query failed.' });
  }
});
