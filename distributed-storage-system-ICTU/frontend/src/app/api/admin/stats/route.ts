import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('nexus_session');

  // Logic simple de vérification de rôle (simulée)
  if (!token) {
    return NextResponse.json({ error: 'Accès restreint' }, { status: 403 });
  }

  // Simulation de données provenant de ton infrastructure
  const adminStats = {
    nodes: 1284,
    traffic: '84.2 TB',
    activeUsers: 42100,
    securityAlerts: 0,
    latency: '14ms'
  };

  return NextResponse.json(adminStats);
}