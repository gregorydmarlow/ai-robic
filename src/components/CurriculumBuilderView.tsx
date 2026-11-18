import React, { useState } from 'react';
import {
  Apparatus,
  CorrectiveDrill,
  DisciplineId,
  Skill,
} from '../types';
import {
  BookOpen,
  CheckCircle2,
  Dumbbell,
  Layers,
  PlusCircle,
  Sparkles,
} from 'lucide-react';

interface CurriculumBuilderViewProps {
  disciplineId: DisciplineId;
  onSelectDiscipline: (d: DisciplineId) => void;
  apparatusList: Apparatus[];
  skills: Skill[];
  drills: CorrectiveDrill[];
  onAddCustomSkill: (newSkill: Skill) => void;
  onAddCustomDrill: (newDrill: CorrectiveDrill) => void;
}

export const CurriculumBuilderView: React.FC<CurriculumBuilderViewProps> = ({
  disciplineId,
  onSelectDiscipline,
  apparatusList,
  skills,
  drills,
  onAddCustomSkill,
  onAddCustomDrill,
}) => {
  const disciplineApparatus = apparatusList.filter((a) => a.disciplineId === disciplineId);
  const [selectedApparatusId, setSelectedApparatusId] = useState<string>(
    disciplineApparatus[0]?.id || 'wag-ub'
  );
  const [skillName, setSkillName] = useState('');
  const [usagCode, setUsagCode] = useState('');
  const [biomechanicalFocus, setBiomechanicalFocus] = useState('');
  const [drillTitle, setDrillTitle] = useState('');
  const [drillSetsReps, setDrillSetsReps] = useState('3 sets × 12 reps');
  const [drillVitalsTrigger, setDrillVitalsTrigger] = useState('Overhead Shoulder Flexion < 175°');
  const [drillDescription, setDrillDescription] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const handleCreateSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;
    const newSkill: Skill = {
      id: `skill-custom-${Date.now()}`,
      disciplineId,
      level: 'Level 4',
      apparatusId: selectedApparatusId,
      name: skillName.trim(),
      usagCode: usagCode.trim() || 'CUST-4.99',
      valuePart: 'Custom Program Element (0.40 Value)',
      biomechanicalFocus:
        biomechanicalFocus.trim() || 'Clean joint alignment, tight core, stuck landing.',
      idealAngles: [{ joint: 'Primary Joint Target', targetDegrees: 180, toleranceDegrees: 5 }],
      commonFaultTags: ['Closed shoulder angle on block', 'Landing step / hop'],
      recommendedDrillIds: [drills[0]?.id || 'drill-butcher-block'],
    };
    onAddCustomSkill(newSkill);
    setSkillName('');
    setUsagCode('');
    setBiomechanicalFocus('');
    setToast(`Added "${newSkill.name}" to the ${disciplineId} curriculum!`);
    setTimeout(() => setToast(null), 3500);
  };

  const handleCreateDrill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drillTitle.trim()) return;
    const newDrill: CorrectiveDrill = {
      id: `drill-custom-${Date.now()}`,
      title: drillTitle.trim(),
      category: 'Shoulder & Thoracic ROM',
      setsReps: drillSetsReps.trim(),
      frequency: '4x / week at home',
      description:
        drillDescription.trim() ||
        'Maintain strict hollow core alignment throughout the entire movement.',
      parentSafetyTip: 'Ensure clear floor space and controlled tempo on every rep.',
      videoCueTitle: 'Coach Demonstration Guide',
      targetedVitalsTrigger: drillVitalsTrigger,
      targetedFaultTags: ['Closed shoulder angle on block'],
    };
    onAddCustomDrill(newDrill);
    setDrillTitle('');
    setDrillDescription('');
    setToast(`Added "${newDrill.title}" to the Bespoke Corrective Drill Library!`);
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0F172A] to-indigo-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-mono font-bold uppercase">
            Multi-Sport Extensible Architecture
          </span>
          <h1 className="text-2xl font-black text-white mt-1">
            Curriculum, USAG Code & Bespoke Drill Library
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Pre-loaded with USAG Women’s Artistic (WAG) & Men’s Artistic (MAG), and ready to scale
            into Cheerleading, Tumbling & Trampoline (T&T), Dance, or Acro.
          </p>
        </div>

        {/* Sport Track Switcher */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {(
            [
              { id: 'WAG', label: 'WAG (4 Events)' },
              { id: 'MAG', label: 'MAG (6 Events)' },
              { id: 'CHEER_TNT', label: 'Cheer & T&T' },
            ] as { id: DisciplineId; label: string }[]
          ).map((d) => (
            <button
              key={d.id}
              onClick={() => {
                onSelectDiscipline(d.id);
                const firstApp = apparatusList.find((a) => a.disciplineId === d.id);
                if (firstApp) setSelectedApparatusId(firstApp.id);
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                disciplineId === d.id
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {toast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Cols: Add New Skill to Apparatus + Active Skill Catalog */}
        <div className="lg:col-span-6 space-y-5">
          <form
            onSubmit={handleCreateSkill}
            className="p-5 rounded-2xl bg-[#0B1120] border border-slate-800 space-y-4"
          >
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              Add Custom Skill to {disciplineId} Curriculum
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Apparatus / Event</label>
                <select
                  value={selectedApparatusId}
                  onChange={(e) => setSelectedApparatusId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  {disciplineApparatus.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name} ({app.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Element Code</label>
                <input
                  type="text"
                  value={usagCode}
                  onChange={(e) => setUsagCode(e.target.value)}
                  placeholder="e.g. UB-5.104"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Skill Name</label>
              <input
                type="text"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="e.g. Clear Hip Circle to Handstand"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Biomechanical & AI Angle Benchmark
              </label>
              <input
                type="text"
                value={biomechanicalFocus}
                onChange={(e) => setBiomechanicalFocus(e.target.value)}
                placeholder="e.g. Late wrist shift, 180° shoulder extension at vertical"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Add Skill to {disciplineId} Tree
            </button>
          </form>

          {/* Existing Skills List */}
          <div className="p-5 rounded-2xl bg-[#0B1120] border border-slate-800 space-y-3">
            <h3 className="text-xs font-mono uppercase text-slate-400 font-bold">
              Active {disciplineId} Skills ({skills.filter((s) => s.disciplineId === disciplineId).length})
            </h3>
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {skills
                .filter((s) => s.disciplineId === disciplineId)
                .map((sk) => (
                  <div
                    key={sk.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-2"
                  >
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">
                        {sk.usagCode} · {sk.valuePart}
                      </span>
                      <div className="text-xs font-bold text-white mt-0.5">{sk.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {sk.biomechanicalFocus}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Add Corrective Home Drill Mapped to Athlete Vitals */}
        <div className="lg:col-span-6 space-y-5">
          <form
            onSubmit={handleCreateDrill}
            className="p-5 rounded-2xl bg-[#0B1120] border border-slate-800 space-y-4"
          >
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-emerald-400" />
              Add Home Corrective Drill to Vitals Engine
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Exercise Title</label>
                <input
                  type="text"
                  value={drillTitle}
                  onChange={(e) => setDrillTitle(e.target.value)}
                  placeholder="e.g. Banded Planche Lean Shrugs"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Sets & Reps</label>
                <input
                  type="text"
                  value={drillSetsReps}
                  onChange={(e) => setDrillSetsReps(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Vitals Auto-Recommendation Trigger
              </label>
              <input
                type="text"
                value={drillVitalsTrigger}
                onChange={(e) => setDrillVitalsTrigger(e.target.value)}
                placeholder="e.g. Long Femur Ratio < 0.90 or Ankle ROM < 30°"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Parent-Friendly Instructions & Safety Cue
              </label>
              <input
                type="text"
                value={drillDescription}
                onChange={(e) => setDrillDescription(e.target.value)}
                placeholder="Clear step-by-step instructions so parents can supervise at home..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Save to Corrective Drill Library
            </button>
          </form>

          {/* Existing Drills List */}
          <div className="p-5 rounded-2xl bg-[#0B1120] border border-slate-800 space-y-3">
            <h3 className="text-xs font-mono uppercase text-slate-400 font-bold">
              Bespoke Corrective Drill Library ({drills.length})
            </h3>
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {drills.map((dr) => (
                <div
                  key={dr.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{dr.title}</span>
                    <span className="text-[11px] font-mono text-emerald-400">{dr.setsReps}</span>
                  </div>
                  <div className="text-[11px] text-cyan-300 font-mono">
                    Vitals Trigger: {dr.targetedVitalsTrigger}
                  </div>
                  <p className="text-[11px] text-slate-400">{dr.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
