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

interface QuadrantPersonaSpec {
  role: UserPersonaRole;
  quadrantTitle: string;
  tagline: string;
  description: string;
  featureBullets: string[];
  defaultEmailPlaceholder: string;
  accentBorder: string;
  accentBg: string;
  accentText: string;
  buttonBg: string;
  icon: React.ReactNode;
}

const QUADRANT_SPECS: QuadrantPersonaSpec[] = [
  {
    role: 'owner',
    quadrantTitle: 'Operator',
    tagline: 'Facility Management & Complete Athlete Visibility',
    description:
      'Designed for gym owners, operators, and program directors. Configure facility programs, levels, rotation groups, and oversee every athlete across all events.',
    featureBullets: [
      'Full facility setup: configure programs (WAG, MAG, Cheer/T&T), levels & rotation groups',
      'Complete visibility across all enrolled athletes, coaches, and apparatus stations',
      'Manage the USAG Skill Encyclopedia, custom curriculum & corrective drill library',
      'Track facility-wide competition actuals vs. practice mastery & print squad judge sheets',
    ],
    defaultEmailPlaceholder: 'operator@skillprogression.com',
    accentBorder: 'border-amber-400/70',
    accentBg: 'bg-amber-500/15',
    accentText: 'text-amber-300',
    buttonBg: 'bg-amber-400 hover:bg-amber-300 text-slate-950',
    icon: <Crown className="w-4 h-4" />,
  },
  {
    role: 'coach',
    quadrantTitle: 'Coach',
    tagline: 'Station-First Floor Cockpit & Assigned Squad',
    description:
      'Built for tablets on the gym floor. Manage your assigned athletes and rotation groups, grade 5-stage skill mastery in one tap, and run AI Digital Judge checks.',
    featureBullets: [
      'Scoped directly to your assigned gym and the set of athletes & groups you coach',
      'Glare-free Station Cockpit with 1-tap rotation timer & 5-stage skill grading',
      '1-tap voice-to-text floor notes & anthropometric vitals-matched drill prescriptions',
      'Print perforated tear-off judge routine cards & log competition actuals',
    ],
    defaultEmailPlaceholder: 'coach@skillprogression.com',
    accentBorder: 'border-cyan-400/70',
    accentBg: 'bg-cyan-500/15',
    accentText: 'text-cyan-300',
    buttonBg: 'bg-cyan-400 hover:bg-cyan-300 text-slate-950',
    icon: <Tablet className="w-4 h-4" />,
  },
  {
    role: 'athlete',
    quadrantTitle: 'Athlete',
    tagline: 'Personal Skill Tree, AI Replays & Home Plan',
    description:
      'Associated with your home gym. Track your personal progression across every apparatus, explore the USAG Skill Encyclopedia, and log your daily home drills.',
    featureBullets: [
      'Interactive 5-stage skill tree showing exact progress toward your next level sign-off',
      'Bespoke Home Training Plan tailored to your physical vitals with daily streak tracking',
      'Watch timestamped AI Digital Judge routine replays & joint-angle telemetry',
      'Explore the USAG Skill Encyclopedia for reference keyframes & pro training tips',
    ],
    defaultEmailPlaceholder: 'athlete@skillprogression.com',
    accentBorder: 'border-indigo-400/70',
    accentBg: 'bg-indigo-500/15',
    accentText: 'text-indigo-300',
    buttonBg: 'bg-indigo-400 hover:bg-indigo-300 text-slate-950',
    icon: <Award className="w-4 h-4" />,
  },
  {
    role: 'parent',
    quadrantTitle: 'Parent',
    tagline: 'Transparent Progress Reports & At-Home Support',
    description:
      'Dedicated Parent Portal associated with one or more of your children. See crystal-clear skill stages, coach notes, and safe home exercises.',
    featureBullets: [
      'Locked exclusively to the Parent Portal for your one or more linked athletes',
      'Seamless multi-child switcher to view each gymnast’s progress & meet readiness',
      'Complete transparency into why a skill is at a given stage & how to help at home',
      'View & print official Coach Level-Up Report Cards and AI Mock Meet scorecards',
    ],
    defaultEmailPlaceholder: 'parent@skillprogression.com',
    accentBorder: 'border-emerald-400/70',
    accentBg: 'bg-emerald-500/15',
    accentText: 'text-emerald-300',
    buttonBg: 'bg-emerald-400 hover:bg-emerald-300 text-slate-950',
    icon: <Users className="w-4 h-4" />,
  },
];

