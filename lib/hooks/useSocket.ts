'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin
      : 'http://localhost:3000', {
      path: '/api/socketio',
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket, connected };
}