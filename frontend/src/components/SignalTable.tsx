import { dateTime, money, pct } from '../utils/format';
import type { Signal } from '../types/domain';
import { DirectionBadge, ScoreBadge } from './SignalBadge';

export const SignalTable = ({ signals }: { signals: Signal[] }) => (
  <div className="overflow-x-auto rounded-md border border-line bg-panel">
    <table className="min-w-[980px] w-full text-left text-sm">
      <thead className="bg-[#202a33] text-xs uppercase tracking-[0.08em] text-slate-400">
        <tr>
          <th className="px-3 py-3">Symbol</th>
          <th className="px-3 py-3">TF</th>
          <th className="px-3 py-3">Side</th>
          <th className="px-3 py-3">Entry</th>
          <th className="px-3 py-3">SL</th>
          <th className="px-3 py-3">TP</th>
          <th className="px-3 py-3">Risk</th>
          <th className="px-3 py-3">Score</th>
          <th className="px-3 py-3">SMC</th>
          <th className="px-3 py-3">Time</th>
          <th className="px-3 py-3">PnL</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {signals.map((signal) => (
          <tr key={signal.id} className="hover:bg-white/[0.03]">
            <td className="px-3 py-3 font-medium text-white">{signal.symbol}</td>
            <td className="px-3 py-3 text-slate-300">{signal.timeframe}</td>
            <td className="px-3 py-3"><DirectionBadge direction={signal.direction} /></td>
            <td className="px-3 py-3">{money(signal.entryPrice)}</td>
            <td className="px-3 py-3">{money(signal.stopLoss)}</td>
            <td className="px-3 py-3">{money(signal.takeProfit)}</td>
            <td className="px-3 py-3">{pct(signal.riskPercent)}</td>
            <td className="px-3 py-3"><ScoreBadge score={signal.qualityScore} /></td>
            <td className="px-3 py-3 text-slate-300">{signal.entryType} / {signal.smcStructure}</td>
            <td className="px-3 py-3 text-slate-400">{dateTime(signal.createdAt)}</td>
            <td className="px-3 py-3">{pct(signal.pnlPercent)}</td>
          </tr>
        ))}
        {signals.length === 0 && (
          <tr>
            <td className="px-3 py-8 text-center text-slate-400" colSpan={11}>No signals yet. Run a scan to populate the table.</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);
