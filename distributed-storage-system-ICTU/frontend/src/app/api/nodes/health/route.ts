import { NextResponse } from 'next/server';

export async function GET() {
  // Cette route pourrait ping tes micro-services de stockage (S3, Nodes IPFS, etc.)
  const nodeStatus = [
    { id: 'Node-Alpha', latency: '12ms', status: 'optimal' },
    { id: 'Node-Beta', latency: '45ms', status: 'degraded' }
  ];

  return NextResponse.json(nodeStatus);
}