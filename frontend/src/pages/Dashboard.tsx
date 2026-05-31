import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, Layers, RefreshCcw } from 'lucide-react';
import { api } from '../api/client';
import { CandleChart } from '../components/chart/CandleChart';
import { MetricCard } from '../components/MetricCard';
import { SignalTable } from '../components/SignalTable';
import { useWebSocket } from '../hooks/useWebSocket';
import { useUiStore } from '../store/uiStore';
import type { Signal, Timeframe } from '../types/domain';

const timeframes: Timeframe[] = ['5m', '15m', '1h', '4h', '1d'];
const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT'];

export const Dashboard = () => {
  const queryClient = useQueryClient();
  const [liveSignals, setLiveSignals] = useState<Signal[]>([]);
  const { symbol, timeframe, overlays, setSymbol, setTimeframe, toggleOverlay } = useUiStore();
  const marketQuery = useQuery({ queryKey: ['market', symbol, timeframe], queryFn: () => api.market(symbol, timeframe), refetchInterval: 60_000 });
  const signalQuery = useQuery({ queryKey: ['signals'], queryFn: api.signals, refetchInterval: 30_000 });
  const statsQuery = useQuery({ queryKey: ['stats'], queryFn: api.stats, refetchInterval: 30_000 });
  const scanMutation = useMutation({ mutationFn: api.scan, onSuccess: () => queryClient.invalidateQueries() });

  const handleSocketSignal = useCallback((signal: Signal) => {
    setLiveSignals((current) => [signal, ...current.filter((item) => item.id !== signal.id)].slice(0, 50));
  }, []);
  useWebSocket(handleSocketSignal);

  const signals = useMemo(() => {
    const merged = [...liveSignals, ...(signalQuery.data ?? [])];
    return merged.filter((signal, index) => merged.findIndex((item) => item.id === signal.id) === index);
  }, [liveSignals, signalQuery.data]);

  const stats = statsQuery.data;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Total signals" value={stats?.totalSignals ?? 0} tone="cyan" />
        <MetricCard label="Win rate" value={`${stats?.winRate ?? 0}%`} tone="buy" />
        <MetricCard label="Avg score" value={stats?.averageQualityScore ?? 0} tone="amber" />
        <MetricCard label="Active now" value={stats?.activeSignals ?? 0} tone="neutral" />
        <MetricCard label="Best signal" value={stats?.bestSignal?.symbol ?? '-'} tone="buy" />
        <MetricCard label="Avg PnL" value={`${stats?.averagePnlPercent ?? 0}%`} tone="neutral" />
      </div>

      <section className="rounded-md border border-line bg-[#141b21] p-4">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 text-white">
            <Activity size={18} className="text-cyan" />
            <h2 className="text-lg font-semibold">Market Map</h2>
            <span className="rounded bg-white/10 px-2 py-1 text-xs text-slate-300">{marketQuery.data?.smc.bias ?? 'LOADING'}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select className="control" value={symbol} onChange={(event) => setSymbol(event.target.value)}>
              {symbols.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select className="control" value={timeframe} onChange={(event) => setTimeframe(event.target.value as Timeframe)}>
              {timeframes.map((item) => <option key={item}>{item}</option>)}
            </select>
            <button className="icon-button" title="Run scan" onClick={() => scanMutation.mutate()} disabled={scanMutation.isPending}>
              <RefreshCcw size={17} />
            </button>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Layers size={16} className="text-slate-400" />
          {Object.entries(overlays).map(([key, enabled]) => (
            <label key={key} className="flex cursor-pointer items-center gap-2 rounded border border-line px-2 py-1 text-xs text-slate-300">
              <input type="checkbox" checked={enabled} onChange={() => toggleOverlay(key as keyof typeof overlays)} />
              {key.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)}
            </label>
          ))}
        </div>

        {marketQuery.data ? (
          <CandleChart
            candles={marketQuery.data.candles}
            indicators={marketQuery.data.indicators}
            smc={marketQuery.data.smc}
            signals={signals.filter((signal) => signal.symbol === symbol && signal.timeframe === timeframe)}
            overlays={overlays}
          />
        ) : (
          <div className="grid h-[460px] place-items-center rounded-md border border-line bg-panel text-slate-400">Loading market data...</div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Active Signals</h2>
        <SignalTable signals={signals.filter((signal) => signal.status === 'ACTIVE')} />
      </section>
    </div>
  );
};
