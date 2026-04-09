// Single source of truth for mock data — used by all services when API keys are absent.

import { subDays, format } from 'date-fns';

// Generate 14 days of history ending today
function generateHistory(partner) {
  const seeds = {
    alex: {
      recoveryBase: 78, recoveryVariance: 18,
      hrvBase: 54, hrvVariance: 14,
      strainBase: 12, strainVariance: 5,
      sleepBase: 7.2, sleepVariance: 1.2,
    },
    sam: {
      recoveryBase: 68, recoveryVariance: 20,
      hrvBase: 42, hrvVariance: 12,
      strainBase: 8, strainVariance: 4,
      sleepBase: 6.8, sleepVariance: 1.4,
    },
  };
  const s = seeds[partner];
  const history = [];
  for (let i = 13; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const rand = (base, variance) =>
      Math.round((base + (Math.random() - 0.5) * variance * 2) * 10) / 10;
    history.push({
      date,
      recovery: Math.min(100, Math.max(0, Math.round(rand(s.recoveryBase, s.recoveryVariance)))),
      hrv: Math.max(20, Math.round(rand(s.hrvBase, s.hrvVariance))),
      strain: Math.min(21, Math.max(0, rand(s.strainBase, s.strainVariance))),
      sleep: Math.max(3, rand(s.sleepBase, s.sleepVariance)),
    });
  }
  return history;
}

const WORKOUTS_ALEX = [
  { id: 'w1', sport: 'Running', sportEmoji: '🏃', date: format(subDays(new Date(), 0), 'yyyy-MM-dd'), duration: 45, strain: 14.2, calories: 520, avgHr: 158 },
  { id: 'w2', sport: 'Cycling', sportEmoji: '🚴', date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), duration: 60, strain: 12.8, calories: 680, avgHr: 148 },
  { id: 'w3', sport: 'Strength', sportEmoji: '🏋️', date: format(subDays(new Date(), 4), 'yyyy-MM-dd'), duration: 50, strain: 15.1, calories: 410, avgHr: 142 },
  { id: 'w4', sport: 'Running', sportEmoji: '🏃', date: format(subDays(new Date(), 6), 'yyyy-MM-dd'), duration: 35, strain: 10.5, calories: 390, avgHr: 152 },
  { id: 'w5', sport: 'HIIT', sportEmoji: '⚡', date: format(subDays(new Date(), 8), 'yyyy-MM-dd'), duration: 30, strain: 18.4, calories: 460, avgHr: 172 },
];

const WORKOUTS_SAM = [
  { id: 'sw1', sport: 'Yoga', sportEmoji: '🧘', date: format(subDays(new Date(), 0), 'yyyy-MM-dd'), duration: 60, effort: 4.2, calories: 280, avgHr: 98 },
  { id: 'sw2', sport: 'Running', sportEmoji: '🏃', date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), duration: 30, effort: 6.8, calories: 310, avgHr: 155 },
  { id: 'sw3', sport: 'Swimming', sportEmoji: '🏊', date: format(subDays(new Date(), 3), 'yyyy-MM-dd'), duration: 45, effort: 7.1, calories: 420, avgHr: 145 },
  { id: 'sw4', sport: 'Pilates', sportEmoji: '🤸', date: format(subDays(new Date(), 5), 'yyyy-MM-dd'), duration: 50, effort: 3.8, calories: 250, avgHr: 95 },
  { id: 'sw5', sport: 'Cycling', sportEmoji: '🚴', date: format(subDays(new Date(), 7), 'yyyy-MM-dd'), duration: 45, effort: 7.5, calories: 520, avgHr: 152 },
];

