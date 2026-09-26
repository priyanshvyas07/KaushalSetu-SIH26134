import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import { StudentProfile, JobMatchResult } from '../../types';
import {
  Sparkles,
  Send,
  Loader2,
  RotateCcw,
  Target,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  HelpCircle,
  Copy,
  Check,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Compass,
  Cpu
} from 'lucide-react';

interface StudentCareerCopilotProps {
  profile: StudentProfile | null;
  gapAnalysis: any;
  jobMatches: JobMatchResult[];
  onRefreshData?: () => void;
}

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  time: string;
  isLive?: boolean;
  provider?: string;
  model?: string;
  dataSource?: string;
  groundedContext?: any;
}

export const StudentCareerCopilot: React.FC<StudentCareerCopilotProps> = ({
  profile,
  gapAnalysis,
  jobMatches,
  onRefreshData,
}) => {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);
  const [activeProvider, setActiveProvider] = useState<string>('demo');
  const [activeModel, setActiveModel] = useState<string>('local-grounded-intelligence');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      text: `Hello ${profile?.userId?.split(' ')[0] || 'Candidate'}! I am your dedicated KaushalSetu AI Career Copilot.

I am grounded in your **${profile?.targetRole || 'Engineering'}** competency profile, verified skill certifications, and real-time regional labor market telemetry.

How can I guide your skill progression, gap remediation, or placement strategy today?`,
      time: 'Just now',
      isLive: false,
      provider: 'demo',
      model: 'local-grounded-intelligence',
      dataSource: 'Grounded Candidate Profile & Labor Market Telemetry',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Suggested Career Questions
  const suggestedCareerQuestions = [
    {
      title: 'Explain my skill gaps',
      prompt: 'Explain my current skill gaps for my target role and how they impact my employability.',
      icon: Target,
      tag: 'Gaps',
    },
    {
      title: 'What should I learn next?',
      prompt: 'What should I learn next in priority order to bridge my missing competencies?',
      icon: Lightbulb,
      tag: 'Roadmap',
    },
    {
      title: 'Why is Docker important?',
      prompt: 'Explain why Docker is useful for a DevOps engineer in exactly 3 points.',
      icon: Cpu,
      tag: 'Technical',
    },
    {
      title: 'Analyze my job matches',
      prompt: 'How do my verified skills match with current benchmark job openings, and which job should I target first?',
      icon: Briefcase,
      tag: 'Placement',
    },
    {
      title: 'What is Kubernetes?',
      prompt: 'What is Kubernetes and why is it essential for modern cloud engineering roles?',
      icon: Compass,
      tag: 'Deep Dive',
    },
  ];

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || query).trim();
    if (!messageText || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setQuery('');
    setLoading(true);

    try {
      const historyPayload = messages
        .filter(m => m.id !== 'welcome' && !m.id.startsWith('welcome-'))
        .slice(-8)
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.text,
        }));

      const response = await api.askCareerCopilot(messageText, historyPayload);
      const isLive = Boolean(response.isLive);
      const provider = response.provider || 'demo';
      const model = response.model || (isLive ? 'gemini-2.5-flash' : 'local-grounded-intelligence');

      setIsLiveMode(isLive);
      setActiveProvider(provider);
      setActiveModel(model);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: response.answer || 'Analysis complete.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isLive,
        provider,
        model,
        dataSource: response.dataSource,
        groundedContext: response.groundedContext,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: 'Unable to connect to KaushalSetu Career Intelligence services. Please check your connection or try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        text: `Workspace cleared. How can I assist your career progression for **${profile?.targetRole || 'your target role'}**?`,
        time: 'Just now',
        isLive: isLiveMode,
        provider: activeProvider,
        model: activeModel,
      },
    ]);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Helper to format bot responses nicely with bullet points, numbered lists, and bold highlights
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (!line.trim()) return <div key={idx} className="h-2" />;

      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('• ') || line.trim().startsWith('* ');
      const isNumbered = /^\d+\.\s+/.test(line.trim());
      const isHeader = line.trim().startsWith('### ') || line.trim().startsWith('## ');

      let content = line.trim();
      if (isBullet) content = line.trim().substring(2);
      if (isNumbered) content = line.trim().replace(/^\d+\.\s+/, '');
      if (isHeader) content = line.trim().replace(/^#{2,3}\s+/, '');

      // Format bold text
      const parts = content.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isHeader) {
        return (
          <h4 key={idx} className="font-bold text-slate-900 text-sm mt-3 mb-1 tracking-tight">
            {formattedParts}
          </h4>
        );
      }

      if (isNumbered) {
        const num = line.trim().match(/^(\d+)\./)?.[1] || '•';
        return (
          <div key={idx} className="flex items-start gap-2.5 my-1 text-slate-700 leading-relaxed">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold font-mono shrink-0 mt-0.5">
              {num}
            </span>
            <span className="flex-1">{formattedParts}</span>
          </div>
        );
      }

      if (isBullet) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 text-slate-700 leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 shrink-0" />
            <span className="flex-1">{formattedParts}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="text-slate-700 leading-relaxed my-1">
          {formattedParts}
        </p>
      );
    });
  };

  const missingSkillsList = gapAnalysis?.marketSkillsNeeded
    ?.filter((m: any) => m.isMissing)
    ?.map((m: any) => m.skill?.canonicalName || m.skill?.name) || [];

  return (
    <div className="space-y-6">
      {/* 1. Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-slate-900 rounded-xl text-white shadow-sm shrink-0">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  AI Career Copilot Workspace
                </h2>
                {isLiveMode ? (
                  <span
                    title={`Live Provider: ${activeProvider} | Model: ${activeModel}`}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live AI ({activeProvider} · {activeModel})
                  </span>
                ) : (
                  <span
                    title={`Fallback Model: ${activeModel}`}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full"
                  >
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    Local Grounded Intelligence
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Grounded conversational intelligence for your verified skills, candidate gaps, and placement roadmap.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={handleClearHistory}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Chat
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Split-View Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Grounded Candidate Context Drawer (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Target Role & Profile Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Grounded Profile Context
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> VERIFIED
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block font-mono">TARGET ROLE</span>
              <span className="text-sm font-bold text-slate-900 block mt-0.5">
                {profile?.targetRole || 'DevOps / Cloud Engineer'}
              </span>
              <span className="text-xs text-slate-500 block mt-0.5 truncate">
                {profile?.preferredLocation || 'Bengaluru, Karnataka'}
              </span>
            </div>

            {/* Verified Strengths */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Strengths
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {profile?.skills?.length || 0} registered
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {profile?.skills?.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[11px] font-medium text-slate-800"
                  >
                    {s.skillName || s.skillId}
                  </span>
                ))}
              </div>
            </div>

            {/* Evaluated Gaps */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-rose-700 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Identified Priority Gaps
                </span>
                <span className="text-[11px] text-rose-600 font-mono font-bold">
                  {missingSkillsList.length} Missing
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {missingSkillsList.map((skillName: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(`How can I master ${skillName} and what resources/order do you recommend?`)}
                    className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 group"
                    title={`Click to ask Copilot how to learn ${skillName}`}
                  >
                    <span>{skillName}</span>
                    <ArrowRight className="w-2.5 h-2.5 opacity-50 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>

            {/* Benchmark Top Job Matches */}
            {jobMatches.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                  Target Benchmark Vacancies
                </span>
                <div className="space-y-1.5 pt-1">
                  {jobMatches.slice(0, 2).map((match, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-slate-50 border border-slate-200/80 rounded-lg text-xs flex items-center justify-between gap-2"
                    >
                      <div className="truncate">
                        <p className="font-semibold text-slate-900 truncate">{match.job?.title}</p>
                        <p className="text-[11px] text-slate-500 truncate">{match.job?.company} · {match.job?.locationCity}</p>
                      </div>
                      <span className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold font-mono text-[10px] rounded shrink-0">
                        {match.overallMatchPct}% Match
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts Panel */}
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm space-y-3">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Suggested Career Prompts
            </span>
            <div className="space-y-1.5">
              {suggestedCareerQuestions.map((q, idx) => {
                const IconComponent = q.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(q.prompt)}
                    disabled={loading}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 hover:border-slate-600 border border-slate-700/60 text-xs text-slate-200 transition-all duration-150 flex items-center gap-2.5 cursor-pointer disabled:opacity-50 group"
                  >
                    <div className="p-1.5 rounded-md bg-indigo-600/30 text-indigo-400 group-hover:text-indigo-300 shrink-0">
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 truncate">
                      <p className="font-semibold text-slate-100 truncate">{q.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">{q.prompt}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Chat Stream & Interactive Prompt Area (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[700px]">
          {/* Workspace Stream Header */}
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              <span className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wide">
                Active Career Advisory Thread
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              SIH26134 Intelligence Engine
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/30 text-xs sm:text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Bubble */}
                  <div
                    className={`p-4 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-slate-900 text-white rounded-tr-none shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div>{renderFormattedText(msg.text)}</div>
                    ) : (
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>

                  {/* Metadata Stamp */}
                  <div className="flex items-center gap-2 px-1 text-[10px] text-slate-400 font-mono">
                    <span>{msg.time}</span>
                    {msg.role === 'assistant' && (
                      <>
                        <span>·</span>
                        <span className="text-slate-500">
                          {msg.isLive ? `Live AI (${msg.provider})` : 'Grounded Fallback'}
                        </span>
                        <span>·</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="hover:text-slate-700 flex items-center gap-0.5 cursor-pointer"
                        >
                          {copiedMessageId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                    {profile?.userId?.[0] || 'U'}
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                </div>
                <div className="p-3.5 bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Analyzing career competencies & formulating advisory...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input & Controls */}
          <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 shrink-0 space-y-2.5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2.5"
            >
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask anything about your ${profile?.targetRole || 'DevOps'} roadmap, skill gaps, or job requirements... (Press Enter to send)`}
                  disabled={loading}
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all resize-none disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="h-11 px-4 sm:px-5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 shrink-0 shadow-sm cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
              <span>Shift + Enter for new line</span>
              <span>Grounded by KaushalSetu SIH26134 Engine</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
