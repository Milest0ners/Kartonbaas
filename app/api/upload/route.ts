import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/upload';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 60;

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
const MAX_SIZE_BYTES = 4 * 1024 * 1024;

function hasCloudinaryConfig(): boolean {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return false;
  // Ignore placeholder values from .env.example/.env.local template
  if (cloudName.startsWith('jouw_') || apiKey.startsWith('jouw_') || apiSecret.startsWith('jouw_')) return false;
  return true;
}

function cloudinaryMissingKeys(): string[] {
  const missing: string[] = [];
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || cloudName.startsWith('jouw_')) missing.push('CLOUDINARY_CLOUD_NAME');
  if (!apiKey || apiKey.startsWith('jouw_')) missing.push('CLOUDINARY_API_KEY');
  if (!apiSecret || apiSecret.startsWith('jouw_')) missing.push('CLOUDINARY_API_SECRET');
  return missing;
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(request.headers, 'upload', 20, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Te veel uploadverzoeken. Probeer het later opnieuw.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Geen bestand ontvangen.' }, { status: 400 });
    }

    const fileObj = file as File;

    const normalizedType = fileObj.type.toLowerCase();
    const isHeic = fileObj.name.toLowerCase().endsWith('.heic');

    if (!ALLOWED_TYPES.includes(normalizedType) && !isHeic) {
      return NextResponse.json(
        { error: 'Alleen JPG, PNG en HEIC bestanden zijn toegestaan.' },
        { status: 400 }
      );
    }

    if (fileObj.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'Bestand is te groot. Maximaal 4 MB toegestaan.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await fileObj.arrayBuffer());

    // Dev fallback: allow local testing without Cloudinary credentials.
    if (!hasCloudinaryConfig() && process.env.NODE_ENV === 'development') {
      const mimeType = fileObj.type || 'image/jpeg';
      const base64 = buffer.toString('base64');
      return NextResponse.json({
        fileUrl: `data:${mimeType};base64,${base64}`,
        fileId: `local-dev-${Date.now()}`,
      });
    }

    if (!hasCloudinaryConfig()) {
      const missing = cloudinaryMissingKeys();
      return NextResponse.json(
        {
          error: `Cloudinary is niet goed geconfigureerd. Ontbrekende variabelen: ${missing.join(', ') || 'onbekend'}.`,
        },
        { status: 500 }
      );
    }

    const result = await uploadToCloudinary(buffer);

    return NextResponse.json({
      fileUrl: result.fileUrl,
      fileId: result.fileId,
    });
  } catch (error) {
    console.error('[upload] error:', error);
    const message = error instanceof Error ? error.message : 'Onbekende uploadfout.';
    return NextResponse.json(
      { error: `Upload mislukt. ${message}` },
      { status: 500 }
    );
  }
}
