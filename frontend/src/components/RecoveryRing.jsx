import { useEffect, useRef } from 'react';
import { getRecoveryColor, ringDashOffset } from '../lib/utils.js';

const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * SVG circular recovery ring.
 * Uses CSS stroke-dashoffset transition — no JS animation loop, no layout thrash.
 */
export default function RecoveryRing({ pct = 0, size = 160, label = 'Recovery' }) {
  const pathRef = useRef(null);
  const { stroke } = getRecoveryColor(pct);
  const dashOffset = ringDashOffset(pct, RADIUS);
  const glowColor = pct >= 67 ? 'rgba(16,185,129,0.5)' : pct >= 34 ? 'rgba(245,158,11,0.5)' : 'rgba(239,68,68,0.45)';

  useEffect(() => {
    if (!pathRef.current) return;
    const t = setTimeout(() => {
      if (pathRef.current) {
        pathRef.current.style.setProperty('--dash-offset', dashOffset + 'px');
        pathRef.current.classList.add('animate');
      }
    }, 80);
    return () => clearTimeout(t);
  }, [dashOffset]);

  const center = size / 2;
  const scale = size / 100;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
          {/* Track */}
          <circle
            cx="50" cy="50" r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Animated fill */}
          <circle
            ref={pathRef}
            cx="50" cy="50" r={RADIUS}
            className="recovery-ring-fill"
            strokeWidth="8"
            stroke={stroke}
            style={{
              '--dash-offset': CIRCUMFERENCE + 'px',
              filter: pct >= 50 ? `drop-shadow(0 0 8px ${glowColor})` : 'none',
            }}
          />
        </svg>

        {/* Center overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
        >
          <span
            className="text-3xl font-bold tabular-nums leading-none"
            style={{ color: stroke }}
          >
            {pct}
            <span className="text-base font-medium" style={{ opacity: 0.65 }}>%</span>
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
