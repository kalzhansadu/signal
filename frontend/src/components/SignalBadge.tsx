import type { Direction } from '../types/domain';

export const DirectionBadge = ({ direction }: { direction: Direction }) => (
  <span className={`inline-flex min-w-16 justify-center rounded px-2 py-1 text-xs font-semibold ${direction === 'LONG' ? 'bg-buy/15 text-buy' : 'bg-sell/15 text-sell'}`}>
    {direction}
  </span>
);

export const ScoreBadge = ({ score }: { score: number }) => {
  const tone = score > 75 ? 'bg-buy/15 text-buy' : score >= 50 ? 'bg-amber/15 text-amber' : 'bg-sell/15 text-sell';
  return <span className={`inline-flex min-w-12 justify-center rounded px-2 py-1 text-xs font-semibold ${tone}`}>{score}</span>;
};
