import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as terra from '../services/terraService.js';

const router = Router();

router.use(requireAuth);

router.get('/daily', async (req, res) => {
  const { data, source } = await terra.getDailyStats();
  res.setHeader('X-Data-Source', source);
  res.json(data);
});

router.get('/sleep', async (req, res) => {
  const { data, source } = await terra.getSleep();
  res.setHeader('X-Data-Source', source);
  res.json(data);
});

router.get('/workouts', async (req, res) => {
  const { data, source } = await terra.getWorkouts();
  res.setHeader('X-Data-Source', source);
  res.json(data);
});

router.get('/history', async (req, res) => {
  const { data, source } = await terra.getHistory();
  res.setHeader('X-Data-Source', source);
  res.json(data);
});

export default router;
