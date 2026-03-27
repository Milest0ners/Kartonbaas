import type { Addon, DeliveryTiming, Format } from './pricing';

export type CountryCode = 'NL' | 'BE';

export interface OrderFormData {
  format: Format | null;
  exactHeightCm: string;
  quantity: number;
  addons: Addon[];
  naam: string;
  email: string;
  land: CountryCode;
  adres: string;
  postcode: string;
  stad: string;
  anderAfleveradres: boolean;
  afleverLand: CountryCode;
  afleverAdres: string;
  afleverPostcode: string;
  afleverStad: string;
  deliveryTiming: DeliveryTiming;
  opmerking: string;
  fileUrl: string | null;
  fileId: string | null;
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateOrderForm(data: OrderFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.format) {
    errors.push({ field: 'format', message: 'Kies een formaat om verder te gaan.' });
  }
  if (!data.exactHeightCm || !/^\d{2,3}$/.test(data.exactHeightCm.trim())) {
    errors.push({ field: 'exactHeightCm', message: 'Vul een geldig exact formaat in (cm).' });
  } else if (data.format) {
    const cm = Number(data.exactHeightCm.trim());
    const ranges: Record<Format, [number, number]> = {
      mini: [80, 140],
      standaard: [140, 180],
      xl: [180, 210],
    };
    const [min, max] = ranges[data.format];
    if (cm < min || cm > max) {
      errors.push({ field: 'exactHeightCm', message: `Kies een formaat binnen ${min} en ${max} cm.` });
    }
  }

  if (!data.fileUrl) {
    errors.push({ field: 'foto', message: 'Upload een foto om verder te gaan.' });
  }

  if (!data.naam || data.naam.trim().length < 2) {
    errors.push({ field: 'naam', message: 'Vul je naam in.' });
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Vul een geldig e-mailadres in.' });
  }

  if (!data.adres || data.adres.trim().length < 5) {
    errors.push({ field: 'adres', message: 'Vul je factuuradres in.' });
  }

  if (!data.postcode || !isValidPostcodeByCountry(data.postcode, data.land)) {
    errors.push({
      field: 'postcode',
      message: data.land === 'BE'
        ? 'Vul een geldige Belgische postcode in (bijv. 2000).'
        : 'Vul een geldige Nederlandse postcode in (bijv. 1234 AB).',
    });
  }

  if (!data.stad || data.stad.trim().length < 2) {
    errors.push({ field: 'stad', message: 'Vul je stad in.' });
  }

  if (data.anderAfleveradres) {
    if (!data.afleverAdres || data.afleverAdres.trim().length < 5) {
      errors.push({ field: 'afleverAdres', message: 'Vul het afleveradres in.' });
    }
    if (!data.afleverPostcode || !isValidPostcodeByCountry(data.afleverPostcode, data.afleverLand)) {
      errors.push({
        field: 'afleverPostcode',
        message: data.afleverLand === 'BE'
          ? 'Vul een geldige Belgische aflever-postcode in (bijv. 2000).'
          : 'Vul een geldige Nederlandse aflever-postcode in (bijv. 1234 AB).',
      });
    }
    if (!data.afleverStad || data.afleverStad.trim().length < 2) {
      errors.push({ field: 'afleverStad', message: 'Vul de afleverstad in.' });
    }
  }

  return errors;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPostcode(postcode: string): boolean {
  return /^\d{4}\s?[A-Za-z]{2}$/.test(postcode.trim());
}

export function isValidBelgianPostcode(postcode: string): boolean {
  return /^\d{4}$/.test(postcode.trim());
}

export function isValidPostcodeByCountry(postcode: string, country: CountryCode): boolean {
  return country === 'BE' ? isValidBelgianPostcode(postcode) : isValidPostcode(postcode);
}

export interface CreatePaymentBody {
  format: string;
  exactHeightCm: string;
  quantity: number;
  addons: string[];
  naam: string;
  email: string;
  land: CountryCode;
  adres: string;
  postcode: string;
  stad: string;
  anderAfleveradres?: boolean;
  afleverLand?: CountryCode;
  afleverAdres?: string;
  afleverPostcode?: string;
  afleverStad?: string;
  deliveryTiming?: DeliveryTiming;
  opmerking?: string;
  fileUrl: string;
  fileId: string;
  total: number;
}

export function validateCreatePaymentBody(body: unknown): {
  valid: boolean;
  data?: CreatePaymentBody;
  errors: string[];
} {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Ongeldig verzoek.'] };
  }

  const b = body as Record<string, unknown>;

