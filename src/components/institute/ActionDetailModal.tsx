import React, { useState } from 'react';
import { X, Check, Copy, BookOpen, TrendingUp, Layers, Sparkles, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export interface ActionDetailData {
  title: string;
  category: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  alignmentImpact: string;
  problem: string;
  evidence: string;
  suggestedAction: string;
  proposedSyllabus: string;
  targetSemester: string;
  hoursNeeded: string;
  requiredResources: string;
}

interface ActionDetailModalProps {
  action: ActionDetailData;
  onClose: () => void;
}

export const ActionDetailModal: React.FC<ActionDetailModalProps> = ({ action, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(action.proposedSyllabus);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                {action.category}
              </span>
              <span className="text-slate-400" aria-hidden="true">·</span>
              <span className="text-[11px] text-emerald-400 font-semibold">{action.alignmentImpact}</span>
            </div>
            <h3 className="text-base font-bold tracking-tight mt-0.5">{action.title}</h3>
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

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          {/* Diagnostic Context */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Recommended Timing</span>
              <p className="font-bold text-slate-900 mt-0.5">{action.targetSemester}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Lab / Lecture Hours</span>
              <p className="font-bold text-slate-900 mt-0.5">{action.hoursNeeded}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Lab Infra Requirements</span>
              <p className="font-bold text-slate-900 mt-0.5 truncate" title={action.requiredResources}>
                {action.requiredResources}
              </p>
            </div>
          </div>

          {/* Problem & Evidence */}
          <div className="space-y-3">
            <div className="p-3.5 bg-rose-50/60 border border-rose-200/80 rounded-lg space-y-1">
              <span className="font-bold text-rose-950 uppercase text-[10px] tracking-wide block">
                Problem Statement
              </span>
              <p className="text-rose-900 text-xs leading-relaxed">{action.problem}</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wide flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                <span>Industry Demand Evidence</span>
              </span>
              <p className="text-slate-600 text-xs leading-relaxed">{action.evidence}</p>
            </div>
          </div>

          {/* Proposed Syllabus Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wide flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>Ready-To-Insert Syllabus Module (Autonomous BoS Draft)</span>
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
              {action.proposedSyllabus}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Compliant with AICTE Model Curriculum 2026 guidelines
          </p>
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
