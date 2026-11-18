import React, { useState } from 'react';
import {
  Athlete,
  CorrectiveDrill,
  MasteryStage,
  Skill,
  SkillProgressEntry,
} from '../types';
import { STAGE_DEFINITIONS } from '../mockData';
import {
  CheckCircle2,
  Dumbbell,
  Mic,
  MicOff,
  Plus,
  Sparkles,
  Tag,
  Video,
  X,
} from 'lucide-react';

interface SkillPrescriptionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  athlete: Athlete;
  skill: Skill | null;
  drills: CorrectiveDrill[];
  onSaveProgress: (
    athleteId: string,
    skillId: string,
    stage: MasteryStage,
    coachNote: string,
    faultTags: string[],
    drillIds: string[]
  ) => void;
}

export const SkillPrescriptionDrawer: React.FC<SkillPrescriptionDrawerProps> = ({
  isOpen,
  onClose,
  athlete,
  skill,
  drills,
  onSaveProgress,
}) => {
  if (!isOpen || !skill) return null;

  const existing: SkillProgressEntry = athlete.skillProgress[skill.id] || {
    skillId: skill.id,
    stage: 1,
    lastUpdated: '2026-11-17',
    coachNote: '',
    activeFaultTags: [],
    assignedDrillIds: [],
    history: [],
  };

  const [stage, setStage] = useState<MasteryStage>(existing.stage);
  const [coachNote, setCoachNote] = useState<string>(existing.coachNote);
  const [faultTags, setFaultTags] = useState<string[]>(existing.activeFaultTags);
  const [selectedDrillIds, setSelectedDrillIds] = useState<string[]>(existing.assignedDrillIds);
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);

  const toggleFaultTag = (tag: string) => {
    setFaultTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleDrill = (drillId: string) => {
    setSelectedDrillIds((prev) =>
      prev.includes(drillId) ? prev.filter((d) => d !== drillId) : [...prev, drillId]
    );
  };

  // Voice-to-Text Dictation handler (uses Web Speech API or realistic smart dictation on tablet floor)
  const handleVoiceDictation = () => {
    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      return;
    }
    setIsRecordingVoice(true);

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

    if (SpeechRecognition && typeof SpeechRecognition === 'function') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recognition: any = new (SpeechRecognition as any)();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setCoachNote((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsRecordingVoice(false);
        };
        recognition.onerror = () => {
          // Fallback to smart vitals-contextualized floor dictation
          appendSmartVoiceTranscript();
        };
        recognition.start();
        return;
      } catch {
        appendSmartVoiceTranscript();
      }
    } else {
      appendSmartVoiceTranscript();
    }
  };

  const appendSmartVoiceTranscript = () => {
    setTimeout(() => {
      const smartSnippet = `Strong effort on ${skill.name} today! Because ${athlete.name}'s torso-to-leg ratio is ${athlete.vitals.torsoToLegRatio} and shoulder flexion is ${athlete.vitals.shoulderFlexionDeg}°, let's focus on ${
        drills.find((d) => skill.recommendedDrillIds.includes(d.id))?.title ||
        'hollow body tension'
      } 3 sets at home before Friday's practice.`;
      setCoachNote((prev) => (prev ? `${prev}\n\n[Voice Note]: ${smartSnippet}` : smartSnippet));
      setIsRecordingVoice(false);
    }, 900);
  };

  const handleSave = () => {
    onSaveProgress(athlete.id, skill.id, stage, coachNote, faultTags, selectedDrillIds);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-[#0B1120] border-l border-slate-700/80 h-full flex flex-col justify-between overflow-y-auto p-6 shadow-2xl">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold">
                  {skill.usagCode}
                </span>
                <span className="text-xs text-slate-400">{athlete.name}</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">{skill.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{skill.biomechanicalFocus}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 1. Mastery Stage Selector */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-bold mb-2">
              1. Progression Stage (Parent-Visible Pipeline)
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {STAGE_DEFINITIONS.map((def) => {
                const active = stage === def.stage;
                return (
                  <button
                    key={def.stage}
                    onClick={() => setStage(def.stage)}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      active
                        ? `${def.bgClass} ${def.borderClass} ${def.colorClass} ring-2 ring-cyan-400/50 font-bold`
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-mono">{def.shortLabel}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Quick Deduction / Biomechanical Blocker Tags */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-bold mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              2. Active Technical / Vitals Blockers (Tap to Toggle)
            </label>
            <div className="flex flex-wrap gap-2">
              {skill.commonFaultTags.map((tag) => {
                const isSelected = faultTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleFaultTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Coach Note + 1-Tap Floor Voice Dictation */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                3. Personalized Coach Note (Shared with Parent)
              </label>
              <button
                onClick={handleVoiceDictation}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                  isRecordingVoice
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40'
                }`}
              >
                {isRecordingVoice ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    Listening on Floor...
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    1-Tap Voice Dictation
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={4}
              value={coachNote}
              onChange={(e) => setCoachNote(e.target.value)}
              placeholder="Explain what went well today and how the home drill unlocks the next stage..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-100 leading-relaxed focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* 4. Vitals-Matched Corrective Drill Library */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold mb-2 flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5" />
              4. Assign Bespoke Home Exercises (Matched to {athlete.name}’s Vitals)
            </label>
            <div className="space-y-2.5">
              {drills.map((drill) => {
                const isRecommended = skill.recommendedDrillIds.includes(drill.id);
                const isAssigned = selectedDrillIds.includes(drill.id);
                return (
                  <div
                    key={drill.id}
                    onClick={() => toggleDrill(drill.id)}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      isAssigned
                        ? 'bg-emerald-500/15 border-emerald-500/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{drill.title}</span>
                          {isRecommended && (
                            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" />
                              Vitals Match
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-emerald-300 font-mono mt-0.5">
                          {drill.setsReps} · {drill.frequency}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{drill.description}</p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                          isAssigned
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                            : 'border-slate-700 text-slate-500'
                        }`}
                      >
                        {isAssigned ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Save */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
          >
            Save & Sync to Parent Portal
          </button>
        </div>
      </div>
    </div>
  );
};
