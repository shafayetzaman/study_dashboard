import { useEffect, useState } from 'react';

const RADIUS = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export default function ProgressRing({ value, color, label, size = 44 }) {
  const progress = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
  const [animatedProgress, setAnimatedProgress] = useState(() =>
    typeof window !== 'undefined'
      && window.matchMedia?.(REDUCED_MOTION_QUERY).matches
      ? progress
      : 0
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setAnimatedProgress(progress));
    return () => window.cancelAnimationFrame(frame);
  }, [progress]);

  return (
    <div
      className="progress-ring shrink-0"
      style={{ width: size, height: size, color }}
      role="img"
      aria-label={`${label}: ${Math.round(progress)}%`}
    >
      <svg viewBox="0 0 44 44" aria-hidden="true">
        <circle className="progress-ring__track" cx="22" cy="22" r={RADIUS} />
        <circle
          className="progress-ring__value"
          cx="22"
          cy="22"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - animatedProgress / 100)}
        />
      </svg>
      <span aria-hidden="true">{Math.round(progress)}%</span>
    </div>
  );
}
