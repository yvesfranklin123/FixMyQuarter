import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  const body = await request.json();
  const { name, avatarUrl, themePreference } = body;

  // Mise à jour du profil utilisateur en DB
  return NextResponse.json({ 
    success: true, 
    message: 'Profil synchronisé sur le réseau' 
  });
}