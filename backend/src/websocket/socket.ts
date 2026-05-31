import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { env } from '../config/env.js';
import type { Signal } from '../types/domain.js';

let io: Server | null = null;

export const socket = {
  init(server: HttpServer) {
    io = new Server(server, {
      cors: {
        origin: env.frontendOrigin,
        methods: ['GET', 'POST'],
      },
    });
    io.on('connection', (client) => {
      client.emit('connected', { ok: true, timestamp: Date.now() });
    });
    return io;
  },
  newSignal(signal: Signal) {
    io?.emit('new_signal', { signal });
  },
  marketUpdate(payload: unknown) {
    io?.emit('market_update', payload);
  },
  smcEvent(payload: unknown) {
    io?.emit('smc_event', payload);
  },
};
