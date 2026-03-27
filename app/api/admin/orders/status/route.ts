import { NextRequest, NextResponse } from 'next/server';
import {
  getOrderById,
  updateOrderFulfillmentStatus,
  type FulfillmentStatus,
} from '@/lib/orders-store';
import { sendOrderStatusEmail } from '@/lib/email';
import { ADMIN_AUTH_COOKIE, verifyAdminSessionToken } from '@/lib/admin-auth';

export const runtime = 'nodejs';

const ALLOWED_STATUSES: FulfillmentStatus[] = [
  'nieuw',
  'in_behandeling',
  'in_productie',
  'verzonden',
  'afgerond',
];

async function isAuthorized(request: NextRequest, token: string | null): Promise<boolean> {
  const expectedPassword = process.env.ADMIN_DASHBOARD_PASSWORD ?? process.env.ADMIN_DASHBOARD_TOKEN ?? '';
  const cookieToken = request.cookies.get(ADMIN_AUTH_COOKIE)?.value;
  if (await verifyAdminSessionToken(cookieToken, expectedPassword)) {
    return true;
  }
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

    if (!(await isAuthorized(request, token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!orderId) {
      return NextResponse.json({ error: 'orderId ontbreekt' }, { status: 400 });
    }

    if (!ALLOWED_STATUSES.includes(fulfillmentStatus)) {
      return NextResponse.json({ error: 'Ongeldige status' }, { status: 400 });
    }

    const existingOrder = await getOrderById(orderId);
    await updateOrderFulfillmentStatus(orderId, fulfillmentStatus);

    if (existingOrder && existingOrder.fulfillment_status !== fulfillmentStatus) {
      if (fulfillmentStatus === 'in_productie' || fulfillmentStatus === 'verzonden') {
        try {
          await sendOrderStatusEmail({ ...existingOrder, fulfillment_status: fulfillmentStatus }, fulfillmentStatus);
        } catch (emailError) {
          console.error('[admin-orders-status] statusmail mislukt:', emailError);
        }
      }
    }

    const redirectUrl = token ? `/admin/orders?t=${encodeURIComponent(token)}` : '/admin/orders';
    return NextResponse.redirect(new URL(redirectUrl, request.url), { status: 303 });
  } catch (error) {
    console.error('[admin-orders-status] error:', error);
    return NextResponse.json({ error: 'Status bijwerken mislukt.' }, { status: 500 });
  }
}
