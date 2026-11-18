import React, { useEffect, useRef, useState } from 'react';
import {
  AIDeductionItem,
  AIJudgeSession,
  Apparatus,
  Athlete,
  CorrectiveDrill,
  Skill,
} from '../types';
import {
  Activity,
  AlertTriangle,
  Award,
  Camera,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Dumbbell,
  FileVideo,
  Pause,
  Play,
  PlusCircle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  Video,
  Wand2,
  X,
} from 'lucide-react';

interface AIJudgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  athlete: Athlete;
  apparatus: Apparatus;
  skills: Skill[];
  drills: CorrectiveDrill[];
  sessions: AIJudgeSession[];
  initialSessionId?: string;
  initialSkillId?: string;
  onCreateSession: (newSession: AIJudgeSession) => void;
  onAssignDrillFromAI: (athleteId: string, drillId: string, skillId: string, vitalsReason: string) => void;
  readOnlyPortalMode?: boolean;
}

export const AIJudgeModal: React.FC<AIJudgeModalProps> = ({
  isOpen,
  onClose,
  athlete,
  apparatus,
  skills,
  drills,
  sessions,
  initialSessionId,
  initialSkillId,
  onCreateSession,
  onAssignDrillFromAI,
  readOnlyPortalMode = false,
}) => {
  const athleteSessions = sessions.filter((s) => s.athleteId === athlete.id);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    initialSessionId || athleteSessions[0]?.id || ''
  );
  const [judgeMode, setJudgeMode] = useState<'single_skill' | 'mock_meet_routine'>('mock_meet_routine');
  const [selectedSkillId, setSelectedSkillId] = useState<string>(
    initialSkillId || skills[0]?.id || ''
  );

  // Playback & Telemetry HUD state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(4.2);
  const [activeDeductionId, setActiveDeductionId] = useState<string | null>(null);
  const [showSkeletonHUD, setShowSkeletonHUD] = useState<boolean>(true);
  const [isScanningAI, setIsScanningAI] = useState<boolean>(false);
  const [assignedFeedbackToast, setAssignedFeedbackToast] = useState<string | null>(null);

  // Camera / Upload state
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [isLiveCamera, setIsLiveCamera] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeSession =
    athleteSessions.find((s) => s.id === selectedSessionId) ||
    athleteSessions[0] ||
    sessions[0];

  const activeDeduction: AIDeductionItem | undefined =
    activeSession?.deductions.find((d) => d.id === activeDeductionId) ||
    activeSession?.deductions[0];

  useEffect(() => {
    if (initialSessionId) {
      setSelectedSessionId(initialSessionId);
    }
  }, [initialSessionId]);

  useEffect(() => {
    if (activeSession && activeSession.deductions.length > 0) {
      setActiveDeductionId(activeSession.deductions[0].id);
      setCurrentTime(activeSession.deductions[0].timestampSec);
    }
  }, [selectedSessionId]);

  // Smooth playback loop for interactive telemetry canvas
  useEffect(() => {
    if (!isOpen || !isPlaying || !activeSession) return;
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.15;
        if (next >= activeSession.durationSec) {
          return 0;
        }
        // Auto-highlight nearby deduction within 0.6s window
        const nearby = activeSession.deductions.find(
          (d) => Math.abs(d.timestampSec - next) < 0.5
        );
        if (nearby) {
          setActiveDeductionId(nearby.id);
        }
        return Number(next.toFixed(1));
      });
    }, 150);
    return () => clearInterval(interval);
  }, [isOpen, isPlaying, activeSession]);

  // Render Biomechanical Skeleton & Angle Telemetry HUD on HTML5 Canvas
  useEffect(() => {
    if (!isOpen || !canvasRef.current || !activeSession) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // 1. Draw high-tech gym floor / apparatus background grid if no live camera
    if (!isLiveCamera && !uploadedVideoUrl) {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#070B14');
      grad.addColorStop(0.7, '#0F172A');
      grad.addColorStop(1, '#1E293B');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Perspective calibration grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.09)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw Apparatus Reference Line (e.g. Low/High Bar or Floor/Beam plane)
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.lineWidth = 4;
      if (activeSession.apparatusId.includes('ub') || activeSession.apparatusId.includes('hb')) {
        // Uneven bars rails + uprights
        const barX = w * 0.48;
        const barY = h * 0.55;
        ctx.beginPath();
        ctx.moveTo(barX, barY);
        ctx.lineTo(barX, h * 0.92);
        ctx.stroke();

        // High bar rail
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(barX, barY, 7, 0, Math.PI * 2);
        ctx.fill();

        // Horizontal benchmark dashed line through bar
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(w * 0.15, barY);
        ctx.lineTo(w * 0.88, barY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.8)';
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillText('USAG HORIZONTAL BENCHMARK (0°)', w * 0.16, barY - 8);
      } else {
        // Competition Floor / Beam surface
        const floorY = h * 0.85;
        ctx.beginPath();
        ctx.moveTo(w * 0.08, floorY);
        ctx.lineTo(w * 0.92, floorY);
        ctx.stroke();

        // Vertical stack reference line
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(w * 0.49, h * 0.12);
        ctx.lineTo(w * 0.49, floorY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.8)';
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillText('180° VERTICAL STACK TARGET', w * 0.51, h * 0.18);
      }
    }

    if (!showSkeletonHUD || !activeDeduction) return;

    // 2. Compute animated or scrubbed pose coordinates
    const kf = activeDeduction.poseKeyframes;
    const osc = isPlaying ? Math.sin(currentTime * 3.2) * 0.018 : 0;

    const pt = (coord: [number, number]): [number, number] => [
      (coord[0] + osc) * w,
      (coord[1] + osc * 0.5) * h,
    ];

    const head = pt(kf.head);
    const shoulder = pt(kf.shoulder);
    const elbow = pt(kf.elbow);
    const wrist = pt(kf.wrist);
    const hip = pt(kf.hip);
    const knee = pt(kf.knee);
    const ankle = pt(kf.ankle);

    // Draw Ideal Target Ghost Line (Green Dashed)
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.65)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(wrist[0], wrist[1]);
    ctx.lineTo(shoulder[0], shoulder[1]);
    ctx.lineTo(hip[0] - 14, hip[1] - 10);
    ctx.lineTo(ankle[0] - 18, ankle[1] - 14);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Athlete Biomechanical Skeleton Segments
    const drawSegment = (p1: [number, number], p2: [number, number], color: string, width = 5) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.stroke();
    };

    // Arms
    drawSegment(wrist, elbow, '#38BDF8', 5);
    drawSegment(elbow, shoulder, '#38BDF8', 6);
    // Torso (scaled visually with athlete's Torso:Leg ratio)
    drawSegment(shoulder, hip, '#818CF8', 8);
    // Femur & Tibia (highlighted in Amber if long-femur leverage is active)
    const legColor =
      kf.highlightJoint === 'knee' || kf.highlightJoint === 'ankle' ? '#F59E0B' : '#38BDF8';
    drawSegment(hip, knee, legColor, 7);
    drawSegment(knee, ankle, legColor, 6);

    // Draw Head
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(head[0], head[1], 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw Joints
    const joints: { name: string; pos: [number, number]; key: string }[] = [
      { name: 'WRIST', pos: wrist, key: 'wrist' },
      { name: 'ELBOW', pos: elbow, key: 'elbow' },
      { name: 'SHOULDER', pos: shoulder, key: 'shoulder' },
      { name: 'HIP', pos: hip, key: 'hip' },
      { name: 'KNEE', pos: knee, key: 'knee' },
      { name: 'ANKLE', pos: ankle, key: 'ankle' },
    ];

    joints.forEach((j) => {
      const isHighlighted = j.key === kf.highlightJoint;
      ctx.fillStyle = isHighlighted ? '#EF4444' : '#10B981';
      ctx.beginPath();
      ctx.arc(j.pos[0], j.pos[1], isHighlighted ? 8 : 5, 0, Math.PI * 2);
      ctx.fill();

      if (isHighlighted) {
        // Pulsing target ring around fault joint
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(j.pos[0], j.pos[1], 16, 0, Math.PI * 2);
        ctx.stroke();

        // Angle arc callout box
        const boxX = Math.min(Math.max(j.pos[0] + 22, 20), w - 260);
        const boxY = Math.min(Math.max(j.pos[1] - 32, 20), h - 85);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.9)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, 240, 62, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FBBF24';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.fillText(
          `DEDUCTION: -${activeDeduction.deductionValue.toFixed(2)} (${activeDeduction.timeFormatted})`,
          boxX + 10,
          boxY + 18
        );

        ctx.fillStyle = '#F8FAFC';
        ctx.font = '11px Inter, sans-serif';
        ctx.fillText(
          `Measured: ${activeDeduction.measuredDeg}° vs Target ${activeDeduction.targetDeg}°`,
          boxX + 10,
          boxY + 36
        );

        ctx.fillStyle = '#38BDF8';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(
          `Vitals Ratio: ${athlete.vitals.torsoToLegRatio} Torso:Leg`,
          boxX + 10,
          boxY + 52
        );
      }
    });
  }, [
    isOpen,
    currentTime,
    activeDeduction,
    showSkeletonHUD,
    isPlaying,
    activeSession,
    athlete.vitals.torsoToLegRatio,
    isLiveCamera,
    uploadedVideoUrl,
  ]);

  if (!isOpen) return null;

  const handleRunNewAIScan = () => {
    setIsScanningAI(true);
    setIsPlaying(false);
    setTimeout(() => {
      const targetSkill = skills.find((s) => s.id === selectedSkillId) || skills[0];
      const newSessionId = `ai-sess-${Date.now()}`;
      const isRoutine = judgeMode === 'mock_meet_routine';

      const newSession: AIJudgeSession = {
        id: newSessionId,
        athleteId: athlete.id,
        apparatusId: apparatus.id,
        mode: judgeMode,
        skillId: targetSkill?.id,
        title: isRoutine
          ? `USAG ${athlete.level} ${apparatus.name} — Full Routine AI Evaluation`
          : `Single-Skill AI Execution Check: ${targetSkill?.name || apparatus.name}`,
        level: athlete.level,
        recordedAt: 'Just Now (Live AI Scan)',
        durationSec: isRoutine ? 22 : 9,
        startValue: 10.0,
        totalDeductions: isRoutine ? 0.45 : 0.15,
        finalScore: isRoutine ? 9.55 : 9.85,
        specialRequirementsMet: [
          { name: `SR1: ${targetSkill?.name || 'Primary Acro/Mount'} (0.60)`, value: 0.6, met: true },
          { name: 'SR2: Amplitude & Extension Benchmark (0.40)', value: 0.4, met: true },
          { name: 'SR3: Controlled Competition Dismount (0.60)', value: 0.6, met: true },
        ],
        deductions: [
          {
            id: `ded-new-1-${Date.now()}`,
            timestampSec: 3.6,
            timeFormatted: '0:03.6',
            elementName: targetSkill?.name || 'Primary Element',
            deductionValue: 0.1,
            usagCategory: 'Amplitude / Angle',
            faultTitle:
              athlete.vitals.shoulderFlexionDeg < 175
                ? `Shoulder block angle (${athlete.vitals.shoulderFlexionDeg - 2}° vs 180° target)`
                : 'Slight pike compression delay on turnover',
            measuredAngleLabel: `Measured Joint Angle: ${athlete.vitals.shoulderFlexionDeg - 2}° (USAG Target: 180°)`,
            measuredDeg: athlete.vitals.shoulderFlexionDeg - 2,
            targetDeg: 180,
            vitalsCorrelation: `Matched to ${athlete.name}’s Vitals Profile (${athlete.vitals.torsoToLegRatio} Torso:Leg ratio, ${athlete.vitals.shoulderFlexionDeg}° Shoulder ROM, ${athlete.vitals.ankleDorsiflexionDeg}° Ankle ROM).`,
            linkedDrillId:
              athlete.vitals.shoulderFlexionDeg < 175
                ? 'drill-butcher-block'
                : 'drill-compression-pulses',
            coachApproved: true,
            poseKeyframes: {
              head: [0.46, 0.34],
              shoulder: [0.48, 0.44],
              elbow: [0.48, 0.56],
              wrist: [0.48, 0.68],
              hip: [0.54, 0.36],
              knee: [0.64, 0.28],
              ankle: [0.74, 0.22],
              highlightJoint: athlete.vitals.shoulderFlexionDeg < 175 ? 'shoulder' : 'hip',
            },
          },
          ...(isRoutine
            ? [
                {
                  id: `ded-new-2-${Date.now()}`,
                  timestampSec: 16.4,
                  timeFormatted: '0:16.4',
                  elementName: 'Dismount Landing Stick',
                  deductionValue: 0.15,
                  usagCategory: 'Landing / Stick' as const,
                  faultTitle: 'Small hop on landing absorption',
                  measuredAngleLabel: `Ankle Dorsiflexion Absorption: ${athlete.vitals.ankleDorsiflexionDeg}° (Target: 34°)`,
                  measuredDeg: athlete.vitals.ankleDorsiflexionDeg,
                  targetDeg: 34,
                  vitalsCorrelation: `Increasing ${athlete.name}’s ankle dorsiflexion from ${athlete.vitals.ankleDorsiflexionDeg}° to 34° absorbs landing impact without a forward hop.`,
                  linkedDrillId: 'drill-ankle-dorsi-band',
                  coachApproved: true,
                  poseKeyframes: {
                    head: [0.58, 0.28] as [number, number],
                    shoulder: [0.57, 0.4] as [number, number],
                    elbow: [0.65, 0.36] as [number, number],
                    wrist: [0.72, 0.32] as [number, number],
                    hip: [0.52, 0.57] as [number, number],
                    knee: [0.59, 0.72] as [number, number],
                    ankle: [0.55, 0.85] as [number, number],
                    highlightJoint: 'ankle' as const,
                  },
                },
              ]
            : []),
        ],
        coachSummaryNote: `AI Digital Judge evaluated ${athlete.name}'s ${isRoutine ? 'Full Routine' : 'Single Skill'} against USAG ${athlete.level} Code of Points and cross-referenced her ${athlete.vitals.torsoToLegRatio} Torso:Leg ratio.`,
        publishedToPortal: true,
      };

      onCreateSession(newSession);
      setSelectedSessionId(newSession.id);
      setIsScanningAI(false);
      setIsPlaying(true);
    }, 900);
  };

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedVideoUrl(url);
    setIsLiveCamera(false);
    handleRunNewAIScan();
  };

  const handleStartLiveCamera = async () => {
    try {
      setIsLiveCamera(true);
      setUploadedVideoUrl(null);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }
    } catch {
      // Fallback gracefully in sandboxed environments without webcam hardware
      setIsLiveCamera(false);
    }
  };

  const handleAssignLinkedDrill = (deduction: AIDeductionItem) => {
    const drill = drills.find((d) => d.id === deduction.linkedDrillId);
    if (!drill) return;
    onAssignDrillFromAI(
      athlete.id,
      drill.id,
      activeSession?.skillId || skills[0]?.id || 'skill-wag-ub-kip',
      `AI Judge detected -${deduction.deductionValue.toFixed(2)} at ${deduction.timeFormatted} (${deduction.measuredAngleLabel}). ${deduction.vitalsCorrelation}`
    );
    setAssignedFeedbackToast(`Assigned "${drill.title}" to ${athlete.name}'s Home Plan!`);
    setTimeout(() => setAssignedFeedbackToast(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 md:p-6 overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-[#0B1120] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Top Broadcast Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-gradient-to-r from-slate-900 via-[#0F172A] to-indigo-950/60 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  USAG AI Digital Judge v2.4
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Pose Telemetry + Vitals Correlation
                </span>
              </div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                {athlete.name} — {activeSession?.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!readOnlyPortalMode && (
              <div className="flex items-center bg-slate-900/90 p-1 rounded-lg border border-slate-700/80">
                <button
                  onClick={() => setJudgeMode('single_skill')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    judgeMode === 'single_skill'
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Single-Skill Check
                </button>
                <button
                  onClick={() => setJudgeMode('mock_meet_routine')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    judgeMode === 'mock_meet_routine'
                      ? 'bg-indigo-500 text-white shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Full-Routine "Mock Meet"
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              aria-label="Close AI Digital Judge"
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast notification when drill is assigned */}
        {assignedFeedbackToast && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-5 py-2.5 flex items-center justify-between text-emerald-200 text-xs font-medium">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {assignedFeedbackToast}
            </span>
            <span className="text-[11px] font-mono text-emerald-300">Synced to Parent Portal</span>
          </div>
        )}

        {/* Main Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left 7 Columns: Video & Biomechanical Pose Canvas + Timeline Scrubber */}
          <div className="lg:col-span-7 p-5 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between bg-[#080C16]">
            {/* Session Selector + Capture Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <select
                  aria-label="Select AI Evaluated Session"
                  value={activeSession?.id || ''}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
                >
                  {athleteSessions.map((sess) => (
                    <option key={sess.id} value={sess.id}>
                      [{sess.mode === 'mock_meet_routine' ? 'MOCK MEET' : 'SKILL'}] {sess.title} ({sess.finalScore.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              {!readOnlyPortalMode && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleStartLiveCamera}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                  >
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    Record Camera
                  </button>

                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5 text-indigo-400" />
                    Upload Video
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={handleRunNewAIScan}
                    disabled={isScanningAI}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    {isScanningAI ? 'Judging Routine...' : 'Run AI Judge'}
                  </button>
                </div>
              )}
            </div>

            {/* Interactive Biomechanics Canvas Viewport */}
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#050811] aspect-video flex items-center justify-center">
              {(isLiveCamera || uploadedVideoUrl) && (
                <video
                  ref={videoRef}
                  src={uploadedVideoUrl || undefined}
                  className="absolute inset-0 w-full h-full object-cover opacity-55"
                  loop
                  muted
                  playsInline
                  autoPlay
                />
              )}

              <canvas
                ref={canvasRef}
                width={680}
                height={382}
                className="relative z-10 w-full h-full object-contain"
              />

              {/* Top-left Telemetry Overlay Pill */}
              <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2 pointer-events-none">
                <span className="px-2.5 py-1 rounded-md bg-slate-950/85 border border-slate-700/80 text-[11px] font-mono text-cyan-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  POSE LOCK: 60 FPS
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-950/85 border border-slate-700/80 text-[11px] font-mono text-slate-300">
                  TORSO:LEG {athlete.vitals.torsoToLegRatio} | SHOULDER ROM {athlete.vitals.shoulderFlexionDeg}°
                </span>
              </div>

              {/* Top-right Skeleton HUD Toggle */}
              <div className="absolute top-3 right-3 z-20">
                <button
                  onClick={() => setShowSkeletonHUD(!showSkeletonHUD)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition ${
                    showSkeletonHUD
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200'
                      : 'bg-slate-900/80 border-slate-700 text-slate-400'
                  }`}
                >
                  {showSkeletonHUD ? 'HUD OVERLAY: ON' : 'HUD OVERLAY: OFF'}
                </button>
              </div>

              {/* AI Scanning Overlay */}
              {isScanningAI && (
                <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                  <p className="text-sm font-bold text-cyan-300 font-mono">
                    EXTRACTING 33 BIOMECHANICAL KEYPOINTS & USAG DEDUCTIONS...
                  </p>
                  <p className="text-xs text-slate-400">
                    Calibrating against {athlete.name}’s Vitals ({athlete.vitals.heightCm}cm, {athlete.vitals.torsoToLegRatio} limb ratio)
                  </p>
                </div>
              )}
            </div>

            {/* Scrubber & Timestamped Deduction Markers */}
            <div className="mt-4 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition"
                    aria-label={isPlaying ? 'Pause Routine' : 'Play Routine'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setCurrentTime(0)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    aria-label="Restart Video"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono text-slate-300 ml-1">
                    0:{currentTime.toFixed(1).padStart(4, '0')} / 0:{activeSession?.durationSec.toFixed(1)}s
                  </span>
                </div>

                <span className="text-[11px] font-mono text-amber-300">
                  Click any red deduction pin to jump to exact joint angle frame
                </span>
              </div>

              {/* Timeline Track with Deduction Pins */}
              <div className="relative h-8 bg-slate-950 rounded-lg border border-slate-800 flex items-center px-2">
                {/* Progress bar fill */}
                <div
                  className="h-2 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      (currentTime / (activeSession?.durationSec || 20)) * 100
                    )}%`,
                  }}
                />

                {/* Deduction Timestamp Pins */}
                {activeSession?.deductions.map((ded) => {
                  const leftPct = Math.min(
                    94,
                    Math.max(4, (ded.timestampSec / activeSession.durationSec) * 100)
                  );
                  const isSelected = activeDeduction?.id === ded.id;
                  return (
                    <button
                      key={ded.id}
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentTime(ded.timestampSec);
                        setActiveDeductionId(ded.id);
                      }}
                      style={{ left: `${leftPct}%` }}
                      className={`absolute -top-1.5 -translate-x-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                        isSelected
                          ? 'bg-red-500 text-white scale-110 ring-2 ring-amber-300 z-20'
                          : 'bg-amber-500/90 text-slate-950 hover:scale-105 z-10'
                      }`}
                      title={`${ded.timeFormatted}: -${ded.deductionValue.toFixed(2)} ${ded.faultTitle}`}
                    >
                      -{ded.deductionValue.toFixed(2)}
                    </button>
                  );
                })}
              </div>

              {/* Special Requirements Bar */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono uppercase text-slate-400">
                  USAG Requirements:
                </span>
                {activeSession?.specialRequirementsMet.map((sr, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px]"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {sr.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Official USAG Scoreboard & Itemized Vitals-Linked Deductions */}
          <div className="lg:col-span-5 p-5 flex flex-col justify-between bg-[#0B1120] max-h-[82vh] overflow-y-auto">
            <div>
              {/* Official USAG Meet Scoreboard Card */}
              <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-700/80 mb-4">
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-center">
                  <div className="text-[10px] font-mono uppercase text-slate-400">
                    Start Value (SV)
                  </div>
                  <div className="text-2xl font-black font-mono text-sky-400 mt-0.5">
                    {activeSession?.startValue.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">All SRs Met</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-center">
                  <div className="text-[10px] font-mono uppercase text-slate-400">
                    E-Score Deductions
                  </div>
                  <div className="text-2xl font-black font-mono text-amber-400 mt-0.5">
                    -{activeSession?.totalDeductions.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {activeSession?.deductions.length} Faults Logged
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-center">
                  <div className="text-[10px] font-mono uppercase text-emerald-300 font-bold">
                    Final Judge Score
                  </div>
                  <div className="text-3xl font-black font-mono text-emerald-400 mt-0.5">
                    {activeSession?.finalScore.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-amber-300 font-medium mt-0.5">
                    9.75+ Potential
                  </div>
                </div>
              </div>

              {/* Itemized Deduction List */}
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-cyan-400" />
                  Timestamped USAG Deduction Breakdown
                </h3>
                <span className="text-[11px] text-slate-400">Tap item to inspect angle</span>
              </div>

              <div className="space-y-2.5">
                {activeSession?.deductions.map((ded) => {
                  const isSelected = activeDeduction?.id === ded.id;
                  const linkedDrill = drills.find((d) => d.id === ded.linkedDrillId);

                  return (
                    <div
                      key={ded.id}
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentTime(ded.timestampSec);
                        setActiveDeductionId(ded.id);
                      }}
                      className={`p-3.5 rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900/95 border-cyan-500/70 shadow-lg shadow-cyan-500/10'
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-xs font-bold">
                            {ded.timeFormatted}
                          </span>
                          <span className="text-xs font-bold text-white">{ded.elementName}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-red-300 font-mono text-xs font-bold">
                          -{ded.deductionValue.toFixed(2)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-200 font-medium mt-1.5">{ded.faultTitle}</p>

                      {/* Angle Telemetry Badge */}
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-[11px] font-mono text-amber-300">
                        <Activity className="w-3.5 h-3.5 text-amber-400" />
                        {ded.measuredAngleLabel}
                      </div>

                      {/* Vitals Correlation Insight Box */}
                      <div className="mt-2 p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-200 leading-relaxed">
                        <span className="font-bold text-cyan-300">Biomechanical Vitals Insight: </span>
                        {ded.vitalsCorrelation}
                      </div>

                      {/* Linked Home Exercise Prescription CTA */}
                      {linkedDrill && (
                        <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                          <div className="text-[11px] text-slate-300">
                            <span className="text-emerald-400 font-semibold">Fix Drill: </span>
                            {linkedDrill.title} ({linkedDrill.setsReps})
                          </div>
                          {!readOnlyPortalMode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssignLinkedDrill(ded);
                              }}
                              className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold transition"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              Prescribe to Home Plan
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Coach Summary Note & Transparency Footer */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono uppercase text-cyan-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Coach & AI Takeaway for Parents
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  Published to Parent Portal
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeSession?.coachSummaryNote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
