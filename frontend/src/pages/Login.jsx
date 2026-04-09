import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Zap, Activity, Moon, TrendingUp } from 'lucide-react';
import { login } from '../lib/api.js';

const FLOATING_ICONS = [
  { Icon: Activity, x: '8%', y: '15%', size: 20, delay: 0 },
  { Icon: Heart, x: '88%', y: '12%', size: 18, delay: 0.4 },
  { Icon: Moon, x: '5%', y: '72%', size: 16, delay: 0.8 },
  { Icon: Zap, x: '92%', y: '68%', size: 20, delay: 0.3 },
  { Icon: TrendingUp, x: '15%', y: '88%', size: 16, delay: 1.1 },
  { Icon: Activity, x: '80%', y: '85%', size: 14, delay: 0.6 },
  { Icon: Heart, x: '50%', y: '6%', size: 14, delay: 0.9 },
  { Icon: Zap, x: '25%', y: '50%', size: 12, delay: 1.5 },
  { Icon: Moon, x: '75%', y: '44%', size: 12, delay: 1.2 },
];

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await login(email, password);
      localStorage.setItem('fit_token', token);
      localStorage.setItem('fit_user', JSON.stringify(user));
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error ?? 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  function fillDemo() {
    setEmail('demo@fittogether.com');
    setPassword('demo123');
    setError('');
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 30% 40%, rgba(139,92,246,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(244,63,94,0.12) 0%, transparent 60%), #0a0a0f' }}>

      {/* Floating background icons */}
      {FLOATING_ICONS.map(({ Icon, x, y, size, delay }, i) => (
        <motion.div
          key={i}
          className="absolute opacity-10 pointer-events-none"
          style={{ left: x, top: y }}
          animate={{ y: [0, -12, 0], opacity: [0.08, 0.16, 0.08] }}
          transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay, ease: 'easeInOut' }}
        >
          <Icon size={size} className="text-partner1" />
        </motion.div>
      ))}

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        <div className="glass-card p-8 shadow-2xl"
          style={{ boxShadow: '0 0 60px rgba(139,92,246,0.15), 0 25px 50px rgba(0,0,0,0.5)' }}>

          {/* Logo */}
          <motion.div
            className="text-center mb-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="relative">
                <Heart size={28} className="text-partner2 fill-partner2/30" />
                <Zap size={14} className="text-partner1 absolute -top-1 -right-1" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="gradient-text-partner1">Fit</span>
              <span className="gradient-text-partner2">Together</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1.5">
              Track your fitness journey together
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-600
                  bg-white/5 border border-white/10 focus:border-partner1/50 focus:outline-none
                  focus:ring-2 focus:ring-partner1/20 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-600
                  bg-white/5 border border-white/10 focus:border-partner1/50 focus:outline-none
                  focus:ring-2 focus:ring-partner1/20 transition-all"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-xs text-recovery-red bg-recovery-red/10 border border-recovery-red/20 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all
                bg-gradient-to-r from-partner1 to-partner1-dark hover:from-partner1-light hover:to-partner1
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-lg shadow-partner1/20 hover:shadow-partner1/30"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/8" />
            </div>
            <div className="relative flex justify-center text-xs text-slate-600">
              <span className="bg-[#12121a] px-3">or</span>
            </div>
          </div>

          {/* Demo button */}
          <button
            type="button"
            onClick={fillDemo}
            className="w-full py-2.5 rounded-xl text-sm font-medium transition-all
              border border-white/10 text-slate-300 hover:border-white/20 hover:text-white
              bg-white/3 hover:bg-white/6"
          >
            <span className="flex items-center justify-center gap-2">
              <Heart size={14} className="text-partner2" />
              Try Demo
            </span>
          </button>

          <p className="text-center text-xs text-slate-600 mt-5">
            demo@fittogether.com · demo123
          </p>
        </div>
      </motion.div>
    </div>
  );
}
