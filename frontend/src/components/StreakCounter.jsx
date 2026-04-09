import { motion } from 'framer-motion';

export default function StreakCounter({ jointStreak = 0, partner1Streak = 0, partner2Streak = 0, partner1Name = 'Alex', partner2Name = 'Sam' }) {
  if (jointStreak === 0 && partner1Streak === 0 && partner2Streak === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className="flex flex-col sm:flex-row items-center justify-center gap-4 px-6 py-4 rounded-2xl border border-white/8"
      style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(139,92,246,0.06) 100%)' }}
    >
      {/* Joint streak */}
      {jointStreak > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <div>
            <div className="text-lg font-bold text-white tabular-nums">
              {jointStreak}-day streak
            </div>
            <div className="text-xs text-slate-500">together</div>
          </div>
        </div>
      )}

      {jointStreak > 0 && (partner1Streak > 0 || partner2Streak > 0) && (
        <div className="hidden sm:block w-px h-8 bg-white/8" />
      )}

      {/* Individual streaks */}
      <div className="flex items-center gap-5">
        <StreakBar name={partner1Name} days={partner1Streak} color="#8b5cf6" />
        <StreakBar name={partner2Name} days={partner2Streak} color="#f43f5e" />
      </div>
    </motion.div>
  );
}

function StreakBar({ name, days, color }) {
  if (days === 0) return null;
  const bars = Math.min(days, 14);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex gap-0.5 items-end h-5">
        {Array.from({ length: bars }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className="w-1.5 rounded-sm"
            style={{
              height: `${50 + (i / bars) * 50}%`,
              background: color,
              opacity: 0.4 + (i / bars) * 0.6,
              transformOrigin: 'bottom',
            }}
          />
        ))}
      </div>
      <div className="text-center">
        <div className="text-xs font-semibold" style={{ color }}>{days}d</div>
        <div className="text-[9px] text-slate-600">{name}</div>
      </div>
    </div>
  );
}
