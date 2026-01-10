import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Session terminée' });
  
  // Suppression du cookie
  response.cookies.delete('nexus_session');
  
  return response;
}