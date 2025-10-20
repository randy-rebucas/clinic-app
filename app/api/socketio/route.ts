// import { NextRequest } from 'next/server';

export async function GET() {
  // This route is used by Socket.IO for the handshake
  // The actual WebSocket connection is handled by the Socket.IO server
  return new Response('Socket.IO endpoint', { status: 200 });
}

export async function POST() {
  // This route is used by Socket.IO for the handshake
  // The actual WebSocket connection is handled by the Socket.IO server
  return new Response('Socket.IO endpoint', { status: 200 });
}
