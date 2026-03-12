interface ProductJsonLdProps {
  name:        string
  description: string
  price:       number
  currency?:   string
  imageUrl?:   string
  url:         string
  rating?:     { value: number; count: number }
  brand?:      string
  sku?:        string
}

export function ProductJsonLd({ name, description, price, currency = 'NGN', imageUrl, url, rating, brand, sku }: ProductJsonLdProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type':    'Product',
    name,
    description,
    url,
    ...(imageUrl && { image: imageUrl }),
    ...(brand    && { brand: { '@type': 'Brand', name: brand } }),
    ...(sku      && { sku }),
    offers: {
      '@type':       'Offer',
      price,
      priceCurrency: currency,
      availability:  'https://schema.org/InStock',
      url,
    },
    ...(rating && {
      aggregateRating: {
        '@type':       'AggregateRating',
        ratingValue:   rating.value,
        reviewCount:   rating.count,
      },
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

interface BreadcrumbJsonLdProps {
  items: { name: string; url: string }[]
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const data = {
    '@context':        'https://schema.org',
    '@type':           'BreadcrumbList',
    itemListElement:   items.map((item, i) => ({
      '@type':  'ListItem',
      position: i + 1,
      name:     item.name,
      item:     item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

interface OrganizationJsonLdProps { url: string; name: string; logo?: string }

export function OrganizationJsonLd({ url, name, logo }: OrganizationJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type':    'Organization',
    url,
    name,
    ...(logo && { logo }),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
