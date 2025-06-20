import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export interface SocketConfig {
  url?: string;
  transports?: string[];
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

export const initializeSocket = (config?: SocketConfig): Socket => {
  if (!socket) {
    const defaultConfig: SocketConfig = {
      url: 'https://crmapi.abisibg.com',
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    };

    const finalConfig = { ...defaultConfig, ...config };

    socket = io(finalConfig.url!, {
      transports: finalConfig.transports as any,
      reconnection: finalConfig.reconnection,
      reconnectionAttempts: finalConfig.reconnectionAttempts,
      reconnectionDelay: finalConfig.reconnectionDelay,
    });

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
      console.log('🔗 Socket ID:', socket?.id);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_error', (error) => {
      console.error('🔄❌ Socket reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('🔄💀 Socket reconnection failed - max attempts reached');
    });
  }

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔌 Socket manually disconnected');
  }
};

export default { initializeSocket, getSocket, disconnectSocket };
