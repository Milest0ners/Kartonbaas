import { NextRequest, NextResponse } from 'next/server';
import {
  updateOrderFulfillmentStatus,
  type FulfillmentStatus,
} from '@/lib/orders-store';

export const runtime = 'nodejs';

const ALLOWED_STATUSES: FulfillmentStatus[] = [
  'nieuw',
  'in_behandeling',
  'in_productie',
  'verzonden',
  'afgerond',
];

function isAuthorized(token: string | null): boolean {
  const dashboardToken = process.env.ADMIN_DASHBOARD_TOKEN;
  if (!dashboardToken) return true;
  return Boolean(token && token === dashboardToken);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const orderId = String(formData.get('orderId') ?? '');
    const fulfillmentStatus = String(formData.get('fulfillmentStatus') ?? '') as FulfillmentStatus;
    const token = String(formData.get('t') ?? '');

    if (!isAuthorized(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!orderId) {
      return NextResponse.json({ error: 'orderId ontbreekt' }, { status: 400 });
    }

    if (!ALLOWED_STATUSES.includes(fulfillmentStatus)) {
      return NextResponse.json({ error: 'Ongeldige status' }, { status: 400 });
    }

    await updateOrderFulfillmentStatus(orderId, fulfillmentStatus);

    const redirectUrl = token ? `/admin/orders?t=${encodeURIComponent(token)}` : '/admin/orders';
    return NextResponse.redirect(new URL(redirectUrl, request.url), { status: 303 });
  } catch (error) {
    console.error('[admin-orders-status] error:', error);
    return NextResponse.json({ error: 'Status bijwerken mislukt.' }, { status: 500 });
  }
}
