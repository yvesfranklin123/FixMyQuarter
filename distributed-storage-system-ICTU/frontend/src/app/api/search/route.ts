import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  // Ici, tu interroges ta base de données ou un index ElasticSearch/Meilisearch
  const results = [
    { id: '1', name: 'Contrat_Final.pdf', type: 'file', path: '/documents' },
    { id: '2', name: 'Photos_Nexus', type: 'folder', path: '/' },
  ].filter(item => item.name.toLowerCase().includes(query?.toLowerCase() || ''));

  return NextResponse.json(results);
}