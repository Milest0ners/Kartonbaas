'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import * as RadioGroup from '@radix-ui/react-radio-group';
import UploadField from './UploadField';
import { PRICING, calculatePrice, formatCurrency } from '@/lib/pricing';
import { validateOrderForm } from '@/lib/validation';
import type { Format, DeliveryTiming } from '@/lib/pricing';
import type { CountryCode, OrderFormData } from '@/lib/validation';

interface ConfiguratorProps {
  onPreviewImageChange?: (url: string) => void;
}

export default function Configurator({ onPreviewImageChange }: ConfiguratorProps) {
  const getFormatRange = (format: Format): [number, number] => {
    const ranges: Record<Format, [number, number]> = {
      mini: [80, 140],
      standaard: [140, 180],
      xl: [180, 210],
    };
    return ranges[format];
  };

  const getHeightPlaceholder = (format: Format | null): string => {
    if (!format) return 'Bijv. 173';
    const [min, max] = getFormatRange(format);
    return `Bijv. ${Math.round((min + max) / 2)}`;
  };

  const getPostcodePlaceholder = (country: CountryCode) => (country === 'BE' ? '2000' : '1234 AB');
  const getCityPlaceholder = (country: CountryCode) => (country === 'BE' ? 'Antwerpen' : 'Amsterdam');

  const [form, setForm] = useState<OrderFormData>({
    format: null,
    exactHeightCm: '',
    quantity: 1,
    addons: [],
    naam: '',
    email: '',
    land: 'NL',
    adres: '',
    postcode: '',
    stad: '',
    anderAfleveradres: false,
    afleverLand: 'NL',
    afleverAdres: '',
    afleverPostcode: '',
    afleverStad: '',
    deliveryTiming: 'standaard',
    opmerking: '',
    fileUrl: null,
    fileId: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const shippingCountry: CountryCode = form.anderAfleveradres ? form.afleverLand : form.land;
  const deliveryOptions: Array<{ value: DeliveryTiming; label: string }> = (() => {
    const shiftBusinessDays = (startDate: Date, businessDays: number) => {
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
    };
    const formatDateLabel = (date: Date) =>
      new Intl.DateTimeFormat('nl-NL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(date);

    const baseDate = shiftBusinessDays(new Date(), 4);
    return [
      { value: 'eerder_1', label: `1 werkdag eerder (${formatDateLabel(shiftBusinessDays(baseDate, -1))}) + €4,95` },
      { value: 'eerder_2', label: `2 werkdagen eerder (${formatDateLabel(shiftBusinessDays(baseDate, -2))}) + €9,95` },
      { value: 'standaard', label: `Standaard (${formatDateLabel(baseDate)})` },
      { value: 'later_1', label: `1 werkdag later (${formatDateLabel(shiftBusinessDays(baseDate, 1))})` },
      { value: 'later_2', label: `2 werkdagen later (${formatDateLabel(shiftBusinessDays(baseDate, 2))})` },
      { value: 'later_3', label: `3 werkdagen later (${formatDateLabel(shiftBusinessDays(baseDate, 3))})` },
    ];
  })();

  useEffect(() => {
    const applyPreselectedFormat = (value: unknown) => {
      if (value !== 'mini' && value !== 'standaard' && value !== 'xl') return;
      setForm((prev) => ({ ...prev, format: value, exactHeightCm: '' }));
      setTouched((prev) => ({ ...prev, format: true }));
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next.format;
        delete next.exactHeightCm;
        return next;
      });
    };

    const stored = window.sessionStorage.getItem('kb_preselect_format');
    if (stored) {
      applyPreselectedFormat(stored);
      window.sessionStorage.removeItem('kb_preselect_format');
    }

    const onPreselect = (event: Event) => {
      const custom = event as CustomEvent;
      applyPreselectedFormat(custom.detail);
    };

    window.addEventListener('kb-preselect-format', onPreselect);
    return () => window.removeEventListener('kb-preselect-format', onPreselect);
  }, []);

  const pricing = form.format
    ? calculatePrice({
        format: form.format,
        quantity: form.quantity,
        addons: form.addons,
        deliveryTiming: form.deliveryTiming,
        shippingCountry,
      })
    : null;

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const fieldError = (field: string): string | null => {
    if (!touched[field]) return null;
    return validationErrors[field] ?? null;
  };

  const liveHeightRangeError = (() => {
    if (!form.format || !form.exactHeightCm.trim()) return null;
    const value = Number(form.exactHeightCm);
    if (!Number.isFinite(value)) return null;
    const [min, max] = getFormatRange(form.format);
    if (value < min || value > max) {
      return `Vul een afmeting in tussen ${min} en ${max} cm.`;
    }
    return null;
  })();

  const focusFirstErrorField = (field: string) => {
    const idMap: Record<string, string> = {
      format: 'format-group',
      exactHeightCm: 'exactHeightCm',
      foto: 'foto-upload',
      naam: 'naam',
      email: 'email',
      land: 'land',
      adres: 'adres',
      postcode: 'postcode',
      stad: 'stad',
      afleverAdres: 'afleverAdres',
      afleverLand: 'afleverLand',
      afleverPostcode: 'afleverPostcode',
      afleverStad: 'afleverStad',
      privacyAccepted: 'privacyAccepted',
      termsAccepted: 'termsAccepted',
    };
    const targetId = idMap[field];
    if (!targetId) return;
    const target = document.getElementById(targetId);
    if (target instanceof HTMLElement) {
      target.focus({ preventScroll: false });
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const errors = validateOrderForm(form);
    const errorMap: Record<string, string> = {};
    errors.forEach((err) => { errorMap[err.field] = err.message; });
    if (!privacyAccepted) {
      errorMap.privacyAccepted = 'Ga akkoord met het privacybeleid om door te gaan.';
    }
    if (!termsAccepted) {
      errorMap.termsAccepted = 'Ga akkoord met de algemene voorwaarden om door te gaan.';
    }

    const allTouched: Record<string, boolean> = {};
    ['format', 'exactHeightCm', 'foto', 'naam', 'email', 'land', 'adres', 'postcode', 'stad', 'afleverAdres', 'afleverLand', 'afleverPostcode', 'afleverStad', 'privacyAccepted', 'termsAccepted'].forEach((f) => {
      allTouched[f] = true;
    });
    setTouched(allTouched);
    setValidationErrors(errorMap);

    if (errors.length > 0 || !privacyAccepted || !termsAccepted) {
      const firstErrorField = errors[0]?.field ?? (privacyAccepted ? 'termsAccepted' : 'privacyAccepted');
      focusFirstErrorField(firstErrorField);
      return;
    }
    if (!form.format || !pricing || !form.fileUrl || !form.fileId) return;

    const selectedAdres = form.anderAfleveradres ? form.afleverAdres : form.adres;
    const selectedPostcode = form.anderAfleveradres ? form.afleverPostcode : form.postcode;
    const selectedStad = form.anderAfleveradres ? form.afleverStad : form.stad;

    setIsSubmitting(true);

    // Keep a lightweight local summary so the thank-you page can show context
    // after Mollie redirects back to the site.
    try {
      const draft = {
        naam: form.naam,
        email: form.email,
        land: form.land,
        adres: selectedAdres,
        postcode: selectedPostcode,
        stad: selectedStad,
        anderAfleveradres: form.anderAfleveradres,
        afleverLand: form.afleverLand,
        afleverAdres: form.afleverAdres,
        afleverPostcode: form.afleverPostcode,
        afleverStad: form.afleverStad,
        deliveryTiming: form.deliveryTiming,
        opmerking: form.opmerking,
        format: form.format,
        exactHeightCm: form.exactHeightCm,
        quantity: form.quantity,
        addons: form.addons,
        fileUrl: form.fileUrl,
        total: pricing.total,
        createdAt: new Date().toISOString(),
      };
      window.sessionStorage.setItem('kb_last_order', JSON.stringify(draft));
    } catch {
      // Non-fatal: checkout should continue even if storage is unavailable.
    }

    try {
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: form.format,
          exactHeightCm: form.exactHeightCm,
          quantity: form.quantity,
          addons: form.addons,
          naam: form.naam,
          email: form.email,
          land: form.land,
          adres: selectedAdres,
          postcode: selectedPostcode,
          stad: selectedStad,
          anderAfleveradres: form.anderAfleveradres,
          afleverLand: form.afleverLand,
          afleverAdres: form.afleverAdres,
          afleverPostcode: form.afleverPostcode,
          afleverStad: form.afleverStad,
          deliveryTiming: form.deliveryTiming,
          opmerking: form.opmerking,
          fileUrl: form.fileUrl,
          fileId: form.fileId,
          total: pricing.total,
        }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setSubmitError(json.error ?? 'Er ging iets mis. Probeer het opnieuw.');
        return;
      }

      if (json.checkoutUrl) {
        try {
          const raw = window.sessionStorage.getItem('kb_last_order');
          if (raw) {
            const parsed = JSON.parse(raw) as Record<string, unknown>;
            parsed.paymentId = json.paymentId ?? null;
            parsed.checkoutStartedAt = new Date().toISOString();
            window.sessionStorage.setItem('kb_last_order', JSON.stringify(parsed));
          }
        } catch {
          // Non-fatal: redirect to Mollie regardless.
        }
        window.location.href = json.checkoutUrl;
      }
    } catch {
      setSubmitError('Er ging iets mis. Controleer je verbinding en probeer het opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-10">
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kies je formaat</h3>

          {/* Mobile: snap carousel */}
          <div id="format-group" tabIndex={-1} className="sm:hidden">
            <div
              ref={carouselRef}
              className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              onScroll={(e) => {
                const el = e.currentTarget;
                const cardWidth = el.scrollWidth / 3;
                setActiveCarouselIndex(Math.round(el.scrollLeft / cardWidth));
              }}
            >
              {(Object.entries(PRICING.formats) as [Format, typeof PRICING.formats[Format]][]).map(
                ([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setForm((p) => ({ ...p, format: key, exactHeightCm: '' }));
                      handleBlur('format');
                    }}
                    className={`snap-start flex-shrink-0 w-[78%] text-left p-5 rounded-2xl border-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
                      form.format === key
                        ? 'border-ink bg-orange-500 text-white shadow-bold translate-x-[-2px] translate-y-[-2px]'
                        : 'border-ink bg-white text-ink shadow-bold hover:bg-orange-50'
                    }`}
                  >
                    <div className="font-semibold text-base">{config.label}</div>
                    <div className={`text-lg font-bold mt-1 whitespace-nowrap ${form.format === key ? 'text-white' : 'text-gray-900'}`}>{config.height}</div>
                    <div className={`text-sm font-semibold mt-3 ${form.format === key ? 'text-gray-200' : 'text-gray-600'}`}>{formatCurrency(config.price)}</div>
                  </button>
                )
              )}
            </div>
            <div className="flex justify-center gap-2 mt-3">
              {(Object.keys(PRICING.formats) as Format[]).map((key, i) => (
                <button
                  key={key}
                  type="button"
                  aria-label={`Ga naar ${key}`}
                  onClick={() => {
                    const el = carouselRef.current;
                    if (!el) return;
                    el.scrollTo({ left: (el.scrollWidth / 3) * i, behavior: 'smooth' });
                  }}
                  className={`h-2 rounded-full border border-ink transition-all duration-200 ${activeCarouselIndex === i ? 'bg-orange-500 w-5' : 'bg-white w-2'}`}
                />
              ))}
            </div>
          </div>

          {/* Desktop: Radix RadioGroup */}
          <RadioGroup.Root
            id="format-group-desktop"
            tabIndex={-1}
            className="hidden sm:grid sm:grid-cols-3 gap-3"
            value={form.format ?? ''}
            onValueChange={(val) => {
              setForm((p) => ({ ...p, format: val as Format, exactHeightCm: '' }));
              handleBlur('format');
            }}
            aria-label="Kies je formaat"
          >
            {(Object.entries(PRICING.formats) as [Format, typeof PRICING.formats[Format]][]).map(
              ([key, config]) => (
                <RadioGroup.Item
                  key={key}
                  value={key}
                  className={`text-left p-5 rounded-2xl border-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
                    form.format === key
                      ? 'border-ink bg-orange-500 text-white shadow-bold translate-x-[-2px] translate-y-[-2px]'
                      : 'border-ink bg-white text-ink shadow-bold hover:bg-orange-50'
                  }`}
                >
                  <div className="font-semibold text-base">{config.label}</div>
                  <div className={`text-lg font-bold mt-1 whitespace-nowrap ${form.format === key ? 'text-white' : 'text-gray-900'}`}>{config.height}</div>
                  <div className={`text-sm font-semibold mt-3 ${form.format === key ? 'text-gray-200' : 'text-gray-600'}`}>{formatCurrency(config.price)}</div>
                </RadioGroup.Item>
              )
            )}
          </RadioGroup.Root>

          {fieldError('format') && (
            <p className="mt-2 text-sm text-red-600" role="alert">{fieldError('format')}</p>
          )}
          {form.format && (
            <div className="mt-4">
              <label htmlFor="exactHeightCm" className="block text-sm font-medium text-gray-700 mb-1">
                Exact formaat (cm)
              </label>
              <input
                id="exactHeightCm"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.exactHeightCm}
                onChange={(e) => {
                  const numeric = e.target.value.replace(/\D/g, '').slice(0, 3);
                  setForm((p) => ({ ...p, exactHeightCm: numeric }));
                }}
                onBlur={() => handleBlur('exactHeightCm')}
                aria-invalid={Boolean(fieldError('exactHeightCm') || liveHeightRangeError)}
                placeholder={getHeightPlaceholder(form.format)}
                className={`w-full px-4 py-3 rounded-lg border text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 ${fieldError('exactHeightCm') || liveHeightRangeError ? 'border-red-400' : 'border-gray-200 hover:border-gray-400'}`}
              />
              {liveHeightRangeError ? (
                <p className="mt-1 text-xs text-red-600" role="alert">{liveHeightRangeError}</p>
              ) : fieldError('exactHeightCm') ? (
                <p className="mt-1 text-xs text-red-600" role="alert">{fieldError('exactHeightCm')}</p>
              ) : null}
            </div>
          )}
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aantal</h3>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
              className="w-10 h-10 rounded-xl border-2 border-ink flex items-center justify-center text-ink bg-white shadow-bold hover:bg-orange-50 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-40 disabled:shadow-bold disabled:translate-x-0 disabled:translate-y-0"
              disabled={form.quantity <= 1}
              aria-label="Minder"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="w-8 text-center text-xl font-semibold tabular-nums">{form.quantity}</span>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, quantity: Math.min(PRICING.maxQuantity, p.quantity + 1) }))}
              className="w-10 h-10 rounded-xl border-2 border-ink flex items-center justify-center text-ink bg-white shadow-bold hover:bg-orange-50 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-40 disabled:shadow-bold disabled:translate-x-0 disabled:translate-y-0"
              disabled={form.quantity >= PRICING.maxQuantity}
              aria-label="Meer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload je foto</h3>
          <p className="text-sm text-gray-600 mb-3">
            Gebruik een duidelijke, scherpe foto waarop het volledige lichaam zichtbaar is (nodig voor een goede uitsnede).
          </p>
          <div id="foto-upload" tabIndex={-1} className="focus:outline-none">
            <UploadField
            onUploadSuccess={(url, id) => {
              setForm((p) => ({ ...p, fileUrl: url, fileId: id }));
              onPreviewImageChange?.(url);
              setTouched((p) => ({ ...p, foto: true }));
              setValidationErrors((p) => { const n = { ...p }; delete n['foto']; return n; });
            }}
            onUploadError={(err) => {
              setForm((p) => ({ ...p, fileUrl: null, fileId: null }));
              setValidationErrors((p) => ({ ...p, foto: err }));
            }}
            onClear={() => {
              setForm((p) => ({ ...p, fileUrl: null, fileId: null }));
              onPreviewImageChange?.('/images/hero.jpg');
            }}
            currentFileUrl={form.fileUrl}
          />
          </div>
          {fieldError('foto') && (
            <p className="mt-2 text-sm text-red-600" role="alert">{fieldError('foto')}</p>
          )}
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Jouw gegevens</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="naam" className="block text-sm font-medium text-gray-700 mb-1">Naam</label>
              <input
                id="naam"
                type="text"
                autoComplete="name"
                value={form.naam}
                onChange={(e) => setForm((p) => ({ ...p, naam: e.target.value }))}
                onBlur={() => handleBlur('naam')}
                aria-invalid={Boolean(fieldError('naam'))}
                placeholder="Voor- en achternaam"
                className={`w-full px-4 py-3 rounded-lg border text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 ${fieldError('naam') ? 'border-red-400' : 'border-gray-200 hover:border-gray-400'}`}
              />
              {fieldError('naam') && <p className="mt-1 text-xs text-red-600" role="alert">{fieldError('naam')}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mailadres</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                onBlur={() => handleBlur('email')}
                aria-invalid={Boolean(fieldError('email'))}
                placeholder="jij@voorbeeld.nl"
                className={`w-full px-4 py-3 rounded-lg border text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 ${fieldError('email') ? 'border-red-400' : 'border-gray-200 hover:border-gray-400'}`}
              />
              {fieldError('email') && <p className="mt-1 text-xs text-red-600" role="alert">{fieldError('email')}</p>}
            </div>

            <div>
              <label htmlFor="land" className="block text-sm font-medium text-gray-700 mb-1">Land</label>
              <select
                id="land"
                value={form.land}
                onChange={(e) => setForm((p) => ({ ...p, land: e.target.value as CountryCode }))}
                onBlur={() => handleBlur('land')}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-900 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 hover:border-gray-400"
              >
                <option value="NL">Nederland</option>
                <option value="BE">Belgie</option>
              </select>
            </div>

            <div>
              <label htmlFor="adres" className="block text-sm font-medium text-gray-700 mb-1">Factuuradres (straat + huisnummer)</label>
              <input
                id="adres"
                type="text"
                autoComplete="street-address"
                value={form.adres}
                onChange={(e) => setForm((p) => ({ ...p, adres: e.target.value }))}
                onBlur={() => handleBlur('adres')}
                aria-invalid={Boolean(fieldError('adres'))}
                placeholder="Voorbeeldstraat 1"
                className={`w-full px-4 py-3 rounded-lg border text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 ${fieldError('adres') ? 'border-red-400' : 'border-gray-200 hover:border-gray-400'}`}
              />
              {fieldError('adres') && <p className="mt-1 text-xs text-red-600" role="alert">{fieldError('adres')}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
                <input
                  id="postcode"
                  type="text"
                  autoComplete="postal-code"
                  value={form.postcode}
                  onChange={(e) => setForm((p) => ({ ...p, postcode: e.target.value }))}
                  onBlur={() => handleBlur('postcode')}
                  aria-invalid={Boolean(fieldError('postcode'))}
                  placeholder={getPostcodePlaceholder(form.land)}
                  className={`w-full px-4 py-3 rounded-lg border text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 ${fieldError('postcode') ? 'border-red-400' : 'border-gray-200 hover:border-gray-400'}`}
                />
                {fieldError('postcode') && <p className="mt-1 text-xs text-red-600" role="alert">{fieldError('postcode')}</p>}
              </div>
              <div>
                <label htmlFor="stad" className="block text-sm font-medium text-gray-700 mb-1">Stad</label>
                <input
                  id="stad"
                  type="text"
                  autoComplete="address-level2"
                  value={form.stad}
                  onChange={(e) => setForm((p) => ({ ...p, stad: e.target.value }))}
                  onBlur={() => handleBlur('stad')}
                  aria-invalid={Boolean(fieldError('stad'))}
                  placeholder={getCityPlaceholder(form.land)}
                  className={`w-full px-4 py-3 rounded-lg border text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 ${fieldError('stad') ? 'border-red-400' : 'border-gray-200 hover:border-gray-400'}`}
                />
                {fieldError('stad') && <p className="mt-1 text-xs text-red-600" role="alert">{fieldError('stad')}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="deliveryTiming" className="block text-sm font-medium text-gray-700 mb-1">Ander aflevermoment</label>
              <select
                id="deliveryTiming"
                value={form.deliveryTiming}
                onChange={(e) => setForm((p) => ({ ...p, deliveryTiming: e.target.value as DeliveryTiming }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-900 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 hover:border-gray-400"
              >
                {deliveryOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {shippingCountry === 'BE' ? (
                <p className="mt-1 text-xs text-gray-600">Levering in Belgie: + €4,95</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="anderAfleveradres" className="block text-sm font-medium text-gray-700 mb-1">Ander afleveradres</label>
              <select
                id="anderAfleveradres"
                value={form.anderAfleveradres ? 'ja' : 'nee'}
                onChange={(e) => {
                  const enabled = e.target.value === 'ja';
                  setForm((p) => ({
                    ...p,
                    anderAfleveradres: enabled,
                    afleverLand: enabled ? p.afleverLand : p.land,
                    afleverAdres: enabled ? p.afleverAdres : '',
                    afleverPostcode: enabled ? p.afleverPostcode : '',
                    afleverStad: enabled ? p.afleverStad : '',
                  }));
                }}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-900 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 hover:border-gray-400"
              >
                <option value="nee">Nee, zelfde als factuuradres</option>
                <option value="ja">Ja, ander afleveradres</option>
              </select>
            </div>

            {form.anderAfleveradres ? (
              <div className="space-y-4 rounded-xl border border-orange-200 bg-orange-50 p-4">
                <p className="text-sm font-semibold text-ink">Afleveradres</p>
                <div>
                  <label htmlFor="afleverLand" className="block text-sm font-medium text-gray-700 mb-1">Land</label>
                  <select
                    id="afleverLand"
                    value={form.afleverLand}
                    onChange={(e) => setForm((p) => ({ ...p, afleverLand: e.target.value as CountryCode }))}
                    onBlur={() => handleBlur('afleverLand')}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-900 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 hover:border-gray-400"
                  >
                    <option value="NL">Nederland</option>
                    <option value="BE">Belgie</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="afleverAdres" className="block text-sm font-medium text-gray-700 mb-1">Straat en huisnummer</label>
                  <input
                    id="afleverAdres"
                    type="text"
                    value={form.afleverAdres}
                    onChange={(e) => setForm((p) => ({ ...p, afleverAdres: e.target.value }))}
                    onBlur={() => handleBlur('afleverAdres')}
                    aria-invalid={Boolean(fieldError('afleverAdres'))}
                    placeholder="Afleverstraat 1"
                    className={`w-full px-4 py-3 rounded-lg border text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 ${fieldError('afleverAdres') ? 'border-red-400' : 'border-gray-200 hover:border-gray-400'}`}
                  />
                  {fieldError('afleverAdres') && <p className="mt-1 text-xs text-red-600" role="alert">{fieldError('afleverAdres')}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="afleverPostcode" className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
                    <input
                      id="afleverPostcode"
                      type="text"
                      value={form.afleverPostcode}
                      onChange={(e) => setForm((p) => ({ ...p, afleverPostcode: e.target.value }))}
                      onBlur={() => handleBlur('afleverPostcode')}
                      aria-invalid={Boolean(fieldError('afleverPostcode'))}
                      placeholder={getPostcodePlaceholder(form.afleverLand)}
                      className={`w-full px-4 py-3 rounded-lg border text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 ${fieldError('afleverPostcode') ? 'border-red-400' : 'border-gray-200 hover:border-gray-400'}`}
                    />
                    {fieldError('afleverPostcode') && <p className="mt-1 text-xs text-red-600" role="alert">{fieldError('afleverPostcode')}</p>}
                  </div>
                  <div>
                    <label htmlFor="afleverStad" className="block text-sm font-medium text-gray-700 mb-1">Stad</label>
                    <input
                      id="afleverStad"
                      type="text"
                      value={form.afleverStad}
                      onChange={(e) => setForm((p) => ({ ...p, afleverStad: e.target.value }))}
                      onBlur={() => handleBlur('afleverStad')}
                      aria-invalid={Boolean(fieldError('afleverStad'))}
                      placeholder={getCityPlaceholder(form.afleverLand)}
                      className={`w-full px-4 py-3 rounded-lg border text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 ${fieldError('afleverStad') ? 'border-red-400' : 'border-gray-200 hover:border-gray-400'}`}
                    />
                    {fieldError('afleverStad') && <p className="mt-1 text-xs text-red-600" role="alert">{fieldError('afleverStad')}</p>}
                  </div>
                </div>
              </div>
            ) : null}

            <div>
              <label htmlFor="opmerking" className="block text-sm font-medium text-gray-700 mb-1">
                Opmerking <span className="font-normal text-gray-400">(optioneel)</span>
              </label>
              <textarea
                id="opmerking"
                rows={3}
                value={form.opmerking}
                onChange={(e) => setForm((p) => ({ ...p, opmerking: e.target.value }))}
                placeholder="Speciale wensen of opmerkingen over je foto..."
                className="w-full px-4 py-3 rounded-lg border border-gray-200 hover:border-gray-400 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 resize-none"
              />
            </div>
          </div>
        </section>

        {pricing && (
          <section className="bg-orange-50 rounded-2xl p-6 border-2 border-ink shadow-bold">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Overzicht</h3>
            <div className="space-y-2">
              {pricing.breakdown.map((line, i) => (
                <div key={i} className="flex justify-between text-sm text-gray-700">
                  <span>{line.split(':')[0]}</span>
                  <span className="font-medium">{line.split(':')[1]?.trim()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
              <span className="text-base font-semibold text-gray-900">Totaal incl. BTW</span>
              <span className="text-2xl font-bold text-gray-900">{formatCurrency(pricing.total)}</span>
            </div>
          </section>
        )}

        {submitError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}

        <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
          <label id="privacyAccepted" className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={(e) => {
                setPrivacyAccepted(e.target.checked);
                setTouched((prev) => ({ ...prev, privacyAccepted: true }));
                setValidationErrors((prev) => {
                  const next = { ...prev };
                  delete next.privacyAccepted;
                  return next;
                });
              }}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700">
              Ik ga akkoord met het{' '}
              <Link href="/privacy" target="_blank" className="font-semibold text-orange-600 hover:text-orange-700 underline">
                privacybeleid
              </Link>
              .
            </span>
          </label>
          {fieldError('privacyAccepted') && (
            <p className="text-xs text-red-600" role="alert">{fieldError('privacyAccepted')}</p>
          )}

          <label id="termsAccepted" className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => {
                setTermsAccepted(e.target.checked);
                setTouched((prev) => ({ ...prev, termsAccepted: true }));
                setValidationErrors((prev) => {
                  const next = { ...prev };
                  delete next.termsAccepted;
                  return next;
                });
              }}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700">
              Ik ga akkoord met de{' '}
              <Link href="/algemene-voorwaarden" target="_blank" className="font-semibold text-orange-600 hover:text-orange-700 underline">
                algemene voorwaarden
              </Link>
              .
            </span>
          </label>
          {fieldError('termsAccepted') && (
            <p className="text-xs text-red-600" role="alert">{fieldError('termsAccepted')}</p>
          )}
        </div>

        <div className="sticky bottom-3 z-20 md:static">
          <button
            type="submit"
            disabled={isSubmitting || !privacyAccepted || !termsAccepted}
            className="w-full py-4 px-8 bg-orange-500 text-white font-black text-base rounded-2xl border-2 border-ink shadow-bold-lg hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-bold-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Betaling aanmaken...
              </span>
            ) : (
              `Afrekenen${pricing ? ` \u2014 ${formatCurrency(pricing.total)}` : ''}`
            )}
          </button>
        </div>

        <p className="text-xs text-center text-gray-400">
          Betaling via iDEAL. Je wordt doorgestuurd naar de Mollie betaalpagina.
        </p>
      </div>
    </form>
  );
}
