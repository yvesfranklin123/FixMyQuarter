import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { event, data, channel } = await request.json();

  // Logique pour diffuser un événement au client sans qu'il demande (Push)
  // ex: 'FILE_ENCRYPTED', 'USER_JOINED'
  
  return NextResponse.json({ triggered: true });
}