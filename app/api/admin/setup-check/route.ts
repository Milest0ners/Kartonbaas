import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

function isAuthorized(token: string | null): boolean {
  const dashboardToken = process.env.ADMIN_DASHBOARD_TOKEN;
  if (!dashboardToken) return true;
  return Boolean(token && token === dashboardToken);
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('t');
  if (!isAuthorized(token)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({
      ok: false,
      configured: false,
      missing: [
        !supabaseUrl ? 'SUPABASE_URL' : null,
        !serviceRoleKey ? 'SUPABASE_SERVICE_ROLE_KEY' : null,
      ].filter(Boolean),
      message: 'Supabase is nog niet geconfigureerd.',
    });
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/orders?select=id&limit=1`, {
      method: 'GET',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      let details = `HTTP ${response.status}`;
      try {
        const json = (await response.json()) as { message?: string; code?: string };
        details = json.code ? `${json.code}: ${json.message ?? details}` : (json.message ?? details);
      } catch {
        // keep HTTP status details
      }

      return NextResponse.json({
        ok: false,
        configured: true,
        tableReady: false,
        message: 'Supabase bereikbaar, maar tabel "orders" lijkt nog niet klaar.',
        details,
      });
    }

    return NextResponse.json({
      ok: true,
      configured: true,
      tableReady: true,
      message: 'Supabase orderopslag is klaar.',
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      configured: true,
      tableReady: false,
      message: 'Supabase check mislukt.',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
