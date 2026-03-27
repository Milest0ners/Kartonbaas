export type Format = 'mini' | 'standaard' | 'xl';
export type Addon = string;
export type PricingCountry = 'NL' | 'BE';
export type DeliveryTiming = 'standaard' | 'eerder_1' | 'eerder_2' | 'later_1' | 'later_2' | 'later_3';

export interface PricingConfig {
  formats: Record<Format, { label: string; height: string; price: number }>;
  addons: Record<string, { label: string; price: number; description: string }>;
  maxQuantity: number;
}

export const PRICING: PricingConfig = {
  formats: {
    mini: {
      label: 'Kids',
      height: '80 - 140 cm',
      price: 89.95,
    },
    standaard: {
      label: 'Standaard',
      height: '140 - 180 cm',
      price: 119.95,
    },
    xl: {
      label: 'XXL',
      height: '180 - 210 cm',
      price: 149.95,
    },
  },
  addons: {},
  maxQuantity: 4,
};

export interface OrderPricing {
  format: Format;
  quantity: number;
  addons: Addon[];
  deliveryTiming?: DeliveryTiming;
  shippingCountry?: PricingCountry;
}

export function calculatePrice(order: OrderPricing): {
  basePrice: number;
  addonTotal: number;
  deliveryTotal: number;
  countrySurcharge: number;
  total: number;
  breakdown: string[];
} {
  const formatConfig = PRICING.formats[order.format];
  const basePrice = formatConfig.price * order.quantity;
  const breakdown: string[] = [
    `${formatConfig.label} (${formatConfig.height}) x${order.quantity}: ${formatCurrency(formatConfig.price * order.quantity)}`,
  ];

  let addonTotal = 0;

  for (const addon of order.addons) {
    const addonConfig = PRICING.addons[addon];
    if (!addonConfig) continue;
    addonTotal += addonConfig.price;
    breakdown.push(`${addonConfig.label}: ${formatCurrency(addonConfig.price)}`);
  }

  const deliverySurcharges: Record<DeliveryTiming, number> = {
    standaard: 0,
    eerder_1: 4.95,
    eerder_2: 9.95,
    later_1: 0,
    later_2: 0,
    later_3: 0,
  };

  const deliveryLabels: Record<DeliveryTiming, string> = {
    standaard: 'Standaard aflevermoment',
    eerder_1: '1 werkdag eerder',
    eerder_2: '2 werkdagen eerder',
    later_1: '1 werkdag later',
    later_2: '2 werkdagen later',
    later_3: '3 werkdagen later',
  };

  const deliveryTiming = order.deliveryTiming ?? 'standaard';
  const deliveryTotal = deliverySurcharges[deliveryTiming];
  if (deliveryTotal > 0) {
    breakdown.push(`${deliveryLabels[deliveryTiming]}: ${formatCurrency(deliveryTotal)}`);
  }

  const countrySurcharge = order.shippingCountry === 'BE' ? 4.95 : 0;
  if (countrySurcharge > 0) {
    breakdown.push(`Levering in Belgie: ${formatCurrency(countrySurcharge)}`);
  }

  const total = basePrice + addonTotal + deliveryTotal + countrySurcharge;

  return {
    basePrice,
    addonTotal,
    deliveryTotal,
    countrySurcharge,
    total,
    breakdown,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
