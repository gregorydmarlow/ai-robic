export type DisciplineId = 'WAG' | 'MAG' | 'CHEER_TNT';

export type MasteryStage = 0 | 1 | 2 | 3 | 4;

export interface StageDefinition {
  stage: MasteryStage;
  label: string;
  shortLabel: string;
  description: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

export interface Apparatus {
  id: string;
  disciplineId: DisciplineId;
  name: string;
  shortName: string;
  code: string;
  iconName: string;
}

export interface CorrectiveDrill {
  id: string;
  title: string;
  category: 'Shoulder & Thoracic ROM' | 'Core & Compression' | 'Plyo & Block Power' | 'Hip & Split Mobility' | 'Ankle & Landing Mechanics' | 'Wrist & Bar Strength';
  setsReps: string;
  frequency: string;
  description: string;
  parentSafetyTip: string;
  videoCueTitle: string;
  targetedVitalsTrigger: string; // e.g., "Overhead Shoulder ROM < 175°" or "Long Femur / Torso Ratio"
  targetedFaultTags: string[];
}

export interface Skill {
  id: string;
  disciplineId: DisciplineId;
  level: string;
  apparatusId: string;
  name: string;
  usagCode: string;
  valuePart: string; // e.g., "A Value Part / Compulsory Major Element"
  biomechanicalFocus: string;
  idealAngles: {
    joint: string;
    targetDegrees: number;
    toleranceDegrees: number;
  }[];
  commonFaultTags: string[];
  recommendedDrillIds: string[];
  // Compulsory Bonus vs Optional Custom Repertoire metadata
  routineCategory?: 'compulsory_core' | 'compulsory_bonus' | 'optional_repertoire';
  isBonusOption?: boolean;
  bonusPoints?: number; // e.g. +0.10 or +0.20 Virtuosity / Connection Bonus
  replacesSkillId?: string; // e.g. Cast to Handstand (+Bonus) upgrades Cast to Horizontal
  difficultyRating?: 'A' | 'B' | 'C' | 'D';
  specialRequirementTag?: string; // e.g. "SR1: Bar Change", "SR2: Flight/Bonus Element", "SR3: 180° Split Leap", "SR4: Salto Dismount"
}

export interface AthleteEventRoutineConfig {
  apparatusId: string;
  routineMode: 'compulsory' | 'optional';
  selectedSkillIds: string[]; // Ordered sequence of skills in this athlete's routine
  optedInBonusSkillIds: string[]; // Compulsory Bonus / Virtuosity upgrades this athlete is attempting!
  customChoreoNotes?: string;
}

export interface AthleteVitals {
  heightCm: number;
  sittingHeightCm: number; // Used to derive torso-to-leg ratio
  legLengthCm: number;
  torsoToLegRatio: number; // e.g., 0.88 (Long-femured) vs 1.04 (Long-torso / compact legs)
  armSpanCm: number;
  apeIndexCm: number; // armSpan - height
  growthSpurtVelocityCmPerYr: number; // > 6.0 triggers Osgood-Schlatter / Sever's & lever recalibration alert
  growthCautionNote?: string;
  // Range of Motion (ROM) benchmarks
  shoulderFlexionDeg: number; // 180+ is ideal ear-covered handstand line
  bridgeThoracicDeg: number;
  hipSplitLeftDeg: number; // 180 is flat split
  hipSplitRightDeg: number;
  pikeCompressionScore: number; // 1 to 10 (palms flat to floor / chest to thighs)
  ankleDorsiflexionDeg: number; // > 32 deg ideal for squat-on and deep landings
  // Strength & Power-to-Weight Ratios
  strictPullUpsMax: number;
  hangingLegLiftsMax: number;
  hollowHoldSeconds: number;
  verticalJumpCm: number;
  lastMeasuredDate: string;
}

export interface SkillProgressEntry {
  skillId: string;
  stage: MasteryStage;
  lastUpdated: string;
  coachNote: string;
  activeFaultTags: string[];
  assignedDrillIds: string[];
  bestAiScore?: number;
  compActualStatus?: 'comp_verified' | 'comp_alert' | 'untested';
  lastCompDeduction?: number;
  lastCompJudgeNote?: string;
  history: {
    date: string;
    stage: MasteryStage;
    note: string;
    coachName: string;
  }[];
}

export interface FacilityConfig {
  id: string;
  facilityName: string;
  headCoachName: string;
  activeDisciplines: DisciplineId[];
  activeLevels: string[];
  rotationCount: number;
}

export interface MeetSkillActualItem {
  skillId: string;
  skillName: string;
  usagCode: string;
  valuePart: string;
  practiceStage: MasteryStage;
  deductionTaken: number; // e.g., 0.00 (Hit Clean), 0.10, 0.20, 0.30, 0.50 (Fall)
  judgeShorthandNote: string;
  status: 'hit_clean' | 'minor_break' | 'major_break';
}

export interface MeetActualRecord {
  id: string;
  athleteId: string;
  apparatusId: string;
  meetName: string;
  meetDate: string;
  level: string;
  startValue: number;
  actualScore: number;
  aiPredictedScore: number;
  judgeNameOrPanel: string;
  judgeGeneralNotes: string;
  skillBreakdowns: MeetSkillActualItem[];
}

export interface HomePrescriptionItem {
  id: string;
  drillId: string;
  skillId: string;
  assignedBy: string; // "Coach Elena" or "AI Digital Judge + Vitals Engine"
  assignedDate: string;
  vitalsReason: string;
  customCoachNote: string;
  completedDates: string[]; // ISO dates for streak tracking
}

export interface AIDeductionItem {
  id: string;
  timestampSec: number;
  timeFormatted: string;
  elementName: string;
  deductionValue: number; // e.g. 0.10, 0.15, 0.20, 0.30
  usagCategory: 'Execution / Form' | 'Amplitude / Angle' | 'Rhythm / Tempo' | 'Landing / Stick' | 'Artistry / Posture';
  faultTitle: string;
  measuredAngleLabel: string; // e.g. "Shoulder Block Angle: 161° (Target: 180°)"
  measuredDeg: number;
  targetDeg: number;
  vitalsCorrelation: string; // Explains how athlete's body vitals relate to this deduction
  linkedDrillId: string;
  coachApproved: boolean;
  poseKeyframes: {
    head: [number, number];
    shoulder: [number, number];
    elbow: [number, number];
    wrist: [number, number];
    hip: [number, number];
    knee: [number, number];
    ankle: [number, number];
    highlightJoint: 'shoulder' | 'hip' | 'knee' | 'ankle';
  };
}

export interface AIJudgeSession {
  id: string;
  athleteId: string;
  apparatusId: string;
  mode: 'single_skill' | 'mock_meet_routine';
  title: string;
  skillId?: string;
  level: string;
  recordedAt: string;
  durationSec: number;
  startValue: number; // e.g., 10.00
  totalDeductions: number; // e.g., 0.65
  finalScore: number; // e.g., 9.35
  specialRequirementsMet: {
    name: string;
    value: number;
    met: boolean;
  }[];
  deductions: AIDeductionItem[];
  coachSummaryNote: string;
  publishedToPortal: boolean;
}

export type RotationGroupId = 'A' | 'B' | 'C' | 'D';

export type UserPersonaRole = 'owner' | 'coach' | 'athlete' | 'parent';

export interface UserPersonaAccount {
  id: string;
  email: string;
  fullName: string;
  role: UserPersonaRole;
  facilityId: string;
  facilityName: string;
  assignedAthleteIds: string[]; // For owner: all; For coach: assigned athletes; For athlete: [selfId]; For parent: [child1, child2...]
  assignedGroups: RotationGroupId[];
  avatarInitials: string;
  avatarGradient: string;
  titleBadge: string;
}

export interface Athlete {
  id: string;
  name: string;
  age: number;
  avatarInitials: string;
  avatarGradient: string;
  disciplineId: DisciplineId;
  level: string;
  rotationGroup: RotationGroupId;
  checkedIn: boolean;
  parentName: string;
  parentEmail: string;
  homeStreakDays: number;
  vitals: AthleteVitals;
  archetypeSummary: string;
  skillProgress: Record<string, SkillProgressEntry>;
  prescriptions: HomePrescriptionItem[];
  routineConfigs?: Record<string, AthleteEventRoutineConfig>;
}
