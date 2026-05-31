import { useMemo } from 'react';
import type React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../api/client';
import { MetricCard } from '../components/MetricCard';
import { SignalTable } from '../components/SignalTable';

export const Statistics = () => {
  const statsQuery = useQuery({ queryKey: ['stats'], queryFn: api.stats, refetchInterval: 30_000 });
  const signals = statsQuery.data?.signals ?? [];

  const bySymbol = useMemo(() => Object.values(signals.reduce<Record<string, { symbol: string; count: number }>>((acc, signal) => {
    acc[signal.symbol] = acc[signal.symbol] ?? { symbol: signal.symbol, count: 0 };
    acc[signal.symbol].count += 1;
    return acc;
  }, {})), [signals]);

  const sideData = [
    { name: 'LONG', value: signals.filter((signal) => signal.direction === 'LONG').length },
    { name: 'SHORT', value: signals.filter((signal) => signal.direction === 'SHORT').length },
  ];

  const scoreBands = [
    { band: '< 50', value: signals.filter((signal) => signal.qualityScore < 50).length },
    { band: '50-75', value: signals.filter((signal) => signal.qualityScore >= 50 && signal.qualityScore <= 75).length },
    { band: '> 75', value: signals.filter((signal) => signal.qualityScore > 75).length },
  ];

  const pnlCurve = signals
    .slice()
    .reverse()
    .map((signal, index, list) => ({
      index: index + 1,
      pnl: list.slice(0, index + 1).reduce((sum, item) => sum + (item.pnlPercent ?? 0), 0),
    }));

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-4">
        <MetricCard label="Signals" value={statsQuery.data?.totalSignals ?? 0} tone="cyan" />
        <MetricCard label="Win rate" value={`${statsQuery.data?.winRate ?? 0}%`} tone="buy" />
        <MetricCard label="Avg score" value={statsQuery.data?.averageQualityScore ?? 0} tone="amber" />
        <MetricCard label="Avg PnL" value={`${statsQuery.data?.averagePnlPercent ?? 0}%`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartPanel title="Signals by Symbol">
          <BarChart data={bySymbol}><CartesianGrid stroke="#2b3640" /><XAxis dataKey="symbol" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip /><Bar dataKey="count" fill="#35b8d4" /></BarChart>
        </ChartPanel>
        <ChartPanel title="LONG vs SHORT">
          <PieChart><Pie data={sideData} dataKey="value" nameKey="name" outerRadius={110}>{sideData.map((entry) => <Cell key={entry.name} fill={entry.name === 'LONG' ? '#13b981' : '#f05d5e'} />)}</Pie><Tooltip /></PieChart>
        </ChartPanel>
        <ChartPanel title="Cumulative PnL">
          <AreaChart data={pnlCurve}><CartesianGrid stroke="#2b3640" /><XAxis dataKey="index" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip /><Area type="monotone" dataKey="pnl" stroke="#13b981" fill="#13b98133" /></AreaChart>
        </ChartPanel>
        <ChartPanel title="Quality Score Bands">
          <LineChart data={scoreBands}><CartesianGrid stroke="#2b3640" /><XAxis dataKey="band" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip /><Line type="monotone" dataKey="value" stroke="#eab308" strokeWidth={3} /></LineChart>
        </ChartPanel>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">All Signals</h2>
        <SignalTable signals={signals} />
      </section>
    </div>
  );
};

const ChartPanel = ({ title, children }: { title: string; children: React.ReactElement }) => (
  <section className="rounded-md border border-line bg-panel p-4">
    <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-slate-300">{title}</h2>
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
    </div>
  </section>
);
