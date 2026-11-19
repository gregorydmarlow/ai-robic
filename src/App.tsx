import React, { useEffect, useState } from 'react';
import {
  AIJudgeSession,
  Athlete,
  AthleteVitals,
  CorrectiveDrill,
  DisciplineId,
  FacilityConfig,
  MasteryStage,
  MeetActualRecord,
  RotationGroupId,
  Skill,
  USAGEncyclopediaSkillEntry,
  UserPersonaAccount,
} from './types';
import {
  APPARATUS_LIST,
  CORRECTIVE_DRILLS,
  INITIAL_AI_JUDGE_SESSIONS,
  INITIAL_ATHLETES,
  INITIAL_FACILITY_CONFIG,
  INITIAL_MEET_ACTUALS,
  INITIAL_USAG_ENCYCLOPEDIA,
  INITIAL_USER_PERSONAS,
  SKILLS_CATALOG,
  STAGE_DEFINITIONS,
} from './mockData';
import { AIJudgeModal } from './components/AIJudgeModal';
import { VitalsDrawerModal } from './components/VitalsDrawerModal';
import { SkillPrescriptionDrawer } from './components/SkillPrescriptionDrawer';
import { ParentAthletePortal } from './components/ParentAthletePortal';
import { CurriculumBuilderView } from './components/CurriculumBuilderView';
import { OnboardingSetupView } from './components/OnboardingSetupView';
import { MeetActualsAndSheetsView } from './components/MeetActualsAndSheetsView';
import { LoginPortalView } from './components/LoginPortalView';
import { USAGSkillEncyclopediaView } from './components/USAGSkillEncyclopediaView';
import {
  isSupabaseConfigured,
  seedFullDatabaseToSupabase,
  syncAIJudgeSessionToSupabase,
  syncAthletesToSupabase,
  syncEncyclopediaEntryToSupabase,
  syncFacilityConfigToSupabase,
  syncMeetActualsToSupabase,
} from './lib/supabase';
import {
  Activity,
  AlertTriangle,
  Award,
  BookOpen,
  Building2,
  CheckCircle2,
  Clock,
  Cloud,
  Code2,
  Cpu,
  Dumbbell,
  Flame,
  Layers,
  LogOut,
  Mic,
  Printer,
  RefreshCw,
  RotateCw,
  Ruler,
  ShieldAlert,
  Sparkles,
  Tablet,
  Trophy,
  UserCheck,
  Users,
  Video,
} from 'lucide-react';

type ActiveWorkspaceTab =
  | 'onboarding_setup'
  | 'coach_floor'
  | 'meet_actuals'
  | 'usag_encyclopedia'
  | 'parent_portal'
  | 'curriculum_admin';

const ROTATION_ORDER: RotationGroupId[] = ['A', 'B', 'C', 'D'];

