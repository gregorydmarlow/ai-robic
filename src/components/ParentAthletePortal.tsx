import React, { useState } from 'react';
import {
  AIJudgeSession,
  Apparatus,
  Athlete,
  CorrectiveDrill,
  Skill,
} from '../types';
import { STAGE_DEFINITIONS } from '../mockData';
import {
  Activity,
  Award,
  CheckCircle2,
  Cpu,
  Dumbbell,
  Flame,
  FileCheck2,
  PlayCircle,
  Printer,
  Ruler,
  ShieldCheck,
  Sparkles,
  Trophy,
  Video,
} from 'lucide-react';

interface ParentAthletePortalProps {
  athletes: Athlete[];
  selectedAthleteId: string;
  onSelectAthlete: (athleteId: string) => void;
  apparatusList: Apparatus[];
  skills: Skill[];
  drills: CorrectiveDrill[];
  aiSessions: AIJudgeSession[];
  onToggleHomeDrillCompletion: (athleteId: string, prescriptionId: string) => void;
  onOpenAIJudgeReplay: (sessionId: string, skillId?: string) => void;
}

export const ParentAthletePortal: React.FC<ParentAthletePortalProps> = ({
  athletes,
  selectedAthleteId,
  onSelectAthlete,
  apparatusList,
  skills,
  drills,
  aiSessions,
  onToggleHomeDrillCompletion,
  onOpenAIJudgeReplay,
}) => {
  const athlete = athletes.find((a) => a.id === selectedAthleteId) || athletes[0];
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('ALL');
  const [showReportCardModal, setShowReportCardModal] = useState<boolean>(false);

  const athleteApparatus = apparatusList.filter(
    (app) => app.disciplineId === athlete.disciplineId
  );

  const athleteSkills = skills.filter(
    (sk) =>
      sk.disciplineId === athlete.disciplineId &&
      (selectedEventFilter === 'ALL' || sk.apparatusId === selectedEventFilter)
  );

  const athleteAiSessions = aiSessions.filter((s) => s.athleteId === athlete.id);

  // Calculate overall level mastery percentage
  const allDisciplineSkills = skills.filter((sk) => sk.disciplineId === athlete.disciplineId);
  const totalPossibleStagePoints = allDisciplineSkills.length * 4;
  const earnedStagePoints = allDisciplineSkills.reduce((acc, sk) => {
    const st = athlete.skillProgress[sk.id]?.stage ?? 0;
    return acc + st;
  }, 0);
  const overallMasteryPct =
    totalPossibleStagePoints > 0
      ? Math.round((earnedStagePoints / totalPossibleStagePoints) * 100)
      : 0;

  const masteredCount = allDisciplineSkills.filter(
    (sk) => (athlete.skillProgress[sk.id]?.stage ?? 0) === 4
  ).length;

  const todayIso = '2026-11-18';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Athlete Switcher & Hero Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0F172A] to-indigo-950/80 border border-slate-800 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${athlete.avatarGradient} flex items-center justify-center text-2xl font-black text-white shadow-lg`}
            >
              {athlete.avatarInitials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                  Parent & Athlete Transparency Portal
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
                  {athlete.disciplineId} · {athlete.level}
                </span>
              </div>
              <h1 className="text-2xl font-black text-white mt-1 flex items-center gap-3">
                {athlete.name}
                <span className="text-xs font-normal text-slate-400">
                  (Parent: {athlete.parentName})
                </span>
              </h1>
              <p className="text-xs text-cyan-200/90 mt-1 max-w-3xl">{athlete.archetypeSummary}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                Preview Athlete Portal For:
              </label>
              <select
                aria-label="Preview Athlete Portal"
                value={athlete.id}
                onChange={(e) => onSelectAthlete(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
              >
                {athletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.disciplineId} {a.level})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowReportCardModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition mt-4 sm:mt-0"
            >
              <FileCheck2 className="w-4 h-4" />
              Official Level-Up Report Card
            </button>
          </div>
        </div>

        {/* 4 Key KPI Cards for Parents */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{athlete.level} Progression</span>
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {overallMasteryPct}% Ready
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full"
                style={{ width: `${overallMasteryPct}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 mt-1.5">
              {masteredCount} of {allDisciplineSkills.length} Skills Competition-Ready
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Latest AI Mock Meet Score</span>
              <Cpu className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              {athleteAiSessions[0]?.finalScore.toFixed(2) || '9.35'}{' '}
              <span className="text-xs font-normal text-slate-400">/ 10.0 SV</span>
            </div>
            <div className="text-[11px] text-cyan-300 mt-1.5">
              +0.40 pts recoverable via Home Plan
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Home Conditioning Streak</span>
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl font-black font-mono text-amber-400 mt-1">
              {athlete.homeStreakDays} Days 🔥
            </div>
            <div className="text-[11px] text-slate-400 mt-1.5">
              {athlete.prescriptions.length} Bespoke Drills Active
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Biomechanical Vitals Snapshot</span>
              <Ruler className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-sm font-bold font-mono text-white mt-1.5">
              Torso:Leg {athlete.vitals.torsoToLegRatio} · Reach +{athlete.vitals.apeIndexCm}cm
            </div>
            <div className="text-[11px] text-indigo-300 mt-1.5">
              Shoulder {athlete.vitals.shoulderFlexionDeg}° · Split {athlete.vitals.hipSplitLeftDeg}° · Ankle {athlete.vitals.ankleDorsiflexionDeg}°
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Portal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Bespoke Home Training Plan + AI Digital Judge Scorecards */}
        <div className="lg:col-span-5 space-y-6">
          {/* Bespoke Home Training Plan Card */}
          <div className="p-5 rounded-2xl bg-[#0B1120] border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  Tailored to {athlete.name}’s Vitals & Skill Goals
                </span>
                <h2 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                  <Dumbbell className="w-4 h-4 text-emerald-400" />
                  My Bespoke Home Training Plan
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-mono font-bold">
                {athlete.homeStreakDays}d Streak
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Every exercise below is matched to {athlete.name}’s body measurements and current
              apparatus blockers so you know *exactly* how to support progress at home.
            </p>

            <div className="space-y-3.5">
              {athlete.prescriptions.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
                  No active home prescriptions yet. Coaches or the AI Judge can assign drills in 1
                  tap.
                </div>
              ) : (
                athlete.prescriptions.map((presc) => {
                  const drill = drills.find((d) => d.id === presc.drillId);
                  const targetSkill = skills.find((s) => s.id === presc.skillId);
                  const doneToday = presc.completedDates.includes(todayIso);
                  if (!drill) return null;

                  return (
                    <div
                      key={presc.id}
                      className={`p-4 rounded-xl border transition ${
                        doneToday
                          ? 'bg-emerald-950/25 border-emerald-500/50'
                          : 'bg-slate-900/80 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 text-[10px] font-mono font-bold">
                              Unlocks: {targetSkill?.name || 'Apparatus Progression'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              by {presc.assignedBy}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-white mt-1">{drill.title}</h3>
                          <div className="text-xs font-mono text-emerald-400 font-semibold mt-0.5">
                            {drill.setsReps} · {drill.frequency}
                          </div>
                        </div>

                        <button
                          onClick={() => onToggleHomeDrillCompletion(athlete.id, presc.id)}
                          className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                            doneToday
                              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {doneToday ? 'Done Today!' : 'Log Home Set'}
                        </button>
                      </div>

                      {/* Why this was prescribed for this athlete's vitals */}
                      <div className="mt-2.5 p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-200 leading-relaxed">
                        <strong className="text-cyan-300">Why {athlete.name} needs this: </strong>
                        {presc.vitalsReason}
                      </div>

                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                        <strong>How to perform: </strong>
                        {drill.description}
                      </p>

                      <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-200">
                        <strong>Parent Form Check: </strong>
                        {drill.parentSafetyTip}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* AI Digital Judge Meet Scorecards */}
          <div className="p-5 rounded-2xl bg-[#0B1120] border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  Objective Pre-Meet Routine & Skill Grading
                </span>
                <h2 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  AI Digital Judge Video Evaluations
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              {athleteAiSessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold uppercase">
                        {sess.mode === 'mock_meet_routine' ? 'Full Routine Mock Meet' : 'Single Skill Form Check'}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1">{sess.title}</h3>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Evaluated {sess.recordedAt} · Start Value {sess.startValue.toFixed(2)} · Deductions -{sess.totalDeductions.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black font-mono text-emerald-400">
                        {sess.finalScore.toFixed(2)}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">FINAL SCORE</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                    {sess.coachSummaryNote}
                  </p>

                  <button
                    onClick={() => onOpenAIJudgeReplay(sess.id, sess.skillId)}
                    className="mt-3 w-full py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 transition"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Watch Timestamped AI Pose Replay & Deductions
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Transparent Interactive Skill Tree by Apparatus */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0B1120] border border-slate-800 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
                  Zero Black Box — Real-Time Stage & Blocker Visibility
                </span>
                <h2 className="text-base font-bold text-white mt-0.5">
                  {athlete.level} Skill Progression & Coach Transparency Feed
                </h2>
              </div>

              {/* Event Filter Pills */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedEventFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    selectedEventFilter === 'ALL'
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  All Events
                </button>
                {athleteApparatus.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => setSelectedEventFilter(app.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      selectedEventFilter === app.id
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {app.shortName}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3.5">
              {athleteSkills.map((sk) => {
                const prog = athlete.skillProgress[sk.id];
                const currentStage = prog?.stage ?? 1;
                const stageDef =
                  STAGE_DEFINITIONS.find((s) => s.stage === currentStage) || STAGE_DEFINITIONS[1];
                const appObj = apparatusList.find((a) => a.id === sk.apparatusId);

                return (
                  <div
                    key={sk.id}
                    className="p-4 rounded-xl bg-slate-900/75 border border-slate-800/90 space-y-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[10px] font-bold">
                            {appObj?.shortName} · {sk.usagCode}
                          </span>
                          <span className="text-[11px] text-slate-400">{sk.valuePart}</span>
                        </div>
                        <h3 className="text-sm font-bold text-white mt-1">{sk.name}</h3>
                      </div>

                      <div className="flex items-center gap-2">
                        {prog?.bestAiScore && (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 font-bold">
                            AI Score: {prog.bestAiScore.toFixed(2)}
                          </span>
                        )}
                        <span
                          className={`px-3 py-1 rounded-lg border text-xs font-bold ${stageDef.bgClass} ${stageDef.borderClass} ${stageDef.colorClass}`}
                        >
                          {stageDef.label}
                        </span>
                      </div>
                    </div>

                    {/* Visual 5-Step Mastery Stepper */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      {[1, 2, 3, 4].map((step) => {
                        const reached = currentStage >= step;
                        const label =
                          step === 1
                            ? '1. Introduced'
                            : step === 2
                            ? '2. Assisted / Drills'
                            : step === 3
                            ? '3. Solo on Event'
                            : '4. Meet Ready!';
                        return (
                          <div key={step} className="space-y-1">
                            <div
                              className={`h-2 rounded-full ${
                                reached
                                  ? step === 4
                                    ? 'bg-emerald-400'
                                    : 'bg-cyan-400'
                                  : 'bg-slate-800'
                              }`}
                            />
                            <div
                              className={`text-[10px] font-mono ${
                                reached ? 'text-slate-200 font-semibold' : 'text-slate-500'
                              }`}
                            >
                              {label}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Coach Transparency Note */}
                    {prog?.coachNote && (
                      <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800/90 text-xs text-slate-200 leading-relaxed">
                        <span className="text-cyan-400 font-bold">Coach Note ({prog.lastUpdated}): </span>
                        {prog.coachNote}
                      </div>
                    )}

                    {/* Active Blockers & Assigned Drills */}
                    {(prog?.activeFaultTags?.length > 0 || prog?.assignedDrillIds?.length > 0) && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {prog.activeFaultTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px]"
                          >
                            Focus: {tag}
                          </span>
                        ))}
                        {prog.assignedDrillIds.map((dId) => {
                          const dObj = drills.find((d) => d.id === dId);
                          return dObj ? (
                            <span
                              key={dId}
                              className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px]"
                            >
                              Home Fix: {dObj.title}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Official Printable Level-Up Report Card Modal */}
      {showReportCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0B1120] border-2 border-amber-400/60 rounded-2xl p-6 shadow-2xl space-y-5 my-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold">
                    AI-ROBIC Official USAG Progress & Biomechanics Sign-Off
                  </span>
                  <h2 className="text-xl font-black text-white">
                    {athlete.name} — {athlete.level} Evaluation Report Card
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setShowReportCardModal(false)}
                className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-center">
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase">Overall Readiness</div>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                  {overallMasteryPct}%
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase">AI Mock Meet Avg</div>
                <div className="text-2xl font-black text-cyan-400 font-mono mt-0.5">9.48</div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase">Home Plan Streak</div>
                <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">
                  {athlete.homeStreakDays} Days
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase text-slate-300 font-bold">
                Biomechanical Summary & Next-Level Sign-Off Notes
              </h3>
              <p className="text-xs text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
                {athlete.name} has mastered {masteredCount} of {allDisciplineSkills.length} required{' '}
                {athlete.level} skills. Based on her anthropometric profile ({athlete.vitals.heightCm}cm,{' '}
                {athlete.vitals.torsoToLegRatio} Torso:Leg ratio), completing her daily{' '}
                {athlete.prescriptions.length} bespoke home exercises will unlock full Stage 4
                sign-off ahead of next month’s Sanctioned Invitational.
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Signed: <strong>Head Coach Elena Vance, USAG Certified</strong>
              </div>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
              >
                <Printer className="w-4 h-4" />
                Print / Export PDF Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
