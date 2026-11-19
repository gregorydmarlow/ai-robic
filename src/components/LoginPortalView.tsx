import React, { useState } from 'react';
import {
  Athlete,
  FacilityConfig,
  UserPersonaAccount,
  UserPersonaRole,
} from '../types';
import {
  Award,
  Building2,
  CheckCircle2,
  ChevronRight,
  Crown,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Tablet,
  UserCheck,
  Users,
} from 'lucide-react';

interface LoginPortalViewProps {
  personas: UserPersonaAccount[];
  athletes: Athlete[];
  facilityConfig: FacilityConfig;
  showDevIds: boolean;
  onLoginSuccess: (account: UserPersonaAccount) => void;
}

const ROLE_METADATA: Record<
  UserPersonaRole,
  {
    label: string;
    subtitle: string;
    accessBadge: string;
    accentBorder: string;
    accentBg: string;
    accentText: string;
  }
> = {
  owner: {
    label: 'Gym Owner / Director',
    subtitle: 'Associated with facility · Full access to all athletes, setup, curriculum & meet actuals.',
    accessBadge: 'Full Facility & All Athletes Access',
    accentBorder: 'border-amber-400/70',
    accentBg: 'bg-amber-500/15',
    accentText: 'text-amber-300',
  },
  coach: {
    label: 'Floor Coach / Instructor',
    subtitle: 'Associated with facility · Scoped to the set of athletes & rotation groups you coach.',
    accessBadge: 'Assigned Squad & Floor Cockpit Access',
    accentBorder: 'border-cyan-400/70',
    accentBg: 'bg-cyan-500/15',
    accentText: 'text-cyan-300',
  },
  athlete: {
    label: 'Athlete / Gymnast',
    subtitle: 'Associated with facility · Direct access to your own Personal Progress Report & Home Plan.',
    accessBadge: 'Personal Progress Report Only',
    accentBorder: 'border-indigo-400/70',
    accentBg: 'bg-indigo-500/15',
    accentText: 'text-indigo-300',
  },
  parent: {
    label: 'Parent / Guardian',
    subtitle: 'Parent Portal Only · Scoped exclusively to your 1 or more linked children.',
    accessBadge: 'Parent Portal Only (Multi-Child Switcher)',
    accentBorder: 'border-emerald-400/70',
    accentBg: 'bg-emerald-500/15',
    accentText: 'text-emerald-300',
  },
};

