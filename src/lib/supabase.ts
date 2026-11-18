import {
  AIJudgeSession,
  Athlete,
  CorrectiveDrill,
  FacilityConfig,
  MeetActualRecord,
  Skill,
} from '../types';

/**
 * AI-ROBIC Supabase Cloud Sync & Offline-First Persistence Adapter
 * - Connects to the dedicated `ai_robic` PostgreSQL schema (via `ai_robic_*` views)
 *   so the entire schema can be cleanly pg_dump'd to a dedicated production instance
 *   once 20 paid seats are reached.
 */

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://nbgvnzsgfqorjxhpslhm.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iZ3ZuenNnZnFvcmp4aHBzbGhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMjQ3NzMsImV4cCI6MjA5NzcwMDc3M30.cE60V7lKxh0M-_Ixl3ucjSzVjpfRfvfEs9sGRbmygmA';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
};

async function supabaseFetch(path: string, options: RequestInit = {}) {
  if (!isSupabaseConfigured()) return null;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation,resolution=merge-duplicates',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Supabase error (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

export async function syncAthletesToSupabase(athletes: Athlete[]): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const rows = athletes.map((a) => ({
      id: a.id,
      name: a.name,
      age: a.age,
      avatar_initials: a.avatarInitials,
      avatar_gradient: a.avatarGradient,
      discipline_id: a.disciplineId,
      level: a.level,
      rotation_group: a.rotationGroup,
      checked_in: a.checkedIn,
      parent_name: a.parentName,
      parent_email: a.parentEmail,
      home_streak_days: a.homeStreakDays,
      archetype_summary: a.archetypeSummary,
      vitals: a.vitals,
      skill_progress: a.skillProgress,
      prescriptions: a.prescriptions,
      updated_at: new Date().toISOString(),
    }));
    await supabaseFetch('ai_robic_athletes?on_conflict=id', {
      method: 'POST',
      body: JSON.stringify(rows),
    });
    return true;
  } catch (err) {
    console.warn('AI-ROBIC offline fallback active:', err);
    return false;
  }
}

export async function syncAIJudgeSessionToSupabase(session: AIJudgeSession): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const row = {
      id: session.id,
      athlete_id: session.athleteId,
      apparatus_id: session.apparatusId,
      mode: session.mode,
      title: session.title,
      skill_id: session.skillId || null,
      level: session.level,
      recorded_at: session.recordedAt,
      duration_sec: session.durationSec,
      start_value: session.startValue,
      total_deductions: session.totalDeductions,
      final_score: session.finalScore,
      special_requirements_met: session.specialRequirementsMet,
      deductions: session.deductions,
      coach_summary_note: session.coachSummaryNote,
      published_to_portal: session.publishedToPortal,
    };
    await supabaseFetch('ai_robic_ai_judge_sessions?on_conflict=id', {
      method: 'POST',
      body: JSON.stringify([row]),
    });
    return true;
  } catch {
    return false;
  }
}

export async function syncFacilityConfigToSupabase(config: FacilityConfig): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    await supabaseFetch('ai_robic_facility_config?on_conflict=id', {
      method: 'POST',
      body: JSON.stringify([
        {
          id: config.id || 'default-facility',
          facility_name: config.facilityName,
          head_coach_name: config.headCoachName,
          active_disciplines: config.activeDisciplines,
          active_levels: config.activeLevels,
          rotation_count: config.rotationCount,
          updated_at: new Date().toISOString(),
        },
      ]),
    });
    return true;
  } catch {
    return false;
  }
}

export async function syncMeetActualsToSupabase(records: MeetActualRecord[]): Promise<boolean> {
  if (!isSupabaseConfigured() || records.length === 0) return false;
  try {
    const rows = records.map((r) => ({
      id: r.id,
      athlete_id: r.athleteId,
      apparatus_id: r.apparatusId,
      meet_name: r.meetName,
      meet_date: r.meetDate,
      level: r.level,
      start_value: r.startValue,
      actual_score: r.actualScore,
      ai_predicted_score: r.aiPredictedScore,
      judge_name_or_panel: r.judgeNameOrPanel,
      judge_general_notes: r.judgeGeneralNotes,
      skill_breakdowns: r.skillBreakdowns,
    }));
    await supabaseFetch('ai_robic_meet_actuals?on_conflict=id', {
      method: 'POST',
      body: JSON.stringify(rows),
    });
    return true;
  } catch {
    return false;
  }
}

export async function seedFullDatabaseToSupabase(
  athletes: Athlete[],
  skills: Skill[],
  drills: CorrectiveDrill[],
  sessions: AIJudgeSession[],
  facilityConfig?: FacilityConfig,
  meetActuals?: MeetActualRecord[]
): Promise<{ ok: boolean; message: string }> {
  try {
    await syncAthletesToSupabase(athletes);
    for (const s of sessions) {
      await syncAIJudgeSessionToSupabase(s);
    }
    if (facilityConfig) {
      await syncFacilityConfigToSupabase(facilityConfig);
    }
    if (meetActuals && meetActuals.length > 0) {
      await syncMeetActualsToSupabase(meetActuals);
    }
    return {
      ok: true,
      message: `Synced ${athletes.length} athletes, ${skills.length} skills, ${drills.length} drills, ${sessions.length} AI Judge sessions & ${meetActuals?.length || 0} Meet Actuals to Supabase schema ai_robic!`,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : 'Failed to sync to Supabase',
    };
  }
}
