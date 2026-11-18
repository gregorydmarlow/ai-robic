import React, { useState } from 'react';
import {
  Athlete,
  AthleteVitals,
  DisciplineId,
  FacilityConfig,
  RotationGroupId,
} from '../types';
import {
  Building2,
  CheckCircle2,
  Layers,
  Plus,
  Rocket,
  Sparkles,
  Trash2,
  Users,
  Wand2,
} from 'lucide-react';

interface OnboardingSetupViewProps {
  facilityConfig: FacilityConfig;
  athletes: Athlete[];
  showDevIds: boolean;
  onSaveOnboarding: (newConfig: FacilityConfig, updatedAthletes: Athlete[]) => void;
  onResetToDemoRoster: () => void;
}

type BodyArchetypePreset = 'balanced' | 'long_femur' | 'compact_power' | 'rapid_growth';

const ARCHETYPE_PRESETS: Record<
  BodyArchetypePreset,
  { label: string; summary: string; vitals: AthleteVitals }
> = {
  balanced: {
    label: 'Balanced All-Arounder (Torso:Leg 0.98)',
    summary:
      'Balanced All-Arounder (Torso:Leg 0.98) — Clean line & coordination; building explosive scapular block for Vault & Floor.',
    vitals: {
      heightCm: 140,
      sittingHeightCm: 69,
      legLengthCm: 71,
      torsoToLegRatio: 0.97,
      armSpanCm: 141,
      apeIndexCm: 1,
      growthSpurtVelocityCmPerYr: 3.8,
      shoulderFlexionDeg: 176,
      bridgeThoracicDeg: 172,
      hipSplitLeftDeg: 176,
      hipSplitRightDeg: 175,
      pikeCompressionScore: 8,
      ankleDorsiflexionDeg: 33,
      strictPullUpsMax: 10,
      hangingLegLiftsMax: 12,
      hollowHoldSeconds: 50,
      verticalJumpCm: 38,
      lastMeasuredDate: '2026-11-18',
    },
  },
  long_femur: {
    label: 'Tall / Long-Femur Lever (Torso:Leg 0.87)',
    summary:
      'Long-Femured Lever Athlete (Torso:Leg 0.87) — High split amplitude; needs extra pike compression & ankle dorsiflexion support for Kips & Squat-Ons.',
    vitals: {
      heightCm: 147,
      sittingHeightCm: 68,
      legLengthCm: 79,
      torsoToLegRatio: 0.86,
      armSpanCm: 150,
      apeIndexCm: 3,
      growthSpurtVelocityCmPerYr: 5.9,
      shoulderFlexionDeg: 165,
      bridgeThoracicDeg: 162,
      hipSplitLeftDeg: 182,
      hipSplitRightDeg: 180,
      pikeCompressionScore: 6,
      ankleDorsiflexionDeg: 28,
      strictPullUpsMax: 8,
      hangingLegLiftsMax: 11,
      hollowHoldSeconds: 44,
      verticalJumpCm: 37,
      lastMeasuredDate: '2026-11-18',
    },
  },
  compact_power: {
    label: 'Compact Powerhouse (Torso:Leg 1.03)',
    summary:
      'Compact Powerhouse (Torso:Leg 1.03, Vertical 45cm) — Fast rotation on Bars & Tumbling; primary focus is active hip split mobility for Beam/Floor leaps.',
    vitals: {
      heightCm: 133,
      sittingHeightCm: 67,
      legLengthCm: 66,
      torsoToLegRatio: 1.02,
      armSpanCm: 134,
      apeIndexCm: 1,
      growthSpurtVelocityCmPerYr: 3.1,
      shoulderFlexionDeg: 180,
      bridgeThoracicDeg: 175,
      hipSplitLeftDeg: 158,
      hipSplitRightDeg: 156,
      pikeCompressionScore: 9,
      ankleDorsiflexionDeg: 36,
      strictPullUpsMax: 14,
      hangingLegLiftsMax: 16,
      hollowHoldSeconds: 62,
      verticalJumpCm: 45,
      lastMeasuredDate: '2026-11-18',
    },
  },
  rapid_growth: {
    label: 'Rapid Growth Spurt (+6.8 cm/yr Alert)',
    summary:
      'Active Growth Spurt Athlete (+6.8cm/yr) — Temporary lat & Achilles tightness from bone growth; requires daily Butcher’s Block & eccentric landing prep.',
    vitals: {
      heightCm: 145,
      sittingHeightCm: 69,
      legLengthCm: 76,
      torsoToLegRatio: 0.91,
      armSpanCm: 148,
      apeIndexCm: 3,
      growthSpurtVelocityCmPerYr: 6.8,
      shoulderFlexionDeg: 163,
      bridgeThoracicDeg: 158,
      hipSplitLeftDeg: 172,
      hipSplitRightDeg: 170,
      pikeCompressionScore: 6,
      ankleDorsiflexionDeg: 27,
      strictPullUpsMax: 7,
      hangingLegLiftsMax: 10,
      hollowHoldSeconds: 38,
      verticalJumpCm: 35,
      lastMeasuredDate: '2026-11-18',
    },
  },
};

