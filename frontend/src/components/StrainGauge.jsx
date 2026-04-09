/**
 * Semi-circular strain gauge.
 * Scale: 0–21 (Whoop scale). Mapped to arc angle.
 * Color gradient: blue → yellow → red.
 */
export default function StrainGauge({ strain = 0, maxStrain = 21, label = 'Strain' }) {
  const pct = Math.min(strain / maxStrain, 1);

  // Arc: 210° span, starting at 165° (bottom-left) going clockwise to 15° (bottom-right)
  const START_ANGLE = 215;
  const SPAN = 250; // degrees
  const R = 38;
  const CX = 50;
  const CY = 54;

  function polarToXY(angleDeg, radius) {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: CX + radius * Math.cos(rad),
      y: CY + radius * Math.sin(rad),
    };
  }

  function describeArc(startAngle, endAngle, r) {
    const start = polarToXY(startAngle, r);
    const end = polarToXY(endAngle, r);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  }

  const endAngle = START_ANGLE + SPAN * pct;

  // Color based on strain level
  const getStrokeColor = () => {
    if (strain >= 18) return '#ef4444'; // red
    if (strain >= 14) return '#f59e0b'; // yellow
    if (strain >= 10) return '#8b5cf6'; // purple
    return '#6366f1'; // indigo
  };

  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="72" viewBox="0 0 100 72">
        {/* Track */}
        <path
          d={describeArc(START_ANGLE, START_ANGLE + SPAN, R)}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Fill */}
        {pct > 0 && (
          <path
            d={describeArc(START_ANGLE, endAngle, R)}
            fill="none"
            stroke={getStrokeColor()}
            strokeWidth="7"
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease, d 0.5s ease' }}
          />
        )}
      </svg>

      {/* Value */}
      <div className="flex flex-col items-center -mt-2">
        <span className="text-xl font-bold tabular-nums" style={{ color: getStrokeColor() }}>
          {strain.toFixed(1)}
        </span>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
    </div>
  );
}
