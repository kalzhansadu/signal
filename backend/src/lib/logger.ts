import { appendFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const write = async (file: string, message: string) => {
  const target = join(process.cwd(), 'logs', file);
  await mkdir(dirname(target), { recursive: true });
  await appendFile(target, `${new Date().toISOString()} ${message}\n`);
};

export const logger = {
  signal: (message: string) => write('signals.log', message).catch(() => undefined),
  smc: (message: string) => write('smc.log', message).catch(() => undefined),
  error: (message: string) => write('errors.log', message).catch(() => undefined),
};
