import { motion } from 'framer-motion';
import { Clock, Flame, Heart } from 'lucide-react';
import { formatDate } from '../lib/utils.js';

export default function WorkoutList({ partner1, partner2 }) {
  const p1Workouts = (partner1?.workouts ?? []).map(w => ({ ...w, partner: partner1?.name, color: '#8b5cf6' }));
  const p2Workouts = (partner2?.workouts ?? []).map(w => ({ ...w, partner: partner2?.name, color: '#f43f5e' }));

  // Interleave and sort by date descending
  const all = [...p1Workouts, ...p2Workouts].sort((a, b) =>
    (b.date ?? '').localeCompare(a.date ?? '')
  ).slice(0, 10);

  if (all.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-600">
        <span className="text-4xl mb-3">🎯</span>
        <p className="text-sm">No workouts this week</p>
        <p className="text-xs mt-1">Connect your devices to see workout history</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {all.map((w, i) => (
        <motion.div
          key={w.id ?? i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className="flex items-center gap-3 p-3 rounded-xl border border-white/6 bg-white/2 hover:bg-white/4 transition-colors"
        >
          {/* Sport emoji */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: `${w.color}15`, border: `1px solid ${w.color}25` }}>
            {w.sportEmoji ?? '💪'}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white truncate">{w.sport}</span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                style={{ background: `${w.color}20`, color: w.color }}>
                {w.partner}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              {w.duration > 0 && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock size={10} />
                  {w.duration}m
                </span>
              )}
              {(w.strain || w.effort) > 0 && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Heart size={10} />
                  {(w.strain ?? w.effort)?.toFixed(1)}
                </span>
              )}
              {w.calories > 0 && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Flame size={10} />
                  {w.calories} kcal
                </span>
              )}
            </div>
          </div>

          {/* Date */}
          <span className="text-[10px] text-slate-600 flex-shrink-0">{formatDate(w.date)}</span>
        </motion.div>
      ))}
    </div>
  );
}
