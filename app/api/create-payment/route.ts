import { NextRequest, NextResponse } from 'next/server';
import { validateCreatePaymentBody } from '@/lib/validation';
import { createPayment } from '@/lib/mollie';
import { calculatePrice } from '@/lib/pricing';
import { validatePostalCombination } from '@/lib/postal-validation';
import type { Format, Addon } from '@/lib/pricing';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(request.headers, 'create-payment', 20, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Te veel betalingsverzoeken. Probeer het over een paar minuten opnieuw.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
        }
      );
    }

    const body = await request.json();
    const validation = validateCreatePaymentBody(body);

    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { error: validation.errors.join(' ') },
        { status: 400 }
      );
    }

    const data = validation.data;

    const billingAddressValid = await validatePostalCombination({
      country: data.land,
      postcode: data.postcode,
      city: data.stad,
    });
    if (billingAddressValid === false) {
      return NextResponse.json(
        { error: 'Postcode en stad komen niet overeen voor het gekozen land (factuuradres).' },
        { status: 400 }
      );
    }

    if (data.anderAfleveradres) {
      const shippingAddressValid = await validatePostalCombination({
        country: data.afleverLand ?? data.land,
        postcode: data.afleverPostcode ?? '',
        city: data.afleverStad ?? '',
      });
      if (shippingAddressValid === false) {
        return NextResponse.json(
          { error: 'Postcode en stad komen niet overeen voor het gekozen land (afleveradres).' },
          { status: 400 }
        );
      }
    }

    const pricing = calculatePrice({
      format: data.format as Format,
      quantity: data.quantity,
      addons: data.addons as Addon[],
      deliveryTiming: data.deliveryTiming,
      shippingCountry: data.anderAfleveradres ? (data.afleverLand ?? data.land) : data.land,
    });

    const serverTotal = pricing.total;

    if (Math.abs(serverTotal - data.total) > 0.01) {
      return NextResponse.json(
        { error: 'Totaalbedrag klopt niet. Herlaad de pagina en probeer opnieuw.' },
        { status: 400 }
      );
    }

    const payment = await createPayment({
      ...data,
      total: serverTotal,
    });

    return NextResponse.json({
      checkoutUrl: payment.checkoutUrl,
      paymentId: payment.paymentId,
    });
  } catch (error) {
    console.error('[create-payment] error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het aanmaken van de betaling. Probeer het opnieuw.' },
      { status: 500 }
    );
  }
}
