import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as whoop from '../services/whoopService.js';

const router = Router();

// All Whoop routes require auth
router.use(requireAuth);

router.get('/recovery', async (req, res) => {
  const { data, source } = await whoop.getRecovery();
  res.setHeader('X-Data-Source', source);
  res.json(data);
});

router.get('/sleep', async (req, res) => {
  const { data, source } = await whoop.getSleep();
  res.setHeader('X-Data-Source', source);
  res.json(data);
});

router.get('/workouts', async (req, res) => {
  const { data, source } = await whoop.getWorkouts();
  res.setHeader('X-Data-Source', source);
  res.json(data);
});

router.get('/history', async (req, res) => {
  const { data, source } = await whoop.getHistory();
  res.setHeader('X-Data-Source', source);
  res.json(data);
});

// OAuth2 flow — no auth required
router.get('/auth', (req, res) => {
  const url = whoop.getOAuthUrl();
  if (!process.env.WHOOP_CLIENT_ID) {
    return res.status(400).json({ error: 'WHOOP_CLIENT_ID not set in .env' });
  }
  res.redirect(url);
});

router.get('/callback', async (req, res) => {
  const { code, error } = req.query;
  if (error || !code) {
    return res.status(400).send(`<h1>Auth error: ${error || 'no code'}</h1>`);
  }
  try {
    const tokens = await whoop.handleCallback(code);
    res.send(`
      <h1>✅ Whoop Connected!</h1>
      <p>Add these to your <code>backend/.env</code>:</p>
      <pre>WHOOP_ACCESS_TOKEN=${tokens.accessToken}\nWHOOP_REFRESH_TOKEN=${tokens.refreshToken}</pre>
      <p>Then restart the server and refresh FitTogether.</p>
    `);
  } catch (err) {
    res.status(500).send(`<h1>Token exchange failed</h1><pre>${err.message}</pre>`);
  }
});

export default router;
