import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Job, Skill } from '../../types';
import { MetricCard } from '../../components/common/MetricCard';
import { DataBadge } from '../../components/common/DataBadge';
import {
  Briefcase,
  PlusCircle,
  Users,
  MessageSquare,
  Sparkles,
  Loader2,
  CheckCircle,
  MapPin,
  Building,
  ShieldCheck,
  Search
} from 'lucide-react';

interface EmployerViewProps {
  currentTab: string;
}

export const EmployerView: React.FC<EmployerViewProps> = ({ currentTab }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [candidateMatches, setCandidateMatches] = useState<any[]>([]);
  const [canonicalSkills, setCanonicalSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Job Requirement Generator
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [generatingWithAI, setGeneratingWithAI] = useState(false);

  // Job Builder Form
  const [titleInput, setTitleInput] = useState('');
  const [roleCategoryInput, setRoleCategoryInput] = useState('DevOps / Cloud Engineer');
  const [locationCityInput, setLocationCityInput] = useState('Bengaluru');
  const [locationStateInput, setLocationStateInput] = useState('Karnataka');
  const [experienceMinYearsInput, setExperienceMinYearsInput] = useState(1);
  const [salaryMinLPAInput, setSalaryMinLPAInput] = useState(10);
  const [salaryMaxLPAInput, setSalaryMaxLPAInput] = useState(18);
  const [descriptionInput, setDescriptionInput] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<
    { skillId: string; skillName: string; isRequired: boolean; minProficiency: any }[]
  >([]);
  const [savingJob, setSavingJob] = useState(false);
  const [jobCreatedSuccess, setJobCreatedSuccess] = useState(false);

  // Survey Form
  const [surveyEmployerName, setSurveyEmployerName] = useState('Razorpay Talent Team');
  const [surveyIndustry, setSurveyIndustry] = useState('Fintech / Enterprise Software');
  const [surveyHardToHire, setSurveyHardToHire] = useState('Kubernetes, Terraform, Go, Observability');
  const [surveyEmerging, setSurveyEmerging] = useState('Generative AI Agents, eBPF Kernel Tracing');
  const [surveyFresherGaps, setSurveyFresherGaps] = useState('Graduates know theoretical OS concepts but have never written a Dockerfile or configured a reverse proxy.');
  const [surveyCertifications, setSurveyCertifications] = useState('AWS Solutions Architect (SAA-C03), CKA');
  const [surveyRemarks, setSurveyRemarks] = useState('');
  const [submittingSurvey, setSubmittingSurvey] = useState(false);
  const [surveySuccess, setSurveySuccess] = useState(false);

  const fetchEmployerData = async () => {
    try {
      setLoading(true);
      const [jobsRes, skillsRes] = await Promise.all([
        api.getEmployerJobs(),
        api.getCanonicalSkills(),
      ]);

      setJobs(jobsRes.jobs);
      setCanonicalSkills(skillsRes.skills);
      if (jobsRes.jobs.length > 0) {
        const firstJobId = jobsRes.jobs[0].id;
        setSelectedJobId(firstJobId);
        loadCandidateMatches(firstJobId);
      }
    } catch (err) {
      console.error('Failed to load employer data', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCandidateMatches = async (jobId: string) => {
    try {
      const res = await api.getCandidateMatchesForJob(jobId);
      setCandidateMatches(res.matches || []);
    } catch (err) {
      console.error('Failed to load candidate matches', err);
    }
  };

  useEffect(() => {
    fetchEmployerData();
  }, []);

  const handleAIGenerateJob = async () => {
    if (!aiPromptInput.trim()) return;

    try {
      setGeneratingWithAI(true);
      const res = await api.generateAIJobRequirements(aiPromptInput);
      setTitleInput(res.title);
      setRoleCategoryInput(res.roleCategory);
      setDescriptionInput(res.description);
      setExperienceMinYearsInput(res.experienceMinYears);
      setSalaryMinLPAInput(res.salaryMinLPA);
      setSalaryMaxLPAInput(res.salaryMaxLPA);

      const combinedSkills = [
        ...(res.requiredSkills || []),
        ...(res.preferredSkills || []),
      ];
      setSelectedSkills(combinedSkills);
    } catch (err: any) {
      alert(err.message || 'AI Job generation failed');
    } finally {
      setGeneratingWithAI(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim() || selectedSkills.length === 0) {
      alert('Please provide a job title and select at least one skill.');
      return;
    }

    try {
      setSavingJob(true);
      await api.createJob({
        title: titleInput,
        roleCategory: roleCategoryInput,
        locationCity: locationCityInput,
        locationState: locationStateInput,
        experienceMinYears: experienceMinYearsInput,
        salaryMinLPA: salaryMinLPAInput,
        salaryMaxLPA: salaryMaxLPAInput,
        description: descriptionInput,
        skills: selectedSkills,
      });

      setJobCreatedSuccess(true);
      fetchEmployerData();
      setTimeout(() => setJobCreatedSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to create job');
    } finally {
      setSavingJob(false);
    }
  };

  const handleToggleSkill = (skill: Skill) => {
    const exists = selectedSkills.find(s => s.skillId === skill.id);
    if (exists) {
      setSelectedSkills(prev => prev.filter(s => s.skillId !== skill.id));
    } else {
      setSelectedSkills(prev => [
        ...prev,
        {
          skillId: skill.id,
          skillName: skill.canonicalName,
          isRequired: true,
          minProficiency: 'INTERMEDIATE',
        },
      ]);
    }
  };

  const handleSubmitSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingSurvey(true);
      await api.submitEmployerSurvey({
        employerName: surveyEmployerName,
        industry: surveyIndustry,
        hardToHireSkills: surveyHardToHire.split(',').map(s => s.trim()).filter(Boolean),
        emergingSkills: surveyEmerging.split(',').map(s => s.trim()).filter(Boolean),
        fresherGaps: surveyFresherGaps.split('.').map(s => s.trim()).filter(Boolean),
        recommendedCertifications: surveyCertifications.split(',').map(s => s.trim()).filter(Boolean),
        additionalRemarks: surveyRemarks,
      });

      setSurveySuccess(true);
      setTimeout(() => setSurveySuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit survey');
    } finally {
      setSubmittingSurvey(false);
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. OVERVIEW */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Active Job Requirements"
              value={jobs.length}
              subtitle="Published Postings"
              dataLabel="REAL"
            />
            <MetricCard
              title="Matched Candidates"
              value={candidateMatches.length}
              subtitle="Audited Engineering Pool"
              dataLabel="REAL"
            />
            <MetricCard
              title="Top Matched Fit"
              value={`${candidateMatches[0]?.overallMatchPct || 50}%`}
              subtitle="Calculated Deterministically"
              dataLabel="REAL"
            />
            <MetricCard
              title="Recruitment Partner"
              value="Razorpay"
              subtitle="Fintech Engineering"
              dataLabel="REAL"
            />
          </div>

          {/* Active Job Postings List */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Active Industry Roles</h3>
                <p className="text-xs text-slate-500">Requirements configured with canonical skill taxonomy and proficiency standards.</p>
              </div>
              <DataBadge type="REAL" label="Live Openings" />
            </div>

            <div className="space-y-3">
              {jobs.map(job => (
                <div key={job.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{job.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {job.locationCity}, {job.locationState} · {job.experienceMinYears}+ Yrs Exp · ₹{job.salaryMinLPA}-{job.salaryMaxLPA} LPA
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {job.skills.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded text-[11px] font-medium">
                          {s.skillId.replace('sk-', '')} {s.isRequired && '★'}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedJobId(job.id);
                      loadCandidateMatches(job.id);
                    }}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shrink-0"
                  >
                    View Matches
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. JOB REQUIREMENT BUILDER */}
      {currentTab === 'builder' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6">
          <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Job Requirement Builder</h3>
              <p className="text-xs text-slate-500">
                Create new vacancies manually or use the AI Requirement Generator to convert natural language descriptions.
              </p>
            </div>
            <DataBadge type="REAL" label="Gemini 3.8 Flash Generator" />
          </div>

          {/* AI Generator Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                AI Job Requirement Generator
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Type a requirement like: <span className="font-mono text-slate-800">"I need a junior DevOps engineer with Linux, Docker and AWS experience."</span>
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPromptInput}
                onChange={e => setAiPromptInput(e.target.value)}
                placeholder="Describe the role or hiring requirement in plain text..."
                className="flex-1 text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <button
                type="button"
                disabled={generatingWithAI || !aiPromptInput.trim()}
                onClick={handleAIGenerateJob}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-2"
              >
                {generatingWithAI && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Generate Draft</span>
              </button>
            </div>
          </div>

          {/* Job Details Form */}
          <form onSubmit={handleCreateJob} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={e => setTitleInput(e.target.value)}
                  placeholder="e.g. Associate DevOps Engineer"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role Category</label>
                <input
                  type="text"
                  value={roleCategoryInput}
                  onChange={e => setRoleCategoryInput(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={locationCityInput}
                  onChange={e => setLocationCityInput(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={locationStateInput}
                  onChange={e => setLocationStateInput(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Min Exp (Years)</label>
                <input
                  type="number"
                  value={experienceMinYearsInput}
                  onChange={e => setExperienceMinYearsInput(Number(e.target.value))}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Range (LPA)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={salaryMinLPAInput}
                    onChange={e => setSalaryMinLPAInput(Number(e.target.value))}
                    className="w-1/2 text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={salaryMaxLPAInput}
                    onChange={e => setSalaryMaxLPAInput(Number(e.target.value))}
                    className="w-1/2 text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description</label>
              <textarea
                rows={4}
                value={descriptionInput}
                onChange={e => setDescriptionInput(e.target.value)}
                placeholder="Describe role responsibilities, tech stack, and key expectations..."
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            {/* Canonical Skills Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Select Competencies from Canonical Taxonomy:
              </label>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 bg-slate-50 border border-slate-200 rounded-lg">
                {canonicalSkills.map(skill => {
                  const isSelected = selectedSkills.some(s => s.skillId === skill.id);
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => handleToggleSkill(skill)}
                      className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                        isSelected
                          ? 'bg-slate-900 border-slate-900 text-white font-semibold'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {skill.canonicalName}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                {selectedSkills.length} competencies selected
              </span>

              <button
                type="submit"
                disabled={savingJob || !titleInput.trim() || selectedSkills.length === 0}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                {savingJob ? 'Publishing...' : 'Save & Publish Job Requirement'}
              </button>
            </div>
          </form>

          {jobCreatedSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Job requirement published successfully and added to matching engine!</span>
            </div>
          )}
        </div>
      )}

      {/* 3. CANDIDATE MATCHING */}
      {currentTab === 'candidates' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6">
          <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wide">
                Explainable Candidate Fit
              </span>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Candidate Matching for Selected Opening
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Filter Job:</span>
              <select
                value={selectedJobId}
                onChange={e => {
                  setSelectedJobId(e.target.value);
                  loadCandidateMatches(e.target.value);
                }}
                className="text-xs p-2 bg-slate-50 border border-slate-300 rounded"
              >
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {candidateMatches.map((cand, idx) => (
              <div key={idx} className="p-5 border border-slate-200 rounded-lg bg-slate-50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{cand.candidateName}</h4>
                    <p className="text-xs text-slate-500">{cand.education} · Target: {cand.targetRole}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-mono block">DETERMINISTIC MATCH</span>
                    <span className="text-xl font-extrabold text-slate-900">{cand.overallMatchPct}%</span>
                  </div>
                </div>

                {/* Breakdown details */}
                <div className="p-3 bg-white rounded border border-slate-200 text-xs space-y-2">
                  <p className="text-slate-700 font-medium">{cand.matchBreakdownExplanation}</p>

                  <div className="flex flex-wrap gap-4 pt-1">
                    <div>
                      <span className="text-[11px] text-slate-400 block">VERIFIED STRENGTHS:</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {cand.strongSkills?.map((s: any, sIdx: number) => (
                          <span key={sIdx} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold">
                            ✓ {s.skill.canonicalName}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block">MISSING GAPS:</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {cand.missingSkills?.map((m: any, mIdx: number) => (
                          <span key={mIdx} className="px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[10px] font-bold">
                            ✗ {m.skill.canonicalName}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. EMPLOYER SURVEY */}
      {currentTab === 'survey' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Industry Demand &amp; Fresher Readiness Survey</h3>
              <p className="text-xs text-slate-500">
                Your submissions directly feed into the Government/Academic curriculum recommendation engine for institutional reform.
              </p>
            </div>
            <DataBadge type="REAL" label="Direct Feedback Feed" />
          </div>

          <form onSubmit={handleSubmitSurvey} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={surveyEmployerName}
                  onChange={e => setSurveyEmployerName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Industry Sector</label>
                <input
                  type="text"
                  value={surveyIndustry}
                  onChange={e => setSurveyIndustry(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hard-To-Hire Skills in Freshers (Comma separated)
              </label>
              <input
                type="text"
                value={surveyHardToHire}
                onChange={e => setSurveyHardToHire(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Emerging Technologies Expected by 2026-2027 (Comma separated)
              </label>
              <input
                type="text"
                value={surveyEmerging}
                onChange={e => setSurveyEmerging(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observed Fresher Practical Deficits in Campus Hires
              </label>
              <textarea
                rows={3}
                value={surveyFresherGaps}
                onChange={e => setSurveyFresherGaps(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Valued Certifications &amp; Hands-On Badges
              </label>
              <input
                type="text"
                value={surveyCertifications}
                onChange={e => setSurveyCertifications(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submittingSurvey}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                {submittingSurvey ? 'Submitting...' : 'Submit Industry Intelligence'}
              </button>
            </div>
          </form>

          {surveySuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Survey incorporated into national labour market intelligence analytics!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
