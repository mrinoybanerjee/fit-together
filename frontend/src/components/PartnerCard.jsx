import { motion } from 'framer-motion';
import { Activity, Moon, Heart, Footprints, Flame, Watch } from 'lucide-react';
import RecoveryRing from './RecoveryRing.jsx';
import StrainGauge from './StrainGauge.jsx';
import MetricCard from './MetricCard.jsx';
import { formatHours, formatNumber } from '../lib/utils.js';

const DEVICE_ICON = { 'WHOOP': '⌚', 'Apple Watch': '⌚' };

export default function PartnerCard({ partner, index = 0 }) {
  if (!partner) return <PartnerCardSkeleton />;

  const isWhoop = partner.device === 'WHOOP';
  const color = partner.deviceColor ?? (isWhoop ? '#8b5cf6' : '#f43f5e');
  const gradientClass = isWhoop ? 'gradient-text-partner1' : 'gradient-text-partner2';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.5, ease: 'easeOut' }}
      className="relative rounded-2xl border border-white/8 overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at top, ${color}12 0%, transparent 70%), #12121a`,
        boxShadow: `0 0 40px ${color}12`,
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${color}00, ${color}, ${color}00)` }} />

      <div className="p-5">
        {/* Header: name + device badge */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: `${color}20`, border: `1.5px solid ${color}40`, color }}>
              {partner.name?.[0] ?? '?'}
            </div>
            <div>
              <h3 className={`text-base font-bold ${gradientClass}`}>{partner.name}</h3>
              <span className="text-[10px] text-slate-500">{partner.device}</span>
            </div>
          </div>

          {/* Milestones badges */}
          {partner.milestones?.slice(0, 2).map(m => (
            <span key={m.id} title={m.label}
              className="text-base leading-none" style={{ filter: 'drop-shadow(0 0 4px gold)' }}>
              {getMilestoneEmoji(m.type)}
            </span>
          ))}
        </div>

        {/* Recovery ring + strain gauge */}
        <div className="flex items-center justify-around mb-5">
          <RecoveryRing pct={partner.recovery ?? 0} />
          <StrainGauge strain={partner.strain ?? 0} />
        </div>

        {/* Metric grid */}
        <div className="grid grid-cols-2 gap-2">
          <MetricCard
            icon={Moon}
            label="Sleep"
            value={formatHours(partner.sleepHours)}
            subValue={`${partner.sleepScore ?? 0}% performance`}
            color={color}
          />
          <MetricCard
            icon={Heart}
            label="HRV"
            value={partner.hrv}
            unit="ms"
            subValue={`${partner.restingHr ?? 0} rhr`}
            color={color}
          />
          <MetricCard
            icon={Footprints}
            label="Steps"
            value={formatNumber(partner.steps)}
            color={color}
          />
          <MetricCard
            icon={Flame}
            label="Calories"
            value={formatNumber(partner.calories)}
            unit="kcal"
            color={color}
          />
        </div>
      </div>
    </motion.div>
  );
}

function getMilestoneEmoji(type) {
  const map = {
    perfect_week: '🏆',
    step_champion: '👟',
    sleep_champion: '😴',
    power_couple: '💪',
    best_hrv: '💚',
  };
  return map[type] ?? '🎖️';
}

function PartnerCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/8 bg-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="skeleton w-9 h-9 rounded-full" />
        <div className="space-y-1.5">
          <div className="skeleton h-4 w-20" />
          <div className="skeleton h-3 w-14" />
        </div>
      </div>
      <div className="flex justify-around">
        <div className="skeleton w-36 h-36 rounded-full" />
        <div className="skeleton w-24 h-24 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-16 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
