import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AssessmentSummary } from '../../types';
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface AssessmentModalProps {
  assessment: AssessmentSummary;
  onClose: () => void;
  onCompleted: () => void;
}

export const AssessmentModal: React.FC<AssessmentModalProps> = ({
  assessment,
  onClose,
  onCompleted,
}) => {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api.getAssessmentDetails(assessment.id);
        setDetails(data);
      } catch (err) {
        console.error('Failed to load assessment details', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [assessment.id]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (result) return; // Locked after submitting
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await api.submitAssessment(assessment.id, answers);
      setResult(res);
      onCompleted();
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-indigo-300 uppercase tracking-wider">
              VERIFIED SKILL EVALUATION · {assessment.skillName}
            </span>
            <h3 className="text-base font-bold tracking-tight">{assessment.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-slate-700" />
              <p className="text-xs">Loading assessment questions...</p>
            </div>
          ) : result ? (
            // Results screen
            <div className="space-y-6">
              <div className={`p-4 rounded-lg border ${
                result.passed ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-center gap-3">
                  {result.passed ? (
                    <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm">
                      {result.passed ? 'Assessment Passed! Verified Skill Earned' : 'Assessment Not Passed'}
                    </h4>
                    <p className="text-xs mt-0.5">
                      Score: <span className="font-mono font-bold">{result.scorePct}%</span> ({result.correctCount}/{result.totalQuestions} questions correct).
                      {result.passed
                        ? ' Your profile has been updated with the verified skill badge.'
                        : ' Review the explanations below and re-attempt to verify your skill.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Question Feedback */}
              <div className="space-y-4">
                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Review &amp; Detailed Explanations:</p>
                {result.questionFeedback?.map((fb: any, idx: number) => (
                  <div key={fb.questionId} className="p-4 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-2">
                    <p className="font-semibold text-slate-900">
                      {idx + 1}. {fb.question}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        fb.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {fb.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    <p className="text-slate-600 font-medium">
                      <span className="font-semibold text-slate-800">Concept Explanation: </span>
                      {fb.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Questions
            <div className="space-y-6">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>Passing Threshold: 66%</span>
                <span>Time Limit: {assessment.durationMinutes} mins</span>
              </div>

              {details?.questions?.map((q: any, qIndex: number) => (
                <div key={q.id} className="space-y-3 pb-4 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-900">
                    {qIndex + 1}. {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options?.map((opt: string, optIndex: number) => {
                      const isSelected = answers[q.id] === optIndex;
                      return (
                        <button
                          key={optIndex}
                          type="button"
                          onClick={() => handleSelectOption(q.id, optIndex)}
                          className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center gap-3 ${
                            isSelected
                              ? 'border-slate-900 bg-slate-900 text-white font-medium'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] shrink-0 ${
                            isSelected ? 'border-white text-white' : 'border-slate-400 text-slate-500'
                          }`}>
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            {result ? 'Close' : 'Cancel'}
          </button>

          {!result && (
            <button
              type="button"
              disabled={submitting || Object.keys(answers).length < (details?.questions?.length || 1)}
              onClick={handleSubmit}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Submit &amp; Evaluate Answers</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
