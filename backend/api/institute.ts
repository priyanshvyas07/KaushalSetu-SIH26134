import { Router, Request, Response } from 'express';
import { db } from '../database/store';
import { curriculumEngine } from '../services/curriculumEngine';
import { analyticsEngine } from '../services/analyticsEngine';
import { dataProvider } from '../services/dataProvider';

export const instituteRouter = Router();

// 1. Overview & Profile
const handleInstituteOverview = (req: Request, res: Response) => {
  const courses = db.getAllCourses();
  const totalStudents = courses.reduce((acc, c) => acc + c.enrolledStudents, 0);

  // Evaluate default curriculum alignment
  const defaultCurriculum = Array.from(db.curricula.values())[0];
  const auditReport = defaultCurriculum
    ? curriculumEngine.auditCurriculum(defaultCurriculum, courses[0]?.title || 'Degree Program')
    : null;

  const shortages = analyticsEngine.getSkillShortagesAndOversupply().slice(0, 5);

  res.json({
    totalCourses: courses.length,
    totalEnrolledStudents: totalStudents,
    averageAlignmentScore: auditReport?.alignmentScore || 48.2,
    auditReport,
    topIndustryShortages: shortages,
    instituteName: 'Pune Institute of Computer Technology (PICT)',
    accreditationStatus: 'NAAC A+ / NBA Accredited Autonomous Institute',
    _dataSource: dataProvider.getMetadata(),
  });
};

instituteRouter.get('/overview', handleInstituteOverview);
instituteRouter.get('/profile', handleInstituteOverview);
instituteRouter.get('/industry-gap', handleInstituteOverview);

// 2. Courses List
instituteRouter.get('/courses', (req: Request, res: Response) => {
  const courses = db.getAllCourses();
  res.json({ courses });
});

// 3. Curriculum Audit for Course
instituteRouter.get('/curriculum/:courseId', (req: Request, res: Response) => {
  const course = db.courses.get(req.params.courseId);
  if (!course) {
    res.status(404).json({ error: 'Course not found.' });
    return;
  }

  const curriculum = db.getCurriculaForCourse(course.id) || Array.from(db.curricula.values())[0];
  if (!curriculum) {
    res.status(404).json({ error: 'Curriculum not found for this course.' });
    return;
  }

  const report = curriculumEngine.auditCurriculum(curriculum, course.title);

  res.json({
    course,
    curriculum,
    report,
  });
});

// 4. Upload & Analyze New Curriculum
const handleCurriculumUpload = async (req: Request, res: Response) => {
  try {
    const { courseId, syllabusRaw, academicYear } = req.body;
    if (!syllabusRaw) {
      res.status(400).json({ error: 'Syllabus content is required.' });
      return;
    }

    const targetCourseId = courseId || 'crs-pict-cs';
    const result = await curriculumEngine.parseAndSaveCurriculum(
      targetCourseId,
      syllabusRaw,
      academicYear || '2026-2027'
    );

    res.json({
      message: 'Curriculum successfully uploaded, analyzed, and audited against industry benchmarks.',
      alignmentScore: result.report.alignmentScore,
      coveredSkillsCount: result.report.coveredMarketSkillsCount,
      missingHighDemandSkillsCount: result.report.missingHighDemandSkillsCount,
      report: result.report,
      aiAudit: result.aiAudit,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Curriculum analysis failed.' });
  }
};

instituteRouter.post('/curriculum/upload', handleCurriculumUpload);
instituteRouter.post('/curriculum/analyze', handleCurriculumUpload);

// 4.1 Recommendations
instituteRouter.get('/recommendations', (req: Request, res: Response) => {
  const defaultCurriculum = Array.from(db.curricula.values())[0];
  const auditReport = defaultCurriculum
    ? curriculumEngine.auditCurriculum(defaultCurriculum, 'Degree Program')
    : null;
  res.json({ recommendations: auditReport?.aiCurriculumRecommendations || [] });
});

// 5. Employer Feedback & Surveys for Institute
instituteRouter.get('/employer-feedback', (req: Request, res: Response) => {
  const surveys = db.getAllSurveys();
  res.json({ surveys });
});
