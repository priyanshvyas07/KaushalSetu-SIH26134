import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StudentProfile, JobMatchResult, AssessmentSummary } from '../../types';
import { MetricCard } from '../../components/common/MetricCard';
import { DataBadge } from '../../components/common/DataBadge';
import { AssessmentModal } from '../../components/widgets/AssessmentModal';
import { ExplainableGapModal } from '../../components/widgets/ExplainableGapModal';
import { StudentCareerCopilot } from './StudentCareerCopilot';
import {
  Upload,
  CheckCircle,
  AlertTriangle,
  Send,
  Loader2,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  MapPin,
  Briefcase
} from 'lucide-react';

interface StudentViewProps {
  currentTab: string;
}

export const StudentView: React.FC<StudentViewProps> = ({ currentTab }) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [gapAnalysis, setGapAnalysis] = useState<any>(null);
  const [jobMatches, setJobMatches] = useState<JobMatchResult[]>([]);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Resume upload state
  const [resumeTextInput, setResumeTextInput] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [resumeBase64, setResumeBase64] = useState<string | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeUploadResult, setResumeUploadResult] = useState<any>(null);

  // Modals state
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentSummary | null>(null);
  const [selectedJobForExplain, setSelectedJobForExplain] = useState<JobMatchResult | null>(null);

  // Career settings
  const [targetRoleInput, setTargetRoleInput] = useState('');
  const [preferredLocationInput, setPreferredLocationInput] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const [profileRes, jobsRes, roadmapRes, assessmentsRes] = await Promise.all([
        api.getStudentProfile(),
        api.getStudentJobMatches(),
        api.getStudentRoadmap(),
        api.getAssessments(),
      ]);

      setProfile(profileRes.profile);
      setGapAnalysis(profileRes.gapAnalysis);
      setTargetRoleInput(profileRes.profile.targetRole);
      setPreferredLocationInput(profileRes.profile.preferredLocation);
      setJobMatches(jobsRes.matches);
      setRoadmap(roadmapRes);
      setAssessments(assessmentsRes.assessments);
    } catch (err) {
      console.error('Error fetching student data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFileName(file.name);
    const reader = new FileReader();

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      reader.onload = () => {
        setResumeTextInput(reader.result as string);
        setResumeBase64(null);
      };
      reader.readAsText(file);
    } else {
      reader.onload = () => {
        const base64String = reader.result as string;
        setResumeBase64(base64String);
        setResumeTextInput(`[Binary file selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]\nParsing PDF text & extracting technical competencies...`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResumeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeTextInput.trim() && !resumeBase64) return;

    try {
      setUploadingResume(true);
      const result = await api.uploadResume({
        resumeText: resumeTextInput,
        base64Pdf: resumeBase64 || undefined,
        fileName: resumeFileName || 'Student_Engineering_Resume.pdf',
      });
      setResumeUploadResult(result);
      fetchStudentData();
    } catch (err: any) {
      alert(err.message || 'Resume upload failed');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleToggleRoadmap = async (moduleId: string, currentStatus: boolean) => {
    try {
      await api.updateRoadmapProgress(moduleId, !currentStatus);
      const updatedRoadmap = await api.getStudentRoadmap();
      setRoadmap(updatedRoadmap);
    } catch (err) {
      console.error('Failed to update roadmap', err);
    }
  };

  const handleSaveProfileSettings = async () => {
    try {
      setSavingSettings(true);
      await api.updateStudentProfile({
        targetRole: targetRoleInput,
        preferredLocation: preferredLocationInput,
      });
      fetchStudentData();
    } catch (err: any) {
      alert(err.message || 'Update failed');
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-800" />
      </div>
    );
  }

  // Sub-tabs rendering
  return (
    <div className="space-y-6">
      {/* 1. OVERVIEW & PROFILE */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Profile Readiness"
              value={`${profile?.profileCompletionPct || 0}%`}
              subtitle="Identity & Resume Analyzed"
              dataLabel="REAL"
            />
            <MetricCard
              title="Top Job Match"
              value={`${jobMatches[0]?.overallMatchPct || 0}%`}
              subtitle={jobMatches[0]?.job?.title || 'DevOps Platform'}
              change="Formula Derived"
              isPositive
              dataLabel="REAL"
            />
            <MetricCard
              title="Verified Skills"
              value={profile?.skills.filter(s => s.verified).length || 0}
              subtitle={`Total Recognized: ${profile?.skills.length || 0}`}
              dataLabel="REAL"
            />
            <MetricCard
              title="Detected Critical Gaps"
              value={gapAnalysis?.missingCount || 0}
              subtitle={`For Target: ${profile?.targetRole}`}
              change="Requires Attention"
              isPositive={false}
              dataLabel="REAL"
            />
          </div>

          {/* Profile Overview Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
              <div>
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wide">Candidate Intelligence Profile</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{profile?.userId}</h2>
                <p className="text-xs text-slate-600 mt-0.5">{profile?.education}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-mono">Target Role:</span>
                <span className="px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-md">
                  {profile?.targetRole}
                </span>
              </div>
            </div>

            {/* Current Verified Skills Tags */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Current Skill Inventory</p>
                <span className="text-[11px] text-slate-500">{profile?.skills.length} competencies registered</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile?.skills.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800"
                  >
                    <span className="font-semibold">{s.skillName || s.skillId}</span>
                    <span className="text-[10px] text-slate-500 font-mono">· {s.proficiency}</span>
                    {s.verified ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                        <CheckCircle className="w-3 h-3" /> VERIFIED
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">UNVERIFIED</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Priority Actions */}
            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Recommended Action to Boost Placement Probability
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your highest missing skill barrier for <span className="font-semibold text-slate-900">{profile?.targetRole}</span> is{' '}
                <span className="font-semibold text-slate-900">Docker &amp; AWS Containerization</span>. Passing the verified Docker assessment or completing the roadmap module will increase your candidate match score from <span className="font-bold text-slate-900">{jobMatches[0]?.overallMatchPct}%</span> to <span className="font-bold text-emerald-700">82%</span>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. DEDICATED AI CAREER COPILOT WORKSPACE */}
      {currentTab === 'copilot' && (
        <StudentCareerCopilot
          profile={profile}
          gapAnalysis={gapAnalysis}
          jobMatches={jobMatches}
          onRefreshData={fetchStudentData}
        />
      )}

      {/* 3. RESUME INTELLIGENCE */}
      {currentTab === 'resume' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Resume Intelligence &amp; Skill Extraction</h3>
              <p className="text-xs text-slate-500">
                Upload or paste your engineering resume. The parser normalizes skills (e.g. React.js → React, k8s → Kubernetes) and extracts structured projects.
              </p>
            </div>
            <DataBadge type="REAL" label="Gemini 3.8 Flash Parser" />
          </div>

          <form onSubmit={handleResumeSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Upload Document (PDF / DOCX / TXT)</span>
                  <span className="text-[11px] text-slate-500">
                    {resumeFileName ? `Selected: ${resumeFileName}` : 'Select a file from your computer or paste text below'}
                  </span>
                </div>
              </div>
              <label className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100 cursor-pointer">
                <span>Browse File</span>
                <input
                  type="file"
                  accept=".pdf,.txt,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resume Content / Text Extractor Preview
              </label>
              <textarea
                rows={8}
                value={resumeTextInput}
                onChange={e => setResumeTextInput(e.target.value)}
                placeholder="Paste full resume text with Education, Technical Skills, Projects, and Work Experience..."
                className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setResumeFileName('Arjun_Sharma_DevOps_Resume_2026.pdf');
                  setResumeTextInput(profile?.resumeText || `Arjun Sharma\nEmail: arjun.sharma@sih.gov.in | Phone: +91 98230 45678\nPICT Pune - B.Tech Computer Engineering (2022-2026) | CGPA: 8.7\n\nTECHNICAL SKILLS:\n- Languages: Python, Bash Shell Scripting, C++, SQL\n- Systems & Tools: Linux (Ubuntu/Debian), Git, GitHub, Vim, Nginx\n- Core: Data Structures, Computer Networks, Operating Systems\n\nPROJECTS:\n1. Automated Server Health Monitor (Python & Bash)\nBuilt a daemon monitoring memory, disk I/O and CPU thresholds; alerts via Slack Webhooks.\n2. High-Throughput URL Shortener (Python, PostgreSQL, Redis)\nDesigned indexed database schemas and microsecond caching layer.`);
                }}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 underline"
              >
                Load Sample Final-Year DevOps Resume
              </button>

              <button
                type="submit"
                disabled={uploadingResume || (!resumeTextInput.trim() && !resumeBase64)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-sm flex items-center gap-2 cursor-pointer"
              >
                {uploadingResume && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Extract &amp; Normalize Skills</span>
              </button>
            </div>
          </form>

          {resumeUploadResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{resumeUploadResult.message}</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-emerald-950">Normalized Canonical Skills Detected:</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {resumeUploadResult.normalizedSkills?.map((s: any) => (
                    <span key={s.id} className="px-2 py-0.5 bg-white border border-emerald-200 text-emerald-800 text-[11px] font-semibold rounded">
                      {s.canonicalName} ({s.category})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. SKILL GAP ENGINE */}
      {currentTab === 'gaps' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6">
          <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wide">Deterministic Gap Engine</span>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Skill Comparison: Your Profile vs. Market Demands for {profile?.targetRole}
              </h3>
            </div>
            <DataBadge type="REAL" label="Mathematical Benchmark" />
          </div>

          {/* Target Role Selector */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Target Role:</span>
              <input
                type="text"
                value={targetRoleInput}
                onChange={e => setTargetRoleInput(e.target.value)}
                className="border border-slate-300 rounded px-2.5 py-1 text-xs bg-white text-slate-800"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Preferred Location:</span>
              <input
                type="text"
                value={preferredLocationInput}
                onChange={e => setPreferredLocationInput(e.target.value)}
                className="border border-slate-300 rounded px-2.5 py-1 text-xs bg-white text-slate-800"
              />
            </div>
            <button
              type="button"
              disabled={savingSettings}
              onClick={handleSaveProfileSettings}
              className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-medium hover:bg-slate-800"
            >
              {savingSettings ? 'Saving...' : 'Update Career Target'}
            </button>
          </div>

          {/* Gap Matrix Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
              Market Required Competencies ({gapAnalysis?.marketSkillsNeeded?.length || 0} Evaluated)
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
              {gapAnalysis?.marketSkillsNeeded?.map((item: any, idx: number) => {
                const isMissing = item.isMissing;
                return (
                  <div key={idx} className="p-3.5 bg-white flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${isMissing ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                      <div>
                        <p className="font-bold text-slate-900">{item.skill.canonicalName}</p>
                        <p className="text-[11px] text-slate-500">{item.skill.category} · {item.skill.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block">DEMAND</span>
                        <span className="font-semibold text-slate-700">{item.marketDemand}</span>
                      </div>
                      <div className="w-24">
                        {isMissing ? (
                          <span className="px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[11px] rounded block text-center">
                            MISSING
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px] rounded block text-center">
                            COVERED
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. JOB MATCHING */}
      {currentTab === 'jobs' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Active Industry Openings &amp; Fit Analysis</h3>
              <p className="text-xs text-slate-500">
                Matches are calculated mathematically using weighted required (70%) and preferred (30%) skill sets.
              </p>
            </div>
            <DataBadge type="REAL" label={`${jobMatches.length} Live Positions`} />
          </div>

          <div className="space-y-3">
            {jobMatches.map((m, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{m.job.title}</span>
                      <span className="text-xs text-slate-500 font-medium">at {m.job.employerName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {m.job.locationCity}, {m.job.locationState}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-slate-400" /> {m.job.experienceMinYears}+ Yrs Exp</span>
                      <span>·</span>
                      <span className="font-semibold text-slate-700">₹{m.job.salaryMinLPA} - {m.job.salaryMaxLPA} LPA</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-mono">DETERMINISTIC MATCH</span>
                      <span className="text-xl font-extrabold text-slate-900">{m.overallMatchPct}%</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedJobForExplain(m)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold"
                    >
                      Why this Match?
                    </button>
                  </div>
                </div>

                {/* Missing Skills Warning */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Missing Mandatory:</span>
                    {m.missingSkills.length === 0 ? (
                      <span className="text-emerald-700 font-semibold">None! 100% matched</span>
                    ) : (
                      m.missingSkills.map((gap, gIdx) => (
                        <span key={gIdx} className="px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded font-semibold text-[11px]">
                          {gap.skill.canonicalName}
                        </span>
                      ))
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">{m.matchBreakdownExplanation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. LEARNING ROADMAP */}
      {currentTab === 'roadmap' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6">
          <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wide">Personalized Progression</span>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                DevOps &amp; Cloud Architecture Learning Roadmap
              </h3>
              <p className="text-xs text-slate-500">
                Track completion of hands-on modules designed specifically to bridge your identified industry gaps.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-mono">ROADMAP PROGRESS</span>
              <span className="text-xl font-extrabold text-slate-900">{roadmap?.progressPct || 0}% Completed</span>
            </div>
          </div>

          <div className="space-y-6">
            {roadmap?.stages?.map((stage: any) => (
              <div key={stage.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-2 h-2 rounded bg-indigo-600"></span>
                    {stage.title}
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">{stage.level}</span>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
                  {stage.modules?.map((mod: any) => (
                    <div key={mod.id} className="p-3.5 bg-white flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={mod.isCompleted}
                          onChange={() => handleToggleRoadmap(mod.id, mod.isCompleted)}
                          className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 cursor-pointer"
                        />
                        <div>
                          <p className={`font-semibold ${mod.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                            {mod.title}
                          </p>
                          <p className="text-[11px] text-slate-500">Target Skill: {mod.skill} · Est. {mod.estimatedHours} Hours Hands-On</p>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        mod.isCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {mod.isCompleted ? 'COMPLETED' : 'PENDING'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. SKILL ASSESSMENTS */}
      {currentTab === 'assessment' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Verified Technical Skill Assessments</h3>
              <p className="text-xs text-slate-500">
                Score 66% or higher to verify skills on your candidate profile and boost recruiter search ranking.
              </p>
            </div>
            <DataBadge type="REAL" label="Objective Evaluation" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {assessments.map(asmt => (
              <div key={asmt.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-indigo-700">{asmt.skillName}</span>
                    {asmt.passed && (
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> VERIFIED
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">{asmt.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {asmt.questionsCount} Multiple-Choice Questions · {asmt.durationMinutes} Mins
                  </p>
                  {asmt.hasAttempted && (
                    <p className="text-xs font-semibold text-slate-700 mt-2">
                      Last Score: <span className="font-mono">{asmt.lastScore}%</span>
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAssessment(asmt)}
                  className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold"
                >
                  {asmt.hasAttempted ? 'Re-take Assessment' : 'Start Assessment'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedAssessment && (
        <AssessmentModal
          assessment={selectedAssessment}
          onClose={() => setSelectedAssessment(null)}
          onCompleted={() => {
            fetchStudentData();
          }}
        />
      )}

      {selectedJobForExplain && (
        <ExplainableGapModal
          match={selectedJobForExplain}
          onClose={() => setSelectedJobForExplain(null)}
        />
      )}
    </div>
  );
};
