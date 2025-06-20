'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { initializeSocket, getSocket, disconnectSocket } from '@/lib/socket';

// Enhanced socket event types for call management
export interface SocketEventData {
  // Forms-related events (working APIs)
  'form:complaint:submitted': {
    id: string;
    customerId: number;
    description: string;
    status: string;
    timestamp: string;
  };
  'form:feedback:submitted': {
    id: string;
    customerId: number;
    description: string;
    timestamp: string;
  };
  'notification:new': {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    timestamp: string;
  };
  // Call-related events for outgoing calls
  'callStatusUpdate': {
    callId: string;
    status: 'connecting' | 'active' | 'ended' | 'failed';
    phoneNumber: string;
    timestamp: string;
    duration?: number;
    reason?: string;
  };
  'registerCall': {
    callId: string;
    phoneNumber: string;
    agentId?: string;
    timestamp: string;
  };
  'call:initiated': {
    callId: string;
    phoneNumber: string;
    status: 'connecting';
    timestamp: string;
  };
  'call:connected': {
    callId: string;
    phoneNumber: string;
    status: 'active';
    timestamp: string;
    duration: number;
  };
  'call:ended': {
    callId: string;
    phoneNumber: string;
    status: 'ended';
    timestamp: string;
    duration: number;
    reason: 'hangup' | 'timeout' | 'failed' | 'busy';
  };
  // Future events
  'call:incoming': {
    callId: string;
    phoneNumber: string;
    timestamp: string;
  };
}

export interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  // Event emission with type safety
  emit: <K extends keyof SocketEventData>(event: K, data: SocketEventData[K]) => void;
  // Event listening with type safety
  on: <K extends keyof SocketEventData>(
    event: K, 
    callback: (data: SocketEventData[K]) => void
  ) => void;
  off: <K extends keyof SocketEventData>(
    event: K, 
    callback?: (data: SocketEventData[K]) => void
  ) => void;
  // Call-specific methods
  registerCall: (callId: string, phoneNumber: string) => void;
  unregisterCall: (callId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    setIsConnecting(true);
    setConnectionError(null);

    try {
      const newSocket = initializeSocket();
      setSocket(newSocket);

      // Connection status handlers
      const handleConnect = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);
        console.log('🎯 SocketProvider: Connected successfully');
      };

      const handleDisconnect = () => {
        setIsConnected(false);
        setIsConnecting(false);
        console.log('🎯 SocketProvider: Disconnected');
      };

      const handleConnectError = (error: Error) => {
        setIsConnected(false);
        setIsConnecting(false);
        setConnectionError(error.message);
        console.error('🎯 SocketProvider: Connection error:', error);
      };

      const handleReconnect = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);
        console.log('🎯 SocketProvider: Reconnected successfully');
      };

      // Call-specific event handlers
      const handleCallStatusUpdate = (data: SocketEventData['callStatusUpdate']) => {
        console.log('📞 Call status update:', data);
        // Store in localStorage for persistence
        localStorage.setItem('lastCallUpdate', JSON.stringify(data));
      };

      // Attach event listeners
      newSocket.on('connect', handleConnect);
      newSocket.on('disconnect', handleDisconnect);
      newSocket.on('connect_error', handleConnectError);
      newSocket.on('reconnect', handleReconnect);
      newSocket.on('callStatusUpdate', handleCallStatusUpdate);

      // Cleanup function
      return () => {
        newSocket.off('connect', handleConnect);
        newSocket.off('disconnect', handleDisconnect);
        newSocket.off('connect_error', handleConnectError);
        newSocket.off('reconnect', handleReconnect);
        newSocket.off('callStatusUpdate', handleCallStatusUpdate);
        disconnectSocket();
        setSocket(null);
        setIsConnected(false);
        setIsConnecting(false);
      };
    } catch (error) {
      console.error('🎯 SocketProvider: Failed to initialize socket:', error);
      setIsConnecting(false);
      setConnectionError(error instanceof Error ? error.message : 'Failed to initialize socket');
    }
  }, []);

  // Type-safe event emission
  const emit = useCallback(<K extends keyof SocketEventData>(
    event: K, 
    data: SocketEventData[K]
  ) => {
    if (socket && isConnected) {
      socket.emit(event as string, data);
      console.log('📤 Socket emit:', event, data);
    } else {
      console.warn('📤❌ Cannot emit - socket not connected:', event);
    }
  }, [socket, isConnected]);

  // Type-safe event listening
  const on = useCallback(<K extends keyof SocketEventData>(
    event: K, 
    callback: (data: SocketEventData[K]) => void
  ) => {
    if (socket) {
      socket.on(event as string, callback);
      console.log('📥 Socket listener added:', event);
    }
  }, [socket]);

  // Type-safe event listener removal
  const off = useCallback(<K extends keyof SocketEventData>(
    event: K, 
    callback?: (data: SocketEventData[K]) => void
  ) => {
    if (socket) {
      if (callback) {
        socket.off(event as string, callback);
      } else {
        socket.off(event as string);
      }
      console.log('📥❌ Socket listener removed:', event);
    }
  }, [socket]);

  // Call registration helper
  const registerCall = useCallback((callId: string, phoneNumber: string) => {
    if (socket && isConnected) {
      const registerData: SocketEventData['registerCall'] = {
        callId,
        phoneNumber,
        timestamp: new Date().toISOString()
      };
      
      socket.emit('registerCall', registerData);
      console.log('📞 Call registered with socket:', callId);
      
      // Store in localStorage for persistence
      localStorage.setItem('currentCallId', callId);
      localStorage.setItem('currentCallPhone', phoneNumber);
    } else {
      console.warn('📞❌ Cannot register call - socket not connected');
    }
  }, [socket, isConnected]);

  // Call unregistration helper
  const unregisterCall = useCallback((callId: string) => {
    if (socket && isConnected) {
      socket.emit('unregisterCall', { callId });
      console.log('📞 Call unregistered from socket:', callId);
    }
    
    // Clean up localStorage
    localStorage.removeItem('currentCallId');
    localStorage.removeItem('currentCallPhone');
    localStorage.removeItem('lastCallUpdate');
  }, [socket, isConnected]);

  const contextValue: SocketContextType = {
    socket,
    isConnected,
    isConnecting,
    connectionError,
    emit,
    on,
    off,
    registerCall,
    unregisterCall,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
