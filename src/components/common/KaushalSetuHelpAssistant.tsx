import React, { useState, useRef, useEffect } from 'react';
import { UserRole } from '../../types';
import { api } from '../../services/api';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Bot,
  RotateCcw,
  ArrowUpRight,
  HelpCircle,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

interface KaushalSetuHelpAssistantProps {
  currentRole: UserRole;
  userName?: string;
}

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  time: string;
  isGrounded?: boolean;
}

export const KaushalSetuHelpAssistant: React.FC<KaushalSetuHelpAssistantProps> = ({
  currentRole,
  userName = 'User',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);
  const [activeProvider, setActiveProvider] = useState<string>('demo');
  const [activeModel, setActiveModel] = useState<string>('local-grounded-intelligence');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      text: `Hello ${userName.split(' ')[0]}! I am your KaushalSetu AI Copilot. I analyze real-time labour market telemetry, regional job openings, and competency matrices to guide your career roadmap.`,
      time: 'Just now',
      isGrounded: true,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Suggested quick questions as requested
  const suggestedQuestions = [
    { label: 'Explain my skill gap', icon: '🎯' },
    { label: 'What should I learn next?', icon: '💡' },
    { label: 'Why is this skill important?', icon: '🔍' },
    { label: 'Create a 30-day roadmap', icon: '📅' },
  ];

  // Auto-scroll when messages change or panel opens
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      // Focus input on desktop
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

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
      setIsLiveMode(Boolean(response.isLive));
      if (response.provider) setActiveProvider(response.provider);
      if (response.model) setActiveModel(response.model);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: response.answer || 'Analysis complete.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isGrounded: true,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: 'Unable to connect to KaushalSetu Intelligence services. Please verify your connection or try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        text: `Conversation cleared. How can I assist your ${currentRole.toLowerCase()} workflow today?`,
        time: 'Just now',
        isGrounded: true,
      },
    ]);
  };

  // Helper to format bot responses nicely with bullet points and bold highlights
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (!line.trim()) return <div key={idx} className="h-1.5" />;
      
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('• ');
      const content = isBullet ? line.trim().substring(2) : line;

      // Format bold text
      const parts = content.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={idx} className="flex items-start gap-1.5 my-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
            <span className="text-slate-700 leading-relaxed">{formattedParts}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="text-slate-700 leading-relaxed my-0.5">
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <>
      {/* 1. FLOATING CHAT PANEL (OPENS ABOVE LAUNCHER) */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="KaushalSetu AI Copilot Chat"
          className="fixed bottom-16 sm:bottom-20 right-3 left-3 sm:left-auto sm:right-6 z-50 w-auto sm:w-[410px] h-[calc(100vh-5.5rem)] sm:h-[530px] max-h-[580px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white px-4 py-3 sm:py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-indigo-600/30 border border-indigo-500/40 rounded-lg text-indigo-400">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                    KaushalSetu AI Copilot
                  </h3>
                  {isLiveMode ? (
                    <span
                      title={`Provider: ${activeProvider} | Model: ${activeModel}`}
                      className="inline-flex items-center gap-1 text-[9px] font-mono font-medium text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-1.5 py-0.2 rounded cursor-help"
                    >
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                      Live AI ({activeProvider})
                    </span>
                  ) : (
                    <span
                      title={`Mode: Fallback | Model: ${activeModel}`}
                      className="inline-flex items-center gap-1 text-[9px] font-mono font-medium text-sky-300 bg-sky-950/70 border border-sky-800/60 px-1.5 py-0.2 rounded cursor-help"
                    >
                      <span className="w-1 h-1 rounded-full bg-sky-400" />
                      Demo Mode
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  Grounded LMI & Skill Intelligence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearHistory}
                title="Reset conversation"
                aria-label="Reset conversation"
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Minimize chat"
                aria-label="Minimize chat"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Context Ribbon */}
          <div className="bg-slate-50 border-b border-slate-100 px-3.5 py-1.5 flex items-center justify-between text-[11px] text-slate-500 font-mono shrink-0">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span className="font-medium text-slate-700 truncate">
                {userName} ({currentRole})
              </span>
            </div>
            <span className="text-[10px] text-slate-400 shrink-0">SIH26134 Engine</span>
          </div>

          {/* Suggested Quick Questions */}
          <div className="bg-white px-3.5 pt-3 pb-1 border-b border-slate-100 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Suggested Questions
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(q.label)}
                  disabled={loading}
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-900 border border-slate-200/80 rounded-lg text-left text-[11px] text-slate-700 transition-all duration-150 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <span className="text-xs">{q.icon}</span>
                  <span className="truncate font-medium">{q.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/40 text-xs sm:text-sm">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 border border-slate-700 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="text-white font-medium">{msg.text}</p>
                  ) : (
                    <div>{renderFormattedText(msg.text)}</div>
                  )}

                  <div
                    className={`mt-1.5 text-[9px] font-mono flex items-center gap-1 ${
                      msg.role === 'user' ? 'text-slate-400 justify-end' : 'text-slate-400'
                    }`}
                  >
                    <span>{msg.time}</span>
                    {msg.isGrounded && (
                      <span className="text-indigo-500 font-semibold">· Grounded LMI</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-indigo-400 flex items-center justify-center shrink-0 border border-slate-700">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                  <span className="text-xs text-slate-600 font-medium">
                    Analyzing skill matrices & labour market data...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ask about skills, gaps, or careers..."
                disabled={loading}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                title="Send question"
                aria-label="Send question"
                className="p-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
            <div className="mt-1.5 text-[10px] text-slate-400 text-center font-mono flex items-center justify-center gap-1.5">
              <span>Grounded by KaushalSetu SIH26134 Intelligence Engine</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. COMPACT FLOATING PILL LAUNCHER */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Toggle KaushalSetu Help AI Copilot"
          className={`group flex items-center gap-2.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full shadow-lg transition-all duration-200 cursor-pointer select-none border ${
            isOpen
              ? 'bg-slate-900 text-white border-slate-700 shadow-slate-950/30 ring-2 ring-indigo-500/30'
              : 'bg-slate-900/95 hover:bg-slate-900 text-white border-slate-700/80 hover:border-slate-600 shadow-slate-950/20 hover:scale-[1.02] active:scale-[0.98]'
          } backdrop-blur-md`}
        >
          {/* Sparkle Icon */}
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Primary Text */}
          <span className="text-xs sm:text-sm font-semibold tracking-tight text-white">
            KaushalSetu Help
          </span>

          {/* Status Indicator / Model Badge */}
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-medium text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-1.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            AI Copilot
          </span>

          {/* Open/Close chevron or toggle indicator */}
          <div className="text-slate-400 group-hover:text-slate-200 transition-transform">
            {isOpen ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
            )}
          </div>
        </button>
      </div>
    </>
  );
};
