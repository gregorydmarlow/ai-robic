import React, { useState } from 'react';
import { Athlete, AthleteVitals, CorrectiveDrill } from '../types';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Dumbbell,
  Flame,
  PlusCircle,
  Ruler,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';

interface VitalsDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  athlete: Athlete;
  drills: CorrectiveDrill[];
  onUpdateVitals: (athleteId: string, updatedVitals: AthleteVitals, newSummary: string) => void;
  onAssignDrill: (athleteId: string, drillId: string, skillId: string, vitalsReason: string) => void;
}

export const VitalsDrawerModal: React.FC<VitalsDrawerModalProps> = ({
  isOpen,
  onClose,
  athlete,
  drills,
  onUpdateVitals,
  onAssignDrill,
}) => {
  const [vitals, setVitals] = useState<AthleteVitals>(athlete.vitals);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFieldChange = (field: keyof AthleteVitals, value: number) => {
    const next = { ...vitals, [field]: value };
    // Auto-recalculate derived anthropometric ratios
    if (field === 'heightCm' || field === 'sittingHeightCm') {
      const legLen = Math.max(40, next.heightCm - next.sittingHeightCm);
      next.legLengthCm = legLen;
      next.torsoToLegRatio = Number((next.sittingHeightCm / legLen).toFixed(2));
    }
    if (field === 'heightCm' || field === 'armSpanCm') {
      next.apeIndexCm = Number((next.armSpanCm - next.heightCm).toFixed(1));
    }
    setVitals(next);
  };

  // Compute dynamic Biomechanical Insights & Recommended Drills based on current vitals sliders
  const generatedInsights: {
    title: string;
    severity: 'caution' | 'opportunity' | 'strength';
    detail: string;
    recommendedDrillId?: string;
  }[] = [];

  if (vitals.torsoToLegRatio < 0.92) {
    generatedInsights.push({
      title: `Long-Femur Leverage Profile (Torso:Leg ${vitals.torsoToLegRatio})`,
      severity: 'caution',
      detail: `Legs (${vitals.legLengthCm}cm) are significantly longer than torso (${vitals.sittingHeightCm}cm). Increases rotational moment of inertia on Glide Kips and requires deeper pike compression + ankle dorsiflexion on Bar Squat-Ons.`,
      recommendedDrillId: 'drill-compression-pulses',
    });
  } else if (vitals.torsoToLegRatio > 1.0) {
    generatedInsights.push({
      title: `Compact Leg / Fast-Rotation Profile (Torso:Leg ${vitals.torsoToLegRatio})`,
      severity: 'strength',
      detail: `Compact leg lever (${vitals.legLengthCm}cm) enables rapid salto/kip turnover. Focus on dynamic hip extension to maximize split leap amplitude.`,
      recommendedDrillId: 'drill-active-split-sliders',
    });
  }

  if (vitals.shoulderFlexionDeg < 175) {
    generatedInsights.push({
      title: `Limited Overhead Shoulder Flexion (${vitals.shoulderFlexionDeg}° vs 180° Target)`,
      severity: 'caution',
      detail: `Forces a closed shoulder angle on Back Handspring block and slight lower-back arch in Beam Handstands. Needs daily thoracic/lat opening.`,
      recommendedDrillId: 'drill-butcher-block',
    });
  } else {
    generatedInsights.push({
      title: `Elite Overhead Shoulder Line (${vitals.shoulderFlexionDeg}°)`,
      severity: 'strength',
      detail: `Full ear-covered vertical stacking capacity on Handstands and Vault repulsion.`,
    });
  }

  if (vitals.ankleDorsiflexionDeg < 31) {
    generatedInsights.push({
      title: `Restricted Ankle Dorsiflexion (${vitals.ankleDorsiflexionDeg}° vs 34° Benchmark)`,
      severity: 'caution',
      detail: `Causes heels to pop up on Bar Squat-On and forces chest low on dismount landings.`,
      recommendedDrillId: 'drill-ankle-dorsi-band',
    });
  }

  if (vitals.growthSpurtVelocityCmPerYr >= 5.5) {
    generatedInsights.push({
      title: `Active Growth Spurt Alert (+${vitals.growthSpurtVelocityCmPerYr} cm/yr)`,
      severity: 'caution',
      detail: `Rapid bone growth temporarily tightens Achilles and lat fascia while shifting center-of-mass. Prioritize eccentric landing absorption and hollow core control.`,
      recommendedDrillId: 'drill-hollow-rockers',
    });
  }

  const handleSaveProfile = () => {
    const newArchetype = `${
      vitals.torsoToLegRatio < 0.92
        ? `Long-Femur Athlete (Torso:Leg ${vitals.torsoToLegRatio})`
        : `Balanced/Compact Lever (Torso:Leg ${vitals.torsoToLegRatio})`
    } — Shoulder ROM ${vitals.shoulderFlexionDeg}°, Ankle ROM ${vitals.ankleDorsiflexionDeg}°, Vertical ${vitals.verticalJumpCm}cm.`;

    onUpdateVitals(athlete.id, vitals, newArchetype);
    setSavedToast('Biomechanical Vitals saved & Prescription Model recalibrated!');
    setTimeout(() => setSavedToast(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0B1120] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-[#0F172A] to-cyan-950/50 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-slate-950 text-base">
              {athlete.avatarInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono uppercase font-bold">
                  Anthropometric & Vitals Engine
                </span>
                <span className="text-xs text-slate-400">
                  Last Measured: {vitals.lastMeasuredDate}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                {athlete.name} — Bespoke Biomechanics Profile
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedToast && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-6 py-2.5 text-xs text-emerald-200 flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {savedToast}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 max-h-[80vh] overflow-y-auto">
          {/* Left 7 Cols: Interactive Vitals Sliders */}
          <div className="lg:col-span-7 p-6 border-b lg:border-b-0 lg:border-r border-slate-800 space-y-6">
            {/* Section 1: Anthropometrics & Limb Ratios */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-2 mb-3">
                <Ruler className="w-4 h-4" />
                1. Anthropometrics & Lever Ratios
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-900/70 p-4 rounded-xl border border-slate-800">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Standing Height</span>
                    <span className="font-mono font-bold text-white">{vitals.heightCm} cm</span>
                  </div>
                  <input
                    type="range"
                    min={115}
                    max={175}
                    value={vitals.heightCm}
                    onChange={(e) => handleFieldChange('heightCm', Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Sitting Height (Torso)</span>
                    <span className="font-mono font-bold text-white">{vitals.sittingHeightCm} cm</span>
                  </div>
                  <input
                    type="range"
                    min={55}
                    max={92}
                    value={vitals.sittingHeightCm}
                    onChange={(e) => handleFieldChange('sittingHeightCm', Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Arm Span (Reach)</span>
                    <span className="font-mono font-bold text-white">
                      {vitals.armSpanCm} cm (Ape: {vitals.apeIndexCm >= 0 ? `+${vitals.apeIndexCm}` : vitals.apeIndexCm}cm)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={115}
                    max={180}
                    value={vitals.armSpanCm}
                    onChange={(e) => handleFieldChange('armSpanCm', Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Growth Spurt Velocity</span>
                    <span
                      className={`font-mono font-bold ${
                        vitals.growthSpurtVelocityCmPerYr >= 5.5 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      +{vitals.growthSpurtVelocityCmPerYr} cm/yr
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={0.2}
                    value={vitals.growthSpurtVelocityCmPerYr}
                    onChange={(e) =>
                      handleFieldChange('growthSpurtVelocityCmPerYr', Number(e.target.value))
                    }
                    className="w-full accent-amber-400"
                  />
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Computed Torso-to-Leg Lever Ratio:</span>
                  <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-700 font-mono font-bold text-cyan-300">
                    {vitals.torsoToLegRatio} ({vitals.sittingHeightCm}cm Torso : {vitals.legLengthCm}cm Leg)
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Flexibility & Range of Motion (ROM) */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4" />
                2. Joint Range of Motion (ROM) Benchmarks
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-900/70 p-4 rounded-xl border border-slate-800">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Overhead Shoulder Flexion</span>
                    <span
                      className={`font-mono font-bold ${
                        vitals.shoulderFlexionDeg < 175 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {vitals.shoulderFlexionDeg}° / 180°
                    </span>
                  </div>
                  <input
                    type="range"
                    min={145}
                    max={190}
                    value={vitals.shoulderFlexionDeg}
                    onChange={(e) => handleFieldChange('shoulderFlexionDeg', Number(e.target.value))}
                    className="w-full accent-indigo-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Ankle Dorsiflexion</span>
                    <span
                      className={`font-mono font-bold ${
                        vitals.ankleDorsiflexionDeg < 31 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {vitals.ankleDorsiflexionDeg}° / 34°+
                    </span>
                  </div>
                  <input
                    type="range"
                    min={18}
                    max={42}
                    value={vitals.ankleDorsiflexionDeg}
                    onChange={(e) =>
                      handleFieldChange('ankleDorsiflexionDeg', Number(e.target.value))
                    }
                    className="w-full accent-indigo-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Dominant Split Angle</span>
                    <span className="font-mono font-bold text-white">{vitals.hipSplitLeftDeg}°</span>
                  </div>
                  <input
                    type="range"
                    min={135}
                    max={190}
                    value={vitals.hipSplitLeftDeg}
                    onChange={(e) => handleFieldChange('hipSplitLeftDeg', Number(e.target.value))}
                    className="w-full accent-indigo-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Seated Pike Compression</span>
                    <span className="font-mono font-bold text-white">
                      {vitals.pikeCompressionScore} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={vitals.pikeCompressionScore}
                    onChange={(e) =>
                      handleFieldChange('pikeCompressionScore', Number(e.target.value))
                    }
                    className="w-full accent-indigo-400"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Strength & Power-to-Weight */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-2 mb-3">
                <Dumbbell className="w-4 h-4" />
                3. Specific Strength & Power Benchmarks
              </h3>
              <div className="grid grid-cols-3 gap-3 bg-slate-900/70 p-4 rounded-xl border border-slate-800">
                <div>
                  <div className="text-[11px] text-slate-400 mb-1">Strict Pull-Ups</div>
                  <input
                    type="number"
                    value={vitals.strictPullUpsMax}
                    onChange={(e) => handleFieldChange('strictPullUpsMax', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-sm text-white"
                  />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 mb-1">Hollow Hold (sec)</div>
                  <input
                    type="number"
                    value={vitals.hollowHoldSeconds}
                    onChange={(e) => handleFieldChange('hollowHoldSeconds', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-sm text-white"
                  />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 mb-1">Vertical Jump (cm)</div>
                  <input
                    type="number"
                    value={vitals.verticalJumpCm}
                    onChange={(e) => handleFieldChange('verticalJumpCm', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-sm text-white"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition"
            >
              Save Vitals Profile & Update Bespoke Model
            </button>
          </div>

          {/* Right 5 Cols: Real-time Bespoke Model Prescriptions */}
          <div className="lg:col-span-5 p-6 bg-[#080C16] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-bold">
                  Live Biomechanical Model Insights
                </h3>
              </div>

              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Adjusting sliders on the left immediately recalculates how {athlete.name}’s body
                proportions impact her skills and which corrective home drills yield the fastest
                progression.
              </p>

              <div className="space-y-3">
                {generatedInsights.map((ins, i) => {
                  const drill = drills.find((d) => d.id === ins.recommendedDrillId);
                  return (
                    <div
                      key={i}
                      className={`p-3.5 rounded-xl border ${
                        ins.severity === 'caution'
                          ? 'bg-amber-500/10 border-amber-500/30'
                          : 'bg-emerald-500/10 border-emerald-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        {ins.severity === 'caution' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        {ins.title}
                      </div>
                      <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{ins.detail}</p>

                      {drill && (
                        <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-cyan-300 font-medium">
                            Rx: {drill.title}
                          </span>
                          <button
                            onClick={() => {
                              onAssignDrill(
                                athlete.id,
                                drill.id,
                                'skill-wag-ub-kip',
                                `${ins.title}: ${ins.detail}`
                              );
                              setSavedToast(`Added "${drill.title}" to ${athlete.name}'s Home Plan!`);
                              setTimeout(() => setSavedToast(null), 3000);
                            }}
                            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 text-[11px] font-semibold transition"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            Assign Drill
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <strong className="text-slate-200">Why this matters for parents:</strong> When parents
              see that a skill requires +8° of shoulder flexion or extra pike compression because of
              a 6.8cm/yr growth spurt, frustration turns into productive home support.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
