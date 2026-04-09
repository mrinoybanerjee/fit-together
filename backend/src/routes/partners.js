// GET /api/partners/summary — combined snapshot of both partners.
// This is the primary endpoint the frontend polls and the WebSocket broadcasts.
// X-Data-Source: 'mock' | 'live' | 'partial' (one live, one mock)

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as whoop from '../services/whoopService.js';
import * as terra from '../services/terraService.js';
import { MOCK_PARTNER1, MOCK_PARTNER2 } from '../data/mockData.js';

const router = Router();

router.use(requireAuth);

router.get('/summary', async (req, res) => {
  const [
    { data: recovery, source: recovSrc },
    { data: whoopHistory, source: histSrc },
    { data: whoopSleep, source: sleepSrc },
    { data: whoopWorkouts, source: wktSrc },
    { data: terraDaily, source: terraSrc },
    { data: terraSleep, source: terraSleepSrc },
    { data: terraWorkouts, source: terraWktSrc },
    { data: terraHistory, source: terraHistSrc },
  ] = await Promise.all([
    whoop.getRecovery(),
    whoop.getHistory(),
    whoop.getSleep(),
    whoop.getWorkouts(),
    terra.getDailyStats(),
    terra.getSleep(),
    terra.getWorkouts(),
    terra.getHistory(),
  ]);

  const partner1 = {
    name: process.env.PARTNER1_NAME || MOCK_PARTNER1.name,
    device: 'WHOOP',
    deviceColor: '#8b5cf6',
    recovery: recovery.recovery ?? MOCK_PARTNER1.recovery,
    hrv: recovery.hrv ?? MOCK_PARTNER1.hrv,
    restingHr: recovery.restingHr ?? MOCK_PARTNER1.restingHr,
    strain: whoopHistory[whoopHistory.length - 1]?.strain ?? MOCK_PARTNER1.strain,
    sleepHours: whoopSleep[whoopSleep.length - 1]?.total ?? MOCK_PARTNER1.sleepHours,
    sleepPerformance: whoopSleep[whoopSleep.length - 1]?.score ?? MOCK_PARTNER1.sleepPerformance,
    sleepScore: whoopSleep[whoopSleep.length - 1]?.score ?? MOCK_PARTNER1.sleepScore,
    steps: MOCK_PARTNER1.steps, // Whoop doesn't track steps well
    calories: MOCK_PARTNER1.calories,
    history: whoopHistory,
    workouts: whoopWorkouts,
    sleepStages: whoopSleep,
    streakDays: computeStreak(whoopHistory, 'recovery', 50),
    milestones: MOCK_PARTNER1.milestones,
  };

  const partner2 = {
    name: process.env.PARTNER2_NAME || MOCK_PARTNER2.name,
    device: 'Apple Watch',
    deviceColor: '#f43f5e',
    recovery: Math.round((terraDaily.hrv / 80) * 100) || MOCK_PARTNER2.recovery,
    hrv: terraDaily.hrv ?? MOCK_PARTNER2.hrv,
    restingHr: terraDaily.restingHr ?? MOCK_PARTNER2.restingHr,
    strain: MOCK_PARTNER2.strain,
    sleepHours: terraSleep[terraSleep.length - 1]?.total ?? MOCK_PARTNER2.sleepHours,
    sleepPerformance: terraSleep[terraSleep.length - 1]?.score ?? MOCK_PARTNER2.sleepPerformance,
    sleepScore: terraSleep[terraSleep.length - 1]?.score ?? MOCK_PARTNER2.sleepScore,
    steps: terraDaily.steps ?? MOCK_PARTNER2.steps,
    calories: terraDaily.calories ?? MOCK_PARTNER2.calories,
    history: terraHistory,
    workouts: terraWorkouts,
    sleepStages: terraSleep,
    streakDays: computeStreak(terraHistory, 'steps', 7000),
    milestones: MOCK_PARTNER2.milestones,
  };

  const sources = [recovSrc, terraSrc];
  const allLive = sources.every(s => s === 'live');
  const allMock = sources.every(s => s === 'mock');
  const dataSource = allLive ? 'live' : allMock ? 'mock' : 'partial';

  const jointStreak = Math.min(partner1.streakDays, partner2.streakDays);

  res.setHeader('X-Data-Source', dataSource);
  res.json({
    partner1,
    partner2,
    jointStreakDays: jointStreak,
    lastUpdated: new Date().toISOString(),
    dataSource,
  });
});

// Count consecutive days from most recent where metric > threshold
function computeStreak(history, metric, threshold) {
  if (!Array.isArray(history) || history.length === 0) return 0;
  let streak = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if ((history[i]?.[metric] ?? 0) >= threshold) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export default router;
