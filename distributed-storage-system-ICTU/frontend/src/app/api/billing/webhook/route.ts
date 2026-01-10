import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('Stripe-Signature');

  // Ici, tu valides la signature Stripe
  // if (!verifyStripe(body, signature)) return Error...

  const event = JSON.parse(body);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Mettre à jour le quota de l'utilisateur en base de données : ex: 1TB
    console.log(`Upgrade de quota pour: ${session.customer_details.email}`);
  }

  return NextResponse.json({ received: true });
}