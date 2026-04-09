import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from './Header.jsx';
import PartnerCard from './PartnerCard.jsx';
import StreakCounter from './StreakCounter.jsx';
import ComparisonChart from './ComparisonChart.jsx';
import SleepChart from './SleepChart.jsx';
import HRVTrend from './HRVTrend.jsx';
import WorkoutList from './WorkoutList.jsx';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'sleep', label: 'Sleep' },
  { id: 'workouts', label: 'Workouts' },
  { id: 'hrv', label: 'HRV Trends' },
];

export default function Dashboard({ data, loading, error, dataSource, wsStatus, lastUpdated }) {
  const [activeTab, setActiveTab] = useState('overview');
  const partner1 = data?.partner1;
  const partner2 = data?.partner2;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Header dataSource={dataSource} wsStatus={wsStatus} lastUpdated={lastUpdated} />

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="p-4 rounded-xl border border-recovery-red/20 bg-recovery-red/5 text-sm text-recovery-red">
            {error}. Showing demo data.
          </div>
        )}

        {/* Partner cards — side by side on md+, stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PartnerCard partner={partner1} index={0} />

          {/* Heart divider — hidden on mobile */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-center z-10 pointer-events-none"
            style={{ top: '50%' }}>
          </div>

          <PartnerCard partner={partner2} index={1} />
        </div>

        {/* Streak counter */}
        <StreakCounter
          jointStreak={data?.jointStreakDays ?? 0}
          partner1Streak={partner1?.streakDays ?? 0}
          partner2Streak={partner2?.streakDays ?? 0}
          partner1Name={partner1?.name}
          partner2Name={partner2?.name}
        />

        {/* Tab navigation */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/3 border border-white/6 w-fit">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute inset-0 rounded-lg bg-white/10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === 'overview' && (
            <ChartSection title="14-Day Comparison">
              <ComparisonChart partner1={partner1} partner2={partner2} />
            </ChartSection>
          )}

          {activeTab === 'sleep' && (
            <ChartSection title="Sleep Analysis">
              <SleepChart partner1={partner1} partner2={partner2} />
            </ChartSection>
          )}

          {activeTab === 'workouts' && (
            <ChartSection title="Recent Workouts">
              <WorkoutList partner1={partner1} partner2={partner2} />
            </ChartSection>
          )}

          {activeTab === 'hrv' && (
            <ChartSection title="HRV Trends">
              <HRVTrend partner1={partner1} partner2={partner2} />
            </ChartSection>
          )}
        </motion.div>
      </main>
    </div>
  );
}

function ChartSection({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/8 p-5"
      style={{ background: 'rgba(18,18,26,0.8)' }}>
      <h2 className="text-sm font-semibold text-slate-300 mb-5">{title}</h2>
      {children}
    </div>
  );
}
