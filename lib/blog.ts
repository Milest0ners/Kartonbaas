export interface BlogSection {
  heading: string;
  content: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  date: string;
  category: string;
  author: string;
  content: BlogSection[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'de-perfecte-foto-voor-je-kartonnen-cutout',
    title: 'De perfecte foto voor je kartonnen cut-out: 6 praktische tips',
    excerpt:
      'Een goede foto maakt het verschil tussen leuk en wow. Met deze 6 tips haal je het maximale uit jouw Kartonbaas cut-out.',
    coverImage: '/images/blog-1.svg',
    date: '10 februari 2026',
    category: 'Tips & Tricks',
    author: 'Team Kartonbaas',
    content: [
      {
        heading: 'Waarom fotokwaliteit zo belangrijk is',
        content: [
          'Een cut-out wordt levensgroot geprint. Dat betekent dat kleine onscherpte op je telefoonscherm groot zichtbaar wordt op karton.',
          'Een scherpe bronfoto zorgt voor strakke contouren en een professioneel resultaat.',
        ],
      },
      {
        heading: '6 snelle tips',
        content: [
          'Gebruik daglicht en vermijd fel tegenlicht.',
          'Fotografeer het hele lichaam van top tot teen.',
          'Houd de camera stabiel of gebruik beide handen.',
          'Kies een rustige achtergrond voor betere uitsnede.',
          'Stuur originele foto, niet via WhatsApp gecomprimeerd.',
          'Maak liever 3 foto’s en kies de beste.',
        ],
      },
    ],
  },
  {
    slug: 'vrijgezellenfeest-ideeen-met-cutout',
    title: '5 ideeën voor een vrijgezellenfeest met kartonnen clone',
    excerpt:
      'Van entree-moment tot fotochallenge: zo maak je van een vrijgezellenfeest een gegarandeerde hit met een Kartonbaas clone.',
    coverImage: '/images/blog-2.svg',
    date: '28 januari 2026',
    category: 'Inspiratie',
    author: 'Team Kartonbaas',
    content: [
      {
        heading: 'Humor + herkenning = succes',
        content: [
          'Een levensgrote clone van de bruid of bruidegom zorgt direct voor hilariteit en leuke foto’s.',
          'Gebruik de clone als rode draad door de dag voor extra beleving.',
        ],
      },
      {
        heading: 'Onze favoriete toepassingen',
        content: [
          'Laat gasten ermee op de foto gaan bij binnenkomst.',
          'Maak een city-challenge: clone op gekke plekken.',
          'Gebruik de clone als decor tijdens diner of borrel.',
          'Laat iedereen een boodschap op de achterkant schrijven.',
          'Neem de clone mee als verrassing tijdens de afterparty.',
        ],
      },
    ],
  },
  {
    slug: 'kantoorfun-met-kartonnen-collega',
    title: 'Kantoorfun: verras je collega met een kartonnen versie',
    excerpt:
      'Afscheid, jubileum of verjaardag op kantoor? Een levensgrote kartonnen collega zorgt voor een memorabel moment.',
    coverImage: '/images/blog-3.svg',
    date: '5 januari 2026',
    category: 'Kantoor',
    author: 'Team Kartonbaas',
    content: [
      {
        heading: 'Perfect voor teams',
        content: [
          'Een cut-out werkt op kantoor als luchtige verrassing die iedereen begrijpt.',
          'Het is persoonlijk, visueel en blijft vaak nog weken staan.',
        ],
      },
      {
        heading: 'Wanneer werkt het goed?',
        content: [
          'Bij afscheid van een collega.',
          'Bij verjaardagen of werkjubilea.',
          'Als decor tijdens teambuilding of borrels.',
        ],
      },
    ],
  },
];

export function getAllBlogPosts(): BlogPost[] {
  return BLOG_POSTS;
}

export function getFeaturedBlogPosts(limit = 3): BlogPost[] {
  return BLOG_POSTS.slice(0, limit);
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
