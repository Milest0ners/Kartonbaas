import type { Metadata } from 'next';
import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { logoutAdmin } from '@/app/admin/actions';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Bestellingen | Admin',
  robots: {
    index: false,
    follow: false,
  },
};

interface StoredOrder {
  fileName: string;
  ordernummer?: string;
  paymentId?: string;
  processedAt?: string;
  status?: OrderStatus;
  metadata?: {
    naam?: string;
    email?: string;
    format?: string;
    exactHeightCm?: string;
    quantity?: number;
    total?: number;
    fileUrl?: string;
  };
}

type OrderStatus = 'nieuw' | 'in_behandeling' | 'in_productie' | 'verzonden' | 'afgerond';

const STATUS_OPTIONS: Array<{ value: OrderStatus; label: string }> = [
  { value: 'nieuw', label: 'Nieuw' },
  { value: 'in_behandeling', label: 'In behandeling' },
  { value: 'in_productie', label: 'In productie' },
  { value: 'verzonden', label: 'Verzonden' },
  { value: 'afgerond', label: 'Afgerond' },
];

function getStatusLabel(status?: OrderStatus) {
  return STATUS_OPTIONS.find((option) => option.value === status)?.label ?? 'Nieuw';
}

function getStatusClasses(status?: OrderStatus) {
  switch (status) {
    case 'in_behandeling':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'in_productie':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'verzonden':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'afgerond':
      return 'bg-green-100 text-green-700 border-green-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

async function getOrders(): Promise<StoredOrder[]> {
  const ordersDir = path.join(process.cwd(), '.orders');

  try {
    const files = await fs.readdir(ordersDir);
    const jsonFiles = files.filter((name) => name.endsWith('.json'));

    const records = await Promise.all(
      jsonFiles.map(async (fileName) => {
        try {
          const raw = await fs.readFile(path.join(ordersDir, fileName), 'utf8');
          const parsed = JSON.parse(raw) as Omit<StoredOrder, 'fileName'>;
          return {
            fileName,
            ...parsed,
            status: parsed.status ?? 'nieuw',
          } as StoredOrder;
        } catch {
          return null;
        }
      })
    );

    return records
      .filter((item): item is StoredOrder => item !== null)
      .sort((a, b) => {
        const aDate = a.processedAt ? new Date(a.processedAt).getTime() : 0;
        const bDate = b.processedAt ? new Date(b.processedAt).getTime() : 0;
        return bDate - aDate;
      });
  } catch {
    return [];
  }
}

function formatCurrency(value?: number) {
  if (typeof value !== 'number') return 'Onbekend';
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

async function updateOrderStatus(formData: FormData) {
  'use server';

  const fileName = String(formData.get('fileName') ?? '');
  const status = String(formData.get('status') ?? '') as OrderStatus;
  const ordersDir = path.join(process.cwd(), '.orders');

  const allowedStatuses = new Set(STATUS_OPTIONS.map((option) => option.value));
  if (!fileName.endsWith('.json') || fileName.includes('/') || fileName.includes('\\')) return;
  if (!allowedStatuses.has(status)) return;

  const filePath = path.join(ordersDir, fileName);

  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const updated = {
      ...parsed,
      status,
      updatedAt: new Date().toISOString(),
    };
    await fs.writeFile(filePath, JSON.stringify(updated, null, 2), 'utf8');
  } catch {
    return;
  }

  revalidatePath('/admin/bestellingen');
}

export default async function AdminBestellingenPage() {
  const orders = await getOrders();

  return (
    <>
      <Header />
      <main className="pt-24 pb-20 px-6 bg-cream min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-ink">Bestellingen overzicht</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Deze pagina toont lokaal opgeslagen betaalde orders uit <code>.orders</code>.
                </p>
              </div>
              <form action={logoutAdmin}>
                <button
                  type="submit"
                  className="inline-flex items-center px-3 py-2 rounded-lg bg-white text-ink text-xs font-black border-2 border-ink shadow-bold hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                >
                  Uitloggen
                </button>
              </form>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white border-2 border-ink rounded-2xl p-6 shadow-bold">
              <p className="text-sm text-gray-700">
                Nog geen orders gevonden. Plaats eerst een testbestelling en zorg dat de webhook succesvol wordt verwerkt.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, idx) => (
                <article key={`${order.ordernummer ?? 'order'}-${idx}`} className="bg-white border-2 border-ink rounded-2xl p-5 shadow-bold">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Ordernummer</p>
                      <p className="font-black text-ink mt-1">{order.ordernummer ?? 'Onbekend'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Klant</p>
                      <p className="font-semibold text-ink mt-1">{order.metadata?.naam ?? 'Onbekend'}</p>
                      <p className="text-gray-600">{order.metadata?.email ?? '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Product</p>
                      <p className="font-semibold text-ink mt-1">
                        {order.metadata?.format ?? 'Onbekend'}
                        {order.metadata?.exactHeightCm ? ` (${order.metadata.exactHeightCm} cm)` : ''} x {order.metadata?.quantity ?? '-'}
                      </p>
                      <p className="text-gray-600">{formatCurrency(order.metadata?.total)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Betaald op</p>
                      <p className="font-semibold text-ink mt-1">
                        {order.processedAt ? new Date(order.processedAt).toLocaleString('nl-NL') : 'Onbekend'}
                      </p>
                      <p className="text-gray-600">Payment ID: {order.paymentId ?? '-'}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-bold ${getStatusClasses(order.status)}`}>
                      Status: {getStatusLabel(order.status)}
                    </span>

                    <form action={updateOrderStatus} className="flex items-center gap-2">
                      <input type="hidden" name="fileName" value={order.fileName} />
                      <select
                        name="status"
                        defaultValue={order.status ?? 'nieuw'}
                        className="h-9 rounded-lg border-2 border-ink bg-white px-3 text-xs font-semibold text-ink"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="inline-flex items-center px-3 py-2 rounded-lg bg-white text-ink text-xs font-black border-2 border-ink shadow-bold hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                      >
                        Status opslaan
                      </button>
                    </form>

                    {order.metadata?.fileUrl ? (
                      <>
                        <Link
                          href={order.metadata.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 rounded-lg bg-orange-500 text-white text-xs font-black border-2 border-ink shadow-bold hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                        >
                          Bekijk foto
                        </Link>
                        <Link
                          href={`/api/admin/orders/download?file=${encodeURIComponent(order.fileName)}`}
                          className="inline-flex items-center px-3 py-2 rounded-lg bg-ink text-white text-xs font-black border-2 border-ink shadow-bold hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                        >
                          Download foto
                        </Link>
                      </>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
