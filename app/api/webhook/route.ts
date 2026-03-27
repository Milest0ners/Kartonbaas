import { NextRequest, NextResponse } from 'next/server';
import { getPayment } from '@/lib/mollie';
import { sendCustomerEmail, sendAdminEmail } from '@/lib/email';
import type { MolliePaymentMetadata } from '@/lib/mollie';
import {
  getOrderByPaymentId,
  isOrderStorageEnabled,
  setOrderEmailFlags,
  upsertPaidOrder,
} from '@/lib/orders-store';

export const runtime = 'nodejs';

function noStoreJson(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return response;
}

function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `KB${dateStr}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const paymentId = params.get('id');

    if (!paymentId) {
      return noStoreJson({ error: 'Geen payment ID ontvangen.' }, { status: 400 });
    }

    const payment = await getPayment(paymentId);

    if (payment.status !== 'paid') {
      return noStoreJson({ received: true });
    }

    const metadata = payment.metadata as MolliePaymentMetadata;

    if (!metadata) {
      console.error('[webhook] metadata ontbreekt', { paymentId });
      return noStoreJson({ received: true });
    }

    let existingOrder: Awaited<ReturnType<typeof getOrderByPaymentId>> = null;
    try {
      existingOrder = await getOrderByPaymentId(paymentId);
    } catch (error) {
      console.error('[webhook] bestaand order ophalen mislukt, ga door zonder dedupe', { paymentId, error });
    }
    if (existingOrder?.email_sent) {
      return noStoreJson({ received: true, ordernummer: existingOrder.order_number });
    }

    const ordernummer = existingOrder?.order_number ?? generateOrderNumber();

    const order = {
      ordernummer,
      metadata,
      paymentId,
    };

    if (isOrderStorageEnabled()) {
      try {
        await upsertPaidOrder({
          orderNumber: ordernummer,
          paymentId,
          paymentStatus: payment.status,
          paymentMethod: payment.method ?? null,
          metadata,
          paidAt: payment.paidAt ?? null,
        });
      } catch (error) {
        console.error('[webhook] orderopslag mislukt, ga door met mailflow', { paymentId, error });
      }
    }

    let customerEmailSent = false;
    let adminEmailSent = false;

    if (metadata.email) {
      try {
        await sendCustomerEmail(order);
        customerEmailSent = true;
      } catch (error) {
        console.error('[webhook] klantmail mislukt', { paymentId, error });
      }
    }

    try {
      await sendAdminEmail(order);
      adminEmailSent = true;
    } catch (error) {
      console.error('[webhook] adminmail mislukt', { paymentId, error });
    }

    if (isOrderStorageEnabled()) {
      try {
        await setOrderEmailFlags(paymentId, {
          customerEmailSent,
          adminEmailSent,
        });
      } catch (error) {
        console.error('[webhook] mailflags opslaan mislukt', { paymentId, error });
      }
    }

    if (process.env.NODE_ENV === 'development') {
      const fs = await import('fs/promises');
      const path = await import('path');
      const ordersDir = path.join(process.cwd(), '.orders');
      await fs.mkdir(ordersDir, { recursive: true });
      await fs.writeFile(
        path.join(ordersDir, `${ordernummer}.json`),
        JSON.stringify({ ...order, processedAt: new Date().toISOString() }, null, 2)
      );
    }

    return noStoreJson({ received: true, ordernummer });
  } catch (error) {
    console.error('[webhook] error:', error);
    return noStoreJson({ received: true }, { status: 200 });
  }
}

export async function GET() {
  return noStoreJson({ status: 'ok' });
}
