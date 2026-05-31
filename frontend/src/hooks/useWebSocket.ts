import { useEffect } from 'react';
import { io } from 'socket.io-client';
import type { Signal } from '../types/domain';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'http://localhost:3000';

export const useWebSocket = (onSignal: (signal: Signal) => void) => {
  useEffect(() => {
    const socket = io(WS_URL, { transports: ['websocket'] });
    socket.on('new_signal', ({ signal }: { signal: Signal }) => onSignal(signal));
    return () => {
      socket.close();
    };
  }, [onSignal]);
};
