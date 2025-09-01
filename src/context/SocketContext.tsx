// src/context/SocketContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  error: string | null;
}

interface SocketContextType extends SocketState {
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  
  const [state, setState] = useState<SocketState>({
    socket: null,
    isConnected: false,
    connectionStatus: 'disconnected',
    error: null
  });

  // Connect to socket
  const connect = useCallback(() => {
    if (!isAuthenticated || !user || state.socket) return;

    setState(prev => ({ ...prev, connectionStatus: 'connecting', error: null }));

    try {
      const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
        auth: {
          userId: user.id,
          token: localStorage.getItem('access_token')
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        maxReconnectionAttempts: 5
      });

      socketInstance.on('connect', () => {
        setState(prev => ({
          ...prev,
          socket: socketInstance,
          isConnected: true,
          connectionStatus: 'connected',
          error: null
        }));
        console.log('Socket connected:', socketInstance.id);
      });

      socketInstance.on('disconnect', (reason) => {
        setState(prev => ({
          ...prev,
          isConnected: false,
          connectionStatus: 'disconnected'
        }));
        console.log('Socket disconnected:', reason);
      });

      socketInstance.on('connect_error', (error) => {
        setState(prev => ({
          ...prev,
          connectionStatus: 'error',
          error: error.message
        }));
        console.error('Socket connection error:', error);
      });

      socketInstance.on('error', (error) => {
        setState(prev => ({
          ...prev,
          error: error.message || 'Socket error'
        }));
        console.error('Socket error:', error);
      });

      // Join user's personal room for notifications
      socketInstance.on('connect', () => {
        socketInstance.emit('join:user', { userId: user.id });
      });

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        connectionStatus: 'error',
        error: error.message || 'Failed to create socket connection'
      }));
    }
  }, [isAuthenticated, user, state.socket]);

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (state.socket) {
      state.socket.disconnect();
      setState(prev => ({
        ...prev,
        socket: null,
        isConnected: false,
        connectionStatus: 'disconnected',
        error: null
      }));
    }
  }, [state.socket]);

  // Emit event
  const emit = useCallback((event: string, data?: any) => {
    if (state.socket && state.isConnected) {
      state.socket.emit(event, data);
    } else {
      console.warn('Socket not connected. Cannot emit event:', event);
    }
  }, [state.socket, state.isConnected]);

  // Subscribe to event
  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (state.socket) {
      state.socket.on(event, callback);
    }
  }, [state.socket]);

  // Unsubscribe from event
  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (state.socket) {
      if (callback) {
        state.socket.off(event, callback);
      } else {
        state.socket.off(event);
      }
    }
  }, [state.socket]);

  // Join room
  const joinRoom = useCallback((room: string) => {
    emit('join:room', { room });
  }, [emit]);

  // Leave room
  const leaveRoom = useCallback((room: string) => {
    emit('leave:room', { room });
  }, [emit]);

  // Auto-connect/disconnect based on authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.socket) {
        state.socket.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{
      ...state,
      connect,
      disconnect,
      emit,
      on,
      off,
      joinRoom,
      leaveRoom
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};