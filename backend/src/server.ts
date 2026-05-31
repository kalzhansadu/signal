import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { schedulerService } from './services/scheduler/schedulerService.js';
import { socket } from './websocket/socket.js';

const app = createApp();
const server = createServer(app);
socket.init(server);
schedulerService.start();

server.listen(env.port, () => {
  console.log(`SMC backend listening on http://localhost:${env.port}`);
});
