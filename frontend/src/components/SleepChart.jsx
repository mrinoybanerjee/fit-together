import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, LineChart, Line, ComposedChart,
} from 'recharts';
import { formatDate } from '../lib/utils.js';

const STAGE_COLORS = {
  deep: '#6366f1',
  rem: '#8b5cf6',
  light: '#a78bfa',
  awake: '#334155',
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs space-y-1">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.filter(p => p.value > 0).map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm" style={{ background: p.fill || p.stroke }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="font-semibold text-white">{p.value?.toFixed(1)}h</span>
        </div>
      ))}
    </div>
  );
}

export default function SleepChart({ partner1, partner2 }) {
  const p1Name = partner1?.name ?? 'Partner 1';
  const p2Name = partner2?.name ?? 'Partner 2';

  const data = buildSleepData(partner1?.sleepStages, partner2?.sleepStages);

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">Sleep stages — last 7 nights (hours)</p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />

          {/* Partner 1 stages */}
          <Bar dataKey="p1_deep" name={`${p1Name} Deep`} stackId="p1" fill={STAGE_COLORS.deep} radius={[0,0,0,0]} />
          <Bar dataKey="p1_rem" name={`${p1Name} REM`} stackId="p1" fill={STAGE_COLORS.rem} />
          <Bar dataKey="p1_light" name={`${p1Name} Light`} stackId="p1" fill={STAGE_COLORS.light} radius={[4,4,0,0]} />

          {/* Partner 2 stages */}
          <Bar dataKey="p2_deep" name={`${p2Name} Deep`} stackId="p2" fill="#be185d" radius={[0,0,0,0]} />
          <Bar dataKey="p2_rem" name={`${p2Name} REM`} stackId="p2" fill="#f43f5e" />
          <Bar dataKey="p2_light" name={`${p2Name} Light`} stackId="p2" fill="#fb7185" radius={[4,4,0,0]} />

          <Legend
            wrapperStyle={{ fontSize: 10, color: '#94a3b8', paddingTop: 8 }}
            formatter={(v) => v.replace(/Partner \d /, '')}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Sleep score trend */}
      <p className="text-xs text-slate-500 pt-2">Sleep score — last 7 nights (%)</p>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="p1_score" name={`${p1Name} Score`} stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: '#8b5cf6' }} />
          <Line type="monotone" dataKey="p2_score" name={`${p2Name} Score`} stroke="#f43f5e" strokeWidth={2} dot={{ r: 3, fill: '#f43f5e' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function buildSleepData(stages1 = [], stages2 = []) {
  const map = new Map();

  for (const s of stages1.slice(-7)) {
    map.set(s.date, {
      date: formatDate(s.date),
      p1_deep: round(s.deep),
      p1_rem: round(s.rem),
      p1_light: round(s.light),
      p1_score: s.score,
    });
  }
  for (const s of stages2.slice(-7)) {
    const existing = map.get(s.date) ?? { date: formatDate(s.date) };
    map.set(s.date, {
      ...existing,
      p2_deep: round(s.deep),
      p2_rem: round(s.rem),
      p2_light: round(s.light),
      p2_score: s.score,
    });
  }

  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
}

function round(v) { return v != null ? Math.round(v * 10) / 10 : 0; }
