import type { MolliePaymentMetadata } from './mollie';
import { PRICING, formatCurrency } from './pricing';
import type { Format } from './pricing';
import type { StoredOrder } from './orders-store';

export interface EmailOrder {
  ordernummer: string;
  metadata: MolliePaymentMetadata;
  paymentId: string;
}

export interface ContactFormEmailInput {
  name: string;
  email: string;
  message: string;
  orderNumber?: string;
}

function getFormatLabel(format: string): string {
  const f = PRICING.formats[format as Format];
  return f ? `${f.label} (${f.height})` : format;
}

function getDeliveryTimingLabel(timing?: string): string {
  switch (timing) {
    case 'eerder_1':
      return '1 werkdag eerder (+ €4,95)';
    case 'eerder_2':
      return '2 werkdagen eerder (+ €9,95)';
    case 'later_1':
      return '1 werkdag later';
    case 'later_2':
      return '2 werkdagen later';
    case 'later_3':
      return '3 werkdagen later';
    default:
      return 'Standaard';
  }
}

async function sendViaResend(to: string, subject: string, html: string) {
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  const resendFrom =
    process.env.RESEND_FROM ||
    (process.env.RESEND_DOMAIN ? `Kartonbaas <noreply@${process.env.RESEND_DOMAIN}>` : 'Kartonbaas <onboarding@resend.dev>');

  await resend.emails.send({
    from: resendFrom,
    to,
    subject,
    html,
  });
}