export const LoginPortalView: React.FC<LoginPortalViewProps> = ({
  personas,
  athletes,
  facilityConfig,
  showDevIds,
  onLoginSuccess,
}) => {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(personas[0]?.id || 'usr-owner-1');
  const [emailInput, setEmailInput] = useState<string>(personas[0]?.email || 'owner@skillprogression.com');
  const [passwordInput, setPasswordInput] = useState<string>('••••••••••••');
  const [customCoachSelectionId, setCustomCoachSelectionId] = useState<string>('usr-coach-elena');

  const activePersona =
    personas.find((p) => p.id === selectedPersonaId) || personas[0];

  const handleSelectPersonaCard = (account: UserPersonaAccount) => {
    setSelectedPersonaId(account.id);
    setEmailInput(account.email);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedByEmail = personas.find(
      (p) => p.email.toLowerCase() === emailInput.trim().toLowerCase()
    );
    onLoginSuccess(matchedByEmail || activePersona);
  };

  return (
    <div className="min-h-screen bg-[#070B12] text-slate-100 flex flex-col justify-between p-4 md:p-8 relative overflow-hidden">
      {/* Subtle Ambient Glow */}
      <div className="pointer-events-none fixed -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Top Brand Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">
                AI-<span className="text-cyan-400">ROBIC</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 font-bold">
                SKILLPROGRESSION.COM
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Gymnastics Progress, Anthropometric Biomechanics & USAG AI Digital Judge
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
          <Building2 className="w-4 h-4 text-cyan-400" />
          <span>Active Facility:</span>
          <strong className="text-white">{facilityConfig.facilityName}</strong>
        </div>
      </div>

      {/* Main Center Login & 4-Persona Selector Grid [AUTH-101] */}
      <div className="max-w-6xl w-full mx-auto my-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative">
        {showDevIds && (
          <span className="absolute -top-4 right-2 px-2 py-0.5 rounded bg-fuchsia-500 text-slate-950 font-mono text-[10px] font-black">
            [AUTH-101: Role-Based Persona Login Portal]
          </span>
        )}

        {/* Left 7 Columns: 4 Role-Based Persona Cards */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0B1120]/95 border border-slate-800 shadow-2xl flex flex-col justify-between space-y-5">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-bold uppercase">
              Role-Based Access Control (RBAC)
            </span>
            <h1 className="text-2xl font-black text-white mt-1.5">
              Select Your Persona to Sign In
            </h1>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Each persona is scoped to an associated facility and their exact permitted views and
              athletes. Click any card below to preview or log in immediately:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* 1. OWNER CARD */}
            {(() => {
              const ownerAcc = personas.find((p) => p.role === 'owner') || personas[0];
              const isSelected = activePersona.id === ownerAcc.id;
              const meta = ROLE_METADATA.owner;
              return (
                <div
                  onClick={() => handleSelectPersonaCard(ownerAcc)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? `${meta.accentBg} ${meta.accentBorder} ring-2 ring-amber-400/50 shadow-lg`
                      : 'bg-slate-900/75 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        1. Owner Persona
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {athletes.length} Athletes
                      </span>
                    </div>
                    <h3 className="text-base font-black text-white mt-2">{ownerAcc.fullName}</h3>
                    <div className="text-xs text-amber-300 font-semibold">
                      {facilityConfig.facilityName}
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                      {meta.subtitle}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-amber-300 font-semibold">
                      All {athletes.length} Facility Athletes
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLoginSuccess(ownerAcc);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] flex items-center gap-1"
                    >
                      Enter as Owner <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* 2. COACH CARD (with switcher between Coach Elena Group A vs Coach Marcus Groups B/C) */}
            {(() => {
              const coachPersonas = personas.filter((p) => p.role === 'coach');
              const currentCoach =
                coachPersonas.find((c) => c.id === customCoachSelectionId) || coachPersonas[0];
              const isSelected = activePersona.role === 'coach';
              const meta = ROLE_METADATA.coach;
              const assignedNames = athletes
                .filter((a) => currentCoach.assignedAthleteIds.includes(a.id))
                .map((a) => a.name.split(' ')[0])
                .join(', ');

              return (
                <div
                  onClick={() => handleSelectPersonaCard(currentCoach)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? `${meta.accentBg} ${meta.accentBorder} ring-2 ring-cyan-400/50 shadow-lg`
                      : 'bg-slate-900/75 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                        <Tablet className="w-3 h-3" />
                        2. Coach Persona
                      </span>
                      <div className="flex items-center gap-1">
                        {coachPersonas.map((cp) => (
                          <button
                            key={cp.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCustomCoachSelectionId(cp.id);
                              handleSelectPersonaCard(cp);
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              currentCoach.id === cp.id
                                ? 'bg-cyan-400 text-slate-950'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {cp.fullName.replace('Coach ', '').split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <h3 className="text-base font-black text-white mt-2">
                      {currentCoach.fullName}
                    </h3>
                    <div className="text-xs text-cyan-300 font-semibold">
                      {facilityConfig.facilityName} · Group{' '}
                      {currentCoach.assignedGroups.join(' & ')}
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                      Responsible for:{' '}
                      <strong className="text-white">
                        {assignedNames} ({currentCoach.assignedAthleteIds.length} athletes)
                      </strong>
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-cyan-300 font-semibold">
                      Scoped Roster ({currentCoach.assignedAthleteIds.length})
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLoginSuccess(currentCoach);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-[11px] flex items-center gap-1"
                    >
                      Enter as Coach <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* 3. ATHLETE CARD */}
            {(() => {
              const athleteAcc = personas.find((p) => p.role === 'athlete') || personas[3];
              const isSelected = activePersona.id === athleteAcc.id;
              const meta = ROLE_METADATA.athlete;
              return (
                <div
                  onClick={() => handleSelectPersonaCard(athleteAcc)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? `${meta.accentBg} ${meta.accentBorder} ring-2 ring-indigo-400/50 shadow-lg`
                      : 'bg-slate-900/75 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        3. Athlete Persona
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">WAG Level 4</span>
                    </div>
                    <h3 className="text-base font-black text-white mt-2">
                      {athleteAcc.fullName}
                    </h3>
                    <div className="text-xs text-indigo-300 font-semibold">
                      {facilityConfig.facilityName}
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                      {meta.subtitle}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-indigo-300 font-semibold">
                      My Progress Report Only
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLoginSuccess(athleteAcc);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-400 hover:bg-indigo-300 text-slate-950 font-black text-[11px] flex items-center gap-1"
                    >
                      Enter as Athlete <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* 4. PARENT CARD (Associated with 1 or more athletes, locked to Parent Portal) */}
            {(() => {
              const parentAcc = personas.find((p) => p.role === 'parent') || personas[4];
              const isSelected = activePersona.id === parentAcc.id;
              const meta = ROLE_METADATA.parent;
              const linkedChildren = athletes
                .filter((a) => parentAcc.assignedAthleteIds.includes(a.id))
                .map((a) => a.name)
                .join(' & ');

              return (
                <div
                  onClick={() => handleSelectPersonaCard(parentAcc)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? `${meta.accentBg} ${meta.accentBorder} ring-2 ring-emerald-400/50 shadow-lg`
                      : 'bg-slate-900/75 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        4. Parent Persona
                      </span>
                      <span className="text-[11px] font-mono text-emerald-300">
                        {parentAcc.assignedAthleteIds.length} Children
                      </span>
                    </div>
                    <h3 className="text-base font-black text-white mt-2">
                      {parentAcc.fullName}
                    </h3>
                    <div className="text-xs text-emerald-300 font-semibold">
                      Linked Athletes: {linkedChildren}
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                      {meta.subtitle}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-emerald-300 font-semibold">
                      Parent Portal Locked
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLoginSuccess(parentAcc);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-[11px] flex items-center gap-1"
                    >
                      Enter as Parent <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Right 5 Columns: Standard Credentials Sign-In Box & Permission Breakdown [AUTH-102] */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0B1120]/95 border border-slate-800 shadow-2xl flex flex-col justify-between relative">
          {showDevIds && (
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-fuchsia-500/20 border border-fuchsia-400 text-fuchsia-200 font-mono text-[10px] font-bold">
              [AUTH-102: Credentials & RBAC Scope Card]
            </span>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${activePersona.avatarGradient} flex items-center justify-center font-black text-white text-base shadow-md`}
              >
                {activePersona.avatarInitials}
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                  Selected Sign-In Account
                </span>
                <h2 className="text-lg font-black text-white">{activePersona.fullName}</h2>
                <div className="text-xs text-slate-400">{activePersona.titleBadge}</div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">
                Account Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">
                Password / Facility Passkey
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Active Persona Permission Summary Box */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  RBAC Security & Scope Verification
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-white uppercase font-bold">
                  ROLE: {activePersona.role}
                </span>
              </div>

              <ul className="text-xs text-slate-300 space-y-1.5 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Associated Gym:</strong> {facilityConfig.facilityName}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Visible Athletes ({activePersona.assignedAthleteIds.length}):</strong>{' '}
                    {athletes
                      .filter((a) => activePersona.assignedAthleteIds.includes(a.id))
                      .map((a) => a.name)
                      .join(', ')}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>
                    <strong>Permitted Workspaces:</strong>{' '}
                    {activePersona.role === 'owner' &&
                      'All Tabs (Gym Setup, Floor Cockpit, Meet Actuals, Parent Portal, Curriculum)'}
                    {activePersona.role === 'coach' &&
                      'Coach Floor Cockpit, Meet Actuals & Tear-Off Sheets, Assigned Athlete Preview'}
                    {activePersona.role === 'athlete' &&
                      'Locked to My Personal Progress Report, AI Judge Replays & Home Plan'}
                    {activePersona.role === 'parent' &&
                      'Locked to Parent Portal Only (with switcher for linked children)'}
                  </span>
                </li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition"
            >
              <UserCheck className="w-4 h-4" />
              Sign In as {activePersona.fullName} ({activePersona.role.toUpperCase()})
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Synced with Supabase `ai_robic.user_accounts`</span>
            <span className="font-mono text-cyan-400">v1.4 RBAC</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-slate-500">
        AI-ROBIC · Built for Gymnastics Facilities, Coaches, Athletes & Parents · skillprogression.com
      </div>
    </div>
  );
};
