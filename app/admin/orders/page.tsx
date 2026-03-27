import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  isOrderStorageEnabled,
  listOrders,
  type FulfillmentStatus,
  type StoredOrder,
} from '@/lib/orders-store';

export const dynamic = 'force-dynamic';

const STATUS_OPTIONS: { value: FulfillmentStatus; label: string }[] = [
  { value: 'nieuw', label: 'Nieuw' },
  { value: 'in_behandeling', label: 'In behandeling' },
  { value: 'in_productie', label: 'In productie' },
  { value: 'verzonden', label: 'Verzonden' },
  { value: 'afgerond', label: 'Afgerond' },
];

function formatDate(value: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('nl-NL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount);
}

function isAuthorized(token: string | undefined): boolean {
  const dashboardToken = process.env.ADMIN_DASHBOARD_TOKEN;
  if (!dashboardToken) return true;
  return Boolean(token && token === dashboardToken);
}

function StatusForm({ order, token }: { order: StoredOrder; token?: string }) {
  return (
    <form action="/api/admin/orders/status" method="POST" className="flex gap-2 items-center">
      <input type="hidden" name="orderId" value={order.id} />
      <input type="hidden" name="t" value={token ?? ''} />
      <select
        name="fulfillmentStatus"
        defaultValue={order.fulfillment_status}
        className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="text-xs px-2 py-1 border border-ink rounded-md bg-orange-500 text-white font-semibold"
      >
        Opslaan
      </button>
    </form>
  );
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { t?: string };
}) {
  const token = searchParams?.t;

  if (!isAuthorized(token)) {
    return (
      <>
        <Header />
        <main id="main-content" className="pt-20 px-6 pb-20 bg-cream min-h-screen">
          <div className="max-w-3xl mx-auto bg-white border-2 border-ink rounded-2xl p-8 shadow-bold">
            <h1 className="text-2xl font-black text-ink mb-3">Geen toegang</h1>
            <p className="text-gray-700">
              Voeg de juiste dashboard token toe als queryparameter:
              <code className="ml-2 bg-gray-100 px-2 py-1 rounded">/admin/orders?t=...</code>
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const storageEnabled = isOrderStorageEnabled();
  let orders: StoredOrder[] = [];
  let ordersError: string | null = null;

  if (storageEnabled) {
    try {
      orders = await listOrders(200);
    } catch (error) {
      if (error instanceof Error) {
        ordersError = error.message;
      } else if (typeof error === 'object' && error && 'message' in error) {
        ordersError = String((error as { message: unknown }).message);
      } else {
        ordersError = 'Onbekende fout bij ophalen orders.';
      }
    }
  }

  return (
    <>
      <Header />
      <main id="main-content" className="pt-20 px-6 pb-20 bg-cream min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-black text-ink">Bestellingen</h1>
              <p className="text-sm text-gray-600 mt-1">
                Overzicht van betaalde orders uit de database.
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 border-2 border-ink rounded-xl bg-white text-ink font-semibold shadow-bold"
            >
              Naar website
            </Link>
          </div>

          {!storageEnabled && (
            <div className="bg-white border-2 border-red-300 rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-bold text-ink mb-2">Orderopslag niet geconfigureerd</h2>
              <p className="text-sm text-gray-700">
                Stel <code>SUPABASE_URL</code> en <code>SUPABASE_SERVICE_ROLE_KEY</code> in om
                orders op te slaan en hier te tonen.
              </p>
              <p className="text-xs text-gray-500 mt-3">
                Controleer setup via{' '}
                <code>
                  /api/admin/setup-check{token ? `?t=${token}` : ''}
                </code>
              </p>
            </div>
          )}

          {storageEnabled && ordersError && (
            <div className="bg-white border-2 border-red-300 rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-bold text-ink mb-2">Orders konden niet worden geladen</h2>
              <p className="text-sm text-gray-700">
                Waarschijnlijk bestaat tabel <code>orders</code> nog niet in Supabase. Voer het SQL-script
                uit uit <code>supabase/orders_schema.sql</code>.
              </p>
              <p className="text-xs text-gray-500 mt-3 break-all">{ordersError}</p>
            </div>
          )}

          {storageEnabled && !ordersError && orders.length === 0 && (
            <div className="bg-white border-2 border-ink rounded-2xl p-6">Nog geen orders gevonden.</div>
          )}

          <div className="space-y-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className="bg-white border-2 border-ink rounded-2xl p-5 shadow-bold-sm"
              >
                <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Ordernummer</p>
                    <p className="text-lg font-black text-ink">{order.order_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Betaling</p>
                    <p className="font-semibold text-ink">{order.payment_status}</p>
                  </div>
                </div>

                <dl className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-4">
                  <div>
                    <dt className="text-gray-500">Klant</dt>
                    <dd className="font-semibold text-ink">{order.customer_name}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">E-mail</dt>
                    <dd className="font-semibold text-ink break-all">{order.customer_email}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Totaal</dt>
                    <dd className="font-semibold text-ink">{formatCurrency(order.total)}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Formaat / aantal</dt>
                    <dd className="font-semibold text-ink">
                      {order.format} x{order.quantity}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Add-ons</dt>
                    <dd className="font-semibold text-ink">
                      {order.addons.length ? order.addons.join(', ') : 'Geen'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Aangemaakt</dt>
                    <dd className="font-semibold text-ink">{formatDate(order.created_at)}</dd>
                  </div>
                  <div className="md:col-span-3">
                    <dt className="text-gray-500">Adres</dt>
                    <dd className="font-semibold text-ink">
                      {order.customer_address}, {order.customer_postcode} {order.customer_city}
                    </dd>
                  </div>
                  {order.customer_note && (
                    <div className="md:col-span-3">
                      <dt className="text-gray-500">Opmerking</dt>
                      <dd className="font-semibold text-ink">{order.customer_note}</dd>
                    </div>
                  )}
                </dl>

                <div className="flex flex-wrap items-center gap-4 justify-between border-t pt-4">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                    <span>
                      Klantmail: {order.customer_email_sent ? 'ja' : 'nee'} · Adminmail:{' '}
                      {order.admin_email_sent ? 'ja' : 'nee'}
                    </span>
                    {order.file_url ? (
                      <>
                        <a
                          href={order.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2.5 py-1 border border-ink rounded-md bg-white text-ink font-semibold"
                        >
                          Foto bekijken
                        </a>
                        <a
                          href={`/api/admin/orders/download?orderId=${encodeURIComponent(order.id)}${token ? `&t=${encodeURIComponent(token)}` : ''}`}
                          className="inline-flex items-center px-2.5 py-1 border border-ink rounded-md bg-white text-ink font-semibold"
                        >
                          Download foto
                        </a>
                      </>
                    ) : (
                      <span className="text-gray-400">Geen foto-URL (lokale testupload)</span>
                    )}
                  </div>
                  <StatusForm order={order} token={token} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
