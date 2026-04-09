// Terra API v2 integration (Apple Watch / HealthKit bridge) with 5-min cache.
//
// Data flow:
//  getDailyStats() → cache.get('terra:daily') → hit → return
//                                              → miss → Terra API
//                                                       → error → MOCK_PARTNER2

import axios from 'axios';
import cache from './cache.js';
import { MOCK_PARTNER2 } from '../data/mockData.js';

const TERRA_BASE = 'https://api.tryterra.co/v2';

function isConfigured() {
  return Boolean(process.env.TERRA_API_KEY && process.env.TERRA_DEV_ID);
}

function terraHeaders() {
  return {
    'dev-id': process.env.TERRA_DEV_ID,
    'x-api-key': process.env.TERRA_API_KEY,
  };
}

async function terraGet(path, params = {}) {
  if (!isConfigured()) return null;
  try {
    const res = await axios.get(`${TERRA_BASE}${path}`, {
      headers: terraHeaders(),
      params: { start_date: daysAgo(14), end_date: daysAgo(0), ...params },
    });
    return res.data;
  } catch (err) {
    console.error('[Terra] API error:', err.response?.status, err.message);
    return null;
  }
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export async function getDailyStats() {
  const cacheKey = 'terra:daily';
  const cached = cache.get(cacheKey);
  if (cached) return { data: cached, source: 'live' };

  const raw = await terraGet('/daily');
  if (!raw?.data?.length) return { data: mockDailyStats(), source: 'mock' };

  const today = raw.data[raw.data.length - 1];
  const data = {
    steps: today.distance_data?.steps ?? MOCK_PARTNER2.steps,
    calories: Math.round(today.calories_data?.total_burned_calories ?? MOCK_PARTNER2.calories),
    restingHr: today.heart_rate_data?.summary?.resting_hr_bpm ?? MOCK_PARTNER2.restingHr,
    hrv: today.heart_rate_data?.summary?.hrv_rmssd_samples?.[0]?.hrv ?? MOCK_PARTNER2.hrv,
    date: today.metadata?.start_time?.split('T')[0] ?? daysAgo(0),
  };
  cache.set(cacheKey, data);
  return { data, source: 'live' };
}

export async function getSleep() {
  const cacheKey = 'terra:sleep';
  const cached = cache.get(cacheKey);
  if (cached) return { data: cached, source: 'live' };

  const raw = await terraGet('/sleep');
  if (!raw?.data?.length) return { data: MOCK_PARTNER2.sleepStages, source: 'mock' };

  const data = raw.data.slice(-7).map(s => ({
    date: s.metadata?.start_time?.split('T')[0],
    total: (s.sleep_durations_data?.sleep_efficiency?.total_sleep_duration_seconds ?? 0) / 3600,
    light: (s.sleep_durations_data?.stages?.light_sleep_duration_seconds ?? 0) / 3600,
    deep: (s.sleep_durations_data?.stages?.deep_sleep_duration_seconds ?? 0) / 3600,
    rem: (s.sleep_durations_data?.stages?.rem_sleep_duration_seconds ?? 0) / 3600,
    awake: (s.sleep_durations_data?.stages?.awake_duration_seconds ?? 0) / 3600,
    score: s.sleep_durations_data?.sleep_efficiency?.sleep_efficiency_percentage ?? 0,
  }));
  cache.set(cacheKey, data);
  return { data, source: 'live' };
}

export async function getWorkouts() {
  const cacheKey = 'terra:workouts';
  const cached = cache.get(cacheKey);
  if (cached) return { data: cached, source: 'live' };

  const raw = await terraGet('/activity');
  if (!raw?.data?.length) return { data: MOCK_PARTNER2.workouts, source: 'mock' };

  const SPORT_MAP = {
    'running': { emoji: '🏃' }, 'cycling': { emoji: '🚴' },
    'yoga': { emoji: '🧘' }, 'swimming': { emoji: '🏊' },
    'strength_training': { emoji: '🏋️' },
  };
  const data = raw.data.slice(-5).map(w => {
    const type = w.metadata?.type?.toLowerCase() ?? 'workout';
    return {
      id: w.metadata?.id ?? Math.random().toString(36).slice(2),
      sport: type.charAt(0).toUpperCase() + type.slice(1),
      sportEmoji: SPORT_MAP[type]?.emoji ?? '💪',
      date: w.metadata?.start_time?.split('T')[0],
      duration: Math.round((w.active_durations_data?.activity_seconds ?? 0) / 60),
      effort: w.scores?.effort_level ?? 5,
      calories: Math.round(w.calories_data?.total_burned_calories ?? 0),
      avgHr: w.heart_rate_data?.summary?.avg_hr_bpm ?? 0,
    };
  });
  cache.set(cacheKey, data);
  return { data, source: 'live' };
}

export async function getHistory() {
  const cacheKey = 'terra:history';
  const cached = cache.get(cacheKey);
  if (cached) return { data: cached, source: 'live' };

  const raw = await terraGet('/daily');
  if (!raw?.data?.length) return { data: MOCK_PARTNER2.history, source: 'mock' };

  const data = raw.data.map(d => ({
    date: d.metadata?.start_time?.split('T')[0],
    recovery: Math.round((d.scores?.recovery_score ?? 0) * 100),
    hrv: d.heart_rate_data?.summary?.hrv_rmssd_samples?.[0]?.hrv ?? 0,
    strain: 0, // Terra doesn't have strain
    sleep: (d.sleep_data?.sleep_duration_planned_seconds ?? 0) / 3600,
    steps: d.distance_data?.steps ?? 0,
  }));
  cache.set(cacheKey, data);
  return { data, source: 'live' };
}

function mockDailyStats() {
  return {
    steps: MOCK_PARTNER2.steps,
    calories: MOCK_PARTNER2.calories,
    restingHr: MOCK_PARTNER2.restingHr,
    hrv: MOCK_PARTNER2.hrv,
    date: daysAgo(0),
  };
}
