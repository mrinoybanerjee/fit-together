import { cn } from '../lib/utils.js';

export default function MetricCard({ icon: Icon, label, value, unit, subValue, color = '#8b5cf6', className }) {
  return (
    <div className={cn(
      'flex flex-col gap-1 p-3 rounded-xl border border-white/6 bg-white/3 hover:bg-white/5 transition-colors',
      className
    )}>
      <div className="flex items-center gap-1.5">
        {Icon && <Icon size={13} style={{ color }} strokeWidth={2.5} />}
        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold tabular-nums text-white leading-none">{value ?? '—'}</span>
        {unit && <span className="text-xs text-slate-500">{unit}</span>}
      </div>
      {subValue && (
        <span className="text-[10px] text-slate-600">{subValue}</span>
      )}
    </div>
  );
}
