import React, { useState } from 'react';
import { HelpCircle, ChevronRight, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { DataSourceBadge } from '../common/DataSourceBadge';
import { ExplainScoreModal } from './ExplainScoreModal';

interface AlignmentScoreSectionProps {
  score?: number;
  totalBenchmarkSkills?: number;
  coveredSkillsCount?: number;
  missingHighDemandCount?: number;
  onExploreSkills?: () => void;
}

export const AlignmentScoreSection: React.FC<AlignmentScoreSectionProps> = ({
  score = 48.2,
  totalBenchmarkSkills = 20,
  coveredSkillsCount = 5,
  missingHighDemandCount = 6,
  onExploreSkills,
}) => {
  const [showModal, setShowModal] = useState(false);

  // Industry demand coverage: high demand skills covered vs total high demand
  const industryDemandCoveragePct = 45.5;
  const gapPercentage = +(100 - score).toFixed(1);

  // Circular gauge math (radius = 42)
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <>
      <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Industry ↔ Curriculum Alignment
              </h2>
              <StatusBadge
                label={score >= 70 ? 'Aligned' : score >= 45 ? 'Moderate Gap' : 'Critical Deficit'}
                variant={score >= 70 ? 'success' : score >= 45 ? 'warning' : 'critical'}
              />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Empirical assessment comparing university syllabus modules against national hiring requirements
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Explain Score</span>
            </button>
            <DataSourceBadge source="AICTE National Curriculum Audit" />
          </div>
        </div>

        {/* Visual Alignment Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Main Visual Gauge Card */}
          <div className="lg:col-span-5 flex items-center gap-5 p-4 sm:p-5 bg-slate-50/70 border border-slate-200/80 rounded-xl">
            {/* SVG Circular Progress Meter */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="text-slate-200 stroke-current"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="text-amber-500 stroke-current transition-all duration-700 ease-out"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
                  {score}%
                </span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Aligned
                </span>
              </div>
            </div>

            {/* Gauge Context Details */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Primary Metric
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Weighted Industry Index
              </h3>
              <p className="text-xs text-slate-600 leading-snug">
                Syllabus covers <span className="font-semibold text-slate-900">{coveredSkillsCount}</span> of benchmark skills with practical lab credits.
              </p>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 hover:underline flex items-center gap-0.5 pt-1"
              >
                <span>View calculation logic</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Three Analytical Pillars */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Pillar 1: Industry Demand Coverage */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Demand Coverage
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-slate-900 tabular-nums">
                  {industryDemandCoveragePct}%
                </span>
                <span className="text-xs text-slate-500">of critical</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full"
                  style={{ width: `${industryDemandCoveragePct}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                High-demand hiring requirements covered in coursework
              </p>
            </div>

            {/* Pillar 2: Curriculum Coverage Breakdown */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Curriculum Coverage
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-slate-900 tabular-nums">
                  {coveredSkillsCount}
                </span>
                <span className="text-xs text-slate-500">/ {coveredSkillsCount + missingHighDemandCount} tracked</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                <span className="text-emerald-700 font-bold">{coveredSkillsCount} covered</span>
                <span className="text-slate-300">·</span>
                <span className="text-rose-700 font-bold">{missingHighDemandCount} missing</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Includes Linux, SQL, Python, DSA in 40+ lab hours
              </p>
            </div>

            {/* Pillar 3: Gap Percentage */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Labour Gap Deficit
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-rose-700 tabular-nums">
                  {gapPercentage}%
                </span>
                <span className="text-xs text-rose-600">deficit</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-rose-500 h-1.5 rounded-full"
                  style={{ width: `${gapPercentage}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Weighted shortage concentrated in Docker, AWS, and K8s
              </p>
            </div>
          </div>
        </div>

        {/* Diagnostic Takeaway Strip */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <p className="text-slate-700">
              <span className="font-semibold text-slate-900">Key Academic Finding:</span> Systems fundamentals (Linux, C++, SQL) are strong, but modern cloud-native competencies (Docker, AWS, Kubernetes, Terraform) are absent from core syllabus requirements.
            </p>
          </div>
          {onExploreSkills && (
            <button
              type="button"
              onClick={onExploreSkills}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:text-indigo-600 whitespace-nowrap self-end sm:self-auto cursor-pointer"
            >
              <span>View Skill Matrix</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <ExplainScoreModal
          score={score}
          coveredCount={coveredSkillsCount}
          totalBenchmarkCount={totalBenchmarkSkills}
          missingHighDemandCount={missingHighDemandCount}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};
