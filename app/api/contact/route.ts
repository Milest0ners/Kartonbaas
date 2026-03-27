import { NextResponse } from 'next/server';
import { sendContactFormEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  orderNumber?: unknown;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(req: Request) {
  try {
    const rateLimit = checkRateLimit(req.headers, 'contact', 10, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Te veel berichten verstuurd. Probeer het later opnieuw.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
        }
      );
    }

    const body = (await req.json()) as ContactPayload;
    const name = asTrimmedString(body.name);
    const email = asTrimmedString(body.email);
    const message = asTrimmedString(body.message);
    const orderNumber = asTrimmedString(body.orderNumber);

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Vul een geldige naam in.' }, { status: 400 });
    }
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Vul een geldig e-mailadres in.' }, { status: 400 });
    }
    if (!message || message.length < 10) {
      return NextResponse.json({ error: 'Vul een bericht van minimaal 10 tekens in.' }, { status: 400 });
    }
    if (orderNumber.length > 80) {
      return NextResponse.json({ error: 'Ordernummer is te lang.' }, { status: 400 });
    }

    await sendContactFormEmail({
      name,
      email,
      message: message.slice(0, 3000),
      orderNumber: orderNumber || undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Contact submit failed:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis met versturen. Probeer het later opnieuw.' },
      { status: 500 }
    );
  }
}
