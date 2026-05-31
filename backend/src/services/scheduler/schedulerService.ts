import cron from 'node-cron';
import type { ScheduledTask } from 'node-cron';
import { logger } from '../../lib/logger.js';
import { analysisService } from '../analysisService.js';
import { settingsService } from '../settingsService.js';
import { socket } from '../../websocket/socket.js';

let task: ScheduledTask | null = null;

const cronExpression = (minutes: number) => `*/${Math.max(1, minutes)} * * * *`;

export const schedulerService = {
  start() {
    const settings = settingsService.get();
    task?.stop();
    task = cron.schedule(cronExpression(settings.scanIntervalMin), () => {
      void this.scan();
    });
  },

  async scan() {
    const results = await analysisService.scanAll();
    for (const result of results) {
      if (result.signal) {
        await logger.signal(`${result.signal.symbol} ${result.signal.timeframe} ${result.signal.direction} score=${result.signal.qualityScore}`);
        socket.newSignal(result.signal);
      }
      const event = [...result.smc.structure].reverse()[0];
      if (event) {
        await logger.smc(`${event.type} level=${event.priceLevel}`);
        socket.smcEvent(event);
      }
    }
    return results;
  },
};
