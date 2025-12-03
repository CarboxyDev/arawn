import { siteConfig } from '@/config/site';

interface StructuredDataProps {
  type: 'software' | 'organization' | 'website' | 'faq';
  data?: Record<string, unknown>;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const schemas = {
    software: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareSourceCode',
      name: 'Blitzpack',
      description:
        'Production-ready full-stack TypeScript monorepo template with Next.js, Fastify, and Turborepo',
      url: 'https://blitzpack.carboxy.dev',
      codeRepository: siteConfig.github,
      programmingLanguage: ['TypeScript', 'JavaScript'],
      runtimePlatform: ['Node.js', 'Next.js', 'Fastify'],
      author: {
        '@type': 'Person',
        name: siteConfig.author.name,
        url: siteConfig.author.url,
      },
      license: 'https://opensource.org/licenses/MIT',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Cross-platform',
    },
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.author.url,
      logo: 'https://blitzpack.carboxy.dev/logo-light-512.png',
      sameAs: [siteConfig.author.github, siteConfig.author.x],
      founder: {
        '@type': 'Person',
        name: siteConfig.author.name,
        url: siteConfig.author.url,
      },
    },
    website: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteConfig.name,
      url: 'https://blitzpack.carboxy.dev',
      description: siteConfig.description,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate:
            'https://github.com/CarboxyDev/blitzpack?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    faq: data || {},
  };

  const schema = schemas[type];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
