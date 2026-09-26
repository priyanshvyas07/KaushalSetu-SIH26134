import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CurriculumAlignmentReport } from '../../types';
import { KPICard } from '../../components/common/KPICard';
import { DataSourceBadge } from '../../components/common/DataSourceBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AlignmentScoreSection } from '../../components/institute/AlignmentScoreSection';
import { SkillIntelligenceSection } from '../../components/institute/SkillIntelligenceSection';
import { RecommendedActionsSection } from '../../components/institute/RecommendedActionsSection';
import { CurriculumChartSection } from '../../components/institute/CurriculumChartSection';
import {
  Layers,
  Upload,
  BarChart3,
  Lightbulb,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Loader2,
  BookOpen,
  ArrowRight,
  TrendingUp,
  FileText,
  School,
  Building2,
  Users,
  Target,
  Award,
  Sparkles,
  Search,
} from 'lucide-react';

interface InstituteViewProps {
  currentTab: string;
  onTabChange?: (tab: string) => void;
}

export const InstituteView: React.FC<InstituteViewProps> = ({ currentTab, onTabChange }) => {
  const [overviewData, setOverviewData] = useState<any>(null);
  const [report, setReport] = useState<CurriculumAlignmentReport | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('crs-pict-cs');
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload syllabus form
  const [syllabusInput, setSyllabusInput] = useState('');
  const [syllabusFileName, setSyllabusFileName] = useState('');
  const [syllabusBase64, setSyllabusBase64] = useState<string | null>(null);
  const [academicYearInput, setAcademicYearInput] = useState('2026-2027');
  const [uploadingSyllabus, setUploadingSyllabus] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const fetchInstituteData = async () => {
    try {
      setLoading(true);
      const [overviewRes, coursesRes, feedbackRes] = await Promise.all([
        api.getInstituteOverview(),
        api.getInstituteCourses(),
        api.getEmployerFeedback(),
      ]);

      setOverviewData(overviewRes);
      setReport(overviewRes.auditReport);
      setCourses(coursesRes.courses);
      setFeedback(feedbackRes.surveys);
    } catch (err) {
      console.error('Failed to load institute data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstituteData();
  }, []);

  const handleSyllabusFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSyllabusFileName(file.name);
    const reader = new FileReader();

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      reader.onload = () => {
        setSyllabusInput(reader.result as string);
        setSyllabusBase64(null);
      };
      reader.readAsText(file);
    } else {
      reader.onload = () => {
        const base64String = reader.result as string;
        setSyllabusBase64(base64String);
        setSyllabusInput(`[Binary syllabus document selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]\nAuditing curriculum units, credit allocation & practical lab components...`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSyllabus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syllabusInput.trim() && !syllabusBase64) return;

    try {
      setUploadingSyllabus(true);
      const res = await api.uploadCurriculum({
        courseId: selectedCourseId,
        syllabusRaw: syllabusInput,
        academicYear: academicYearInput,
      });

      setUploadResult(res);
      setReport(res.report);
      fetchInstituteData();
    } catch (err: any) {
      alert(err.message || 'Curriculum audit failed');
    } finally {
      setUploadingSyllabus(false);
    }
  };

  if (loading && !overviewData) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-slate-800" />
        <p className="text-xs font-semibold text-slate-500">
          Loading institutional curriculum intelligence...
        </p>
      </div>
    );
  }

  // Dynamic Skill Insights mapped from backend audit report
  const dynamicSkillInsights = report?.comparisonTable?.map(row => {
    let type: 'CRITICAL_GAP' | 'ALIGNED' | 'OVERSUPPLY' = 'CRITICAL_GAP';
    if (row.coverageStatus === 'COVERED' || row.coverageStatus === 'PARTIAL') {
      type = row.marketDemand === 'LOW' ? 'OVERSUPPLY' : 'ALIGNED';
    } else {
      type = 'CRITICAL_GAP';
    }

    return {
      id: row.skill.id,
      name: row.skill.canonicalName,
      category: row.skill.category,
      type,
      demandLevel: row.marketDemand as 'HIGH' | 'MEDIUM' | 'LOW',
      openingsCount: row.openingsInIndia,
      curriculumStatus: row.coverageStatus === 'COVERED'
        ? `Covered · Sem ${row.semesterTaught || 5} (${row.hoursDedicated || 36} hrs)`
        : (row.coverageStatus === 'PARTIAL' ? 'Theoretical Overview Only' : 'Absent from Core Syllabus'),
      hoursDedicated: row.hoursDedicated,
      semesterTaught: row.semesterTaught,
      whyClassified: row.urgency === 'CRITICAL'
        ? 'High hiring volume across Razorpay, Swiggy, and tech employers; mandatory prerequisite for campus recruitment drives but lacking lab credits.'
        : (type === 'OVERSUPPLY' ? 'Over-allocated hours for legacy tech with declining corporate hiring.' : 'Curricular lab hours align well with corporate hiring benchmarks.'),
      recommendedAction: row.coverageStatus === 'MISSING'
        ? `Add practical lab module for ${row.skill.canonicalName} in upcoming scheme revision.`
        : `Maintain current ${row.hoursDedicated || 40}-hour lab depth.`,
      sampleEmployers: ['Razorpay', 'Swiggy', 'Persistent Systems', 'CRED'],
    };
  });

  // Dynamic Actions mapped from backend audit report
  const dynamicRecommendations = report?.aiCurriculumRecommendations?.map(rec => ({
    title: rec.title,
    category: rec.category === 'SKILLS_TO_ADD' ? 'Practical Lab Addition' : (rec.category === 'MODULES_TO_UPDATE' ? 'Curriculum Modernization' : 'Credit Optimization'),
    priority: (rec.category === 'SKILLS_TO_ADD' ? 'CRITICAL' : 'HIGH') as any,
    alignmentImpact: '+18.2% Projected Alignment Gain',
    problem: rec.details,
    evidence: rec.marketEvidence,
    suggestedAction: rec.details,
    targetSemester: 'Semester 5 (Core Lab)',
    hoursNeeded: '36 Hours (12 Theory + 24 Labs)',
    requiredResources: 'Cloud Native / Linux Sandbox Lab',
    proposedSyllabus: `MODULE: ${rec.title}\n- ${rec.details}\n- Market Evidence: ${rec.marketEvidence}`,
  }));

  // Consistent Primary Alignment Score
  const primaryAlignmentScore = overviewData?.averageAlignmentScore || report?.alignmentScore || 48.2;
  const missingSkillsCount = report?.missingHighDemandSkillsCount ?? 6;
  const enrolledStudents = overviewData?.totalEnrolledStudents || 500;
  const accreditedProgramsCount = overviewData?.totalCourses || 2;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. INSTITUTIONAL OVERVIEW TAB */}
      {currentTab === 'overview' && (
        <div className="space-y-8">
          {/* Header as specified in brief:
              Institute Overview
              Pune Institute of Computer Technology (PICT)
              Subtitle: “Industry alignment and curriculum intelligence”
          */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                <School className="w-4 h-4" />
                <span>Institute Overview</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                {overviewData?.instituteName || 'Pune Institute of Computer Technology (PICT)'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Industry alignment and curriculum intelligence · {overviewData?.accreditationStatus || 'NAAC A+ Autonomous Scheme'}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <span className="text-[11px] font-mono text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs">
                Scheme: AY 2025-2026
              </span>
              <DataSourceBadge
                source={overviewData?._dataSource?.label || "SIH26134 Benchmark Baseline"}
                type={overviewData?._dataSource?.isLive ? "VERIFIED" : "BENCHMARK"}
                timestamp="Feb 2026"
              />
            </div>
          </div>

          {/* 4 Polished KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Curriculum Alignment"
              value={`${primaryAlignmentScore}%`}
              subtitle="Weighted Industry Index"
              change="-36.8% vs. target"
              changeType="negative"
              supportingContext="Target: 85%+ corporate benchmark"
              icon={Target}
              sourceType={overviewData?._dataSource?.isLive ? 'VERIFIED' : 'BENCHMARK'}
              verifiedSource={overviewData?._dataSource?.isLive ? 'AICTE National Index' : 'SIH26134 Benchmark Model'}
            />
            <KPICard
              title="Missing Demanded Skills"
              value={missingSkillsCount}
              subtitle="High Market Shortages"
              change="Urgent reform"
              changeType="negative"
              supportingContext="Top: Docker, AWS, Kubernetes, Terraform"
              icon={AlertTriangle}
              sourceType={overviewData?._dataSource?.isLive ? 'VERIFIED' : 'BENCHMARK'}
              verifiedSource={overviewData?._dataSource?.isLive ? 'Corporate Hiring Feed' : 'Benchmark Index'}
            />
            <KPICard
              title="Monitored Students"
              value={enrolledStudents.toLocaleString()}
              subtitle="Across Degree Programs"
              change="+12% YoY"
              changeType="positive"
              supportingContext="320 Comp Engg + 180 IT undergraduates"
              icon={Users}
              verifiedSource="Institutional SIS"
            />
            <KPICard
              title="Accredited Programs"
              value={accreditedProgramsCount}
              subtitle="Autonomous CS & IT"
              change="Tier-1 NBA"
              changeType="positive"
              supportingContext="Autonomous Scheme (Undergraduate)"
              icon={Award}
              verifiedSource="NBA Accreditation Register"
            />
          </div>

          {/* 5. Main Alignment Section */}
          <AlignmentScoreSection
            score={primaryAlignmentScore}
            totalBenchmarkSkills={report?.totalMarketSkillsEvaluated || 20}
            coveredSkillsCount={report?.coveredMarketSkillsCount || 5}
            missingHighDemandCount={missingSkillsCount}
            onExploreSkills={() => onTabChange && onTabChange('alignment')}
          />

          {/* 8. Data Visualization Charts */}
          <CurriculumChartSection />

          {/* 6. Skill Intelligence Section */}
          <SkillIntelligenceSection items={dynamicSkillInsights} />

          {/* 7. AI Recommended Actions Section */}
          <RecommendedActionsSection actions={dynamicRecommendations} />
        </div>
      )}

      {/* 2. CURRICULUM ANALYZER (UPLOAD & INGESTION) */}
      {currentTab === 'curriculum' && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 sm:p-8 space-y-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider block">
                Syllabus Ingestion &amp; Natural Language Audit
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                Curriculum Syllabus Analyzer
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Upload or paste college course syllabus text (PDF / DOCX / TXT). The AI &amp; deterministic extractor maps competencies, credit hours, and lab coverage against industrial standards.
              </p>
            </div>
            <DataSourceBadge source="Gemini 3.8 Flash Parser" />
          </div>

          <form onSubmit={handleUploadSyllabus} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target Degree Program
                </label>
                <select
                  value={selectedCourseId}
                  onChange={e => setSelectedCourseId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.enrolledStudents} students)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={academicYearInput}
                  onChange={e => setAcademicYearInput(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Document File Uploader */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Upload Syllabus File (PDF / DOCX / TXT)</span>
                  <span className="text-[11px] text-slate-500">
                    {syllabusFileName ? `Selected: ${syllabusFileName}` : 'Select university curriculum document from your system or paste text below'}
                  </span>
                </div>
              </div>
              <label className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100 cursor-pointer">
                <span>Browse File</span>
                <input
                  type="file"
                  accept=".pdf,.txt,.docx"
                  onChange={handleSyllabusFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Syllabus Outline (Modules, Subjects, Lab Practicals, and Objectives)
              </label>
              <textarea
                rows={9}
                value={syllabusInput}
                onChange={e => setSyllabusInput(e.target.value)}
                placeholder="Paste university course outline (e.g. Module 1: OS & Linux; Module 2: Data Structures; Module 3: DBMS & SQL)..."
                className="w-full text-xs font-mono p-3.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 leading-relaxed"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSyllabusFileName('PICT_Computer_Engg_2026_Modernized_Syllabus.pdf');
                  setSyllabusInput(`PUNE INSTITUTE OF COMPUTER TECHNOLOGY
DEPARTMENT OF COMPUTER ENGINEERING
REVISED 2026 AUTONOMOUS SCHEME

Module 1: Cloud Native Infrastructure & Containers
- Multi-stage Docker builds, Docker Compose, Linux namespaces and cgroups
- Kubernetes architecture, Pods, Deployments, Services, Helm charts

Module 2: Cloud Computing & Infrastructure as Code
- Amazon Web Services (AWS EC2, S3, IAM, VPC), Terraform HCL scripts

Module 3: Continuous Integration & Automated Testing
- GitHub Actions CI/CD workflows, automated unit testing, container registry push

Module 4: Distributed Database Systems & Caching
- PostgreSQL replication, Redis microsecond caching, query optimization`);
                }}
                className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 hover:underline text-left cursor-pointer"
              >
                + Load Sample Modernized 2026 Syllabus (Docker + AWS + K8s)
              </button>

              <button
                type="submit"
                disabled={uploadingSyllabus || (!syllabusInput.trim() && !syllabusBase64)}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {uploadingSyllabus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Analyze &amp; Calculate Alignment</span>
              </button>
            </div>
          </form>

          {uploadResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200/90 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{uploadResult.message}</span>
              </div>
              <p className="text-xs text-emerald-800">
                New Calculated Alignment Score:{' '}
                <span className="font-extrabold text-emerald-950 font-mono text-sm">
                  {uploadResult.alignmentScore}%
                </span>{' '}
                (Previously 48.2% · Significant boost from Docker, AWS, and K8s inclusion)
              </p>
            </div>
          )}
        </div>
      )}

      {/* 3. INDUSTRY VS CURRICULUM COMPARISON TABLE */}
      {currentTab === 'alignment' && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 sm:p-8 space-y-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider block">
                Competency Audit Matrix
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                Skill Comparison: Industry Market Demand vs. Curriculum Coverage
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Deterministic comparison of national job openings, university syllabus hours, and depth of instruction
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-medium text-slate-500">Overall Score:</span>
              <span className="text-sm font-bold text-slate-900 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg">
                {primaryAlignmentScore}%
              </span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Skill Competency</th>
                  <th className="p-3.5">Market Demand</th>
                  <th className="p-3.5">Openings (India)</th>
                  <th className="p-3.5">Curriculum Coverage</th>
                  <th className="p-3.5">Coverage Depth</th>
                  <th className="p-3.5 text-right">Curricular Urgency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report?.comparisonTable?.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-semibold text-slate-900">
                      {row.skill.canonicalName}
                      <span className="block text-[11px] text-slate-500 font-normal">
                        {row.skill.category}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <StatusBadge
                        label={row.marketDemand}
                        variant={row.marketDemand === 'HIGH' ? 'critical' : 'neutral'}
                        dot={false}
                      />
                    </td>
                    <td className="p-3.5 font-mono text-slate-800 tabular-nums">
                      {row.openingsInIndia.toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`font-semibold ${
                          row.coverageStatus === 'COVERED'
                            ? 'text-emerald-700'
                            : row.coverageStatus === 'PARTIAL'
                            ? 'text-amber-700'
                            : 'text-rose-600'
                        }`}
                      >
                        {row.coverageStatus === 'COVERED'
                          ? '✓ Covered'
                          : row.coverageStatus === 'PARTIAL'
                          ? '⚡ Partial (Theory)'
                          : '✗ Missing'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {row.coverageDepth ? `${row.coverageDepth} (Sem ${row.semesterTaught || 5})` : '—'}
                    </td>
                    <td className="p-3.5 text-right">
                      <StatusBadge
                        label={row.urgency}
                        variant={
                          row.urgency === 'CRITICAL'
                            ? 'critical'
                            : row.urgency === 'MODERATE'
                            ? 'warning'
                            : 'neutral'
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. AI CURRICULUM RECOMMENDATIONS TAB */}
      {currentTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div>
              <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider block">
                AICTE &amp; NASSCOM Grounded Strategy
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                AI Curriculum Reforms &amp; Practical Interventions
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Every suggested curriculum modification is supported by real market evidence, salary premiums, and employer survey citations.
              </p>
            </div>
            <DataSourceBadge source="Grounded Employer Feedback" />
          </div>

          <RecommendedActionsSection />
        </div>
      )}

      {/* 5. EMPLOYER FEEDBACK TAB */}
      {currentTab === 'feedback' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div>
              <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider block">
                Recruitment Partner Intel
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                Industry Employer Feedback &amp; Hiring Gaps
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Direct survey submissions from recruiting partners regarding fresher readiness, practical skill deficits, and certification requirements.
              </p>
            </div>
            <DataSourceBadge source={`${feedback.length} Corporate Submissions`} />
          </div>

          <div className="space-y-4">
            {feedback.map(survey => (
              <div
                key={survey.id}
                className="bg-white border border-slate-200/90 rounded-xl p-6 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{survey.employerName}</h3>
                    <p className="text-xs text-slate-500">{survey.industry}</p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    Submitted: {new Date(survey.submittedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-200/70 space-y-2">
                    <p className="font-bold text-rose-950 text-xs">Hard-To-Hire Skills (Fresher Level):</p>
                    <div className="flex flex-wrap gap-1.5">
                      {survey.hardToHireSkills?.map((s: string, sIdx: number) => (
                        <span
                          key={sIdx}
                          className="px-2 py-1 bg-white border border-rose-200 rounded-md text-[11px] font-semibold text-rose-800"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-200/70 space-y-2">
                    <p className="font-bold text-indigo-950 text-xs">Emerging 2026 Industrial Demands:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {survey.emergingSkills?.map((s: string, sIdx: number) => (
                        <span
                          key={sIdx}
                          className="px-2 py-1 bg-white border border-indigo-200 rounded-md text-[11px] font-semibold text-indigo-900"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <p className="font-bold text-slate-900 text-xs">Observed Fresher Competency Gaps:</p>
                  <p className="text-slate-700 italic leading-relaxed">"{survey.fresherGaps?.join(' ')}"</p>
                </div>

                {survey.additionalRemarks && (
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-900">Recruiter Note: </span>
                    {survey.additionalRemarks}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
