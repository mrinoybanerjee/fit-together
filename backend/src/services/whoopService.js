// Whoop API v1 integration with 5-min cache and refresh-on-401.
//
// Data flow:
//  getRecovery() → cache.get('whoop:recovery') → hit → return
//                                               → miss → Whoop API
//                                                        → 401 → refresh token → retry
//                                                        → error → MOCK_PARTNER1

import axios from 'axios';
import cache from './cache.js';
import { MOCK_PARTNER1 } from '../data/mockData.js';

const WHOOP_BASE = 'https://api.prod.whoop.com/developer/v1';
const WHOOP_TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';

// In-memory token store (no DB needed for personal app)
let accessToken = process.env.WHOOP_ACCESS_TOKEN || null;
let refreshToken = process.env.WHOOP_REFRESH_TOKEN || null;

function isConfigured() {
  return Boolean(accessToken);
}

async function refreshAccessToken() {
  if (!refreshToken || !process.env.WHOOP_CLIENT_ID) return false;
  try {
    const res = await axios.post(WHOOP_TOKEN_URL, new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.WHOOP_CLIENT_ID,
      client_secret: process.env.WHOOP_CLIENT_SECRET,
    }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    accessToken = res.data.access_token;
    refreshToken = res.data.refresh_token || refreshToken;
    return true;
  } catch {
    return false;
  }
}

async function whoopGet(path, retried = false) {
  if (!isConfigured()) return null;
  try {
    const res = await axios.get(`${WHOOP_BASE}${path}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data;
  } catch (err) {
    if (err.response?.status === 401 && !retried) {
      const refreshed = await refreshAccessToken();
      if (refreshed) return whoopGet(path, true);
    }
    return null;
  }
}

export async function getRecovery() {
  const cacheKey = 'whoop:recovery';
  const cached = cache.get(cacheKey);
  if (cached) return { data: cached, source: 'live' };

  const raw = await whoopGet('/recovery?limit=1');
  if (!raw?.records?.length) return { data: mockRecovery(), source: 'mock' };

  const rec = raw.records[0];
  const data = {
    recovery: Math.round(rec.score?.recovery_score ?? MOCK_PARTNER1.recovery),
    hrv: Math.round(rec.score?.hrv_rmssd_milli ?? MOCK_PARTNER1.hrv),
    restingHr: Math.round(rec.score?.resting_heart_rate ?? MOCK_PARTNER1.restingHr),
    date: rec.created_at?.split('T')[0],
  };
  cache.set(cacheKey, data);
  return { data, source: 'live' };
}

export async function getSleep() {
  const cacheKey = 'whoop:sleep';
  const cached = cache.get(cacheKey);
  if (cached) return { data: cached, source: 'live' };

  const raw = await whoopGet('/sleep?limit=7');
  if (!raw?.records?.length) return { data: MOCK_PARTNER1.sleepStages, source: 'mock' };

  const data = raw.records.map(s => ({
    date: s.start?.split('T')[0],
    total: (s.score?.stage_summary?.total_in_bed_time_milli ?? 0) / 3_600_000,
    light: (s.score?.stage_summary?.total_light_sleep_time_milli ?? 0) / 3_600_000,
    deep: (s.score?.stage_summary?.total_slow_wave_sleep_time_milli ?? 0) / 3_600_000,
    rem: (s.score?.stage_summary?.total_rem_sleep_time_milli ?? 0) / 3_600_000,
    awake: (s.score?.stage_summary?.total_awake_time_milli ?? 0) / 3_600_000,
    score: s.score?.sleep_performance_percentage ?? 0,
  }));
  cache.set(cacheKey, data);
  return { data, source: 'live' };
}

export async function getWorkouts() {
  const cacheKey = 'whoop:workouts';
  const cached = cache.get(cacheKey);
  if (cached) return { data: cached, source: 'live' };

  const raw = await whoopGet('/workout?limit=5');
  if (!raw?.records?.length) return { data: MOCK_PARTNER1.workouts, source: 'mock' };

  const SPORT_EMOJI = { 0: '🏃', 1: '🚴', 44: '🏋️', 63: '⚡', 57: '🧘' };
  const data = raw.records.map(w => ({
    id: w.id,
    sport: w.sport_id?.toString() ?? 'workout',
    sportEmoji: SPORT_EMOJI[w.sport_id] ?? '💪',
    date: w.start?.split('T')[0],
    duration: Math.round(((w.score?.zone_duration?.zone_two_milli ?? 0) + (w.score?.zone_duration?.zone_three_milli ?? 0) + (w.score?.zone_duration?.zone_four_milli ?? 0) + (w.score?.zone_duration?.zone_five_milli ?? 0)) / 60000),
    strain: w.score?.strain ?? 0,
    calories: w.score?.kilojoule ? Math.round(w.score.kilojoule / 4.184) : 0,
    avgHr: w.score?.average_heart_rate ?? 0,
  }));
  cache.set(cacheKey, data);
  return { data, source: 'live' };
}

export async function getHistory() {
  const cacheKey = 'whoop:history';
  const cached = cache.get(cacheKey);
  if (cached) return { data: cached, source: 'live' };

  const raw = await whoopGet('/cycle?limit=14');
  if (!raw?.records?.length) return { data: MOCK_PARTNER1.history, source: 'mock' };

  const data = raw.records.map(c => ({
    date: c.start?.split('T')[0],
    recovery: c.score?.recovery_score ?? 0,
    hrv: c.score?.hrv_rmssd_milli ?? 0,
    strain: c.score?.strain ?? 0,
    sleep: (c.score?.sleep?.total_in_bed_time_milli ?? 0) / 3_600_000,
  })).reverse();
  cache.set(cacheKey, data);
  return { data, source: 'live' };
}

function mockRecovery() {
  return {
    recovery: MOCK_PARTNER1.recovery,
    hrv: MOCK_PARTNER1.hrv,
    restingHr: MOCK_PARTNER1.restingHr,
    date: new Date().toISOString().split('T')[0],
  };
}

export function getOAuthUrl() {
  const params = new URLSearchParams({
    client_id: process.env.WHOOP_CLIENT_ID || '',
    redirect_uri: process.env.WHOOP_REDIRECT_URI || 'http://localhost:3001/api/whoop/callback',
    response_type: 'code',
    scope: 'offline read:recovery read:sleep read:workout read:cycles read:profile',
  });
  return `https://api.prod.whoop.com/oauth/oauth2/auth?${params}`;
}

export async function handleCallback(code) {
  const res = await axios.post(WHOOP_TOKEN_URL, new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: process.env.WHOOP_CLIENT_ID,
    client_secret: process.env.WHOOP_CLIENT_SECRET,
    redirect_uri: process.env.WHOOP_REDIRECT_URI,
  }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  accessToken = res.data.access_token;
  refreshToken = res.data.refresh_token;
  console.log('[Whoop] OAuth complete. Tokens stored in memory — copy WHOOP_ACCESS_TOKEN and WHOOP_REFRESH_TOKEN to your .env file to persist them.');
  return { accessToken, refreshToken };
}
