'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { formatCurrency } from '@/lib/pricing';
import type { Format } from '@/lib/pricing';

type StoredOrder = {
  naam?: string;
  email?: string;
  adres?: string;
  postcode?: string;
  stad?: string;
  opmerking?: string;
  format?: Format;
  exactHeightCm?: string;
  quantity?: number;
  total?: number;
  fileUrl?: string | null;
  deliveryTiming?: 'standaard' | 'eerder_1' | 'eerder_2' | 'later_1' | 'later_2' | 'later_3';
  paymentId?: string | null;
  createdAt?: string;
};

type PaymentStatusResponse = {
  id: string;
  status: string;
  paidAt: string | null;
  amount: { value: string; currency: string };
  method: string | null;
};

function isPaymentStatusResponse(value: unknown): value is PaymentStatusResponse {
  if (!value || typeof value !== 'object') return false;
  const data = value as Record<string, unknown>;
  return (
    typeof data.id === 'string' &&
    typeof data.status === 'string' &&
    typeof data.amount === 'object' &&
    data.amount !== null
  );
}

const FORMAT_LABELS: Record<Format, string> = {
  mini: 'Kids (80 - 140 cm)',
  standaard: 'Standaard (140 - 180 cm)',
  xl: 'XXL (180 - 210 cm)',
};

