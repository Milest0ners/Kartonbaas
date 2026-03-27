import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { MolliePaymentMetadata } from './mollie';

export type FulfillmentStatus =
  | 'nieuw'
  | 'in_behandeling'
  | 'in_productie'
  | 'verzonden'
  | 'afgerond';

export interface StoredOrder {
  id: string;
  order_number: string;
  payment_id: string;
  payment_status: string;
  payment_method: string | null;
  customer_name: string;
  customer_email: string;
  customer_address: string;
  customer_postcode: string;
  customer_city: string;
  customer_note: string;
  format: string;
  quantity: number;
  addons: string[];
  total: number;
  file_url: string;
  file_id: string;
  email_sent: boolean;
  customer_email_sent: boolean;
  admin_email_sent: boolean;
  fulfillment_status: FulfillmentStatus;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UpsertOrderInput {
  orderNumber: string;
  paymentId: string;
  paymentStatus: string;
  paymentMethod: string | null;
  metadata: MolliePaymentMetadata;
  paidAt: string | null;
}

let supabaseClient: SupabaseClient | null = null;

function getFormatSummary(format: string, exactHeightCm?: string): string {
  const formatLabels: Record<string, string> = {
    mini: 'Kids',
    standaard: 'Standaard',
    xl: 'XXL',
  };
  const label = formatLabels[format] ?? format;
  return exactHeightCm ? `${label} (${exactHeightCm} cm)` : label;
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

function getDeliveryTimingAddonLabel(timing: string | undefined, paidAt: string | null): string {
  const referenceDate = paidAt ? new Date(paidAt) : new Date();
  const safeDate = Number.isNaN(referenceDate.getTime()) ? new Date() : referenceDate;
  const baseDate = shiftBusinessDays(safeDate, 4);

  switch (timing) {
    case 'eerder_1':
      return `Aflevermoment: 1 werkdag eerder (${formatDeliveryDate(shiftBusinessDays(baseDate, -1))})`;
    case 'eerder_2':
      return `Aflevermoment: 2 werkdagen eerder (${formatDeliveryDate(shiftBusinessDays(baseDate, -2))})`;
    case 'later_1':
      return `Aflevermoment: 1 werkdag later (${formatDeliveryDate(shiftBusinessDays(baseDate, 1))})`;
    case 'later_2':
      return `Aflevermoment: 2 werkdagen later (${formatDeliveryDate(shiftBusinessDays(baseDate, 2))})`;
    case 'later_3':
      return `Aflevermoment: 3 werkdagen later (${formatDeliveryDate(shiftBusinessDays(baseDate, 3))})`;
    case 'standaard':
    default:
      return `Aflevermoment: Standaard (${formatDeliveryDate(baseDate)})`;
  }
}

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }

  supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return supabaseClient;
}

export function isOrderStorageEnabled(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function getOrderByPaymentId(paymentId: string): Promise<StoredOrder | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from('orders')
    .select('*')
    .eq('payment_id', paymentId)
    .maybeSingle();

  if (error) throw error;
  return data as StoredOrder | null;
}

export async function getOrderById(orderId: string): Promise<StoredOrder | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .maybeSingle();

  if (error) throw error;
  return data as StoredOrder | null;
}

export async function upsertPaidOrder(input: UpsertOrderInput): Promise<StoredOrder | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const deliveryAddon = getDeliveryTimingAddonLabel(input.metadata.deliveryTiming, input.paidAt);
  const normalizedAddons = [...input.metadata.addons];
  if (!normalizedAddons.some((item) => item.startsWith('Aflevermoment:'))) {
    normalizedAddons.push(deliveryAddon);
  }

  const { data, error } = await client
    .from('orders')
    .upsert(
      {
        order_number: input.orderNumber,
        payment_id: input.paymentId,
        payment_status: input.paymentStatus,
        payment_method: input.paymentMethod,
        customer_name: input.metadata.naam,
        customer_email: input.metadata.email,
        customer_address: input.metadata.adres,
        customer_postcode: input.metadata.postcode,
        customer_city: input.metadata.stad,
        customer_note: input.metadata.opmerking || '',
        format: getFormatSummary(input.metadata.format, input.metadata.exactHeightCm),
        quantity: input.metadata.quantity,
        addons: normalizedAddons,
        total: input.metadata.total,
        file_url: input.metadata.fileUrl,
        file_id: input.metadata.fileId,
        paid_at: input.paidAt,
      },
      { onConflict: 'payment_id' }
    )
    .select('*')
    .single();

  if (error) throw error;
  return data as StoredOrder;
}

export async function setOrderEmailFlags(
  paymentId: string,
  flags: { customerEmailSent: boolean; adminEmailSent: boolean }
): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const emailSent = flags.customerEmailSent && flags.adminEmailSent;

  const { error } = await client
    .from('orders')
    .update({
      customer_email_sent: flags.customerEmailSent,
      admin_email_sent: flags.adminEmailSent,
      email_sent: emailSent,
    })
    .eq('payment_id', paymentId);

  if (error) throw error;
}

export async function listOrders(limit = 100): Promise<StoredOrder[]> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return [];

  const response = await fetch(
    `${supabaseUrl}/rest/v1/orders?select=*&order=created_at.desc&limit=${Math.max(1, limit)}`,
    {
      method: 'GET',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    let details = `HTTP ${response.status}`;
    try {
      const json = (await response.json()) as { message?: string; code?: string };
      details = json.code ? `${json.code}: ${json.message ?? details}` : (json.message ?? details);
    } catch {
      // keep default details
    }
    throw new Error(details);
  }

  const data = (await response.json()) as StoredOrder[];
  return data ?? [];
}

export async function updateOrderFulfillmentStatus(
  orderId: string,
  fulfillmentStatus: FulfillmentStatus
): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const { error } = await client
    .from('orders')
    .update({ fulfillment_status: fulfillmentStatus })
    .eq('id', orderId);

  if (error) throw error;
}
