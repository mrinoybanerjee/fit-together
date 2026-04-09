// WebSocket server — broadcasts partner summary every 30s.
// Auth: JWT passed as query param `?token=<JWT>` on upgrade.
// Uses cached data (no extra API calls per broadcast).

import { WebSocketServer } from 'ws';
import { parse } from 'url';
import { verifyToken } from '../middleware/auth.js';
import * as whoop from '../services/whoopService.js';
import * as terra from '../services/terraService.js';
import { MOCK_PARTNER1, MOCK_PARTNER2 } from '../data/mockData.js';

const BROADCAST_INTERVAL_MS = 30_000;

export function attachWebSocket(server) {
  const wss = new WebSocketServer({ noServer: true });

  // Authenticate on upgrade
  server.on('upgrade', (req, socket, head) => {
    // Only handle /ws upgrades
    const { pathname, query } = parse(req.url, true);
    if (pathname !== '/ws') {
      socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
      socket.destroy();
      return;
    }
    const token = query.token;

    if (!token) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    const user = verifyToken(token);
    if (!user) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    req.user = user;
    wss.handleUpgrade(req, socket, head, ws => {
      wss.emit('connection', ws, req);
    });
  });

  wss.on('connection', (ws, req) => {
    console.log(`[WS] Connected: ${req.user?.email}`);

    // Send immediately on connect
    broadcastToClient(ws);

    ws.on('error', err => console.error('[WS] Error:', err.message));
    ws.on('close', () => console.log(`[WS] Disconnected: ${req.user?.email}`));
  });

  // Broadcast to all clients every 30s
  const interval = setInterval(() => {
    if (wss.clients.size === 0) return;
    broadcastToAll(wss);
  }, BROADCAST_INTERVAL_MS);

  wss.on('close', () => clearInterval(interval));

  return wss;
}

async function buildPayload() {
  // Reads from cache — no extra API calls
  const [
    { data: recovery, source: recovSrc },
    { data: whoopHistory },
    { data: whoopSleep },
    { data: whoopWorkouts },
    { data: terraDaily, source: terraSrc },
    { data: terraSleep },
    { data: terraWorkouts },
    { data: terraHistory },
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

  const allLive = recovSrc === 'live' && terraSrc === 'live';
  const allMock = recovSrc === 'mock' && terraSrc === 'mock';

  return {
    type: 'DATA_UPDATE',
    timestamp: new Date().toISOString(),
    dataSource: allLive ? 'live' : allMock ? 'mock' : 'partial',
    partner1: {
      name: process.env.PARTNER1_NAME || MOCK_PARTNER1.name,
      device: 'WHOOP',
      deviceColor: '#8b5cf6',
      recovery: recovery.recovery ?? MOCK_PARTNER1.recovery,
      hrv: recovery.hrv ?? MOCK_PARTNER1.hrv,
      restingHr: recovery.restingHr ?? MOCK_PARTNER1.restingHr,
      strain: whoopHistory[whoopHistory.length - 1]?.strain ?? MOCK_PARTNER1.strain,
      sleepHours: whoopSleep[whoopSleep.length - 1]?.total ?? MOCK_PARTNER1.sleepHours,
      sleepScore: whoopSleep[whoopSleep.length - 1]?.score ?? MOCK_PARTNER1.sleepScore,
      steps: MOCK_PARTNER1.steps,
      calories: MOCK_PARTNER1.calories,
      history: whoopHistory,
      workouts: whoopWorkouts,
      sleepStages: whoopSleep,
    },
    partner2: {
      name: process.env.PARTNER2_NAME || MOCK_PARTNER2.name,
      device: 'Apple Watch',
      deviceColor: '#f43f5e',
      recovery: Math.round((terraDaily.hrv / 80) * 100) || MOCK_PARTNER2.recovery,
      hrv: terraDaily.hrv ?? MOCK_PARTNER2.hrv,
      restingHr: terraDaily.restingHr ?? MOCK_PARTNER2.restingHr,
      strain: MOCK_PARTNER2.strain,
      sleepHours: terraSleep[terraSleep.length - 1]?.total ?? MOCK_PARTNER2.sleepHours,
      sleepScore: terraSleep[terraSleep.length - 1]?.score ?? MOCK_PARTNER2.sleepScore,
      steps: terraDaily.steps ?? MOCK_PARTNER2.steps,
      calories: terraDaily.calories ?? MOCK_PARTNER2.calories,
      history: terraHistory,
      workouts: terraWorkouts,
      sleepStages: terraSleep,
    },
  };
}

async function broadcastToClient(ws) {
  try {
    const payload = await buildPayload();
    if (ws.readyState === 1) {
      ws.send(JSON.stringify(payload));
    }
  } catch (err) {
    console.error('[WS] Broadcast error:', err.message);
  }
}

async function broadcastToAll(wss) {
  try {
    const payload = await buildPayload();
    const msg = JSON.stringify(payload);
    for (const ws of wss.clients) {
      if (ws.readyState === 1) ws.send(msg);
    }
  } catch (err) {
    console.error('[WS] Broadcast error:', err.message);
  }
}
