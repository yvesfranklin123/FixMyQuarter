import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. Appel vers ton backend réel (ex: Go, Node, Python)
    // const response = await fetch(`${process.env.BACKEND_URL}/auth/login`, { ... });
    
    // Simulation d'une réponse réussie
    const user = { id: '1', email: email, role: 'admin', token: 'JWT_TOKEN_HERE' };

    const response = NextResponse.json(
      { message: 'Authentification réussie', user },
      { status: 200 }
    );

    // 2. Sécurisation du token dans un cookie invisible côté client (anti-XSS)
    response.cookies.set('nexus_session', user.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 semaine
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}