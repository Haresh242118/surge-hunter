import { NextResponse } from 'next/server';

export async function GET() {
  // Simulates dynamic live visitor concurrency fluctuations
  const baseUsers = 14;
  const variation = Math.floor(Math.random() * 7) - 3;
  const activeCount = Math.max(8, baseUsers + variation);

  return NextResponse.json({
    onlineUsers: activeCount,
    timestamp: new Date().toISOString(),
  });
}