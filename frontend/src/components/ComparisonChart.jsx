import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, Area, AreaChart,
} from 'recharts';
import { formatDate } from '../lib/utils.js';

const METRICS = [
  { key: 'recovery', label: 'Recovery', unit: '%', domain: [0, 100] },
  { key: 'hrv', label: 'HRV', unit: 'ms', domain: ['auto', 'auto'] },
  { key: 'sleep', label: 'Sleep', unit: 'h', domain: [0, 10] },
  { key: 'strain', label: 'Strain', unit: '', domain: [0, 21] },
];

const P1_COLOR = '#8b5cf6';
const P2_COLOR = '#f43f5e';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs space-y-1">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="font-semibold text-white">{p.value?.toFixed(1)}{p.unit}</span>
        </div>
      ))}
    </div>
  );
}

export default function ComparisonChart({ partner1, partner2 }) {
  const [activeMetric, setActiveMetric] = useState('recovery');

  const metric = METRICS.find(m => m.key === activeMetric);
  const p1Name = partner1?.name ?? 'Partner 1';
  const p2Name = partner2?.name ?? 'Partner 2';

  // Merge histories by date
  const data = buildChartData(partner1?.history, partner2?.history, activeMetric);

  return (
    <div className="space-y-4">
      {/* Metric selector */}
      <div className="flex gap-2 flex-wrap">
        {METRICS.map(m => (
          <button
            key={m.key}
            onClick={() => setActiveMetric(m.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              activeMetric === m.key
                ? 'bg-partner1/20 text-partner1 border border-partner1/40'
                : 'text-slate-500 border border-white/8 hover:text-slate-300 hover:border-white/16'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="gradP1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={P1_COLOR} stopOpacity={0.25} />
              <stop offset="95%" stopColor={P1_COLOR} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradP2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={P2_COLOR} stopOpacity={0.2} />
              <stop offset="95%" stopColor={P2_COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />

          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={2}
          />
          <YAxis
            domain={metric.domain}
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="p1"
            name={p1Name}
            stroke={P1_COLOR}
            strokeWidth={2}
            fill="url(#gradP1)"
            dot={false}
            activeDot={{ r: 4, fill: P1_COLOR }}
            unit={metric.unit}
          />
          <Area
            type="monotone"
            dataKey="p2"
            name={p2Name}
            stroke={P2_COLOR}
            strokeWidth={2}
            fill="url(#gradP2)"
            dot={false}
            activeDot={{ r: 4, fill: P2_COLOR }}
            unit={metric.unit}
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

function buildChartData(history1 = [], history2 = [], metric) {
  const map = new Map();

  for (const d of history1) {
    map.set(d.date, { date: formatDate(d.date), p1: roundVal(d[metric]) });
  }
  for (const d of history2) {
    const existing = map.get(d.date) ?? { date: formatDate(d.date) };
    map.set(d.date, { ...existing, p2: roundVal(d[metric]) });
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);
}

function roundVal(v) {
  if (v == null) return null;
  return Math.round(v * 10) / 10;
}
