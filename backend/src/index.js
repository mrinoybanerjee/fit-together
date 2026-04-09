import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import authRouter from './routes/auth.js';
import whoopRouter from './routes/whoop.js';
import terraRouter from './routes/terra.js';
import partnersRouter from './routes/partners.js';
import { attachWebSocket } from './websocket/wsServer.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS — allow Vite dev server and production origin
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173', // Vite preview
  ],
  credentials: true,
}));

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/whoop', whoopRouter);
app.use('/api/terra', terraRouter);
app.use('/api/partners', partnersRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.path}` });
});

// Error handler
app.use((err, req, res, _next) => {
  console.error('[Server Error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Create HTTP server and attach WebSocket
const server = createServer(app);
attachWebSocket(server);

server.listen(PORT, () => {
  console.log(`\n🏃 FitTogether backend running on http://localhost:${PORT}`);
  console.log(`💡 Demo login: demo@fittogether.com / demo123`);
  console.log(`📡 WebSocket: ws://localhost:${PORT}/ws?token=<JWT>\n`);
});

export { app };
