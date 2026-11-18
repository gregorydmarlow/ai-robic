import React, { useState } from 'react';
import {
  Apparatus,
  Athlete,
  AthleteEventRoutineConfig,
  FacilityConfig,
  MeetActualRecord,
  MeetSkillActualItem,
  Skill,
} from '../types';
import { STAGE_DEFINITIONS } from '../mockData';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ClipboardList,
  Layers,
  PlusCircle,
  Printer,
  Scissors,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Trophy,
  X,
} from 'lucide-react';

interface MeetActualsAndSheetsViewProps {
  facilityConfig: FacilityConfig;
  athletes: Athlete[];
  selectedAthleteId: string;
  onSelectAthlete: (athleteId: string) => void;
  apparatusList: Apparatus[];
  skills: Skill[];
  meetActuals: MeetActualRecord[];
  showDevIds: boolean;
  onSaveMeetActual: (newRecord: MeetActualRecord) => void;
  onUpdateAthleteRoutineConfig: (
    athleteId: string,
    apparatusId: string,
    config: AthleteEventRoutineConfig
  ) => void;
}

export const MeetActualsAndSheetsView: React.FC<MeetActualsAndSheetsViewProps> = ({
  facilityConfig,
  athletes,
  selectedAthleteId,
  onSelectAthlete,
  apparatusList,
  skills,
  meetActuals,
  showDevIds,
  onSaveMeetActual,
  onUpdateAthleteRoutineConfig,
}) => {
  const athlete = athletes.find((a) => a.id === selectedAthleteId) || athletes[0];
  const disciplineApparatus = apparatusList.filter(
    (a) => a.disciplineId === athlete.disciplineId
  );

  const [selectedApparatusId, setSelectedApparatusId] = useState<string>(
    disciplineApparatus[0]?.id || 'wag-ub'
  );
  const [showPrintJudgeSheetModal, setShowPrintJudgeSheetModal] = useState<boolean>(false);
  const [printBatchAllSquad, setPrintBatchAllSquad] = useState<boolean>(false);
  const [showLogMeetModal, setShowLogMeetModal] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  const currentApparatus =
    disciplineApparatus.find((a) => a.id === selectedApparatusId) || disciplineApparatus[0];

  // Separate Compulsory Core, Compulsory Bonus Upgrades, and Optional Repertoire skills
  const allEventSkills = skills.filter(
    (s) => s.disciplineId === athlete.disciplineId && s.apparatusId === currentApparatus?.id
  );
  const compulsoryCoreSkills = allEventSkills.filter(
    (s) => !s.isBonusOption && s.routineCategory !== 'optional_repertoire'
  );
  const compulsoryBonusSkills = allEventSkills.filter((s) => s.isBonusOption);
  const optionalRepertoireSkills = allEventSkills.filter(
    (s) => s.routineCategory === 'optional_repertoire' || !s.isBonusOption
  );

  // Get or initialize the athlete's routine config for this apparatus
  const activeRoutineConfig: AthleteEventRoutineConfig = athlete.routineConfigs?.[
    currentApparatus?.id
  ] || {
    apparatusId: currentApparatus?.id,
    routineMode:
      athlete.level.includes('7') ||
      athlete.level.includes('8') ||
      athlete.level.includes('Xcel')
        ? 'optional'
        : 'compulsory',
    selectedSkillIds: compulsoryCoreSkills.map((s) => s.id),
    optedInBonusSkillIds: [],
  };

  const handleToggleRoutineMode = (mode: 'compulsory' | 'optional') => {
    const defaultSelected =
      mode === 'compulsory'
        ? compulsoryCoreSkills.map((s) => s.id)
        : optionalRepertoireSkills.slice(0, 4).map((s) => s.id);
    onUpdateAthleteRoutineConfig(athlete.id, currentApparatus.id, {
      ...activeRoutineConfig,
      routineMode: mode,
      selectedSkillIds: defaultSelected,
    });
  };

  const handleToggleBonusOptIn = (bonusSkillId: string) => {
    const exists = activeRoutineConfig.optedInBonusSkillIds.includes(bonusSkillId);
    const nextBonus = exists
      ? activeRoutineConfig.optedInBonusSkillIds.filter((id) => id !== bonusSkillId)
      : [...activeRoutineConfig.optedInBonusSkillIds, bonusSkillId];

    onUpdateAthleteRoutineConfig(athlete.id, currentApparatus.id, {
      ...activeRoutineConfig,
      optedInBonusSkillIds: nextBonus,
    });
  };

  const handleToggleOptionalSkill = (skillId: string) => {
    const exists = activeRoutineConfig.selectedSkillIds.includes(skillId);
    const nextSelected = exists
      ? activeRoutineConfig.selectedSkillIds.filter((id) => id !== skillId)
      : [...activeRoutineConfig.selectedSkillIds, skillId];

    onUpdateAthleteRoutineConfig(athlete.id, currentApparatus.id, {
      ...activeRoutineConfig,
      selectedSkillIds: nextSelected,
    });
  };

  // Compute the effective ordered skill list for this athlete's routine
  const getEffectiveRoutineSkillsForAthlete = (ath: Athlete, appId: string) => {
    const cfg = ath.routineConfigs?.[appId];
    const core = skills.filter(
      (s) =>
        s.disciplineId === ath.disciplineId &&
        s.apparatusId === appId &&
        !s.isBonusOption &&
        s.routineCategory !== 'optional_repertoire'
    );
    const bonuses = skills.filter(
      (s) => s.disciplineId === ath.disciplineId && s.apparatusId === appId && s.isBonusOption
    );

    if (cfg?.routineMode === 'optional') {
      const selected = skills.filter((s) => cfg.selectedSkillIds.includes(s.id));
      return {
        mode: 'optional' as const,
        routineSkills: selected.length > 0 ? selected : core,
        optedBonusSkills: [] as Skill[],
        totalBonusPotential: 0,
      };
    }

    const optedIds = cfg?.optedInBonusSkillIds || [];
    const optedBonusSkills = bonuses.filter((b) => optedIds.includes(b.id));
    const totalBonusPotential = optedBonusSkills.reduce(
      (acc, b) => acc + (b.bonusPoints || 0.15),
      0
    );

    return {
      mode: 'compulsory' as const,
      routineSkills: core,
      optedBonusSkills,
      totalBonusPotential: Number(totalBonusPotential.toFixed(2)),
    };
  };

  const currentAthleteRoutine = getEffectiveRoutineSkillsForAthlete(
    athlete,
    currentApparatus?.id
  );

  const athleteMeetRecords = meetActuals.filter((m) => m.athleteId === athlete.id);

  // State for logging a new Meet Actual + Judge Critique
  const [meetName, setMeetName] = useState('2026 Winter Classic Sanctioned Meet');
  const [meetDate, setMeetDate] = useState('2026-11-18');
  const [judgePanel, setJudgePanel] = useState('USAG 2-Judge Panel');
  const [judgeGeneralNotes, setJudgeGeneralNotes] = useState('');
  const [skillDeductions, setSkillDeductions] = useState<
    Record<string, { deduction: number; note: string }>
  >({});

  const combinedLoggableSkills = [
    ...currentAthleteRoutine.routineSkills,
    ...currentAthleteRoutine.optedBonusSkills,
  ];

  const handleOpenLogModal = () => {
    const initialMap: Record<string, { deduction: number; note: string }> = {};
    combinedLoggableSkills.forEach((sk) => {
      initialMap[sk.id] = { deduction: 0.0, note: '' };
    });
    setSkillDeductions(initialMap);
    setShowLogMeetModal(true);
  };

  const handleSaveNewMeetActual = (e: React.FormEvent) => {
    e.preventDefault();
    const breakdowns: MeetSkillActualItem[] = combinedLoggableSkills.map((sk) => {
      const entry = skillDeductions[sk.id] || { deduction: 0, note: '' };
      const pStage = athlete.skillProgress[sk.id]?.stage ?? 1;
      const status: MeetSkillActualItem['status'] =
        entry.deduction >= 0.25
          ? 'major_break'
          : entry.deduction >= 0.1
          ? 'minor_break'
          : 'hit_clean';

      return {
        skillId: sk.id,
        skillName: sk.name,
        usagCode: sk.usagCode,
        valuePart: sk.valuePart,
        practiceStage: pStage,
        deductionTaken: entry.deduction,
        judgeShorthandNote:
          entry.note.trim() ||
          (entry.deduction === 0
            ? sk.isBonusOption
              ? `BONUS HIT! (+${(sk.bonusPoints || 0.15).toFixed(2)})`
              : 'Hit clean in competition (0.00)'
            : `Judge deduction -${entry.deduction.toFixed(2)}`),
        status,
      };
    });

    const totalDed = breakdowns.reduce((acc, b) => acc + b.deductionTaken, 0);
    const startVal = Number((10.0 + currentAthleteRoutine.totalBonusPotential).toFixed(2));
    const finalActual = Number(Math.max(0, startVal - totalDed).toFixed(2));

    const newRec: MeetActualRecord = {
      id: `meet-act-${Date.now()}`,
      athleteId: athlete.id,
      apparatusId: currentApparatus.id,
      meetName,
      meetDate,
      level: athlete.level,
      startValue: startVal,
      actualScore: finalActual,
      aiPredictedScore: 9.4,
      judgeNameOrPanel: judgePanel,
      judgeGeneralNotes:
        judgeGeneralNotes.trim() ||
        `Evaluated at ${meetName}. Any Stage 4 skill with >= 0.20 deduction has been flagged on the Floor Cockpit for pressure training.`,
      skillBreakdowns: breakdowns,
    };

    onSaveMeetActual(newRec);
    setShowLogMeetModal(false);
    setToast(
      `Saved ${meetName} Actuals (${finalActual.toFixed(
        2
      )}) & updated Floor Cockpit pressure flags!`
    );
    setTimeout(() => setToast(null), 4000);
  };

  // Squad athletes on this discipline for batch tear-off sheet printing
  const squadAthletes = athletes.filter((a) => a.disciplineId === athlete.disciplineId);

  return (
    <div className="space-y-6 pb-14">
      {/* Top Banner [ACT-101] */}
      <div className="relative p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0F172A] to-amber-950/50 border border-slate-800 shadow-xl">
        {showDevIds && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-fuchsia-500/20 border border-fuchsia-400 text-fuchsia-200 font-mono text-[10px] font-bold">
            [ACT-101: Routine Builder, Tear-Off Judge Sheets & Meet Actuals Banner]
          </span>
        )}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold uppercase">
              Compulsory Bonus Opt-Ins · Optional Repertoire · Tear-Off Judge Cards
            </span>
            <h1 className="text-2xl font-black text-white mt-1">
              Athlete Routine Builder, Tear-Off Judge Sheets & Competition Actuals
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Configure whether an athlete is attempting **Compulsory Bonus Upgrades** (low levels)
              or a **Custom Optional Repertoire** (high levels), print **Per-Athlete Tear-Off
              Routine Cards** for the judges, and analyze **Practice vs. Competition Actuals**.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              aria-label="Select Athlete for Routine & Meet Actuals"
              value={athlete.id}
              onChange={(e) => onSelectAthlete(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white"
            >
              {athletes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.disciplineId} {a.level})
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setPrintBatchAllSquad(false);
                setShowPrintJudgeSheetModal(true);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition"
            >
              <Scissors className="w-4 h-4" />
              Tear-Off Judge Card ({athlete.name.split(' ')[0]})
            </button>

            <button
              onClick={() => {
                setPrintBatchAllSquad(true);
                setShowPrintJudgeSheetModal(true);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 transition"
            >
              <Printer className="w-4 h-4" />
              Print Squad Tear-Off Stack ({squadAthletes.length} Cards)
            </button>

            <button
              onClick={handleOpenLogModal}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Log Meet Actuals
            </button>
          </div>
        </div>

        {/* Event Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-400 mr-1">Select Apparatus:</span>
            {disciplineApparatus.map((app) => (
              <button
                key={app.id}
                onClick={() => setSelectedApparatusId(app.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  currentApparatus?.id === app.id
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {app.name} ({app.code})
              </button>
            ))}
          </div>

          {/* Compulsory vs Optional Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => handleToggleRoutineMode('compulsory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeRoutineConfig.routineMode === 'compulsory'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Compulsory (Base Routine + Bonus Opt-In)
            </button>
            <button
              onClick={() => handleToggleRoutineMode('optional')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeRoutineConfig.routineMode === 'optional'
                  ? 'bg-indigo-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Optional (Custom Repertoire + SRs)
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toast}
        </div>
      )}

      {/* Section [ACT-104]: Athlete Routine & Bonus / Optional Repertoire Configurator */}
      <div className="relative p-5 rounded-2xl bg-[#0B1120] border border-slate-800 shadow-lg space-y-4">
        {showDevIds && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-fuchsia-500/20 border border-fuchsia-400 text-fuchsia-200 font-mono text-[10px] font-bold">
            [ACT-104: Athlete Routine & Bonus / Optional Builder]
          </span>
        )}

        {activeRoutineConfig.routineMode === 'compulsory' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 6 Cols: Compulsory Base Routine + Bonus Opt-In Toggles */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                    Low-Level Compulsory Differentiation
                  </span>
                  <h2 className="text-base font-bold text-white">
                    {athlete.name}’s {currentApparatus?.name} Compulsory Routine & Bonus Elections
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold">
                  Max Start Value:{' '}
                  {(10.0 + currentAthleteRoutine.totalBonusPotential).toFixed(2)}
                </span>
              </div>

              <p className="text-xs text-slate-400">
                All athletes perform the standard {athlete.level} base routine below. Toggle which{' '}
                <strong className="text-amber-300">Bonus / Virtuosity Upgrades</strong>{' '}
                {athlete.name} is attempting so her Tear-Off Judge Sheet & Analytics reflect her
                exact target routine:
              </p>

              {/* Bonus Upgrade Opt-In Cards */}
              {compulsoryBonusSkills.length === 0 ? (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
                  Standard compulsory skills active for this apparatus.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {compulsoryBonusSkills.map((bSkill) => {
                    const isOptedIn = activeRoutineConfig.optedInBonusSkillIds.includes(bSkill.id);
                    const pStage = athlete.skillProgress[bSkill.id]?.stage ?? 2;
                    return (
                      <div
                        key={bSkill.id}
                        onClick={() => handleToggleBonusOptIn(bSkill.id)}
                        className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                          isOptedIn
                            ? 'bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/10'
                            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-mono text-[10px] font-black">
                              +{(bSkill.bonusPoints || 0.15).toFixed(2)} BONUS OPTION
                            </span>
                            <span className="text-xs font-mono text-cyan-300">
                              {bSkill.usagCode}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              (Practice Stage {pStage})
                            </span>
                          </div>
                          <div className="text-sm font-bold text-white mt-1">{bSkill.name}</div>
                          <div className="text-[11px] text-slate-300 mt-0.5">
                            {bSkill.biomechanicalFocus}
                          </div>
                        </div>

                        <div
                          className={`px-3.5 py-2 rounded-xl font-mono text-xs font-black shrink-0 ${
                            isOptedIn
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isOptedIn ? '★ GOING FOR BONUS' : 'STANDARD ONLY'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right 5 Cols: Squad Bonus & ROI Analytics Comparison */}
            <div className="lg:col-span-5 p-4 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-bold">
                    Squad Bonus Election & ROI Analytics
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Coaches, athletes & parents can see at a glance who is attempting bonus upgrades
                  and whether the bonus is net-positive in competition:
                </p>

                <div className="space-y-2">
                  {squadAthletes.map((sqAth) => {
                    const rInfo = getEffectiveRoutineSkillsForAthlete(
                      sqAth,
                      currentApparatus?.id
                    );
                    const isCurr = sqAth.id === athlete.id;
                    return (
                      <div
                        key={sqAth.id}
                        onClick={() => onSelectAthlete(sqAth.id)}
                        className={`p-2.5 rounded-lg border flex items-center justify-between text-xs cursor-pointer transition ${
                          isCurr
                            ? 'bg-slate-900 border-cyan-500/60'
                            : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-white">{sqAth.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 ml-2">
                            Grp {sqAth.rotationGroup}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {rInfo.optedBonusSkills.length > 0 ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold">
                              ★ {rInfo.optedBonusSkills.length} Bonus (+
                              {rInfo.totalBonusPotential.toFixed(2)})
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
                              Base 10.00
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-cyan-300">
                <strong>Coach Insight:</strong> Only elect a +0.20 Bonus skill on the Tear-Off Sheet
                once the athlete’s AI Mock Score deduction on that element is under -0.15!
              </div>
            </div>
          </div>
        ) : (
          /* Optional Custom Repertoire Builder (Higher Levels 6-10 / Xcel) */
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold">
                  Higher-Level Optional Custom Repertoire
                </span>
                <h2 className="text-base font-bold text-white">
                  {athlete.name}’s Custom Optional Routine & USAG Special Requirements (SR) Check
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-200 font-mono text-xs font-bold">
                  Selected Elements: {activeRoutineConfig.selectedSkillIds.length} · Start Value: 10.00
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {optionalRepertoireSkills.map((optSk) => {
                const isSelected = activeRoutineConfig.selectedSkillIds.includes(optSk.id);
                return (
                  <div
                    key={optSk.id}
                    onClick={() => handleToggleOptionalSkill(optSk.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-500/15 border-indigo-400 shadow-md'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-950 text-cyan-300 font-mono text-[10px] font-bold">
                          {optSk.usagCode} · Diff: {optSk.difficultyRating || 'B'}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isSelected ? '✓ IN ROUTINE' : '+ ADD'}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white mt-1.5">{optSk.name}</div>
                      <div className="text-[11px] text-indigo-300 mt-1">
                        {optSk.specialRequirementTag || optSk.valuePart}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Two-Column Grid: Practice vs Comp Actuals + Logged Judge Critiques */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Cols: Practice Mastery vs. Competition Actuals Matrix [ACT-102] */}
        <div className="lg:col-span-6 relative p-5 rounded-2xl bg-[#0B1120] border border-slate-800 space-y-4">
          {showDevIds && (
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-fuchsia-500/20 border border-fuchsia-400 text-fuchsia-200 font-mono text-[10px] font-bold">
              [ACT-102: Practice vs. Comp Reality Matrix]
            </span>
          )}

          <div>
            <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
              Practice vs. Competition Calibration
            </span>
            <h2 className="text-base font-bold text-white mt-0.5">
              {athlete.name}’s Active {currentApparatus?.name} Routine ({combinedLoggableSkills.length}{' '}
              Elements)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Includes {athlete.name}’s base elements plus any elected{' '}
              <strong className="text-amber-300">Bonus Upgrades</strong>.
            </p>
          </div>

          <div className="space-y-3">
            {combinedLoggableSkills.map((sk, idx) => {
              const prog = athlete.skillProgress[sk.id];
              const pStage = prog?.stage ?? 1;
              const stageDef =
                STAGE_DEFINITIONS.find((d) => d.stage === pStage) || STAGE_DEFINITIONS[1];

              const latestBreakdown = athleteMeetRecords
                .flatMap((r) => r.skillBreakdowns)
                .find((b) => b.skillId === sk.id);

              const hasPressureGap =
                pStage === 4 &&
                ((latestBreakdown && latestBreakdown.deductionTaken >= 0.2) ||
                  prog?.compActualStatus === 'comp_alert');

              return (
                <div
                  key={sk.id}
                  className={`p-4 rounded-xl border space-y-2.5 ${
                    sk.isBonusOption
                      ? 'bg-amber-950/20 border-amber-500/50'
                      : hasPressureGap
                      ? 'bg-red-950/20 border-red-500/50'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-950 text-cyan-300 font-mono text-[10px] font-bold">
                          #{idx + 1} · {sk.usagCode}
                        </span>
                        {sk.isBonusOption && (
                          <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-mono text-[10px] font-black">
                            ★ ELECTED BONUS (+{(sk.bonusPoints || 0.15).toFixed(2)})
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">{sk.valuePart}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white mt-1">{sk.name}</h3>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${stageDef.bgClass} ${stageDef.borderClass} ${stageDef.colorClass}`}
                    >
                      Practice: {stageDef.shortLabel}
                    </span>
                  </div>

                  {/* Reality Check Comparison Bar */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                      <div className="text-[10px] font-mono text-slate-400">PRACTICE STATUS</div>
                      <div className="text-xs font-bold text-white mt-0.5">{stageDef.label}</div>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                      <div className="text-[10px] font-mono text-slate-400">AI MOCK SCORE</div>
                      <div className="text-xs font-mono font-bold text-cyan-400 mt-0.5">
                        {prog?.bestAiScore ? prog.bestAiScore.toFixed(2) : '9.30'}
                      </div>
                    </div>

                    <div
                      className={`p-2 rounded-lg border ${
                        hasPressureGap
                          ? 'bg-red-500/15 border-red-500/40'
                          : 'bg-emerald-500/10 border-emerald-500/30'
                      }`}
                    >
                      <div className="text-[10px] font-mono text-slate-300">LAST MEET ACTUAL</div>
                      <div
                        className={`text-xs font-mono font-bold mt-0.5 ${
                          hasPressureGap ? 'text-red-300' : 'text-emerald-300'
                        }`}
                      >
                        {latestBreakdown
                          ? `-${latestBreakdown.deductionTaken.toFixed(2)} Ded.`
                          : prog?.lastCompDeduction
                          ? `-${prog.lastCompDeduction.toFixed(2)} Ded.`
                          : 'Hit Clean (0.00)'}
                      </div>
                    </div>
                  </div>

                  {/* Pressure Gap Alert Callout */}
                  {hasPressureGap && (
                    <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-[11px] text-red-200 flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-red-300">
                          ⚠️ Practice vs. Meet Pressure Gap:{' '}
                        </strong>
                        Marked as <em>Stage 4 (Mastered)</em> in practice, but judge took{' '}
                        <strong>
                          -{(latestBreakdown?.deductionTaken || prog?.lastCompDeduction || 0.25).toFixed(2)}
                        </strong>{' '}
                        in competition ({latestBreakdown?.judgeShorthandNote || prog?.lastCompJudgeNote}).
                        Schedule 1-touch cold-routine pressure sets!
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 6 Cols: Logged Competition Actuals & Judge Critique History [ACT-103] */}
        <div className="lg:col-span-6 relative p-5 rounded-2xl bg-[#0B1120] border border-slate-800 space-y-4">
          {showDevIds && (
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-fuchsia-500/20 border border-fuchsia-400 text-fuchsia-200 font-mono text-[10px] font-bold">
              [ACT-103: Official Meet Scorecards & Judge Critique Log]
            </span>
          )}

          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                Sanctioned Meet History
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">
                Logged Judge Critiques & Competition Scores ({athleteMeetRecords.length})
              </h2>
            </div>
          </div>

          <div className="space-y-4">
            {athleteMeetRecords.map((rec) => {
              const appObj = apparatusList.find((a) => a.id === rec.apparatusId);
              const scoreDelta = Number((rec.actualScore - rec.aiPredictedScore).toFixed(2));

              return (
                <div
                  key={rec.id}
                  className="p-4 rounded-2xl bg-slate-900/85 border border-slate-800 space-y-3.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold">
                          {appObj?.name} ({appObj?.code})
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{rec.meetDate}</span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1">{rec.meetName}</h3>
                      <div className="text-[11px] text-slate-400">{rec.judgeNameOrPanel}</div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
                        <div className="text-[9px] font-mono text-slate-400">AI MOCK</div>
                        <div className="text-base font-mono font-bold text-cyan-400">
                          {rec.aiPredictedScore.toFixed(2)}
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-center">
                        <div className="text-[9px] font-mono text-amber-300 font-bold">
                          ACTUAL MEET
                        </div>
                        <div className="text-xl font-mono font-black text-white">
                          {rec.actualScore.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                    <strong className="text-amber-400">Judge’s Critique Sheet Note: </strong>
                    {rec.judgeGeneralNotes}
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                      Skill-by-Skill Judge Deductions (Delta vs AI: {scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta})
                    </div>
                    {rec.skillBreakdowns.map((b) => (
                      <div
                        key={b.skillId}
                        className="px-3 py-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <span className="font-mono text-cyan-400 font-bold mr-1.5">
                            {b.usagCode}
                          </span>
                          <span className="font-semibold text-white">{b.skillName}</span>
                          <div className="text-[11px] text-slate-400">{b.judgeShorthandNote}</div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-bold text-xs shrink-0 ${
                            b.deductionTaken >= 0.25
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : b.deductionTaken > 0
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {b.deductionTaken === 0 ? 'HIT 0.00' : `-${b.deductionTaken.toFixed(2)}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal 1: Printable Per-Athlete Tear-Off Judge Routine Cards (Single or Squad Batch) */}
      {showPrintJudgeSheetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white text-slate-900 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 my-auto max-h-[92vh] overflow-y-auto">
            {/* Top Print Controls (Hidden when printing) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-300 print:hidden">
              <div className="flex items-center gap-2">
                <Scissors className="w-5 h-5 text-slate-700" />
                <span className="text-sm font-black text-slate-900">
                  {printBatchAllSquad
                    ? `Batch Squad Tear-Off Judge Cards (${squadAthletes.length} Athletes · ${currentApparatus?.name})`
                    : `Single Athlete Tear-Off Judge Card (${athlete.name} · ${currentApparatus?.name})`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPrintBatchAllSquad(!printBatchAllSquad)}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold"
                >
                  {printBatchAllSquad ? 'Switch to Single Card' : 'Switch to Full Squad Stack'}
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  Print Tear-Off Sheet(s)
                </button>
                <button
                  onClick={() => setShowPrintJudgeSheetModal(false)}
                  className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Render Tear-Off Card(s) */}
            {(printBatchAllSquad ? squadAthletes : [athlete]).map((cardAth, cardIdx) => {
              const rInfo = getEffectiveRoutineSkillsForAthlete(
                cardAth,
                currentApparatus?.id
              );
              const allBonusForEvent = compulsoryBonusSkills;

              return (
                <div
                  key={cardAth.id}
                  className="border-2 border-slate-900 rounded-xl p-5 space-y-4 bg-white relative break-inside-avoid"
                >
                  {/* Perforated Tear-Off Cut Line */}
                  {cardIdx > 0 && (
                    <div className="border-t-2 border-dashed border-slate-400 -mt-8 mb-4 pt-2 text-center text-[10px] font-mono text-slate-500">
                      ✂ — — — — — TEAR ALONG PERFORATION FOR JUDGE PANEL — — — — — ✂
                    </div>
                  )}

                  {/* Card Header */}
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b-2 border-slate-900 pb-3">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 font-bold">
                        {facilityConfig.facilityName.toUpperCase()} · USAG JUDGE TEAR-OFF ROUTINE CARD
                      </div>
                      <h3 className="text-xl font-black text-slate-950 mt-0.5">
                        {cardAth.name} — {currentApparatus?.name} ({currentApparatus?.code})
                      </h3>
                      <div className="text-xs text-slate-700 font-medium">
                        Program: <strong>{cardAth.disciplineId} {cardAth.level}</strong> · Mode:{' '}
                        <strong className="uppercase">{rInfo.mode}</strong> · Rotation Group:{' '}
                        <strong>Group {cardAth.rotationGroup}</strong>
                      </div>
                    </div>

                    <div className="text-right border-2 border-slate-900 rounded-lg px-3 py-1.5 bg-slate-50">
                      <div className="text-[9px] font-mono uppercase text-slate-600 font-bold">
                        TARGET START VALUE + BONUS
                      </div>
                      <div className="text-lg font-black font-mono text-slate-950">
                        10.00{' '}
                        {rInfo.totalBonusPotential > 0
                          ? `(+${rInfo.totalBonusPotential.toFixed(2)} Bonus)`
                          : 'SV'}
                      </div>
                    </div>
                  </div>

                  {/* Compulsory Bonus Election Banner for the Judge */}
                  {rInfo.mode === 'compulsory' && allBonusForEvent.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-400 text-xs">
                      <div className="font-mono font-bold text-[10px] uppercase text-amber-900 mb-1">
                        ★ ATHLETE BONUS SKILL DECLARATION (FOR JUDGE PANEL):
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {allBonusForEvent.map((bSk) => {
                          const attempting = rInfo.optedBonusSkills.some((x) => x.id === bSk.id);
                          return (
                            <div
                              key={bSk.id}
                              className="flex items-center justify-between px-2.5 py-1.5 rounded bg-white border border-slate-300"
                            >
                              <div>
                                <span className="font-bold text-slate-900">{bSk.name}</span>
                                <span className="text-[10px] font-mono text-slate-600 ml-1">
                                  (+{(bSk.bonusPoints || 0.15).toFixed(2)})
                                </span>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded font-mono text-[10px] font-black ${
                                  attempting
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {attempting ? '[✓] ATTEMPTING BONUS' : '[ ] STANDARD ONLY'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Planned Routine Elements Table */}
                  <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-mono uppercase text-slate-700">
                        <th className="py-2 px-2.5"># / Code</th>
                        <th className="py-2 px-2.5">Routine Element & Bonus Election</th>
                        <th className="py-2 px-2.5">Value / SR</th>
                        <th className="py-2 px-2.5 w-24">Credit</th>
                        <th className="py-2 px-2.5 w-28">Deduction</th>
                        <th className="py-2 px-2.5 w-40">Judge Shorthand</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {rInfo.routineSkills.map((sk, i) => {
                        const bonusUpgrade = rInfo.optedBonusSkills.find(
                          (b) => b.replacesSkillId === sk.id
                        );
                        return (
                          <tr key={sk.id}>
                            <td className="py-2 px-2.5 font-mono font-bold text-slate-900">
                              {i + 1}. {bonusUpgrade ? bonusUpgrade.usagCode : sk.usagCode}
                            </td>
                            <td className="py-2 px-2.5">
                              <div className="font-bold text-slate-900">
                                {bonusUpgrade ? bonusUpgrade.name : sk.name}
                              </div>
                              {bonusUpgrade && (
                                <div className="text-[10px] font-mono font-bold text-amber-800">
                                  ★ Upgrading standard {sk.name} (+
                                  {(bonusUpgrade.bonusPoints || 0.15).toFixed(2)} Bonus)
                                </div>
                              )}
                            </td>
                            <td className="py-2 px-2.5 font-mono text-[10px] text-slate-700">
                              {sk.specialRequirementTag || sk.valuePart}
                            </td>
                            <td className="py-2 px-2.5 font-mono text-[10px] text-slate-500">
                              [ &nbsp; ] Hit &nbsp; [ &nbsp; ] Bonus
                            </td>
                            <td className="py-2 px-2.5 font-mono text-[10px] text-slate-400">
                              -0.___
                            </td>
                            <td className="py-2 px-2.5">
                              <div className="h-5 border-b border-slate-400" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Bottom Judge Sign-Off Strip */}
                  <div className="grid grid-cols-4 gap-2 pt-1 text-center text-xs">
                    <div className="p-2 border border-slate-300 rounded">
                      <span className="text-[9px] font-mono text-slate-500 block">BASE SV</span>
                      <strong className="font-mono">10.00</strong>
                    </div>
                    <div className="p-2 border border-slate-300 rounded">
                      <span className="text-[9px] font-mono text-slate-500 block">
                        BONUS AWARDED
                      </span>
                      <strong className="font-mono text-slate-400">+0.___</strong>
                    </div>
                    <div className="p-2 border border-slate-300 rounded">
                      <span className="text-[9px] font-mono text-slate-500 block">
                        EXEC DEDUCTIONS
                      </span>
                      <strong className="font-mono text-slate-400">-___.___</strong>
                    </div>
                    <div className="p-2 border-2 border-slate-900 rounded bg-slate-50">
                      <span className="text-[9px] font-mono text-slate-900 font-bold block">
                        FINAL SCORE
                      </span>
                      <strong className="font-mono text-slate-400">____.___</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal 2: Log Real Meet Score & Judge Notes */}
      {showLogMeetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveNewMeetActual}
            className="w-full max-w-2xl bg-[#0B1120] border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4 my-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                  Post-Meet Feedback Loop
                </span>
                <h2 className="text-lg font-bold text-white">
                  Log Official Meet Score & Judge Notes for {athlete.name} ({currentApparatus?.shortName})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowLogMeetModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-400 mb-1">
                  Meet / Competition Name
                </label>
                <input
                  type="text"
                  value={meetName}
                  onChange={(e) => setMeetName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Meet Date</label>
                <input
                  type="date"
                  value={meetDate}
                  onChange={(e) => setMeetDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              <div className="text-xs font-mono uppercase text-cyan-400 font-bold">
                Enter Judge Deductions & Bonus Credit Per Routine Skill:
              </div>
              {combinedLoggableSkills.map((sk) => {
                const entry = skillDeductions[sk.id] || { deduction: 0, note: '' };
                const pStage = athlete.skillProgress[sk.id]?.stage ?? 1;
                return (
                  <div
                    key={sk.id}
                    className={`p-3 rounded-xl border grid grid-cols-1 sm:grid-cols-12 gap-2 items-center ${
                      sk.isBonusOption
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="sm:col-span-5">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        {sk.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {sk.usagCode} · Practice Stage {pStage}
                      </div>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] text-slate-400">Deduction Taken</label>
                      <select
                        value={entry.deduction}
                        onChange={(e) =>
                          setSkillDeductions((prev) => ({
                            ...prev,
                            [sk.id]: { ...entry, deduction: Number(e.target.value) },
                          }))
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-amber-300 font-bold"
                      >
                        <option value={0}>0.00 (Hit Clean)</option>
                        <option value={0.05}>-0.05 (Minor form)</option>
                        <option value={0.1}>-0.10 (Small error)</option>
                        <option value={0.15}>-0.15 (Medium error)</option>
                        <option value={0.2}>-0.20 (Large error)</option>
                        <option value={0.3}>-0.30 (Major break)</option>
                        <option value={0.5}>-0.50 (Fall)</option>
                      </select>
                    </div>
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] text-slate-400">Judge Note / Symbol</label>
                      <input
                        type="text"
                        value={entry.note}
                        onChange={(e) =>
                          setSkillDeductions((prev) => ({
                            ...prev,
                            [sk.id]: { ...entry, note: e.target.value },
                          }))
                        }
                        placeholder="e.g. Hit bonus / shy of horiz"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Overall Judge Panel Comments
              </label>
              <textarea
                rows={2}
                value={judgeGeneralNotes}
                onChange={(e) => setJudgeGeneralNotes(e.target.value)}
                placeholder="General artistry, rhythm, or warmup pressure notes from the judge..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowLogMeetModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs"
              >
                Save Meet Actuals & Flag Pressure Skills
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