const GRADIENT_PALETTE = [
  'from-cyan-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-purple-500 to-indigo-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-blue-600 to-indigo-700',
];

export const OnboardingSetupView: React.FC<OnboardingSetupViewProps> = ({
  facilityConfig,
  athletes,
  showDevIds,
  onSaveOnboarding,
  onResetToDemoRoster,
}) => {
  const [config, setConfig] = useState<FacilityConfig>(facilityConfig);
  const [draftAthletes, setDraftAthletes] = useState<Athlete[]>(athletes);
  const [bulkNamesInput, setBulkNamesInput] = useState<string>('');
  const [bulkDiscipline, setBulkDiscipline] = useState<DisciplineId>('WAG');
  const [bulkLevel, setBulkLevel] = useState<string>('Level 4');
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const toggleDiscipline = (d: DisciplineId) => {
    setConfig((prev) => {
      const exists = prev.activeDisciplines.includes(d);
      const next = exists
        ? prev.activeDisciplines.filter((x) => x !== d)
        : [...prev.activeDisciplines, d];
      return { ...prev, activeDisciplines: next.length > 0 ? next : ['WAG'] };
    });
  };

  const toggleLevel = (lvl: string) => {
    setConfig((prev) => {
      const exists = prev.activeLevels.includes(lvl);
      const next = exists
        ? prev.activeLevels.filter((x) => x !== lvl)
        : [...prev.activeLevels, lvl];
      return { ...prev, activeLevels: next.length > 0 ? next : ['Level 4'] };
    });
  };

  const handleAddSingleAthlete = () => {
    const idx = draftAthletes.length;
    const preset = ARCHETYPE_PRESETS.balanced;
    const groups: RotationGroupId[] = ['A', 'B', 'C', 'D'];
    const newAth: Athlete = {
      id: `ath-${Date.now()}-${idx}`,
      name: `Athlete ${idx + 1}`,
      age: 10,
      avatarInitials: `A${idx + 1}`,
      avatarGradient: GRADIENT_PALETTE[idx % GRADIENT_PALETTE.length],
      disciplineId: config.activeDisciplines[0] || 'WAG',
      level: config.activeLevels[0] || 'Level 4',
      rotationGroup: groups[idx % Math.max(1, config.rotationCount)],
      checkedIn: true,
      parentName: 'Parent / Guardian',
      parentEmail: 'parent@example.com',
      homeStreakDays: 1,
      archetypeSummary: preset.summary,
      vitals: { ...preset.vitals },
      skillProgress: {},
      prescriptions: [],
    };
    setDraftAthletes((prev) => [...prev, newAth]);
  };

  const handleBulkGenerateFromNames = () => {
    const names = bulkNamesInput
      .split(/[\n,]+/)
      .map((n) => n.trim())
      .filter(Boolean);
    if (names.length === 0) return;

    const groups: RotationGroupId[] = ['A', 'B', 'C', 'D'];
    const presets: BodyArchetypePreset[] = [
      'balanced',
      'long_femur',
      'compact_power',
      'rapid_growth',
    ];

    const created: Athlete[] = names.map((fullName, i) => {
      const parts = fullName.split(' ');
      const initials =
        parts.length >= 2
          ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
          : fullName.slice(0, 2).toUpperCase();
      const presetKey = presets[i % presets.length];
      const preset = ARCHETYPE_PRESETS[presetKey];

      return {
        id: `ath-${Date.now()}-${i}`,
        name: fullName,
        age: 10 + (i % 4),
        avatarInitials: initials,
        avatarGradient: GRADIENT_PALETTE[(draftAthletes.length + i) % GRADIENT_PALETTE.length],
        disciplineId: bulkDiscipline,
        level: bulkLevel,
        rotationGroup: groups[i % Math.max(1, config.rotationCount)],
        checkedIn: true,
        parentName: `${parts[parts.length - 1] || fullName} Family`,
        parentEmail: `${parts[0].toLowerCase()}@example.com`,
        homeStreakDays: 1,
        archetypeSummary: preset.summary,
        vitals: { ...preset.vitals },
        skillProgress: {},
        prescriptions: [],
      };
    });

    setDraftAthletes((prev) => [...prev, ...created]);
    setBulkNamesInput('');
    setSavedToast(`Added ${created.length} athletes and balanced their rotation groups!`);
    setTimeout(() => setSavedToast(null), 3500);
  };

  const handleUpdateAthleteRow = (
    id: string,
    updates: Partial<Athlete>,
    archetypeKey?: BodyArchetypePreset
  ) => {
    setDraftAthletes((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const next = { ...a, ...updates };
        if (updates.name) {
          const parts = updates.name.trim().split(' ');
          next.avatarInitials =
            parts.length >= 2
              ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
              : updates.name.slice(0, 2).toUpperCase();
        }
        if (archetypeKey) {
          const preset = ARCHETYPE_PRESETS[archetypeKey];
          next.vitals = { ...preset.vitals };
          next.archetypeSummary = preset.summary;
        }
        return next;
      })
    );
  };

  const handleRemoveAthlete = (id: string) => {
    setDraftAthletes((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6 pb-14">
      {/* Top Hero Banner [ONB-101] */}
      <div className="relative p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0F172A] to-cyan-950/70 border border-slate-800 shadow-xl">
        {showDevIds && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-fuchsia-500/20 border border-fuchsia-400 text-fuchsia-200 font-mono text-[10px] font-bold">
            [ONB-101: Facility & Program Header]
          </span>
        )}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold uppercase">
              Gym Onboarding & Roster Configurator
            </span>
            <h1 className="text-2xl font-black text-white mt-1">
              Configure Your Facility, Program Gender, Levels & Athletes
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Customize your gym name, active programs (Women’s WAG, Men’s MAG, or Cheer/T&T),
              training levels, and athlete roster. Changes sync directly to the Floor Cockpit and
              your Supabase `ai_robic` database.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onResetToDemoRoster}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              Restore Demo Roster
            </button>

            <button
              onClick={() => onSaveOnboarding(config, draftAthletes)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition"
            >
              <Rocket className="w-4 h-4" />
              Save & Launch Floor Cockpit ({draftAthletes.length} Athletes)
            </button>
          </div>
        </div>
      </div>

      {savedToast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {savedToast}
        </div>
      )}

      {/* Step 1 & Step 2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step 1: Facility Profile, Program Gender & Levels [ONB-102] */}
        <div className="lg:col-span-5 relative p-5 rounded-2xl bg-[#0B1120] border border-slate-800 space-y-5">
          {showDevIds && (
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-fuchsia-500/20 border border-fuchsia-400 text-fuchsia-200 font-mono text-[10px] font-bold">
              [ONB-102: Facility & Program Settings]
            </span>
          )}

          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            Step 1: Facility Profile & Program Gender
          </h2>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1">
                Gym / Facility Name
              </label>
              <input
                type="text"
                value={config.facilityName}
                onChange={(e) => setConfig({ ...config, facilityName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1">
                Lead Coach / Program Director Name
              </label>
              <input
                type="text"
                value={config.headCoachName}
                onChange={(e) => setConfig({ ...config, headCoachName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1.5">
                Active Programs / Gender Tracks (Select All That Apply)
              </label>
              <div className="grid grid-cols-1 gap-2">
                {(
                  [
                    {
                      id: 'WAG',
                      title: 'Women’s Artistic Gymnastics (WAG — 4 Events)',
                      sub: 'Vault, Uneven Bars, Balance Beam, Floor Exercise',
                    },
                    {
                      id: 'MAG',
                      title: 'Men’s Artistic Gymnastics (MAG — 6 Events)',
                      sub: 'Floor, Pommel Horse, Still Rings, Vault, Parallel Bars, High Bar',
                    },
                    {
                      id: 'CHEER_TNT',
                      title: 'Cheerleading & Power Tumbling / Trampoline (T&T)',
                      sub: 'Running Tumbling, Trampoline, Stunt & Flyer Body Positions',
                    },
                  ] as { id: DisciplineId; title: string; sub: string }[]
                ).map((item) => {
                  const active = config.activeDisciplines.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleDiscipline(item.id)}
                      className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                        active
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">{item.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.sub}</div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          active ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {active ? 'ACTIVE' : 'OFF'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1.5">
                Active Levels Trained in This Session
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Pre-Team / Rec',
                  'Level 1',
                  'Level 2',
                  'Level 3',
                  'Level 4',
                  'Level 5',
                  'Level 6',
                  'Level 7',
                  'Level 8-10',
                  'Xcel Bronze/Silver',
                  'Xcel Gold/Plat',
                ].map((lvl) => {
                  const active = config.activeLevels.includes(lvl);
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => toggleLevel(lvl)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        active
                          ? 'bg-indigo-500/25 border-indigo-400 text-indigo-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {active ? `✓ ${lvl}` : lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1.5">
                Number of Floor Rotation Groups ({config.rotationCount} Groups)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setConfig({ ...config, rotationCount: cnt })}
                    className={`py-2 rounded-xl border text-xs font-bold font-mono transition ${
                      config.rotationCount === cnt
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {cnt} {cnt === 1 ? 'Group (A)' : `Groups (A-${['A', 'B', 'C', 'D'][cnt - 1]})`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bulk Quick-Generator Box */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h3 className="text-xs font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5" />
              Fast Bulk Athlete Importer (Paste Names)
            </h3>
            <p className="text-[11px] text-slate-400">
              Paste comma- or line-separated athlete names to auto-create their profiles and
              distribute them evenly across Rotation Groups:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={bulkDiscipline}
                onChange={(e) => setBulkDiscipline(e.target.value as DisciplineId)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="WAG">Women’s (WAG)</option>
                <option value="MAG">Men’s (MAG)</option>
                <option value="CHEER_TNT">Cheer / T&T</option>
              </select>
              <select
                value={bulkLevel}
                onChange={(e) => setBulkLevel(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                {config.activeLevels.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              rows={3}
              value={bulkNamesInput}
              onChange={(e) => setBulkNamesInput(e.target.value)}
              placeholder="e.g. Emma Ross, Olivia Patel, Lucas Kim, Ava Torres"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
            />
            <button
              type="button"
              onClick={handleBulkGenerateFromNames}
              className="w-full py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition"
            >
              + Bulk Add Athletes to Roster
            </button>
          </div>
        </div>

        {/* Step 2: Interactive Athlete Roster Table [ONB-103] */}
        <div className="lg:col-span-7 relative p-5 rounded-2xl bg-[#0B1120] border border-slate-800 space-y-4">
          {showDevIds && (
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-fuchsia-500/20 border border-fuchsia-400 text-fuchsia-200 font-mono text-[10px] font-bold">
              [ONB-103: Athlete Roster Builder Table]
            </span>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                Step 2: Configure Athlete Roster ({draftAthletes.length} Athletes)
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Edit names, ages, program gender, level, rotation group, and starting body vitals
                archetype.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddSingleAthlete}
              className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              Add Athlete Row
            </button>
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {draftAthletes.map((ath, idx) => (
              <div
                key={ath.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                  {/* Avatar + Name */}
                  <div className="sm:col-span-4 flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${ath.avatarGradient} flex items-center justify-center font-black text-white text-xs shrink-0`}
                    >
                      {ath.avatarInitials}
                    </div>
                    <div className="w-full">
                      <label className="block text-[10px] text-slate-400">Athlete Name</label>
                      <input
                        type="text"
                        value={ath.name}
                        onChange={(e) => handleUpdateAthleteRow(ath.id, { name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-bold"
                      />
                    </div>
                  </div>

                  {/* Age */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-400">Age</label>
                    <input
                      type="number"
                      min={4}
                      max={25}
                      value={ath.age}
                      onChange={(e) =>
                        handleUpdateAthleteRow(ath.id, { age: Number(e.target.value) })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                    />
                  </div>

                  {/* Program Gender */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-400">Program</label>
                    <select
                      value={ath.disciplineId}
                      onChange={(e) =>
                        handleUpdateAthleteRow(ath.id, {
                          disciplineId: e.target.value as DisciplineId,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-cyan-300 font-bold"
                    >
                      <option value="WAG">WAG (Women)</option>
                      <option value="MAG">MAG (Men)</option>
                      <option value="CHEER_TNT">Cheer/T&T</option>
                    </select>
                  </div>

                  {/* Level */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-400">Level</label>
                    <select
                      value={ath.level}
                      onChange={(e) => handleUpdateAthleteRow(ath.id, { level: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                    >
                      {Array.from(new Set([...config.activeLevels, ath.level])).map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rotation Group + Delete */}
                  <div className="sm:col-span-2 flex items-end justify-between gap-1">
                    <div className="w-full">
                      <label className="block text-[10px] text-slate-400">Rot. Group</label>
                      <select
                        value={ath.rotationGroup}
                        onChange={(e) =>
                          handleUpdateAthleteRow(ath.id, {
                            rotationGroup: e.target.value as RotationGroupId,
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-300 font-mono font-bold"
                      >
                        {(['A', 'B', 'C', 'D'] as RotationGroupId[]).map((g) => (
                          <option key={g} value={g}>
                            Group {g}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAthlete(ath.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
                      title="Remove athlete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Vitals Archetype Quick Selector */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <span className="text-slate-400 font-mono">
                    Current Vitals: {ath.vitals.heightCm}cm · Torso:Leg {ath.vitals.torsoToLegRatio}{' '}
                    · Shoulder {ath.vitals.shoulderFlexionDeg}°
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Preset Vitals:</span>
                    {(Object.keys(ARCHETYPE_PRESETS) as BodyArchetypePreset[]).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleUpdateAthleteRow(ath.id, {}, key)}
                        className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-700 text-[10px] text-cyan-300 font-mono transition"
                      >
                        {key === 'balanced'
                          ? 'Balanced'
                          : key === 'long_femur'
                          ? 'Long-Femur'
                          : key === 'compact_power'
                          ? 'Compact Power'
                          : 'Growth Spurt'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
