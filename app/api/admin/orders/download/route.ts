import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getOrderById } from '@/lib/orders-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function noStoreJson(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return response;
}

function isAuthorized(token: string | null): boolean {
  const dashboardToken = process.env.ADMIN_DASHBOARD_TOKEN;
  if (!dashboardToken) return true;
  return Boolean(token && token === dashboardToken);
}

function extensionFromMime(mime: string) {
  if (mime.includes('png')) return 'png';
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('gif')) return 'gif';
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
  if (mime.includes('heic')) return 'heic';
  return 'bin';
}

function dataUrlToResponse(dataUrl: string, baseFileName: string): NextResponse | null {
  const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!match) return null;
  const mime = match[1] || 'image/jpeg';
  const base64 = match[2];
  const buffer = Buffer.from(base64, 'base64');
  const extension = extensionFromMime(mime);
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': mime,
      'Content-Disposition': `attachment; filename="${baseFileName}.${extension}"`,
      'Cache-Control': 'no-store',
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('t');
    if (!isAuthorized(token)) {
      return noStoreJson({ error: 'Unauthorized' }, { status: 401 });
    }

    const orderId = request.nextUrl.searchParams.get('orderId');
    if (orderId) {
      const order = await getOrderById(orderId);
      if (!order) {
        return noStoreJson({ error: 'Order niet gevonden.' }, { status: 404 });
      }
      if (!order.file_url) {
        return noStoreJson({ error: 'Geen downloadbare foto beschikbaar voor deze order.' }, { status: 404 });
      }

      const baseFileName = `${order.order_number}-foto`;
      if (order.file_url.startsWith('data:')) {
        const response = dataUrlToResponse(order.file_url, baseFileName);
        if (response) return response;
        return noStoreJson({ error: 'Data URL kon niet worden verwerkt.' }, { status: 400 });
      }

      const upstream = await fetch(order.file_url, { cache: 'no-store' });
      if (!upstream.ok) {
        return noStoreJson({ error: 'Foto kon niet worden opgehaald.' }, { status: 502 });
      }

      const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream';
      const extension = extensionFromMime(contentType);

      return new NextResponse(upstream.body, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${baseFileName}.${extension}"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    const fileName = request.nextUrl.searchParams.get('file') ?? '';
    if (!fileName.endsWith('.json') || fileName.includes('/') || fileName.includes('\\')) {
      return noStoreJson({ error: 'Ongeldige bestandsnaam.' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), '.orders', fileName);
    const raw = await fs.readFile(filePath, 'utf8');
    const localOrder = JSON.parse(raw) as {
      ordernummer?: string;
      metadata?: { fileUrl?: string };
    };

    const fileUrl = localOrder.metadata?.fileUrl;
    if (!fileUrl) {
      return noStoreJson({ error: 'Geen foto gevonden voor deze bestelling.' }, { status: 404 });
    }

    const baseFileName = `${localOrder.ordernummer ?? fileName.replace('.json', '')}-foto`;
    if (fileUrl.startsWith('data:')) {
      const response = dataUrlToResponse(fileUrl, baseFileName);
      if (response) return response;
      return noStoreJson({ error: 'Data URL kon niet worden verwerkt.' }, { status: 400 });
    }

    const upstream = await fetch(fileUrl, { cache: 'no-store' });
    if (!upstream.ok) {
      return noStoreJson({ error: 'Foto kon niet worden opgehaald.' }, { status: 502 });
    }

    const contentType = upstream.headers.get('content-type') ?? 'image/jpeg';
    const extension = extensionFromMime(contentType);

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${baseFileName}.${extension}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[admin-order-download] error:', error);
    return noStoreJson({ error: 'Download mislukt.' }, { status: 500 });
  }
}
