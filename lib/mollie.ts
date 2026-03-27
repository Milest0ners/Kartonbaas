import { createMollieClient, PaymentMethod } from '@mollie/api-client';
import type { CreatePaymentBody } from './validation';

let mollieClient: ReturnType<typeof createMollieClient> | null = null;

function normalizeApiKey(value: string): string {
  const trimmed = value.trim();
  return trimmed.replace(/^Bearer\s+/i, '');
}

function getMollieClient() {
  if (!mollieClient) {
    const rawApiKey = process.env.MOLLIE_API_KEY;
    if (!rawApiKey) throw new Error('MOLLIE_API_KEY is niet ingesteld.');

    const apiKey = normalizeApiKey(rawApiKey);
    if (!/^(test|live)_[A-Za-z0-9]+$/.test(apiKey)) {
      throw new Error('MOLLIE_API_KEY heeft een ongeldig formaat. Gebruik een key zoals test_xxx of live_xxx zonder "Bearer ".');
    }

    mollieClient = createMollieClient({ apiKey });
  }
  return mollieClient;
}

export interface MolliePaymentMetadata {
  naam: string;
  email: string;
  land: string;
  adres: string;
  postcode: string;
  stad: string;
  anderAfleveradres?: boolean;
  afleverAdres?: string;
  afleverPostcode?: string;
  afleverStad?: string;
  deliveryTiming?: string;
  opmerking: string;
  format: string;
  exactHeightCm: string;
  quantity: number;
  addons: string[];
  fileUrl: string;
  fileId: string;
  total: number;
}

export async function createPayment(orderData: CreatePaymentBody) {
  const client = getMollieClient();
  const customerName = orderData.naam?.trim() || 'Klant';

  const webhookUrl = process.env.MOLLIE_WEBHOOK_URL;
  const redirectUrl = process.env.MOLLIE_REDIRECT_URL ?? `${process.env.NEXT_PUBLIC_SITE_URL}/bedankt`;

  if (!webhookUrl) throw new Error('MOLLIE_WEBHOOK_URL is niet ingesteld.');

  // Mollie metadata is limited to 1024 bytes. Data-URLs from local dev uploads
  // can be very large, so we avoid sending them to Mollie.
  const fileUrlForMetadata = orderData.fileUrl.startsWith('data:') ? '' : orderData.fileUrl;
  const noteForMetadata = (orderData.opmerking ?? '').trim().slice(0, 280);

  const metadata: MolliePaymentMetadata = {
    naam: customerName,
    email: orderData.email,
    land: orderData.land,
    adres: orderData.adres,
    postcode: orderData.postcode,
    stad: orderData.stad,
    anderAfleveradres: Boolean(orderData.anderAfleveradres),
    afleverAdres: orderData.afleverAdres ?? '',
    afleverPostcode: orderData.afleverPostcode ?? '',
    afleverStad: orderData.afleverStad ?? '',
    deliveryTiming: orderData.deliveryTiming ?? 'standaard',
    opmerking: noteForMetadata,
    format: orderData.format,
    exactHeightCm: orderData.exactHeightCm,
    quantity: orderData.quantity,
    addons: orderData.addons,
    fileUrl: fileUrlForMetadata,
    fileId: orderData.fileId,
    total: orderData.total,
  };

  const payment = await client.payments.create({
    amount: {
      currency: 'EUR',
      value: orderData.total.toFixed(2),
    },
    description: `Kartonbaas bestelling - ${customerName}`,
    redirectUrl,
    webhookUrl,
    metadata,
    method: [PaymentMethod.ideal],
  });

  return {
    paymentId: payment.id,
    checkoutUrl: payment.getCheckoutUrl(),
  };
}

export async function getPayment(paymentId: string) {
  const client = getMollieClient();
  return client.payments.get(paymentId);
}
