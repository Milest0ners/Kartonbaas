import { NextRequest, NextResponse } from 'next/server';
import { getPayment } from '@/lib/mollie';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function noStoreJson(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return response;
}

export async function GET(request: NextRequest) {
  try {
    const paymentId = request.nextUrl.searchParams.get('id');

    if (!paymentId) {
      return noStoreJson({ error: 'Payment ID ontbreekt.' }, { status: 400 });
    }

    const payment = await getPayment(paymentId);

    return noStoreJson({
      id: payment.id,
      status: payment.status,
      paidAt: payment.paidAt ?? null,
      amount: payment.amount,
      method: payment.method ?? null,
    });
  } catch (error) {
    console.error('[payment-status] error:', error);
    return noStoreJson({ error: 'Status ophalen mislukt.' }, { status: 500 });
  }
}
