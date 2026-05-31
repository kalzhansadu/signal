interface MetricCardProps {
  label: string;
  value: string | number;
  tone?: 'buy' | 'sell' | 'amber' | 'cyan' | 'neutral';
}

const tones = {
  buy: 'text-buy',
  sell: 'text-sell',
  amber: 'text-amber',
  cyan: 'text-cyan',
  neutral: 'text-white',
};

export const MetricCard = ({ label, value, tone = 'neutral' }: MetricCardProps) => (
  <div className="rounded-md border border-line bg-panel p-4 shadow-panel">
    <div className="text-xs uppercase tracking-[0.08em] text-slate-400">{label}</div>
    <div className={`mt-2 text-2xl font-semibold ${tones[tone]}`}>{value}</div>
  </div>
);
