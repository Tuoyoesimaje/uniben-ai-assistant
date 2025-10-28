import { useMemo } from 'react';

export default function Timer({ timeRemaining }) {
  const formatted = useMemo(() => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timeRemaining]);

  const isLow = timeRemaining < 300;
  const isCritical = timeRemaining < 120;

  return (
    <div className={`
      flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold
      ${isCritical ? 'bg-error/10 text-error animate-pulse' : ''}
      ${isLow && !isCritical ? 'bg-warning/10 text-warning' : ''}
      ${!isLow ? 'bg-neutral-100 text-neutral-700' : ''}
    `}>
      <span>⏱️</span>
      <span>{formatted}</span>
    </div>
  );
}