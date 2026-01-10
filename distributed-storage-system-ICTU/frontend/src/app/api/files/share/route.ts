import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { fileId, expiration, passwordProtected } = await request.json();

  // Génération d'un hash unique pour le partage
  const shareToken = crypto.randomUUID();
  const shareLink = `https://nexus.cloud/s/${shareToken}`;

  return NextResponse.json({ 
    shareLink, 
    expiresAt: expiration,
    status: 'Public via Nexus-Proxy' 
  });
}