import React, { useState } from 'react';
import {
  Apparatus,
  Athlete,
  DisciplineId,
  Skill,
  USAGEncyclopediaSkillEntry,
  UserPersonaRole,
} from '../types';
import {
  AlertTriangle,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Dumbbell,
  Film,
  Layers,
  PlayCircle,
  PlusCircle,
  Search,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';

interface USAGSkillEncyclopediaViewProps {
  encyclopediaEntries: USAGEncyclopediaSkillEntry[];
  apparatusList: Apparatus[];
  athletes: Athlete[];
  selectedAthleteId: string;
  onSelectAthlete: (id: string) => void;
  viewerRole: UserPersonaRole;
  showDevIds: boolean;
  onAddEncyclopediaSkillToAthleteRoutine: (
    athleteId: string,
    entry: USAGEncyclopediaSkillEntry
  ) => void;
  onAddNewEncyclopediaEntry: (newEntry: USAGEncyclopediaSkillEntry) => void;
}

const DIFFICULTY_BADGE_COLORS: Record<string, string> = {
  Compulsory: 'bg-sky-500/20 border-sky-500/40 text-sky-300',
  A: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
  B: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
  C: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300',
  D: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
  E: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
};

export const USAGSkillEncyclopediaView: React.FC<USAGSkillEncyclopediaViewProps> = ({
  encyclopediaEntries,
  apparatusList,
  athletes,
  selectedAthleteId,
  onSelectAthlete,
  viewerRole,
  showDevIds,
  onAddEncyclopediaSkillToAthleteRoutine,
  onAddNewEncyclopediaEntry,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [disciplineFilter, setDisciplineFilter] = useState<DisciplineId | 'ALL'>('ALL');
  const [apparatusFilter, setApparatusFilter] = useState<string>('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');
  const [selectedEntryId, setSelectedEntryId] = useState<string>(
    encyclopediaEntries[1]?.id || encyclopediaEntries[0]?.id || ''
  );
  const [activeKeyframeIndex, setActiveKeyframeIndex] = useState<number>(0);
  const [toast, setToast] = useState<string | null>(null);
  const [showAddCustomEntryModal, setShowAddCustomEntryModal] = useState<boolean>(false);

  // Form state for adding a new skill to the USAG Encyclopedia DB
  const [newCode, setNewCode] = useState('UB-4.505');
  const [newName, setNewName] = useState('');
  const [newDiscipline, setNewDiscipline] = useState<DisciplineId>('WAG');
  const [newApparatusId, setNewApparatusId] = useState('wag-ub');
  const [newDifficulty, setNewDifficulty] = useState<'Compulsory' | 'A' | 'B' | 'C' | 'D' | 'E'>('C');
  const [newLevelRange, setNewLevelRange] = useState('Levels 8–10 (Optional)');
  const [newTip, setNewTip] = useState('');
  const [newFault, setNewFault] = useState('');
  const [newVitalsNote, setNewVitalsNote] = useState('');

  const filteredEntries = encyclopediaEntries.filter((entry) => {
    if (disciplineFilter !== 'ALL' && entry.disciplineId !== disciplineFilter) return false;
    if (apparatusFilter !== 'ALL' && entry.apparatusId !== apparatusFilter) return false;
    if (difficultyFilter !== 'ALL' && entry.difficultyValue !== difficultyFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = entry.skillName.toLowerCase().includes(q);
      const matchCode = entry.usagCode.toLowerCase().includes(q);
      const matchAlias = entry.aliases.some((a) => a.toLowerCase().includes(q));
      const matchGroup = entry.elementGroup.toLowerCase().includes(q);
      return matchName || matchCode || matchAlias || matchGroup;
    }
    return true;
  });

  const activeEntry =
    filteredEntries.find((e) => e.id === selectedEntryId) ||
    encyclopediaEntries.find((e) => e.id === selectedEntryId) ||
    filteredEntries[0] ||
    encyclopediaEntries[0];

  const activeAthlete = athletes.find((a) => a.id === selectedAthleteId) || athletes[0];

  const handleAssignToAthlete = () => {
    if (!activeEntry || !activeAthlete) return;
    onAddEncyclopediaSkillToAthleteRoutine(activeAthlete.id, activeEntry);
    setToast(
      `Added "${activeEntry.skillName}" (${activeEntry.usagCode}) to ${activeAthlete.name}’s Advanced Skill Tree & Optional Routine Builder!`
    );
    setTimeout(() => setToast(null), 4000);
  };

  const handleCreateCustomEncyclopediaEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const entry: USAGEncyclopediaSkillEntry = {
      id: `enc-custom-${Date.now()}`,
      disciplineId: newDiscipline,
      apparatusId: newApparatusId,
      usagCode: newCode.trim() || 'USAG-9.99',
      skillName: newName.trim(),
      aliases: [newName.trim()],
      levelRange: newLevelRange,
      difficultyValue: newDifficulty,
      elementGroup: 'Custom USAG Code Manual Entry',
      specialRequirementCredit: 'Satisfies Optional Value Part & Special Requirement',
      referenceVideoUrl: 'https://skillprogression.com/media/custom-skill-ref.mp4',
      videoKeyframeCues: [
        '0:00.5 Entry & hurdle / tap initiation',
        '0:01.2 Peak amplitude & joint extension benchmark',
        '0:02.0 Controlled finish or landing absorption',
      ],
      trainingTips: [
        newTip.trim() || 'Maintain hollow body tension and full shoulder extension through takeoff.',
      ],
      commonMistakesAndDeductions: [
        {
          fault: newFault.trim() || 'Insufficient amplitude or slight knee bend in flight',
          deduction: '-0.10 to -0.20',
          fix: 'Hollow body rockers + targeted joint mobility progression',
        },
      ],
      biomechanicalVitalsNotes:
        newVitalsNote.trim() ||
        'Calibrate takeoff angle and block timing to athlete Torso:Leg ratio and Overhead Shoulder ROM.',
      prerequisiteSkillNames: ['Foundational Apparatus Progression'],
      progressionNextSkillNames: ['Elite Combination Series'],
    };

    onAddNewEncyclopediaEntry(entry);
    setSelectedEntryId(entry.id);
    setShowAddCustomEntryModal(false);
    setNewName('');
    setToast(`Saved "${entry.skillName}" to the USAG Manual Encyclopedia Database!`);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="space-y-6 pb-14">
      {/* Top Hero & Search Filter Bar [ENC-101] */}
      <div className="relative p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0F172A] to-indigo-950/80 border border-slate-800 shadow-xl space-y-4">
        {showDevIds && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-fuchsia-500/20 border border-fuchsia-400 text-fuchsia-200 font-mono text-[10px] font-bold">
            [ENC-101: USAG Skill Encyclopedia Search & Filter Header]
          </span>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold uppercase">
              USAG Code of Points Encyclopedia & Advanced Skill Builder
            </span>
            <h1 className="text-2xl font-black text-white mt-1 flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-cyan-400" />
              USAG Skill Manual, Reference Videos, Coaching Tips & Deduction Guide
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Explore compulsory and optional `A` through `E` elements across WAG & MAG. Inspect
              reference video keyframes, training cues, common judge deductions, and biomechanical
              vitals correlations—or 1-tap add any skill to an advanced athlete’s routine.
            </p>
          </div>

          {(viewerRole === 'owner' || viewerRole === 'coach') && (
            <button
              onClick={() => setShowAddCustomEntryModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition"
            >
              <PlusCircle className="w-4 h-4" />
              + Add Skill to USAG Manual DB
            </button>
          )}
        </div>

        {/* Interactive Search & Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-slate-800/80">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by skill name, USAG code (e.g. UB-3.401, Yurchenko, Pak, Cross)..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Discipline Filter */}
          <div className="md:col-span-2">
            <select
              aria-label="Filter by Discipline"
              value={disciplineFilter}
              onChange={(e) => {
                setDisciplineFilter(e.target.value as DisciplineId | 'ALL');
                setApparatusFilter('ALL');
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
            >
              <option value="ALL">All Programs (WAG/MAG)</option>
              <option value="WAG">Women’s Artistic (WAG)</option>
              <option value="MAG">Men’s Artistic (MAG)</option>
            </select>
          </div>

          {/* Apparatus Filter */}
          <div className="md:col-span-3">
            <select
              aria-label="Filter by Apparatus"
              value={apparatusFilter}
              onChange={(e) => setApparatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
            >
              <option value="ALL">All Apparatus / Events</option>
              {apparatusList
                .filter((a) => disciplineFilter === 'ALL' || a.disciplineId === disciplineFilter)
                .map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.disciplineId} · {app.name} ({app.code})
                  </option>
                ))}
            </select>
          </div>

          {/* Difficulty Value Part Filter */}
          <div className="md:col-span-2">
            <select
              aria-label="Filter by Difficulty Value"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-cyan-300"
            >
              <option value="ALL">All Difficulties (A–E)</option>
              <option value="Compulsory">Compulsory (L1–L5)</option>
              <option value="A">A Value Part</option>
              <option value="B">B Value Part</option>
              <option value="C">C Value Part</option>
              <option value="D">D Value Part (Bonus)</option>
              <option value="E">E Value Part (Elite)</option>
            </select>
          </div>
        </div>
      </div>

      {toast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toast}
        </div>
      )}

      {/* Main Master-Detail Encyclopedia Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Columns: Scrollable USAG Skill Directory [ENC-102] */}
        <div className="lg:col-span-5 relative p-4 rounded-2xl bg-[#0B1120] border border-slate-800 space-y-3">
          {showDevIds && (
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-fuchsia-500/20 border border-fuchsia-400 text-fuchsia-200 font-mono text-[10px] font-bold">
              [ENC-102: USAG Manual Skill Catalog List]
            </span>
          )}

          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">
              Matching USAG Elements ({filteredEntries.length})
            </span>
            <span className="text-[11px] text-cyan-400 font-mono">
              Supabase: ai_robic.usag_skill_encyclopedia
            </span>
          </div>

          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
            {filteredEntries.map((entry) => {
              const isSelected = activeEntry?.id === entry.id;
              const appObj = apparatusList.find((a) => a.id === entry.apparatusId);
              const diffStyle =
                DIFFICULTY_BADGE_COLORS[entry.difficultyValue] ||
                DIFFICULTY_BADGE_COLORS.Compulsory;

              return (
                <div
                  key={entry.id}
                  onClick={() => {
                    setSelectedEntryId(entry.id);
                    setActiveKeyframeIndex(0);
                  }}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-400 ring-1 ring-cyan-400/50 shadow-lg'
                      : 'bg-slate-900/55 border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-[10px] font-bold">
                        {entry.usagCode}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold">
                        {entry.disciplineId} · {appObj?.shortName}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded border text-[10px] font-mono font-black shrink-0 ${diffStyle}`}
                    >
                      {entry.difficultyValue === 'Compulsory'
                        ? 'COMPULSORY'
                        : `DIFF: ${entry.difficultyValue}`}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-1.5">{entry.skillName}</h3>
                  <div className="text-[11px] text-slate-400 mt-0.5">{entry.levelRange}</div>
                  <div className="text-[11px] text-indigo-300 font-mono mt-1">
                    {entry.specialRequirementCredit}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 7 Columns: Deep Encyclopedia Inspector & Advanced Athlete Skill Builder [ENC-103] */}
        {activeEntry && (
          <div className="lg:col-span-7 relative p-6 rounded-2xl bg-[#0B1120] border border-slate-800 space-y-6">
            {showDevIds && (
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-fuchsia-500/20 border border-fuchsia-400 text-fuchsia-200 font-mono text-[10px] font-bold">
                [ENC-103: Skill Encyclopedia Deep Inspector & Athlete Assigner]
              </span>
            )}

            {/* Top Skill Title & Add to Advanced Athlete Routine Bar */}
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold">
                    {activeEntry.usagCode}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded border text-xs font-mono font-bold ${
                      DIFFICULTY_BADGE_COLORS[activeEntry.difficultyValue] || ''
                    }`}
                  >
                    Value Part: {activeEntry.difficultyValue}
                  </span>
                  <span className="text-xs text-slate-400">{activeEntry.elementGroup}</span>
                </div>
                <h2 className="text-xl font-black text-white mt-1.5">{activeEntry.skillName}</h2>
                <p className="text-xs text-indigo-300 font-medium mt-0.5">
                  {activeEntry.specialRequirementCredit} · {activeEntry.levelRange}
                </p>
              </div>

              {/* Advanced Skill Builder Action Box */}
              {(viewerRole === 'owner' || viewerRole === 'coach') && (
                <div className="flex flex-wrap items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <select
                    aria-label="Target Athlete for Advanced Skill Builder"
                    value={activeAthlete?.id || ''}
                    onChange={(e) => onSelectAthlete(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white"
                  >
                    {athletes.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.level})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleAssignToAthlete}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Add to {activeAthlete?.name.split(' ')[0]}’s Skill Tree
                  </button>
                </div>
              )}
            </div>

            {/* 1. Interactive Reference Video & Biomechanical Keyframe Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                  <Film className="w-4 h-4" />
                  1. USAG Reference Video & Phase Keyframe Breakdown
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  {activeEntry.referenceVideoUrl.replace('https://', '')}
                </span>
              </div>

              {/* Interactive Keyframe Visualizer Box */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-[#0B1324] to-indigo-950/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
                    <PlayCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                      PHASE {activeKeyframeIndex + 1} OF {activeEntry.videoKeyframeCues.length}
                    </span>
                    <div className="text-sm font-bold text-white mt-1">
                      {activeEntry.videoKeyframeCues[activeKeyframeIndex]}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Click any phase chip below to step through the biomechanical sequence
                    </div>
                  </div>
                </div>
              </div>

              {/* Keyframe Stepper Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeEntry.videoKeyframeCues.map((cue, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveKeyframeIndex(idx)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition flex items-center gap-2 ${
                      activeKeyframeIndex === idx
                        ? 'bg-cyan-500/15 border-cyan-400 text-white font-bold'
                        : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-950 border border-slate-700 font-mono text-[10px] flex items-center justify-center text-cyan-300 shrink-0">
                      {idx + 1}
                    </span>
                    <span className="truncate">{cue}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Pro Coaching & Training Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/75 border border-slate-800 space-y-2.5">
                <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  2. Pro Training Tips & Coaching Cues
                </h3>
                <ul className="space-y-2 text-xs text-slate-200 leading-relaxed">
                  {activeEntry.trainingTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. Biomechanical Vitals & Body-Type Notes */}
              <div className="p-4 rounded-xl bg-indigo-950/35 border border-indigo-500/30 space-y-2.5 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-indigo-300 font-bold flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    3. Anthropometric & Vitals Correlation
                  </h3>
                  <p className="text-xs text-indigo-100 mt-2 leading-relaxed">
                    {activeEntry.biomechanicalVitalsNotes}
                  </p>
                </div>

                {activeAthlete && (
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-cyan-300 font-mono">
                    <strong>{activeAthlete.name}’s Vitals Check:</strong> Torso:Leg{' '}
                    {activeAthlete.vitals.torsoToLegRatio} · Shoulder{' '}
                    {activeAthlete.vitals.shoulderFlexionDeg}° · Ankle{' '}
                    {activeAthlete.vitals.ankleDorsiflexionDeg}° · Split{' '}
                    {activeAthlete.vitals.hipSplitLeftDeg}°
                  </div>
                )}
              </div>
            </div>

            {/* 4. Common Mistakes, USAG Judge Deductions & Corrective Fixes */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                4. Common Mistakes, USAG Judge Deductions & Corrective Drills
              </h3>
              <div className="space-y-2.5">
                {activeEntry.commonMistakesAndDeductions.map((item, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-900/85 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-red-300 font-mono text-[10px] font-bold">
                          {item.deduction}
                        </span>
                        <span>{item.fault}</span>
                      </div>
                      <div className="text-xs text-emerald-300">
                        <strong>Corrective Fix: </strong>
                        {item.fix}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Skill Progression Ladder (Prerequisites -> Current -> Next Unlock) */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-2.5">
                5. Skill Progression Ladder (Prerequisites → Next Unlock)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">
                    Prerequisites
                  </div>
                  <div className="font-semibold text-slate-200 mt-1">
                    {activeEntry.prerequisiteSkillNames.join(' · ') || 'Foundational Shapes'}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-cyan-500/15 border border-cyan-500/40">
                  <div className="text-[10px] font-mono text-cyan-300 uppercase font-bold">
                    Current Skill
                  </div>
                  <div className="font-bold text-white mt-1">{activeEntry.skillName}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30">
                  <div className="text-[10px] font-mono text-indigo-300 uppercase">
                    Unlocks Next
                  </div>
                  <div className="font-semibold text-indigo-200 mt-1">
                    {activeEntry.progressionNextSkillNames.join(' · ') || 'Elite Combination'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add Custom Entry to USAG Encyclopedia DB */}
      {showAddCustomEntryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <form
            onSubmit={handleCreateCustomEncyclopediaEntry}
            className="w-full max-w-xl bg-[#0B1120] border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4 my-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                  Supabase Table: ai_robic.usag_skill_encyclopedia
                </span>
                <h2 className="text-lg font-bold text-white">
                  Add Skill to USAG Manual Encyclopedia
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCustomEntryModal(false)}
                className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Program</label>
                <select
                  value={newDiscipline}
                  onChange={(e) => setNewDiscipline(e.target.value as DisciplineId)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="WAG">WAG (Women)</option>
                  <option value="MAG">MAG (Men)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Apparatus</label>
                <select
                  value={newApparatusId}
                  onChange={(e) => setNewApparatusId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  {apparatusList
                    .filter((a) => a.disciplineId === newDiscipline)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Difficulty Value</label>
                <select
                  value={newDifficulty}
                  onChange={(e) =>
                    setNewDifficulty(
                      e.target.value as 'Compulsory' | 'A' | 'B' | 'C' | 'D' | 'E'
                    )
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-bold"
                >
                  <option value="Compulsory">Compulsory</option>
                  <option value="A">A Value Part</option>
                  <option value="B">B Value Part</option>
                  <option value="C">C Value Part</option>
                  <option value="D">D Value Part</option>
                  <option value="E">E Value Part</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">USAG Manual Code</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-400 mb-1">Official Skill Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Maloney / Toe-On Shaposhnikova to High Bar"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Key Coaching Cue / Training Tip
              </label>
              <input
                type="text"
                value={newTip}
                onChange={(e) => setNewTip(e.target.value)}
                placeholder="e.g. Keep heels driving backward out of the toe-on circle..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Common Fault & Judge Deduction
              </label>
              <input
                type="text"
                value={newFault}
                onChange={(e) => setNewFault(e.target.value)}
                placeholder="e.g. Hip angle < 160° prior to high-bar catch (-0.20)"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Biomechanical Vitals Correlation Note
              </label>
              <input
                type="text"
                value={newVitalsNote}
                onChange={(e) => setNewVitalsNote(e.target.value)}
                placeholder="e.g. Requires Pike Compression >= 8/10 and Shoulder Flexion >= 178°"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddCustomEntryModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs"
              >
                Save to USAG Encyclopedia DB
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
