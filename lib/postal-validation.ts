import type { CountryCode } from './validation';

interface PostalValidationInput {
  country: CountryCode;
  postcode: string;
  city: string;
}

function normalizeCity(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function normalizePostcode(country: CountryCode, postcode: string): string {
  const trimmed = postcode.trim().toUpperCase();
  if (country === 'NL') {
    return trimmed.replace(/\s+/g, '');
  }
  return trimmed;
}

function isCityMatch(expectedCity: string, resolvedPlaces: string[]): boolean {
  const cityNeedle = normalizeCity(expectedCity);
  if (!cityNeedle) return false;

  return resolvedPlaces.some((name) => {
    if (!name) return false;
    if (name === cityNeedle) return true;
    // Be tolerant for naming variants like municipality suffixes.
    return name.includes(cityNeedle) || cityNeedle.includes(name);
  });
}

async function validateWithZippopotam(input: PostalValidationInput, normalizedPostcode: string): Promise<boolean | null> {
  const countryPath = input.country === 'BE' ? 'be' : 'nl';
  let response: Response;
  try {
    response = await fetch(`https://api.zippopotam.us/${countryPath}/${encodeURIComponent(normalizedPostcode)}`, {
      method: 'GET',
      cache: 'no-store',
    });
  } catch {
    return null;
  }

  if (!response.ok) {
    if (response.status >= 500 || response.status === 429) {
      return null;
    }
    return false;
  }

  const json = (await response.json()) as {
    places?: Array<{ 'place name'?: string }>;
  };

  const placeNames = (json.places ?? [])
    .map((place) => normalizeCity(place['place name'] ?? ''))
    .filter(Boolean);

  if (placeNames.length === 0) return false;
  return isCityMatch(input.city, placeNames);
}

async function validateWithNominatim(input: PostalValidationInput, normalizedPostcode: string): Promise<boolean | null> {
  const countryCode = input.country.toLowerCase();
  const params = new URLSearchParams({
    format: 'jsonv2',
    addressdetails: '1',
    limit: '5',
    countrycodes: countryCode,
    postalcode: normalizedPostcode,
    city: input.city.trim(),
  });

  let response: Response;
  try {
    response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Kartonbaas/1.0 (postal-validation)',
      },
    });
  } catch {
    return null;
  }

  if (!response.ok) {
    if (response.status >= 500 || response.status === 429) {
      return null;
    }
    return false;
  }

  const json = (await response.json()) as Array<{
    name?: string;
    display_name?: string;
    address?: {
      city?: string;
      town?: string;
      village?: string;
      municipality?: string;
      postcode?: string;
    };
  }>;

  if (!Array.isArray(json) || json.length === 0) return false;

  const placeNames = json
    .flatMap((item) => [
      item.address?.city,
      item.address?.town,
      item.address?.village,
      item.address?.municipality,
      item.name,
      item.display_name?.split(',')[0],
    ])
    .map((value) => normalizeCity(value ?? ''))
    .filter(Boolean);

  if (placeNames.length === 0) return false;
  return isCityMatch(input.city, placeNames);
}

export async function validatePostalCombination(input: PostalValidationInput): Promise<boolean | null> {
  const normalizedPostcode = normalizePostcode(input.country, input.postcode);
  if (!normalizedPostcode || !input.city.trim()) return false;

  const primaryResult = await validateWithZippopotam(input, normalizedPostcode);
  if (primaryResult === true) return true;

  // Second source prevents false negatives when one dataset is incomplete.
  const fallbackResult = await validateWithNominatim(input, normalizedPostcode);
  if (fallbackResult !== null) return fallbackResult;

  // If both providers are unavailable, allow checkout instead of blocking.
  return primaryResult === null ? null : primaryResult;
}