export const LoginPortalView: React.FC<LoginPortalViewProps> = ({
  personas,
  facilityConfig,
  showDevIds,
  onLoginSuccess,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserPersonaRole>('owner');
  const [emailInput, setEmailInput] = useState<string>('operator@skillprogression.com');
  const [passwordInput, setPasswordInput] = useState<string>('••••••••••••');
  const [rememberSession, setRememberSession] = useState<boolean>(true);

  const activeSpec =
    QUADRANT_SPECS.find((q) => q.role === selectedRole) || QUADRANT_SPECS[0];

  const handleSelectRoleQuadrant = (spec: QuadrantPersonaSpec) => {
    setSelectedRole(spec.role);
    setEmailInput(spec.defaultEmailPlaceholder);
  };

  const resolveAccountForRole = (role: UserPersonaRole, typedEmail: string): UserPersonaAccount => {
    const cleanEmail = typedEmail.trim().toLowerCase();
    const exactEmailMatch = personas.find(
      (p) => p.role === role && p.email.toLowerCase() === cleanEmail
    );
    if (exactEmailMatch) return exactEmailMatch;
    return personas.find((p) => p.role === role) || personas[0];
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const account = resolveAccountForRole(selectedRole, emailInput);
    onLoginSuccess(account);
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
          <span>Platform Status:</span>
          <strong className="text-emerald-400">Live · Persistent Session Enabled</strong>
        </div>
      </div>

      {/* Main Center Login & 4-Quadrant Role Selector Grid [AUTH-101] */}
      <div className="max-w-6xl w-full mx-auto my-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative">
        {showDevIds && (
          <span className="absolute -top-4 right-2 px-2 py-0.5 rounded bg-fuchsia-500 text-slate-950 font-mono text-[10px] font-black">
            [AUTH-101: 4-Quadrant Persona Login Portal]
          </span>
        )}

        {/* Left 7 Columns: 4 Clean Persona Quadrants (Operator, Coach, Athlete, Parent) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0B1120]/95 border border-slate-800 shadow-2xl flex flex-col justify-between space-y-5">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-bold uppercase">
              Choose Your Role
            </span>
            <h1 className="text-2xl font-black text-white mt-1.5">
              Select Your Persona Quadrant
            </h1>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Select your role below to view the features tailored to your experience and sign in to
              your persistent workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {QUADRANT_SPECS.map((spec) => {
              const isSelected = selectedRole === spec.role;
              return (
                <div
                  key={spec.role}
                  onClick={() => handleSelectRoleQuadrant(spec)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? `${spec.accentBg} ${spec.accentBorder} ring-2 ring-cyan-400/40 shadow-lg`
                      : 'bg-slate-900/75 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-black uppercase flex items-center gap-1.5 ${spec.accentBg} ${spec.accentBorder} ${spec.accentText}`}
                      >
                        {spec.icon}
                        {spec.quadrantTitle}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                          Selected
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white mt-3">{spec.tagline}</h3>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      {spec.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className={`text-[11px] font-mono font-semibold ${spec.accentText}`}>
                      {spec.quadrantTitle} Workspace
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectRoleQuadrant(spec);
                        onLoginSuccess(resolveAccountForRole(spec.role, spec.defaultEmailPlaceholder));
                      }}
                      className={`px-3 py-1.5 rounded-lg font-black text-xs flex items-center gap-1 transition ${spec.buttonBg}`}
                    >
                      Launch {spec.quadrantTitle} <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Columns: Persona Feature Breakdown & Persistent Sign-In Form [AUTH-102] */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0B1120]/95 border border-slate-800 shadow-2xl flex flex-col justify-between relative">
          {showDevIds && (
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-fuchsia-500/20 border border-fuchsia-400 text-fuchsia-200 font-mono text-[10px] font-bold">
              [AUTH-102: Persona Features & Sign-In Panel]
            </span>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Selected Role Header (No individual user names shown) */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div
                className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${activeSpec.accentBg} ${activeSpec.accentBorder} ${activeSpec.accentText}`}
              >
                {activeSpec.icon}
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                  Selected Persona
                </span>
                <h2 className="text-lg font-black text-white">
                  {activeSpec.quadrantTitle} Portal Sign-In
                </h2>
                <div className="text-xs text-slate-400">{activeSpec.tagline}</div>
              </div>
            </div>

            {/* Feature Explanation Box for the Selected Persona */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {activeSpec.quadrantTitle} Capabilities & Access
                </span>
              </div>

              <ul className="text-xs text-slate-300 space-y-2 pt-1">
                {activeSpec.featureBullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder={activeSpec.defaultEmailPlaceholder}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">
                Password
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

            {/* Persistent Session Checkbox */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberSession}
                  onChange={(e) => setRememberSession(e.target.checked)}
                  className="rounded accent-cyan-400"
                />
                <span className="text-xs text-slate-200 font-medium">
                  Keep me signed in on this device
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Persistent Session
              </span>
            </label>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition"
            >
              <UserCheck className="w-4 h-4" />
              Sign In to {activeSpec.quadrantTitle} Workspace
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Facility: {facilityConfig.facilityName}</span>
            <span className="font-mono text-cyan-400">skillprogression.com</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-slate-500">
        AI-ROBIC · Built for Gymnastics Facilities, Operators, Coaches, Athletes & Parents · skillprogression.com
      </div>
    </div>
  );
};