async function sendViaSmtp(to: string, subject: string, html: string) {
  const nodemailer = await import('nodemailer');

  const transporter = nodemailer.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `Kartonbaas <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

async function sendEmail(to: string, subject: string, html: string) {
  if (process.env.RESEND_API_KEY) {
    await sendViaResend(to, subject, html);
  } else {
    await sendViaSmtp(to, subject, html);
  }
}

export async function sendOrderStatusEmail(order: StoredOrder, status: 'in_productie' | 'verzonden'): Promise<void> {
  const to = order.customer_email;
  if (!to) return;

  const isProduction = status === 'in_productie';
  const subject = isProduction
    ? 'Je bestelling is goedgekeurd en gaat nu in productie'
    : 'Je bestelling is verzonden';

  const statusText = isProduction
    ? 'Je foto is gecontroleerd en goedgekeurd. We gaan nu starten met de productie van je cut-out.'
    : 'Goed nieuws: je bestelling is verzonden. Je kunt de levering binnenkort verwachten.';

  const html = `
    <!DOCTYPE html>
    <html lang="nl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #f9fafb; margin: 0; padding: 0; }
        .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { background: #111827; padding: 28px 32px; }
        .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; }
        .body { padding: 32px; }
        .body p { color: #374151; line-height: 1.7; margin: 0 0 14px; }
        .tag { display: inline-block; background: #fff7ed; border: 1px solid #fdba74; color: #9a3412; font-size: 12px; font-weight: 700; padding: 6px 10px; border-radius: 999px; margin-bottom: 14px; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>Kartonbaas</h1>
        </div>
        <div class="body">
          <span class="tag">${isProduction ? 'In productie' : 'Verzonden'}</span>
          <p>Hallo ${order.customer_name},</p>
          <p>${statusText}</p>
          <p><strong>Ordernummer:</strong> ${order.order_number}</p>
          <p>Vragen? Mail ons via <a href="mailto:info@kartonbaas.nl" style="color:#111827;">info@kartonbaas.nl</a>.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail(to, subject, html);
}

export async function sendCustomerEmail(order: EmailOrder): Promise<void> {
  const { ordernummer, metadata } = order;
  const { naam, email, format, exactHeightCm, quantity, total, adres, postcode, stad, anderAfleveradres, afleverAdres, afleverPostcode, afleverStad, deliveryTiming } = metadata;
  const shippingAddress = anderAfleveradres && afleverAdres
    ? `${afleverAdres}, ${afleverPostcode} ${afleverStad}`
    : `${adres}, ${postcode} ${stad}`;

  const subject = `Je bestelling bij Kartonbaas is ontvangen`;
  const hasPublicFileUrl = Boolean(metadata.fileUrl && metadata.fileUrl.trim().length > 0);

  const html = `
    <!DOCTYPE html>
    <html lang="nl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #f9fafb; margin: 0; padding: 0; }
        .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { background: #111827; padding: 32px 40px; }
        .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
        .body { padding: 40px; }
        .body p { color: #374151; line-height: 1.7; margin: 0 0 16px; }
        .table { width: 100%; border-collapse: collapse; margin: 24px 0; }
        .table td { padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #374151; font-size: 15px; }
        .table td:last-child { text-align: right; font-weight: 500; }
        .total-row td { border-bottom: none; font-weight: 700; font-size: 16px; color: #111827; padding-top: 16px; }
        .footer { padding: 24px 40px; background: #f9fafb; border-top: 1px solid #f3f4f6; }
        .footer p { color: #9ca3af; font-size: 13px; margin: 0; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>Kartonbaas</h1>
        </div>
        <div class="body">
          <p>Hallo ${naam},</p>
          <p>Bedankt voor je bestelling bij Kartonbaas. We controleren je foto binnen 24 uur. Als alles goed is gaat je cut-out in productie.</p>

          <table class="table">
            <tr>
              <td>Ordernummer</td>
              <td>${ordernummer}</td>
            </tr>
            <tr>
              <td>Formaat</td>
              <td>${getFormatLabel(format)}</td>
            </tr>
            <tr>
              <td>Exact formaat</td>
              <td>${exactHeightCm ? `${exactHeightCm} cm` : '-'}</td>
            </tr>
            <tr>
              <td>Aantal</td>
              <td>${quantity}</td>
            </tr>
            <tr>
              <td>Afleveradres</td>
              <td>${shippingAddress}</td>
            </tr>
            <tr>
              <td>Aflevermoment</td>
              <td>${getDeliveryTimingLabel(deliveryTiming)}</td>
            </tr>
            <tr class="total-row">
              <td>Totaal</td>
              <td>${formatCurrency(total)}</td>
            </tr>
          </table>

          ${hasPublicFileUrl ? `<p>Je geuploade foto: <a href="${metadata.fileUrl}" style="color:#111827;">bekijk upload</a>.</p>` : ''}

          <p>Heb je vragen? Mail ons op <a href="mailto:info@kartonbaas.nl" style="color:#111827;">info@kartonbaas.nl</a>.</p>
        </div>
        <div class="footer">
          <p>Kartonbaas &middot; <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kartonbaas.nl'}" style="color:#9ca3af;">kartonbaas.nl</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail(email, subject, html);
}

export async function sendAdminEmail(order: EmailOrder): Promise<void> {
  const { ordernummer, metadata, paymentId } = order;
  const { naam, email, format, exactHeightCm, quantity, total, adres, postcode, stad, anderAfleveradres, afleverAdres, afleverPostcode, afleverStad, deliveryTiming, opmerking, fileUrl } = metadata;
  const hasPublicFileUrl = Boolean(fileUrl && fileUrl.trim().length > 0);
  const shippingAddress = anderAfleveradres && afleverAdres
    ? `${afleverAdres}, ${afleverPostcode} ${afleverStad}`
    : `${adres}, ${postcode} ${stad}`;

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) throw new Error('ADMIN_EMAIL is niet ingesteld.');

  const subject = `Nieuwe bestelling Kartonbaas - ${ordernummer}`;

  const html = `
    <!DOCTYPE html>
    <html lang="nl">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #f9fafb; margin: 0; padding: 0; }
        .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { background: #111827; padding: 32px 40px; }
        .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; }
        .body { padding: 40px; }
        .body p { color: #374151; line-height: 1.7; margin: 0 0 16px; }
        .table { width: 100%; border-collapse: collapse; margin: 24px 0; }
        .table td { padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #374151; font-size: 15px; }
        .table td:first-child { color: #9ca3af; width: 160px; }
        .upload-link { display: inline-block; margin-top: 8px; background: #111827; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>Nieuwe bestelling</h1>
        </div>
        <div class="body">
          <table class="table">
            <tr><td>Ordernummer</td><td><strong>${ordernummer}</strong></td></tr>
            <tr><td>Betaling ID</td><td>${paymentId}</td></tr>
            <tr><td>Status</td><td><strong>Betaald</strong></td></tr>
          </table>

          <table class="table">
            <tr><td>Naam</td><td>${naam}</td></tr>
            <tr><td>E-mail</td><td>${email}</td></tr>
            <tr><td>Factuuradres</td><td>${adres}</td></tr>
            <tr><td>Factuur postcode</td><td>${postcode}</td></tr>
            <tr><td>Factuur stad</td><td>${stad}</td></tr>
            <tr><td>Afleveradres</td><td>${shippingAddress}</td></tr>
          </table>

          <table class="table">
            <tr><td>Formaat</td><td>${getFormatLabel(format)}</td></tr>
            <tr><td>Exact formaat</td><td>${exactHeightCm ? `${exactHeightCm} cm` : '-'}</td></tr>
            <tr><td>Aantal</td><td>${quantity}</td></tr>
            <tr><td>Aflevermoment</td><td>${getDeliveryTimingLabel(deliveryTiming)}</td></tr>
            <tr><td>Totaal</td><td><strong>${formatCurrency(total)}</strong></td></tr>
            ${opmerking ? `<tr><td>Opmerking</td><td>${opmerking}</td></tr>` : ''}
          </table>

          <p><strong>Upload:</strong></p>
          ${hasPublicFileUrl
            ? `<a href="${fileUrl}" class="upload-link">Foto bekijken</a>`
            : `<p style="color:#6b7280; margin:0;">Geen publieke uploadlink beschikbaar (lokale testupload).</p>`}
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail(adminEmail, subject, html);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export async function sendContactFormEmail(input: ContactFormEmailInput): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) throw new Error('ADMIN_EMAIL is niet ingesteld.');

  const safeName = escapeHtml(input.name.trim());
  const safeEmail = escapeHtml(input.email.trim());
  const safeMessage = escapeHtml(input.message.trim()).replaceAll('\n', '<br />');
  const safeOrderNumber = input.orderNumber?.trim() ? escapeHtml(input.orderNumber.trim()) : '';

  const subject = safeOrderNumber
    ? `Nieuw contactbericht (${safeOrderNumber})`
    : 'Nieuw contactbericht';

  const html = `
    <!DOCTYPE html>
    <html lang="nl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #f9fafb; margin: 0; padding: 0; }
        .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { background: #111827; padding: 28px 32px; }
        .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; }
        .body { padding: 32px; }
        .table { width: 100%; border-collapse: collapse; margin: 0 0 20px; }
        .table td { padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #374151; font-size: 15px; vertical-align: top; }
        .table td:first-child { width: 140px; color: #9ca3af; }
        .message { margin-top: 16px; padding: 16px; border-radius: 8px; background: #fff7ed; border: 1px solid #fdba74; color: #374151; line-height: 1.7; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>Nieuw contactbericht</h1>
        </div>
        <div class="body">
          <table class="table">
            <tr><td>Naam</td><td>${safeName}</td></tr>
            <tr><td>E-mailadres</td><td>${safeEmail}</td></tr>
            ${safeOrderNumber ? `<tr><td>Ordernummer</td><td><strong>${safeOrderNumber}</strong></td></tr>` : ''}
          </table>
          <div class="message">${safeMessage}</div>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail(adminEmail, subject, html);
}
