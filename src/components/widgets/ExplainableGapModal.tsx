import React from 'react';
import { X, Calculator, ShieldCheck } from 'lucide-react';
import { JobMatchResult } from '../../types';

interface ExplainableGapModalProps {
  match: JobMatchResult;
  onClose: () => void;
}

export const ExplainableGapModal: React.FC<ExplainableGapModalProps> = ({
  match,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold tracking-tight">Explainable Match Breakdown</h3>
              <p className="text-xs text-slate-300">{match.job.title} at {match.job.employerName}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs text-slate-700">
          {/* Mathematical Formula Box */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 uppercase tracking-wide">Deterministic Formula</span>
              <span className="font-mono text-xs font-bold text-slate-900">{match.overallMatchPct}% MATCH</span>
            </div>
            <div className="p-3 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-800 space-y-1">
              <p>Score = (MatchedRequired / TotalRequired × 0.70) + (MatchedPreferred / TotalPreferred × 0.30)</p>
              <p className="text-indigo-600">
                Score = ({match.matchedSkillsCount}/{match.totalRequiredCount} × 70%) + ({match.preferredMatchPct}% × 30%) = {match.overallMatchPct}%
              </p>
            </div>
            <p className="text-[11px] text-slate-500">
              * The match percentage is strictly derived from mathematical set intersection and weighted proficiency thresholds, not arbitrary LLM generation.
            </p>
          </div>

          {/* Missing Mandatory Skills */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
              Critical Skill Gaps ({match.missingSkills.length})
            </h4>
            {match.missingSkills.length === 0 ? (
              <p className="text-slate-500 italic">No missing mandatory skills! Candidate meets all requirements.</p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {match.missingSkills.map((gap, idx) => (
                  <div key={idx} className="p-3 bg-white flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{gap.skill.canonicalName}</span>
                        <span className="text-[10px] font-mono uppercase bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200">
                          {gap.gapPriority} GAP
                        </span>
                        <span className="text-[11px] text-slate-400">· Demand: {gap.marketDemand}</span>
                      </div>
                      <p className="text-slate-600 mt-1">{gap.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Strong Matched Skills */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
              Verified Candidate Strengths ({match.strongSkills.length})
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
              {match.strongSkills.map((str, idx) => (
                <div key={idx} className="p-3 bg-white flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{str.skill.canonicalName}</span>
                      <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> VERIFIED
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1">{str.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
