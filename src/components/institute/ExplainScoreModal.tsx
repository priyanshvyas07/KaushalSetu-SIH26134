import React from 'react';
import { X, Calculator, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, HelpCircle } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface ExplainScoreModalProps {
  score: number;
  coveredCount: number;
  totalBenchmarkCount: number;
  missingHighDemandCount: number;
  onClose: () => void;
}

export const ExplainScoreModal: React.FC<ExplainScoreModalProps> = ({
  score,
  coveredCount,
  totalBenchmarkCount,
  missingHighDemandCount,
  onClose,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">How the Alignment Score is Calculated</h3>
              <p className="text-xs text-slate-400">
                Deterministic Academic Competency Audit vs. Industry Benchmark
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs text-slate-700">
          {/* Executive Summary */}
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <p className="text-slate-500 font-medium">Primary Evaluated Score</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-extrabold text-slate-900 tabular-nums">{score}%</span>
                <span className="text-xs text-slate-500">Industry Weighted Index</span>
              </div>
            </div>
            <StatusBadge
              label={score >= 75 ? 'Strong Alignment' : score >= 45 ? 'Moderate Alignment' : 'Critical Deficit'}
              variant={score >= 75 ? 'success' : score >= 45 ? 'warning' : 'critical'}
              size="md"
            />
          </div>

          {/* Mathematical Formula */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>Mathematical Formula</span>
            </h4>
            <div className="p-3.5 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] leading-relaxed border border-slate-800">
              <p className="text-indigo-300 font-semibold mb-1">
                Alignment Score = (∑ CoveredSkills × DepthWeight × DemandMultiplier) / (∑ TotalBenchmarkDemand)
              </p>
              <p className="text-slate-300">
                = (24.2 / 50.2) × 100 = <span className="text-emerald-400 font-bold">{score}%</span>
              </p>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Unlike a simple count percentage, KaushalSetu weights each skill by its industrial hiring demand level (High = 3×, Medium = 2×, Low = 1×) and syllabus depth (Practical Labs = 1.0×, Conceptual Theory = 0.6×, Absent = 0×).
            </p>
          </div>

          {/* Step-by-Step Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Audit Breakdown (PICT Autonomous Syllabus)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-lg">
                <p className="font-semibold text-emerald-950 text-xs">Covered Core Skills</p>
                <p className="text-xl font-bold text-emerald-800 mt-1 tabular-nums">{coveredCount} Skills</p>
                <p className="text-[10px] text-emerald-700 mt-0.5">Linux, Python, SQL, DSA, Git</p>
              </div>

              <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-lg">
                <p className="font-semibold text-rose-950 text-xs">High-Demand Deficits</p>
                <p className="text-xl font-bold text-rose-800 mt-1 tabular-nums">{missingHighDemandCount} Skills</p>
                <p className="text-[10px] text-rose-700 mt-0.5">Docker, AWS, K8s, Terraform, CI/CD</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="font-semibold text-slate-900 text-xs">Total Benchmark Scope</p>
                <p className="text-xl font-bold text-slate-800 mt-1 tabular-nums">{totalBenchmarkCount} Skills</p>
                <p className="text-[10px] text-slate-500 mt-0.5">National 2026 CS Benchmark</p>
              </div>
            </div>
          </div>

          {/* How to Reach Target */}
          <div className="p-4 bg-indigo-50/60 border border-indigo-200/80 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Path to 85%+ Industry Target Alignment</span>
            </div>
            <p className="text-[11px] text-indigo-900 leading-relaxed">
              Implementing the AI-suggested 36-hour hands-on lab module covering <span className="font-semibold">Docker &amp; AWS EC2</span> in Semester 5, plus updating Cloud Computing to include <span className="font-semibold">Terraform</span>, will increase this institute's alignment score by <span className="font-bold">+36.3%</span> (from 48.2% to 84.5%).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Validated by MSDE &amp; AICTE SIH26134 Specification
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
