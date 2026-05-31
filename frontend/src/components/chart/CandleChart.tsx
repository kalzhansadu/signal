import { useEffect, useRef } from 'react';
import { createChart, ColorType, LineStyle, type IChartApi, type ISeriesApi } from 'lightweight-charts';
import type { Candle, IndicatorSnapshot, Signal, SmcSummary } from '../../types/domain';
import { money } from '../../utils/format';

interface CandleChartProps {
  candles: Candle[];
  indicators: IndicatorSnapshot[];
  smc: SmcSummary;
  signals: Signal[];
  overlays: {
    orderBlocks: boolean;
    fairValueGaps: boolean;
    liquidity: boolean;
    structure: boolean;
    equilibrium: boolean;
  };
}

export const CandleChart = ({ candles, indicators, smc, signals, overlays }: CandleChartProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      height: 460,
      layout: { background: { type: ColorType.Solid, color: '#182027' }, textColor: '#aeb8c2' },
      grid: { vertLines: { color: '#26313a' }, horzLines: { color: '#26313a' } },
      timeScale: { borderColor: '#3b4650', timeVisible: true },
      rightPriceScale: { borderColor: '#3b4650' },
    });
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#13b981',
      downColor: '#f05d5e',
      borderVisible: false,
      wickUpColor: '#13b981',
      wickDownColor: '#f05d5e',
    });
    chartRef.current = chart;
    candleRef.current = candleSeries;
    const resize = () => chart.applyOptions({ width: containerRef.current?.clientWidth ?? 0 });
    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current || !candleRef.current || candles.length === 0) return;
    const chart = chartRef.current;
    const candleSeries = candleRef.current;
    candleSeries.setData(candles.map((candle) => ({ ...candle, time: candle.time as never })));
    candleSeries.setMarkers(
      signals.map((signal) => ({
        time: Math.floor(signal.createdAt / 1000) as never,
        position: signal.direction === 'LONG' ? 'belowBar' : 'aboveBar',
        color: signal.direction === 'LONG' ? '#13b981' : '#f05d5e',
        shape: signal.direction === 'LONG' ? 'arrowUp' : 'arrowDown',
        text: `${signal.direction} ${signal.qualityScore}`,
      })),
    );

    const ema20 = chart.addLineSeries({ color: '#35b8d4', lineWidth: 2, priceLineVisible: false });
    const ema50 = chart.addLineSeries({ color: '#eab308', lineWidth: 2, priceLineVisible: false });
    ema20.setData(indicators.map((value, index) => value.ema20 ? { time: candles[index].time as never, value: value.ema20 } : null).filter(Boolean) as never);
    ema50.setData(indicators.map((value, index) => value.ema50 ? { time: candles[index].time as never, value: value.ema50 } : null).filter(Boolean) as never);

    const lines = [
      overlays.equilibrium ? candleSeries.createPriceLine({ price: smc.equilibrium, color: '#ffffff', lineStyle: LineStyle.Dashed, title: 'EQ 50%' }) : null,
      ...signals.flatMap((signal) => [
        candleSeries.createPriceLine({ price: signal.entryPrice, color: '#35b8d4', title: 'Entry' }),
        candleSeries.createPriceLine({ price: signal.takeProfit, color: '#13b981', title: 'TP' }),
        candleSeries.createPriceLine({ price: signal.stopLoss, color: '#f05d5e', title: 'SL' }),
      ]),
    ].filter(Boolean);

    chart.timeScale().fitContent();
    return () => {
      chart.removeSeries(ema20);
      chart.removeSeries(ema50);
      lines.forEach((line) => candleSeries.removePriceLine(line as never));
    };
  }, [candles, indicators, overlays.equilibrium, signals, smc.equilibrium]);

  return (
    <div className="relative rounded-md border border-line bg-panel">
      <div ref={containerRef} className="h-[460px] w-full" />
      <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-2 text-xs">
        {overlays.orderBlocks && smc.orderBlocks.slice(-4).map((zone) => (
          <span key={zone.id} className={`${zone.type === 'BULL' ? 'bg-buy/20 text-buy' : 'bg-sell/20 text-sell'} rounded px-2 py-1`}>
            OB {zone.status} {money(zone.low)}-{money(zone.high)}
          </span>
        ))}
        {overlays.fairValueGaps && smc.fairValueGaps.slice(-4).map((gap) => (
          <span key={gap.id} className={`${gap.type === 'BULL' ? 'bg-cyan/20 text-cyan' : 'bg-amber/20 text-amber'} rounded px-2 py-1`}>
            FVG {gap.status} {money(gap.low)}-{money(gap.high)}
          </span>
        ))}
        {overlays.liquidity && smc.liquidity.slice(-4).map((zone) => (
          <span key={zone.id} className={`${zone.swept ? 'bg-slate-500/20 text-slate-300' : 'bg-amber/20 text-amber'} rounded px-2 py-1`}>
            {zone.type} {money(zone.priceLevel)}
          </span>
        ))}
        {overlays.structure && smc.structure.slice(-3).map((event) => (
          <span key={event.id} className="rounded bg-white/10 px-2 py-1 text-white">{event.type} {money(event.priceLevel)}</span>
        ))}
      </div>
    </div>
  );
};
