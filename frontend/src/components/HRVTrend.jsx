import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceArea, Legend,
} from 'recharts';
import { formatDate } from '../lib/utils.js';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs space-y-1">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.stroke }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="font-semibold text-white">{p.value} ms</span>
        </div>
      ))}
    </div>
  );
}

export default function HRVTrend({ partner1, partner2 }) {
  const p1Name = partner1?.name ?? 'Partner 1';
  const p2Name = partner2?.name ?? 'Partner 2';

  const data = buildHRVData(partner1?.history, partner2?.history);

  // Healthy HRV zone (reference band: 40–80ms is a reasonable healthy adult range)
  const allValues = data.flatMap(d => [d.p1, d.p2]).filter(Boolean);
  const avg = allValues.length ? allValues.reduce((a, b) => a + b, 0) / allValues.length : 50;
  const zoneMin = Math.max(20, avg - 15);
  const zoneMax = avg + 15;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <p className="text-xs text-slate-500">Heart Rate Variability — 14-day trend (ms)</p>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-recovery-green/10 text-recovery-green border border-recovery-green/20">
          Optimal zone shaded
        </span>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="hrvGradP1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="hrvGradP2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />

          {/* Optimal zone reference band */}
          <ReferenceArea
            y1={zoneMin} y2={zoneMax}
            fill="rgba(16,185,129,0.06)"
            stroke="rgba(16,185,129,0.15)"
            strokeDasharray="4 4"
            label={{ value: 'Optimal', position: 'insideTopRight', fill: '#10b981', fontSize: 10 }}
          />

          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={2}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            domain={['auto', 'auto']}
          />

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="p1"
            name={p1Name}
            stroke="#8b5cf6"
            strokeWidth={2.5}
            fill="url(#hrvGradP1)"
            dot={false}
            activeDot={{ r: 5, fill: '#8b5cf6', stroke: '#a78bfa', strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="p2"
            name={p2Name}
            stroke="#f43f5e"
            strokeWidth={2.5}
            fill="url(#hrvGradP2)"
            dot={false}
            activeDot={{ r: 5, fill: '#f43f5e', stroke: '#fb7185', strokeWidth: 2 }}
          />

          <Legend
            wrapperStyle={{ fontSize: 11, color: '#94a3b8', paddingTop: 8 }}
            iconType="circle"
            iconSize={8}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function buildHRVData(history1 = [], history2 = []) {
  const map = new Map();
  for (const d of history1) {
    map.set(d.date, { date: formatDate(d.date), p1: d.hrv ?? null });
  }
  for (const d of history2) {
    const existing = map.get(d.date) ?? { date: formatDate(d.date) };
    map.set(d.date, { ...existing, p2: d.hrv ?? null });
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
}