export function App() {
  // Persistent state initialized from rich USAG seed data
  const [activeTab, setActiveTab] = useState<ActiveWorkspaceTab>('coach_floor');
  const [disciplineId, setDisciplineId] = useState<DisciplineId>('WAG');
  const [athletes, setAthletes] = useState<Athlete[]>(() => {
    const saved = localStorage.getItem('apexgym_athletes_v1');
    return saved ? JSON.parse(saved) : INITIAL_ATHLETES;
  });
  const [skills, setSkills] = useState<Skill[]>(() => {
    const saved = localStorage.getItem('apexgym_skills_v1');
    return saved ? JSON.parse(saved) : SKILLS_CATALOG;
  });
  const [drills, setDrills] = useState<CorrectiveDrill[]>(() => {
    const saved = localStorage.getItem('apexgym_drills_v1');
    return saved ? JSON.parse(saved) : CORRECTIVE_DRILLS;
  });
  const [aiSessions, setAiSessions] = useState<AIJudgeSession[]>(() => {
    const saved = localStorage.getItem('apexgym_ai_sessions_v1');
    return saved ? JSON.parse(saved) : INITIAL_AI_JUDGE_SESSIONS;
  });
  const [facilityConfig, setFacilityConfig] = useState<FacilityConfig>(() => {
    const saved = localStorage.getItem('airobic_facility_v1');
    return saved ? JSON.parse(saved) : INITIAL_FACILITY_CONFIG;
  });
  const [meetActuals, setMeetActuals] = useState<MeetActualRecord[]>(() => {
    const saved = localStorage.getItem('airobic_meet_actuals_v1');
    return saved ? JSON.parse(saved) : INITIAL_MEET_ACTUALS;
  });
  const [currentUser, setCurrentUser] = useState<UserPersonaAccount | null>(() => {
    const saved = localStorage.getItem('airobic_current_user_v1');
    return saved ? JSON.parse(saved) : null;
  });
  const [encyclopediaEntries, setEncyclopediaEntries] = useState<USAGEncyclopediaSkillEntry[]>(
    () => {
      const saved = localStorage.getItem('airobic_usag_encyclopedia_v1');
      return saved ? JSON.parse(saved) : INITIAL_USAG_ENCYCLOPEDIA;
    }
  );
  const [showDevIds, setShowDevIds] = useState<boolean>(false);

  // Station-First Floor Cockpit state
  const disciplineApparatus = APPARATUS_LIST.filter((a) => a.disciplineId === disciplineId);
  const [selectedApparatusId, setSelectedApparatusId] = useState<string>('wag-ub');
  // Map each apparatus index to a Rotation Group (rotated with 1-tap Rotate button)
  const [rotationOffset, setRotationOffset] = useState<number>(0);
  const [showAllCheckedInAtStation, setShowAllCheckedInAtStation] = useState<boolean>(false);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('ath-maya');
  const [rotationTimerSec, setRotationTimerSec] = useState<number>(18 * 60 + 42); // 18:42 remaining in rotation

  // Modals & Drawers state
  const [isAIJudgeOpen, setIsAIJudgeOpen] = useState<boolean>(false);
  const [aiJudgeInitialSessionId, setAiJudgeInitialSessionId] = useState<string | undefined>();
  const [aiJudgeInitialSkillId, setAiJudgeInitialSkillId] = useState<string | undefined>();
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState<boolean>(false);
  const [activePrescriptionSkill, setActivePrescriptionSkill] = useState<Skill | null>(null);
  const [showRosterCheckInModal, setShowRosterCheckInModal] = useState<boolean>(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<string | null>(null);

  // Sync changes to localStorage & Supabase Cloud (when configured)
  useEffect(() => {
    localStorage.setItem('apexgym_athletes_v1', JSON.stringify(athletes));
    if (isSupabaseConfigured()) {
      syncAthletesToSupabase(athletes);
    }
  }, [athletes]);

  useEffect(() => {
    localStorage.setItem('apexgym_skills_v1', JSON.stringify(skills));
  }, [skills]);

  useEffect(() => {
    localStorage.setItem('apexgym_drills_v1', JSON.stringify(drills));
  }, [drills]);

  useEffect(() => {
    localStorage.setItem('apexgym_ai_sessions_v1', JSON.stringify(aiSessions));
  }, [aiSessions]);

  useEffect(() => {
    localStorage.setItem('airobic_facility_v1', JSON.stringify(facilityConfig));
    if (isSupabaseConfigured()) {
      syncFacilityConfigToSupabase(facilityConfig);
    }
  }, [facilityConfig]);

  useEffect(() => {
    localStorage.setItem('airobic_meet_actuals_v1', JSON.stringify(meetActuals));
    if (isSupabaseConfigured()) {
      syncMeetActualsToSupabase(meetActuals);
    }
  }, [meetActuals]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('airobic_current_user_v1', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('airobic_current_user_v1');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('airobic_usag_encyclopedia_v1', JSON.stringify(encyclopediaEntries));
  }, [encyclopediaEntries]);

  // Compute Role-Scoped Athletes for the logged-in persona
  const permittedAthletes: Athlete[] = React.useMemo(() => {
    if (!currentUser || currentUser.role === 'owner') {
      return athletes;
    }
    const filtered = athletes.filter((a) => currentUser.assignedAthleteIds.includes(a.id));
    return filtered.length > 0 ? filtered : athletes.slice(0, 1);
  }, [athletes, currentUser]);

  const handlePersonaLogin = (account: UserPersonaAccount) => {
    setCurrentUser(account);
    if (account.role === 'parent' || account.role === 'athlete') {
      setActiveTab('parent_portal');
      const firstId = account.assignedAthleteIds[0];
      if (firstId) setSelectedAthleteId(firstId);
    } else if (account.role === 'coach') {
      setActiveTab('coach_floor');
      const firstId = account.assignedAthleteIds[0];
      if (firstId) {
        setSelectedAthleteId(firstId);
        const firstAth = athletes.find((a) => a.id === firstId);
        if (firstAth) {
          setDisciplineId(firstAth.disciplineId);
          const firstApp = APPARATUS_LIST.find((ap) => ap.disciplineId === firstAth.disciplineId);
          if (firstApp) setSelectedApparatusId(firstApp.id);
        }
      }
    } else {
      setActiveTab('coach_floor');
    }
  };

  const handleManualCloudSync = async () => {
    const res = await seedFullDatabaseToSupabase(
      athletes,
      skills,
      drills,
      aiSessions,
      facilityConfig,
      meetActuals
    );
    setCloudSyncStatus(res.message);
    setTimeout(() => setCloudSyncStatus(null), 4000);
  };

  const handleSaveMeetActual = (newRec: MeetActualRecord) => {
    setMeetActuals((prev) => [newRec, ...prev]);
    // Automatically flag any skill on the athlete's Floor Cockpit that had >= 0.20 deduction
    setAthletes((prev) =>
      prev.map((a) => {
        if (a.id !== newRec.athleteId) return a;
        const nextProgress = { ...a.skillProgress };
        newRec.skillBreakdowns.forEach((b) => {
          const existing = nextProgress[b.skillId] || {
            skillId: b.skillId,
            stage: b.practiceStage,
            lastUpdated: newRec.meetDate,
            coachNote: '',
            activeFaultTags: [],
            assignedDrillIds: [],
            history: [],
          };
          nextProgress[b.skillId] = {
            ...existing,
            compActualStatus: b.deductionTaken >= 0.2 ? 'comp_alert' : 'comp_verified',
            lastCompDeduction: b.deductionTaken,
            lastCompJudgeNote: b.judgeShorthandNote,
          };
        });
        return { ...a, skillProgress: nextProgress };
      })
    );
  };

  // Live floor rotation countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setRotationTimerSec((prev) => (prev > 0 ? prev - 1 : 20 * 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Determine which Rotation Group is currently assigned to each apparatus
  const getGroupAtApparatus = (appId: string): RotationGroupId => {
    const idx = Math.max(
      0,
      disciplineApparatus.findIndex((a) => a.id === appId)
    );
    return ROTATION_ORDER[(idx + rotationOffset) % ROTATION_ORDER.length];
  };

  const activeStationGroup = getGroupAtApparatus(selectedApparatusId);

  // Filter athletes currently at the selected station (scoped to logged-in Owner or Coach)
  const stationAthletes = permittedAthletes.filter((a) => {
    if (a.disciplineId !== disciplineId) return false;
    if (!a.checkedIn) return false;
    // If logged in as a coach, always show their assigned athletes at the station (or filter by group when toggled)
    if (showAllCheckedInAtStation || currentUser?.role === 'coach') return true;
    return a.rotationGroup === activeStationGroup;
  });

  const activeAthlete =
    stationAthletes.find((a) => a.id === selectedAthleteId) ||
    permittedAthletes.find((a) => a.id === selectedAthleteId) ||
    stationAthletes[0] ||
    permittedAthletes[0];

  const currentApparatus =
    disciplineApparatus.find((a) => a.id === selectedApparatusId) || disciplineApparatus[0];

  const stationSkills = skills.filter(
    (s) => s.disciplineId === disciplineId && s.apparatusId === currentApparatus?.id
  );

  // Rotate all groups across stations with 1 tap
  const handleRotateGroups = () => {
    const nextOffset = (rotationOffset + 1) % ROTATION_ORDER.length;
    setRotationOffset(nextOffset);
    setRotationTimerSec(20 * 60);
    // Automatically select the first athlete in the new group arriving at this station
    const idx = Math.max(
      0,
      disciplineApparatus.findIndex((a) => a.id === selectedApparatusId)
    );
    const arrivingGroup = ROTATION_ORDER[(idx + nextOffset) % ROTATION_ORDER.length];
    const firstInArriving = athletes.find(
      (a) => a.disciplineId === disciplineId && a.checkedIn && a.rotationGroup === arrivingGroup
    );
    if (firstInArriving) {
      setSelectedAthleteId(firstInArriving.id);
    }
  };

  // 1-Tap Stage Upgrade on the Gym Floor
  const handleQuickStageSelect = (athleteId: string, skillId: string, newStage: MasteryStage) => {
    setAthletes((prev) =>
      prev.map((a) => {
        if (a.id !== athleteId) return a;
        const existing = a.skillProgress[skillId] || {
          skillId,
          stage: 0,
          lastUpdated: '2026-11-18',
          coachNote: '',
          activeFaultTags: [],
          assignedDrillIds: [],
          history: [],
        };
        return {
          ...a,
          skillProgress: {
            ...a.skillProgress,
            [skillId]: {
              ...existing,
              stage: newStage,
              lastUpdated: '2026-11-18',
              history: [
                ...existing.history,
                {
                  date: '2026-11-18',
                  stage: newStage,
                  note: `Updated to Stage ${newStage} at ${currentApparatus.name} station.`,
                  coachName: 'Coach Elena',
                },
              ],
            },
          },
        };
      })
    );
  };

  // Detailed Prescription & Coach Note Save
  const handleSaveSkillPrescription = (
    athleteId: string,
    skillId: string,
    stage: MasteryStage,
    coachNote: string,
    faultTags: string[],
    drillIds: string[]
  ) => {
    setAthletes((prev) =>
      prev.map((a) => {
        if (a.id !== athleteId) return a;
        const existing = a.skillProgress[skillId] || {
          skillId,
          stage: 1,
          lastUpdated: '2026-11-18',
          coachNote: '',
          activeFaultTags: [],
          assignedDrillIds: [],
          history: [],
        };

        // Ensure newly selected drills also appear in the athlete's Home Training Plan
        const updatedPrescriptions = [...a.prescriptions];
        drillIds.forEach((dId) => {
          const alreadyInPlan = updatedPrescriptions.some((p) => p.drillId === dId);
          if (!alreadyInPlan) {
            const dObj = drills.find((d) => d.id === dId);
            updatedPrescriptions.unshift({
              id: `presc-${Date.now()}-${dId}`,
              drillId: dId,
              skillId,
              assignedBy: 'Coach Elena (Floor Cockpit)',
              assignedDate: '2026-11-18',
              vitalsReason: `Matched to ${a.name}’s Vitals (${a.vitals.torsoToLegRatio} Torso:Leg ratio, ${a.vitals.shoulderFlexionDeg}° Shoulder ROM). ${dObj?.targetedVitalsTrigger || ''}`,
              customCoachNote: coachNote,
              completedDates: [],
            });
          }
        });

        return {
          ...a,
          prescriptions: updatedPrescriptions,
          skillProgress: {
            ...a.skillProgress,
            [skillId]: {
              ...existing,
              stage,
              coachNote,
              activeFaultTags: faultTags,
              assignedDrillIds: drillIds,
              lastUpdated: '2026-11-18',
            },
          },
        };
      })
    );
  };

  // Assign a corrective drill directly from AI Judge or Vitals Engine
  const handleAssignDrillDirect = (
    athleteId: string,
    drillId: string,
    skillId: string,
    vitalsReason: string
  ) => {
    setAthletes((prev) =>
      prev.map((a) => {
        if (a.id !== athleteId) return a;
        const exists = a.prescriptions.some((p) => p.drillId === drillId);
        if (exists) return a;
        return {
          ...a,
          prescriptions: [
            {
              id: `presc-${Date.now()}`,
              drillId,
              skillId,
              assignedBy: 'AI Digital Judge + Vitals Engine',
              assignedDate: '2026-11-18',
              vitalsReason,
              customCoachNote: 'Prescribed via AI Joint Angle & Vitals Correlation.',
              completedDates: [],
            },
            ...a.prescriptions,
          ],
        };
      })
    );
  };

  // Update Athlete Vitals Profile
  const handleUpdateVitals = (
    athleteId: string,
    updatedVitals: AthleteVitals,
    newSummary: string
  ) => {
    setAthletes((prev) =>
      prev.map((a) =>
        a.id === athleteId
          ? {
              ...a,
              vitals: updatedVitals,
              archetypeSummary: newSummary,
            }
          : a
      )
    );
  };

  // Parent/Athlete toggles daily completion on a home drill
  const handleToggleHomeDrillCompletion = (athleteId: string, prescriptionId: string) => {
    const todayIso = '2026-11-18';
    setAthletes((prev) =>
      prev.map((a) => {
        if (a.id !== athleteId) return a;
        let streakDelta = 0;
        const nextPrescriptions = a.prescriptions.map((p) => {
          if (p.id !== prescriptionId) return p;
          const hasToday = p.completedDates.includes(todayIso);
          streakDelta = hasToday ? -1 : 1;
          return {
            ...p,
            completedDates: hasToday
              ? p.completedDates.filter((d) => d !== todayIso)
              : [...p.completedDates, todayIso],
          };
        });
        return {
          ...a,
          homeStreakDays: Math.max(1, a.homeStreakDays + streakDelta),
          prescriptions: nextPrescriptions,
        };
      })
    );
  };

  // Toggle attendance or rotation group in Class Roster Modal
  const handleToggleAttendance = (athleteId: string) => {
    setAthletes((prev) =>
      prev.map((a) => (a.id === athleteId ? { ...a, checkedIn: !a.checkedIn } : a))
    );
  };

  const handleChangeAthleteGroup = (athleteId: string, group: RotationGroupId) => {
    setAthletes((prev) =>
      prev.map((a) => (a.id === athleteId ? { ...a, rotationGroup: group } : a))
    );
  };

  // If no user persona is logged in, render the Role-Based Login Portal
  if (!currentUser) {
    return (
      <LoginPortalView
        personas={INITIAL_USER_PERSONAS}
        athletes={athletes}
        facilityConfig={facilityConfig}
        showDevIds={showDevIds}
        onLoginSuccess={handlePersonaLogin}
      />
    );
  }

  const isOwner = currentUser.role === 'owner';
  const isCoach = currentUser.role === 'coach';
  const isAthlete = currentUser.role === 'athlete';
  const isParent = currentUser.role === 'parent';
  const isPortalLockedRole = isAthlete || isParent;

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col">
      {/* Top Global Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0B1120]/95 backdrop-blur-md border-b border-slate-800/90 px-4 lg:px-6 py-3">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white">
                  AI-<span className="text-cyan-400">ROBIC</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 font-bold">
                  {facilityConfig.facilityName.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Signed in: <strong className="text-slate-200">{currentUser.fullName}</strong> (
                {currentUser.role.toUpperCase()}) · {permittedAthletes.length} Visible Athlete(s)
              </p>
            </div>
          </div>

          {/* Primary Role / Workspace Switcher (Scoped strictly by Persona Permissions) */}
          <nav
            aria-label="Primary Workspace Switcher"
            className="flex flex-wrap items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800"
          >
            {isOwner && (
              <button
                onClick={() => setActiveTab('onboarding_setup')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                  activeTab === 'onboarding_setup'
                    ? 'bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Gym Setup & Roster
              </button>
            )}

            {(isOwner || isCoach) && (
              <button
                onClick={() => setActiveTab('coach_floor')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                  activeTab === 'coach_floor'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                Floor Cockpit ({permittedAthletes.length})
              </button>
            )}

            {(isOwner || isCoach) && (
              <button
                onClick={() => setActiveTab('meet_actuals')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                  activeTab === 'meet_actuals'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                Meet Actuals & Judge Sheets
              </button>
            )}

            {(isOwner || isCoach || isAthlete) && (
              <button
                onClick={() => setActiveTab('usag_encyclopedia')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                  activeTab === 'usag_encyclopedia'
                    ? 'bg-gradient-to-r from-sky-400 to-indigo-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                USAG Encyclopedia ({encyclopediaEntries.length})
              </button>
            )}

            <button
              onClick={() => setActiveTab('parent_portal')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'parent_portal'
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              {isAthlete
                ? 'My Progress Report'
                : isParent
                ? `Parent Portal (${permittedAthletes.length} Linked)`
                : 'Parent Portal'}
            </button>

            {isOwner && (
              <button
                onClick={() => setActiveTab('curriculum_admin')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                  activeTab === 'curriculum_admin'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Curriculum
              </button>
            )}
          </nav>

          {/* Right Quick Actions: Persona Switcher, AI Digital Judge Studio, Dev Section IDs & Class Roster */}
          <div className="flex items-center gap-2">
            {/* Active Persona Pill + Quick Switch / Sign Out */}
            <button
              onClick={() => setCurrentUser(null)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-xs font-bold text-cyan-300 transition"
              title="Switch Persona or Sign Out to Login Screen"
            >
              <LogOut className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {currentUser.role.toUpperCase()}: {currentUser.fullName.split(' ')[0]}
              </span>
              <span className="text-[10px] font-mono text-slate-400 underline ml-1">
                Switch Role
              </span>
            </button>

            <button
              onClick={() => setShowDevIds(!showDevIds)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-mono font-bold transition ${
                showDevIds
                  ? 'bg-fuchsia-500/25 border-fuchsia-400 text-fuchsia-200'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Toggle Section IDs so you can tell the AI agent exactly which section ID to edit"
            >
              <Code2 className="w-3.5 h-3.5" />
              {showDevIds ? 'IDs: ON' : 'IDs'}
            </button>

            {!isPortalLockedRole && (
              <button
                onClick={() => {
                  setAiJudgeInitialSessionId(undefined);
                  setIsAIJudgeOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/50 text-indigo-200 text-xs font-bold transition"
              >
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">AI Digital Judge</span>
              </button>
            )}

            <button
              onClick={handleManualCloudSync}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-semibold transition"
              title="Sync local tablet state with Supabase PostgreSQL"
            >
              <Cloud className="w-4 h-4 text-cyan-400" />
              <span className="hidden xl:inline">
                {isSupabaseConfigured() ? 'Supabase Connected' : 'Supabase Sync'}
              </span>
            </button>

            {(isOwner || isCoach) && (
              <button
                onClick={() => setShowRosterCheckInModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="hidden md:inline">Check-In</span> (
                {permittedAthletes.filter((a) => a.checkedIn).length})
              </button>
            )}
          </div>
        </div>
        {cloudSyncStatus && (
          <div className="max-w-[1600px] mx-auto mt-2 px-3 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-xs font-mono">
            {cloudSyncStatus}
          </div>
        )}
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 lg:px-6 pt-5">
        {activeTab === 'onboarding_setup' && (
          <OnboardingSetupView
            facilityConfig={facilityConfig}
            athletes={athletes}
            showDevIds={showDevIds}
            onSaveOnboarding={(newCfg, updatedAthletes) => {
              setFacilityConfig(newCfg);
              setAthletes(updatedAthletes);
              if (newCfg.activeDisciplines.length > 0) {
                setDisciplineId(newCfg.activeDisciplines[0]);
              }
              setActiveTab('coach_floor');
            }}
            onResetToDemoRoster={() => {
              setFacilityConfig(INITIAL_FACILITY_CONFIG);
              setAthletes(INITIAL_ATHLETES);
              setMeetActuals(INITIAL_MEET_ACTUALS);
            }}
          />
        )}

        {activeTab === 'meet_actuals' && (isOwner || isCoach) && (
          <MeetActualsAndSheetsView
            facilityConfig={facilityConfig}
            athletes={permittedAthletes}
            selectedAthleteId={selectedAthleteId}
            onSelectAthlete={(id) => setSelectedAthleteId(id)}
            apparatusList={APPARATUS_LIST}
            skills={skills}
            meetActuals={meetActuals}
            showDevIds={showDevIds}
            onSaveMeetActual={handleSaveMeetActual}
            onUpdateAthleteRoutineConfig={(athId, appId, cfg) => {
              setAthletes((prev) =>
                prev.map((a) => {
                  if (a.id !== athId) return a;
                  return {
                    ...a,
                    routineConfigs: {
                      ...(a.routineConfigs || {}),
                      [appId]: cfg,
                    },
                  };
                })
              );
            }}
          />
        )}

        {activeTab === 'coach_floor' && (
          <div className="space-y-5 pb-12">
            {/* Top Station & Rotation Group Control Bar [SEC-101] */}
            <div className="relative p-4 rounded-2xl bg-[#0B1120] border border-slate-800 shadow-lg flex flex-wrap items-center justify-between gap-4">
              {showDevIds && (
                <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded bg-fuchsia-500 text-slate-950 font-mono text-[10px] font-black shadow">
                  [SEC-101: Station & Rotation Bar]
                </span>
              )}
              {/* Apparatus Station Selector Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="mr-1">
                  <span className="block text-[10px] font-mono uppercase text-slate-400 font-bold">
                    1. Select Active Station ({disciplineId})
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    {(['WAG', 'MAG', 'CHEER_TNT'] as DisciplineId[]).map((d) => (
                      <button
                        key={d}
                        onClick={() => {
                          setDisciplineId(d);
                          const firstApp = APPARATUS_LIST.find((a) => a.disciplineId === d);
                          if (firstApp) setSelectedApparatusId(firstApp.id);
                          const firstAth = athletes.find((a) => a.disciplineId === d);
                          if (firstAth) setSelectedAthleteId(firstAth.id);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                          disciplineId === d
                            ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {d === 'CHEER_TNT' ? 'CHEER/T&T' : d}
                      </button>
                    ))}
                  </div>
                </div>

                {disciplineApparatus.map((app) => {
                  const isSelected = app.id === currentApparatus?.id;
                  const grp = getGroupAtApparatus(app.id);
                  return (
                    <button
                      key={app.id}
                      onClick={() => {
                        setSelectedApparatusId(app.id);
                        const grpAth = athletes.find(
                          (a) =>
                            a.disciplineId === disciplineId &&
                            a.checkedIn &&
                            a.rotationGroup === grp
                        );
                        if (grpAth) setSelectedAthleteId(grpAth.id);
                      }}
                      className={`px-4 py-2.5 rounded-xl border text-left transition flex items-center gap-3 min-h-[52px] ${
                        isSelected
                          ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-black tracking-wide flex items-center gap-1.5">
                          {app.name}
                          <span className="px-1.5 py-0.5 rounded bg-slate-950 text-[10px] font-mono text-cyan-300">
                            {app.code}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-amber-300 mt-0.5">
                          Group {grp} at Station
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Rotation Timer & 1-Tap Rotate Groups Button */}
              <div className="flex items-center gap-3 bg-slate-900/95 p-2.5 rounded-xl border border-slate-800">
                <div className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-[9px] font-mono uppercase text-slate-400">
                      Rotation Timer
                    </div>
                    <div className="text-sm font-black font-mono text-white">
                      {formatTimer(rotationTimerSec)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRotateGroups}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition"
                >
                  <RotateCw className="w-4 h-4" />
                  Rotate Groups (1-Tap)
                </button>
              </div>
            </div>

            {/* Main Floor Split-Screen Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left 4 Columns: Athletes Currently at This Apparatus + Vitals Snapshot */}
              <div className="lg:col-span-4 space-y-4">
                <div className="relative p-4 rounded-2xl bg-[#0B1120] border border-slate-800 shadow-lg">
                  {showDevIds && (
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded bg-fuchsia-500 text-slate-950 font-mono text-[10px] font-black shadow">
                      [SEC-102: Station Athlete Roster Rail]
                    </span>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                        Rotation Group {activeStationGroup} · {currentApparatus?.name}
                      </span>
                      <h2 className="text-sm font-bold text-white mt-0.5">
                        Athletes at {currentApparatus?.shortName} Station ({stationAthletes.length})
                      </h2>
                    </div>

                    <button
                      onClick={() => setShowAllCheckedInAtStation(!showAllCheckedInAtStation)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-cyan-300 transition"
                    >
                      {showAllCheckedInAtStation ? 'Filter to Group' : 'Show Full Floor'}
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {stationAthletes.map((ath) => {
                      const isSelected = ath.id === activeAthlete?.id;
                      const growthAlert = ath.vitals.growthSpurtVelocityCmPerYr >= 5.5;
                      const shoulderAlert = ath.vitals.shoulderFlexionDeg < 175;

                      // Calculate athlete's completion on this apparatus
                      const completedOnEvent = stationSkills.filter(
                        (sk) => (ath.skillProgress[sk.id]?.stage ?? 0) === 4
                      ).length;

                      return (
                        <div
                          key={ath.id}
                          onClick={() => setSelectedAthleteId(ath.id)}
                          className={`p-3.5 rounded-xl border transition cursor-pointer ${
                            isSelected
                              ? 'bg-slate-900 border-cyan-400 ring-1 ring-cyan-400/50 shadow-lg'
                              : 'bg-slate-900/50 border-slate-800/90 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${ath.avatarGradient} flex items-center justify-center font-black text-white text-sm shrink-0`}
                              >
                                {ath.avatarInitials}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-white">{ath.name}</span>
                                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-cyan-300">
                                    Grp {ath.rotationGroup}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                  {ath.vitals.heightCm}cm · Torso:Leg {ath.vitals.torsoToLegRatio} · Reach +{ath.vitals.apeIndexCm}cm
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-emerald-400">
                                {completedOnEvent}/{stationSkills.length}
                              </span>
                              <div className="text-[10px] text-slate-400">Mastered</div>
                            </div>
                          </div>

                          {/* Quick Vitals & Leverage Alerts */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                            {ath.vitals.torsoToLegRatio < 0.92 && (
                              <span className="px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-[10px] font-mono text-indigo-300">
                                Long-Femur Lever ({ath.vitals.torsoToLegRatio})
                              </span>
                            )}
                            {growthAlert && (
                              <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono text-amber-300 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Growth +{ath.vitals.growthSpurtVelocityCmPerYr}cm/yr
                              </span>
                            )}
                            {shoulderAlert && (
                              <span className="px-2 py-0.5 rounded bg-sky-500/15 border border-sky-500/30 text-[10px] font-mono text-sky-300">
                                Shoulder ROM {ath.vitals.shoulderFlexionDeg}°
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Active Athlete Biomechanical & Vitals Card on the Floor */}
                {activeAthlete && (
                  <div className="relative p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0B1120] to-indigo-950/60 border border-slate-800 shadow-lg space-y-3">
                    {showDevIds && (
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded bg-fuchsia-500 text-slate-950 font-mono text-[10px] font-black shadow">
                        [SEC-103: Athlete Vitals Card]
                      </span>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                          Active Athlete Vitals & Levers
                        </span>
                        <h3 className="text-sm font-bold text-white mt-0.5">
                          {activeAthlete.name}’s Biomechanics Card
                        </h3>
                      </div>

                      <button
                        onClick={() => setIsVitalsModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <Ruler className="w-3.5 h-3.5" />
                        Edit Vitals
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                      {activeAthlete.archetypeSummary}
                    </p>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                        <div className="text-[10px] text-slate-400 font-mono">TORSO:LEG</div>
                        <div className="text-sm font-black font-mono text-cyan-300 mt-0.5">
                          {activeAthlete.vitals.torsoToLegRatio}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                        <div className="text-[10px] text-slate-400 font-mono">SHOULDER</div>
                        <div className="text-sm font-black font-mono text-amber-300 mt-0.5">
                          {activeAthlete.vitals.shoulderFlexionDeg}°
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                        <div className="text-[10px] text-slate-400 font-mono">ANKLE ROM</div>
                        <div className="text-sm font-black font-mono text-indigo-300 mt-0.5">
                          {activeAthlete.vitals.ankleDorsiflexionDeg}°
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right 8 Columns: Apparatus Skill Matrix, 1-Tap Stage Grading, Voice Notes & AI Digital Judge */}
              <div className="lg:col-span-8 space-y-4">
                <div className="relative p-5 rounded-2xl bg-[#0B1120] border border-slate-800 shadow-lg">
                  {showDevIds && (
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded bg-fuchsia-500 text-slate-950 font-mono text-[10px] font-black shadow">
                      [SEC-104: Apparatus Skill Matrix & 1-Tap Grading]
                    </span>
                  )}
                  {/* Athlete Station Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold">
                          {currentApparatus?.name} ({currentApparatus?.code})
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {activeAthlete?.level} Curriculum
                        </span>
                      </div>
                      <h2 className="text-xl font-black text-white mt-1">
                        Scoring {activeAthlete?.name} at {currentApparatus?.shortName}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          setAiJudgeInitialSessionId(undefined);
                          setAiJudgeInitialSkillId(stationSkills[0]?.id);
                          setIsAIJudgeOpen(true);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-600 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition"
                      >
                        <Video className="w-4 h-4" />
                        AI Digital Judge (Mock Meet / Skill Video)
                      </button>
                    </div>
                  </div>

                  {/* Station Skill List with 1-Tap Stage Buttons */}
                  <div className="space-y-4 mt-4">
                    {stationSkills.map((sk) => {
                      const prog = activeAthlete?.skillProgress[sk.id];
                      const currentStage = prog?.stage ?? 1;
                      const assignedDrills = drills.filter((d) =>
                        prog?.assignedDrillIds?.includes(d.id)
                      );

                      return (
                        <div
                          key={sk.id}
                          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition space-y-3.5"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="max-w-xl">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-[11px] font-bold">
                                  {sk.usagCode}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">
                                  {sk.valuePart}
                                </span>
                                {prog?.bestAiScore && (
                                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] font-bold">
                                    AI Judge: {prog.bestAiScore.toFixed(2)}
                                  </span>
                                )}
                                {prog?.compActualStatus === 'comp_alert' && (
                                  <button
                                    onClick={() => setActiveTab('meet_actuals')}
                                    className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/50 text-red-300 font-mono text-[11px] font-bold flex items-center gap-1 hover:bg-red-500/30 transition"
                                    title={prog.lastCompJudgeNote || 'Competition break logged'}
                                  >
                                    <ShieldAlert className="w-3 h-3 text-red-400" />
                                    Comp Break (-{(prog.lastCompDeduction || 0.25).toFixed(2)})
                                  </button>
                                )}
                                {prog?.compActualStatus === 'comp_verified' && (
                                  <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[11px] font-bold">
                                    ✓ Comp Hit
                                  </span>
                                )}
                              </div>
                              <h3 className="text-base font-bold text-white mt-1">{sk.name}</h3>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {sk.biomechanicalFocus}
                              </p>
                            </div>

                            {/* Action Buttons: Prescribe/Voice Note & AI Video Check */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setActivePrescriptionSkill(sk)}
                                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition"
                              >
                                <Mic className="w-3.5 h-3.5" />
                                Note & Home Rx
                              </button>

                              <button
                                onClick={() => {
                                  setAiJudgeInitialSkillId(sk.id);
                                  setIsAIJudgeOpen(true);
                                }}
                                className="px-3 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center gap-1.5 transition"
                              >
                                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                                Judge Turn
                              </button>
                            </div>
                          </div>

                          {/* Oversized 1-Tap Tablet Mastery Stage Bar (Stages 0 to 4) */}
                          <div className="grid grid-cols-5 gap-2 pt-1">
                            {STAGE_DEFINITIONS.map((def) => {
                              const isCurrent = currentStage === def.stage;
                              return (
                                <button
                                  key={def.stage}
                                  onClick={() =>
                                    handleQuickStageSelect(activeAthlete.id, sk.id, def.stage)
                                  }
                                  className={`py-2.5 px-2 rounded-xl border text-center transition min-h-[48px] flex flex-col items-center justify-center ${
                                    isCurrent
                                      ? `${def.bgClass} ${def.borderClass} ${def.colorClass} ring-2 ring-cyan-400/60 font-black shadow-md`
                                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                  }`}
                                >
                                  <span className="text-xs font-mono">{def.shortLabel}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Coach Note & Assigned Home Fixes Preview */}
                          {(prog?.coachNote ||
                            (prog?.activeFaultTags && prog.activeFaultTags.length > 0) ||
                            assignedDrills.length > 0) && (
                            <div className="p-3 rounded-xl bg-slate-950/85 border border-slate-800/90 space-y-2">
                              {prog?.coachNote && (
                                <p className="text-xs text-slate-200 leading-relaxed">
                                  <span className="text-cyan-400 font-bold">
                                    Tailored Coach Note:{' '}
                                  </span>
                                  {prog.coachNote}
                                </p>
                              )}

                              <div className="flex flex-wrap items-center gap-2">
                                {prog?.activeFaultTags?.map((t) => (
                                  <span
                                    key={t}
                                    className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-medium"
                                  >
                                    Blocker: {t}
                                  </span>
                                ))}
                                {assignedDrills.map((d) => (
                                  <span
                                    key={d.id}
                                    className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium flex items-center gap-1"
                                  >
                                    <Dumbbell className="w-3 h-3" />
                                    Home Fix: {d.title} ({d.setsReps})
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'usag_encyclopedia' && (isOwner || isCoach || isAthlete) && (
          <USAGSkillEncyclopediaView
            encyclopediaEntries={encyclopediaEntries}
            apparatusList={APPARATUS_LIST}
            athletes={permittedAthletes}
            selectedAthleteId={selectedAthleteId}
            onSelectAthlete={(id) => setSelectedAthleteId(id)}
            viewerRole={currentUser.role}
            showDevIds={showDevIds}
            onAddEncyclopediaSkillToAthleteRoutine={(athId, entry) => {
              const newSkillId = `skill-enc-${entry.id}`;
              // Add to active skills catalog if not already present
              setSkills((prev) => {
                if (prev.some((s) => s.id === newSkillId || s.usagCode === entry.usagCode)) {
                  return prev;
                }
                const mapped: Skill = {
                  id: newSkillId,
                  disciplineId: entry.disciplineId,
                  level: 'Level 4',
                  apparatusId: entry.apparatusId,
                  name: entry.skillName,
                  usagCode: entry.usagCode,
                  valuePart: `${entry.difficultyValue} Value Part · ${entry.specialRequirementCredit}`,
                  biomechanicalFocus: entry.trainingTips[0] || entry.biomechanicalVitalsNotes,
                  idealAngles: [
                    { joint: 'USAG Benchmark Alignment', targetDegrees: 180, toleranceDegrees: 5 },
                  ],
                  commonFaultTags: entry.commonMistakesAndDeductions.map((m) => m.fault),
                  recommendedDrillIds: ['drill-butcher-block', 'drill-hollow-rockers'],
                  routineCategory: 'optional_repertoire',
                  difficultyRating:
                    entry.difficultyValue === 'Compulsory' || entry.difficultyValue === 'E'
                      ? 'D'
                      : entry.difficultyValue,
                  specialRequirementTag: entry.specialRequirementCredit,
                };
                return [...prev, mapped];
              });

              // Also add to the selected athlete's skillProgress at Stage 1 (Introduced)
              setAthletes((prev) =>
                prev.map((a) => {
                  if (a.id !== athId) return a;
                  if (a.skillProgress[newSkillId]) return a;
                  return {
                    ...a,
                    skillProgress: {
                      ...a.skillProgress,
                      [newSkillId]: {
                        skillId: newSkillId,
                        stage: 1,
                        lastUpdated: '2026-11-19',
                        coachNote: `Added from USAG Encyclopedia (${entry.usagCode}). ${entry.biomechanicalVitalsNotes}`,
                        activeFaultTags: [],
                        assignedDrillIds: ['drill-hollow-rockers'],
                        history: [],
                      },
                    },
                  };
                })
              );
            }}
            onAddNewEncyclopediaEntry={(newEntry) => {
              setEncyclopediaEntries((prev) => [newEntry, ...prev]);
              syncEncyclopediaEntryToSupabase(newEntry);
            }}
          />
        )}

        {activeTab === 'parent_portal' && (
          <ParentAthletePortal
            athletes={permittedAthletes}
            selectedAthleteId={selectedAthleteId}
            onSelectAthlete={(id) => setSelectedAthleteId(id)}
            apparatusList={APPARATUS_LIST}
            skills={skills}
            drills={drills}
            aiSessions={aiSessions}
            onToggleHomeDrillCompletion={handleToggleHomeDrillCompletion}
            onOpenAIJudgeReplay={(sessId, skId) => {
              setAiJudgeInitialSessionId(sessId);
              setAiJudgeInitialSkillId(skId);
              setIsAIJudgeOpen(true);
            }}
            viewerRole={currentUser.role}
            facilityName={facilityConfig.facilityName}
          />
        )}

        {activeTab === 'curriculum_admin' && (
          <CurriculumBuilderView
            disciplineId={disciplineId}
            onSelectDiscipline={(d) => setDisciplineId(d)}
            apparatusList={APPARATUS_LIST}
            skills={skills}
            drills={drills}
            onAddCustomSkill={(newSk) => setSkills((prev) => [...prev, newSk])}
            onAddCustomDrill={(newDr) => setDrills((prev) => [...prev, newDr])}
          />
        )}
      </main>

      {/* AI Digital Judge Modal */}
      {activeAthlete && currentApparatus && (
        <AIJudgeModal
          isOpen={isAIJudgeOpen}
          onClose={() => setIsAIJudgeOpen(false)}
          athlete={activeAthlete}
          apparatus={currentApparatus}
          skills={stationSkills.length > 0 ? stationSkills : skills}
          drills={drills}
          sessions={aiSessions}
          initialSessionId={aiJudgeInitialSessionId}
          initialSkillId={aiJudgeInitialSkillId}
          onCreateSession={(newSess) => setAiSessions((prev) => [newSess, ...prev])}
          onAssignDrillFromAI={handleAssignDrillDirect}
          readOnlyPortalMode={activeTab === 'parent_portal'}
        />
      )}

      {/* Athlete Vitals & Biomechanics Drawer Modal */}
      {activeAthlete && (
        <VitalsDrawerModal
          isOpen={isVitalsModalOpen}
          onClose={() => setIsVitalsModalOpen(false)}
          athlete={activeAthlete}
          drills={drills}
          onUpdateVitals={handleUpdateVitals}
          onAssignDrill={handleAssignDrillDirect}
        />
      )}

      {/* Skill Note, Voice Dictation & Drill Prescription Drawer */}
      {activeAthlete && (
        <SkillPrescriptionDrawer
          isOpen={Boolean(activePrescriptionSkill)}
          onClose={() => setActivePrescriptionSkill(null)}
          athlete={activeAthlete}
          skill={activePrescriptionSkill}
          drills={drills}
          onSaveProgress={handleSaveSkillPrescription}
        />
      )}

      {/* Live Class Check-In & Rotation Group Assignment Modal */}
      {showRosterCheckInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-[#0B1120] border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                  Live Floor Attendance & Rotation Groups
                </span>
                <h2 className="text-lg font-bold text-white">
                  Class Check-In & Group Split (Groups A, B, C, D)
                </h2>
              </div>
              <button
                onClick={() => setShowRosterCheckInModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Done
              </button>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto">
              {permittedAthletes.map((ath) => (
                <div
                  key={ath.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleAttendance(ath.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        ath.checkedIn
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {ath.checkedIn ? '✓ Checked In' : 'Absent'}
                    </button>
                    <div>
                      <div className="text-sm font-bold text-white">
                        {ath.name}{' '}
                        <span className="text-xs font-mono text-cyan-400">({ath.disciplineId})</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Torso:Leg {ath.vitals.torsoToLegRatio} · Shoulder {ath.vitals.shoulderFlexionDeg}°
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-400 mr-1">Group:</span>
                    {ROTATION_ORDER.map((grp) => (
                      <button
                        key={grp}
                        onClick={() => handleChangeAthleteGroup(ath.id, grp)}
                        className={`w-7 h-7 rounded-lg font-mono text-xs font-bold transition ${
                          ath.rotationGroup === grp
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {grp}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
