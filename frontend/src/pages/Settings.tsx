import { FormEvent, useEffect, useState } from 'react';
import type React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Play, Save } from 'lucide-react';
import { api } from '../api/client';
import type { Settings as SettingsType } from '../types/domain';

export const Settings = () => {
  const settingsQuery = useQuery({ queryKey: ['settings'], queryFn: api.settings });
  const [draft, setDraft] = useState<SettingsType | null>(null);
  const saveMutation = useMutation({ mutationFn: api.updateSettings, onSuccess: setDraft });
  const scanMutation = useMutation({ mutationFn: api.scan });

  useEffect(() => {
    if (settingsQuery.data) setDraft(settingsQuery.data);
  }, [settingsQuery.data]);

  if (!draft) return <div className="text-slate-400">Loading settings...</div>;

  const update = <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => setDraft({ ...draft, [key]: value });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    saveMutation.mutate(draft);
  };

  return (
    <form className="grid gap-4 xl:grid-cols-2" onSubmit={submit}>
      <Panel title="Symbols">
        <label className="field">
          <span>Tracked pairs</span>
          <input className="control w-full" value={draft.symbols.join(', ')} onChange={(event) => update('symbols', event.target.value.split(',').map((item) => item.trim().toUpperCase()).filter(Boolean))} />
        </label>
        <label className="field">
          <span>Timeframes</span>
          <input className="control w-full" value={draft.timeframes.join(', ')} onChange={(event) => update('timeframes', event.target.value.split(',').map((item) => item.trim()) as SettingsType['timeframes'])} />
        </label>
      </Panel>

      <Panel title="Scanning">
        <label className="field">
          <span>Interval, minutes</span>
          <input className="control w-full" type="number" min={1} value={draft.scanIntervalMin} onChange={(event) => update('scanIntervalMin', Number(event.target.value))} />
        </label>
        <button className="button-secondary" type="button" onClick={() => scanMutation.mutate()}><Play size={16} /> Run manual scan</button>
      </Panel>

      <Panel title="Indicators">
        <NumberField label="RSI period" value={draft.rsiPeriod} onChange={(value) => update('rsiPeriod', value)} />
        <NumberField label="ATR multiplier" value={draft.atrMultiplier} step={0.1} onChange={(value) => update('atrMultiplier', value)} />
        <NumberField label="Risk reward" value={draft.riskRewardRatio} step={0.1} onChange={(value) => update('riskRewardRatio', value)} />
      </Panel>

      <Panel title="SMC Parameters">
        <NumberField label="Swing lookback" value={draft.swingLookback} onChange={(value) => update('swingLookback', value)} />
        <NumberField label="Min quality score" value={draft.minQualityScore} onChange={(value) => update('minQualityScore', value)} />
        <NumberField label="Liquidity sweep lookback" value={draft.liquiditySweepLookback} onChange={(value) => update('liquiditySweepLookback', value)} />
      </Panel>

      <Panel title="Notifications">
        <label className="field">
          <span>Telegram bot token</span>
          <input className="control w-full" value={draft.telegramToken ?? ''} onChange={(event) => update('telegramToken', event.target.value)} />
        </label>
        <label className="field">
          <span>Telegram chat ID</span>
          <input className="control w-full" value={draft.telegramChatId ?? ''} onChange={(event) => update('telegramChatId', event.target.value)} />
        </label>
        <NumberField label="Quality threshold" value={draft.telegramQualityThreshold} onChange={(value) => update('telegramQualityThreshold', value)} />
      </Panel>

      <div className="flex items-end">
        <button className="button-primary" type="submit" disabled={saveMutation.isPending}><Save size={16} /> Save settings</button>
      </div>
    </form>
  );
};

const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-4 rounded-md border border-line bg-panel p-4">
    <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-300">{title}</h2>
    {children}
  </section>
);

const NumberField = ({ label, value, step = 1, onChange }: { label: string; value: number; step?: number; onChange: (value: number) => void }) => (
  <label className="field">
    <span>{label}</span>
    <input className="control w-full" type="number" step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
  </label>
);