function formatDate(iso?: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('nl-NL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d);
}

function shiftBusinessDays(startDate: Date, businessDays: number): Date {
  const result = new Date(startDate);
  if (businessDays === 0) return result;
  const direction = businessDays > 0 ? 1 : -1;
  let moved = 0;
  while (moved < Math.abs(businessDays)) {
    result.setDate(result.getDate() + direction);
    const day = result.getDay();
    if (day !== 0 && day !== 6) moved += 1;
  }
  return result;
}

function formatDeliveryDate(date: Date): string {
  return new Intl.DateTimeFormat('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

function getDeliveryTimingLabel(
  timing?: StoredOrder['deliveryTiming'],
  createdAt?: string
): string {
  if (!timing) return '-';
  const referenceDate = createdAt ? new Date(createdAt) : new Date();
  const safeDate = Number.isNaN(referenceDate.getTime()) ? new Date() : referenceDate;
  const baseDate = shiftBusinessDays(safeDate, 4);

  switch (timing) {
    case 'eerder_1':
      return `1 werkdag eerder (${formatDeliveryDate(shiftBusinessDays(baseDate, -1))})`;
    case 'eerder_2':
      return `2 werkdagen eerder (${formatDeliveryDate(shiftBusinessDays(baseDate, -2))})`;
    case 'later_1':
      return `1 werkdag later (${formatDeliveryDate(shiftBusinessDays(baseDate, 1))})`;
    case 'later_2':
      return `2 werkdagen later (${formatDeliveryDate(shiftBusinessDays(baseDate, 2))})`;
    case 'later_3':
      return `3 werkdagen later (${formatDeliveryDate(shiftBusinessDays(baseDate, 3))})`;
    case 'standaard':
    default:
      return `Standaard (${formatDeliveryDate(baseDate)})`;
  }
}

export default function BedanktPage() {
  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem('kb_last_order');
      if (!raw) return;
      setOrder(JSON.parse(raw) as StoredOrder);
    } catch {
      setOrder(null);
    }
  }, []);

  useEffect(() => {
    const paymentId = order?.paymentId;
    if (!paymentId) return;

    const controller = new AbortController();
    setStatusLoading(true);
    setStatusError(null);

    fetch(`/api/payment-status?id=${encodeURIComponent(paymentId)}`, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (res) => {
        const json = (await res.json()) as PaymentStatusResponse | { error?: string };
        if (!res.ok || 'error' in json || !isPaymentStatusResponse(json)) {
          const message = 'error' in json && json.error ? json.error : 'Status kon niet worden opgehaald.';
          throw new Error(message);
        }
        setPaymentStatus(json);
      })
      .catch((error: unknown) => {
        if ((error as Error).name === 'AbortError') return;
        setStatusError('We konden de betaalstatus niet controleren. Vernieuw de pagina later nog eens.');
      })
      .finally(() => setStatusLoading(false));

    return () => controller.abort();
  }, [order?.paymentId]);

  const statusMeta = useMemo(() => {
    const status = paymentStatus?.status;
    if (!status) return { label: 'Onbekend', tone: 'text-gray-700 bg-gray-100 border-gray-300', hint: 'Geen betaalstatus beschikbaar.' };

    if (status === 'paid') {
      return {
        label: 'Betaald',
        tone: 'text-green-700 bg-green-100 border-green-300',
        hint: 'Top! Je betaling is bevestigd. We gaan je bestelling nu verwerken.',
      };
    }
    if (status === 'open' || status === 'pending' || status === 'authorized') {
      return {
        label: 'Nog niet afgerond',
        tone: 'text-amber-700 bg-amber-100 border-amber-300',
        hint: 'Je betaling is nog niet afgerond. Rond de betaling af in Mollie om je order te bevestigen.',
      };
    }
    if (status === 'failed' || status === 'canceled' || status === 'expired') {
      return {
        label: 'Niet betaald',
        tone: 'text-red-700 bg-red-100 border-red-300',
        hint: 'Deze betaling is niet gelukt of geannuleerd. Plaats gerust opnieuw een bestelling.',
      };
    }

    return {
      label: status,
      tone: 'text-gray-700 bg-gray-100 border-gray-300',
      hint: 'Status ontvangen van Mollie.',
    };
  }, [paymentStatus?.status]);

  return (
    <>
      <Header />
      <main id="main-content" className="pt-16 bg-cream min-h-screen">
        <section className="px-6 py-16 md:py-20">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border-2 border-ink rounded-3xl shadow-bold-lg p-8 md:p-10">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-ink tracking-tight mb-3">Bedankt voor je bestelling</h1>
              <p className="text-gray-600 leading-relaxed mb-8">
                Je betaling is ontvangen door Mollie. We controleren je foto binnen 24 uur. Zodra alles akkoord is, start de productie van je cut-out.
              </p>

              <div className="border border-gray-200 rounded-2xl p-5 mb-8">
                <h2 className="text-sm font-black text-ink uppercase tracking-widest mb-4">Betaalstatus</h2>
                <div
                  className={[
                    'inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-semibold',
                    statusMeta.tone,
                  ].join(' ')}
                >
                  {statusLoading ? 'Status laden...' : statusMeta.label}
                </div>
                <p className="text-sm text-gray-600 mt-3">{statusError ?? statusMeta.hint}</p>
                {paymentStatus?.paidAt && (
                  <p className="text-xs text-gray-500 mt-2">Betaald op: {formatDate(paymentStatus.paidAt)}</p>
                )}
              </div>

              <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5 mb-8">
                <h2 className="text-sm font-black text-ink uppercase tracking-widest mb-4">Wat gebeurt er nu?</h2>
                <ol className="space-y-3 text-sm text-gray-700">
                  <li>1. Fotocheck binnen 24 uur. Bij twijfel nemen we contact met je op.</li>
                  <li>2. Na akkoord gaat je bestelling in productie.</li>
                  <li>3. Verzending in stevige verpakking, normaal binnen 3-5 werkdagen.</li>
                  <li>4. Je ontvangt updates per e-mail op het door jou ingevulde adres.</li>
                </ol>
              </div>

              <div className="border border-gray-200 rounded-2xl p-5 mb-8">
                <h2 className="text-sm font-black text-ink uppercase tracking-widest mb-4">Jouw gegevens</h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  <div>
                    <dt className="text-gray-500">Naam</dt>
                    <dd className="font-semibold text-gray-900">{order?.naam ?? '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">E-mail</dt>
                    <dd className="font-semibold text-gray-900">{order?.email ?? '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Formaat</dt>
                    <dd className="font-semibold text-gray-900">
                      {order?.format ? FORMAT_LABELS[order.format] : '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Aantal</dt>
                    <dd className="font-semibold text-gray-900">{order?.quantity ?? '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Exact formaat</dt>
                    <dd className="font-semibold text-gray-900">
                      {order?.exactHeightCm ? `${order.exactHeightCm} cm` : '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Totaal</dt>
                    <dd className="font-semibold text-gray-900">
                      {typeof order?.total === 'number' ? formatCurrency(order.total) : '-'}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-gray-500">Leveradres</dt>
                    <dd className="font-semibold text-gray-900">
                      {[order?.adres, order?.postcode, order?.stad].filter(Boolean).join(', ') || '-'}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-gray-500">Gekozen levermoment</dt>
                    <dd className="font-semibold text-gray-900">
                      {getDeliveryTimingLabel(order?.deliveryTiming, order?.createdAt)}
                    </dd>
                  </div>
                  {order?.opmerking?.trim() ? (
                    <div className="sm:col-span-2">
                      <dt className="text-gray-500">Opmerking</dt>
                      <dd className="font-semibold text-gray-900 whitespace-pre-wrap">{order.opmerking.trim()}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="text-gray-500">Betaling gestart op</dt>
                    <dd className="font-semibold text-gray-900">{formatDate(order?.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Betaling ID</dt>
                    <dd className="font-semibold text-gray-900 break-all">{order?.paymentId ?? '-'}</dd>
                  </div>
                </dl>
                {order?.fileUrl ? (
                  <div className="mt-5 pt-5 border-t border-gray-200">
                    <p className="text-gray-500 text-sm mb-2">Geuploade foto</p>
                    <a
                      href={order.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 rounded-lg bg-white text-ink text-xs font-black border-2 border-ink shadow-bold hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                    >
                      Bekijk je upload
                    </a>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/"
                  className="inline-flex justify-center items-center px-5 py-3 rounded-xl border-2 border-ink bg-orange-500 text-white font-black shadow-bold hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                >
                  Terug naar homepage
                </Link>
                <a
                  href="mailto:info@kartonbaas.nl"
                  className="inline-flex justify-center items-center px-5 py-3 rounded-xl border-2 border-ink bg-white text-ink font-black shadow-bold hover:bg-orange-50 transition-all"
                >
                  Vraag stellen via e-mail
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