  if (!b.format || !['mini', 'standaard', 'xl'].includes(String(b.format))) {
    errors.push('Ongeldig formaat.');
  }
  if (!b.exactHeightCm || typeof b.exactHeightCm !== 'string' || !/^\d{2,3}$/.test(b.exactHeightCm.trim())) {
    errors.push('Exact formaat (cm) ontbreekt of is ongeldig.');
  } else {
    const cm = Number(String(b.exactHeightCm).trim());
    const ranges: Record<string, [number, number]> = {
      mini: [80, 140],
      standaard: [140, 180],
      xl: [180, 210],
    };
    const range = ranges[String(b.format)];
    if (range && (cm < range[0] || cm > range[1])) {
      errors.push(`Exact formaat moet tussen ${range[0]} en ${range[1]} cm liggen.`);
    }
  }

  if (!b.quantity || typeof b.quantity !== 'number' || b.quantity < 1 || b.quantity > 4) {
    errors.push('Ongeldig aantal.');
  }

  if (!b.fileUrl || typeof b.fileUrl !== 'string') {
    errors.push('Foto ontbreekt.');
  }

  if (!b.fileId || typeof b.fileId !== 'string') {
    errors.push('Foto ID ontbreekt.');
  }

  if (!b.naam || typeof b.naam !== 'string' || b.naam.trim().length < 2) {
    errors.push('Naam ontbreekt.');
  }

  if (!b.email || typeof b.email !== 'string' || !isValidEmail(b.email)) {
    errors.push('E-mailadres ontbreekt of is ongeldig.');
  }

  if (!b.adres || typeof b.adres !== 'string' || b.adres.trim().length < 5) {
    errors.push('Factuuradres ontbreekt.');
  }

  const land = b.land === 'BE' ? 'BE' : 'NL';
  if (!b.postcode || typeof b.postcode !== 'string' || !isValidPostcodeByCountry(b.postcode, land)) {
    errors.push(land === 'BE' ? 'Belgische postcode is ongeldig.' : 'Nederlandse postcode is ongeldig.');
  }

  if (!b.stad || typeof b.stad !== 'string' || b.stad.trim().length < 2) {
    errors.push('Stad ontbreekt.');
  }

  if (!b.total || typeof b.total !== 'number' || b.total <= 0) {
    errors.push('Totaalbedrag is ongeldig.');
  }

  const allowedDeliveryTiming = new Set(['standaard', 'eerder_1', 'eerder_2', 'later_1', 'later_2', 'later_3']);
  if (!b.deliveryTiming || typeof b.deliveryTiming !== 'string' || !allowedDeliveryTiming.has(b.deliveryTiming)) {
    errors.push('Aflevermoment is ongeldig.');
  }

  const anderAfleveradres = Boolean(b.anderAfleveradres);
  const afleverLand = b.afleverLand === 'BE' ? 'BE' : 'NL';
  if (anderAfleveradres) {
    if (!b.afleverAdres || typeof b.afleverAdres !== 'string' || b.afleverAdres.trim().length < 5) {
      errors.push('Afleveradres ontbreekt.');
    }
    if (!b.afleverPostcode || typeof b.afleverPostcode !== 'string' || !isValidPostcodeByCountry(b.afleverPostcode, afleverLand)) {
      errors.push(afleverLand === 'BE' ? 'Belgische aflever-postcode is ongeldig.' : 'Nederlandse aflever-postcode is ongeldig.');
    }
    if (!b.afleverStad || typeof b.afleverStad !== 'string' || b.afleverStad.trim().length < 2) {
      errors.push('Afleverstad ontbreekt.');
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      format: String(b.format),
      exactHeightCm: b.exactHeightCm ? String(b.exactHeightCm).trim() : '',
      quantity: Number(b.quantity),
      addons: Array.isArray(b.addons) ? (b.addons as string[]) : [],
      naam: b.naam ? String(b.naam).trim() : '',
      email: b.email ? String(b.email).trim().toLowerCase() : '',
      land,
      adres: b.adres ? String(b.adres).trim() : '',
      postcode: b.postcode ? String(b.postcode).trim().toUpperCase() : '',
      stad: b.stad ? String(b.stad).trim() : '',
      anderAfleveradres,
      afleverLand,
      afleverAdres: b.afleverAdres ? String(b.afleverAdres).trim() : '',
      afleverPostcode: b.afleverPostcode ? String(b.afleverPostcode).trim().toUpperCase() : '',
      afleverStad: b.afleverStad ? String(b.afleverStad).trim() : '',
      deliveryTiming: (b.deliveryTiming as DeliveryTiming) ?? 'standaard',
      opmerking: b.opmerking ? String(b.opmerking).trim() : '',
      fileUrl: String(b.fileUrl),
      fileId: String(b.fileId),
      total: Number(b.total),
    },
    errors: [],
  };
}
