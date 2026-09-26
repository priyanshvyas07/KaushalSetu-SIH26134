import React from 'react';
import { UserRole } from '../../types';
import { ShieldCheck, UserCheck, Building2, Briefcase, ChevronRight } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  userName: string;
  organizationName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  userName,
  organizationName,
}) => {
  const roles: { role: UserRole; label: string; icon: any; workspaceLabel: string }[] = [
    { role: 'STUDENT', label: 'Student', icon: UserCheck, workspaceLabel: 'Student Workspace' },
    { role: 'INSTITUTE', label: 'Institute', icon: Building2, workspaceLabel: 'Institute Workspace' },
    { role: 'EMPLOYER', label: 'Employer', icon: Briefcase, workspaceLabel: 'Employer Workspace' },
    { role: 'ADMIN', label: 'Govt Admin', icon: ShieldCheck, workspaceLabel: 'Govt Admin Workspace' },
  ];

  const currentRoleConfig = roles.find(r => r.role === currentRole) || roles[1];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Identity & Active Workspace Indicator */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-xs">
              KS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-base">
                  KaushalSetu
                </span>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200/80 px-1.5 py-0.5 rounded font-medium">
                  SIH26134
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-semibold text-indigo-700">
                  {currentRoleConfig.workspaceLabel}
                </span>
                <span className="text-slate-300 hidden sm:inline" aria-hidden="true">·</span>
                <span className="hidden sm:inline text-slate-500 text-[11px]">
                  Labour Market &amp; Skill Intelligence
                </span>
              </div>
            </div>
          </div>

          {/* Quick Role Switcher for SIH Evaluation */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-lg border border-slate-200/80">
            {roles.map(({ role, label, icon: Icon }) => {
              const isActive = currentRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => onRoleChange(role)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-slate-950 shadow-xs border border-slate-200/90'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Active User Details / Profile */}
          <div className="flex items-center gap-3 text-right shrink-0">
            {/* Mobile role select fallback */}
            <div className="md:hidden">
              <select
                value={currentRole}
                onChange={e => onRoleChange(e.target.value as UserRole)}
                className="text-xs py-1.5 px-2 bg-slate-100 border border-slate-200 rounded-lg font-medium text-slate-800"
              >
                {roles.map(r => (
                  <option key={r.role} value={r.role}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden lg:block">
              <p className="text-xs font-bold text-slate-900 leading-tight">{userName}</p>
              <p className="text-[11px] text-slate-500 truncate max-w-[220px]">
                {organizationName || `${currentRole.toLowerCase()} workspace`}
              </p>
            </div>

            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-800 shrink-0">
              {userName.charAt(0)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
