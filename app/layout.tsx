import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import CookieConsentBanner from '@/components/CookieConsentBanner';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  applicationName: 'Kartonbaas',
  title: 'Kartonbaas | Levensgrote kartonnen cut-out',
  description:
    'Maak een levensgrote kartonnen cut-out van jezelf of een vriend. Upload één foto en Kartonbaas maakt een haarscherpe kartonnen clone. Perfect voor verjaardagen en feesten.',
  keywords: [
    'kartonnen cut-out',
    'levensgrote cut-out',
    'kartonnen clone',
    'feest decoratie',
    'vrijgezellenfeest',
    'verjaardag',
  ],
  authors: [{ name: 'Kartonbaas' }],
  creator: 'Kartonbaas',
  publisher: 'Kartonbaas',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kartonbaas.nl'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Kartonbaas | Levensgrote kartonnen cut-out',
    description:
      'Maak een levensgrote kartonnen cut-out van jezelf of een vriend. Upload één foto en Kartonbaas maakt een haarscherpe kartonnen clone.',
    url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kartonbaas.nl',
    siteName: 'Kartonbaas',
    locale: 'nl_NL',
    type: 'website',
    images: [
      {
        url: '/images/hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Levensgrote kartonnen cut-out van Kartonbaas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kartonbaas | Levensgrote kartonnen cut-out',
    description:
      'Maak een levensgrote kartonnen cut-out van jezelf of een vriend. Perfect voor verjaardagen en feesten.',
    images: ['/images/hero.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Hoe snel is mijn cut-out klaar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'In de meeste gevallen wordt jouw kartonnen cut-out binnen 5 werkdagen geleverd. Sneller nodig? Tegen een meerprijs kun je jouw cut-out tot 2 werkdagen eerder ontvangen.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wat voor foto moet ik uploaden?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Een scherpe staande foto met goede belichting en liefst het volledige lichaam zichtbaar.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wat als mijn foto niet goed genoeg is?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We checken elke foto binnen 24 uur en laten je weten als er een betere foto nodig is.',
      },
    },
    {
      '@type': 'Question',
      name: 'Kan de cut-out zelfstandig staan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ja. Elke cut-out krijgt een kartonnen standaard meegeleverd.',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className={inter.className}>
      <head>
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PMSF629D');`,
          }}
        />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PMSF629D"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <a href="#main-content" className="skip-link">Direct naar inhoud</a>
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