const SLEEP_STAGES_ALEX = [
  { date: format(subDays(new Date(), 6), 'yyyy-MM-dd'), light: 2.8, deep: 1.6, rem: 2.2, awake: 0.5, total: 7.1, score: 82 },
  { date: format(subDays(new Date(), 5), 'yyyy-MM-dd'), light: 3.1, deep: 1.4, rem: 2.5, awake: 0.3, total: 7.3, score: 85 },
  { date: format(subDays(new Date(), 4), 'yyyy-MM-dd'), light: 2.5, deep: 1.8, rem: 1.9, awake: 0.8, total: 7.0, score: 78 },
  { date: format(subDays(new Date(), 3), 'yyyy-MM-dd'), light: 2.9, deep: 2.0, rem: 2.4, awake: 0.2, total: 7.5, score: 88 },
  { date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), light: 2.6, deep: 1.5, rem: 2.1, awake: 0.6, total: 6.8, score: 76 },
  { date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), light: 3.2, deep: 1.7, rem: 2.6, awake: 0.4, total: 7.9, score: 90 },
  { date: format(subDays(new Date(), 0), 'yyyy-MM-dd'), light: 2.8, deep: 1.9, rem: 2.3, awake: 0.5, total: 7.5, score: 85 },
];

const SLEEP_STAGES_SAM = [
  { date: format(subDays(new Date(), 6), 'yyyy-MM-dd'), light: 2.4, deep: 1.2, rem: 1.8, awake: 0.6, total: 6.0, score: 72 },
  { date: format(subDays(new Date(), 5), 'yyyy-MM-dd'), light: 2.6, deep: 1.4, rem: 2.0, awake: 0.5, total: 6.5, score: 76 },
  { date: format(subDays(new Date(), 4), 'yyyy-MM-dd'), light: 2.2, deep: 1.0, rem: 1.6, awake: 0.9, total: 5.7, score: 65 },
  { date: format(subDays(new Date(), 3), 'yyyy-MM-dd'), light: 2.8, deep: 1.6, rem: 2.2, awake: 0.4, total: 7.0, score: 80 },
  { date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), light: 2.5, deep: 1.3, rem: 1.9, awake: 0.7, total: 6.4, score: 73 },
  { date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), light: 2.7, deep: 1.5, rem: 2.1, awake: 0.5, total: 6.8, score: 78 },
  { date: format(subDays(new Date(), 0), 'yyyy-MM-dd'), light: 2.5, deep: 1.4, rem: 1.9, awake: 0.6, total: 6.4, score: 74 },
];

export const MOCK_PARTNER1 = {
  name: process.env.PARTNER1_NAME || 'Alex',
  device: 'WHOOP',
  deviceColor: '#8b5cf6',
  // Today's snapshot
  recovery: 87,
  strain: 14.2,
  hrv: 58,
  restingHr: 48,
  sleepHours: 7.5,
  sleepPerformance: 85,
  sleepScore: 85,
  steps: 9200,
  calories: 2840,
  // History
  history: generateHistory('alex'),
  workouts: WORKOUTS_ALEX,
  sleepStages: SLEEP_STAGES_ALEX,
  // Streaks
  streakDays: 8,
  // Milestones
  milestones: [
    { id: 'm1', type: 'perfect_week', label: 'Perfect Week', date: format(subDays(new Date(), 1), 'yyyy-MM-dd') },
    { id: 'm2', type: 'step_champion', label: 'Step Champion', date: format(subDays(new Date(), 3), 'yyyy-MM-dd') },
  ],
};

export const MOCK_PARTNER2 = {
  name: process.env.PARTNER2_NAME || 'Sam',
  device: 'Apple Watch',
  deviceColor: '#f43f5e',
  // Today's snapshot
  recovery: 72,
  strain: 8.4,
  hrv: 45,
  restingHr: 56,
  sleepHours: 6.8,
  sleepPerformance: 78,
  sleepScore: 74,
  steps: 8420,
  calories: 2350,
  // History
  history: generateHistory('sam'),
  workouts: WORKOUTS_SAM,
  sleepStages: SLEEP_STAGES_SAM,
  // Streaks
  streakDays: 8,
  // Milestones
  milestones: [
    { id: 'sm1', type: 'sleep_champion', label: 'Sleep Champion', date: format(subDays(new Date(), 2), 'yyyy-MM-dd') },
    { id: 'sm2', type: 'power_couple', label: 'Power Couple', date: format(subDays(new Date(), 1), 'yyyy-MM-dd') },
  ],
};

export const MOCK_SUMMARY = {
  partner1: MOCK_PARTNER1,
  partner2: MOCK_PARTNER2,
  jointStreakDays: 8,
  lastUpdated: new Date().toISOString(),
};
