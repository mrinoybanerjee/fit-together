import { Router } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// In-memory users — fine for a personal couple's app
const USERS = [
  { email: 'demo@fittogether.com', password: 'demo123', name: 'Demo User' },
  ...(process.env.PARTNER1_EMAIL
    ? [{ email: process.env.PARTNER1_EMAIL, password: process.env.DEMO_PASSWORD || 'fittogether2024', name: process.env.PARTNER1_NAME || 'Alex' }]
    : []),
  ...(process.env.PARTNER2_EMAIL
    ? [{ email: process.env.PARTNER2_EMAIL, password: process.env.DEMO_PASSWORD || 'fittogether2024', name: process.env.PARTNER2_NAME || 'Sam' }]
    : []),
];

// POST /api/auth/login
router.post('/login', loginLimiter, (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = USERS.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { email: user.email, name: user.name },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '24h' }
  );

  res.json({ token, user: { email: user.email, name: user.name } });
});

export default router;
