/**
 * Sensus SEO Utilities
 * Herramientas para optimización SEO
 */

export interface SEOData {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
  locale?: string
  alternateLocales?: string[]
  canonical?: string
  noindex?: boolean
  nofollow?: boolean
}

export class SEOOptimizer {
  private baseUrl: string
  private defaultImage: string
  private defaultAuthor: string

  constructor() {
    this.baseUrl = 'https://sensus.app'
    this.defaultImage = '/assets/images/og-default.jpg'
    this.defaultAuthor = 'Sensus Team'
  }

  /**
   * Generar meta tags SEO
   */
  generateMetaTags(data: SEOData): string {
    const {
      title,
      description,
      keywords = [],
      image = this.defaultImage,
      url,
      type = 'website',
      author = this.defaultAuthor,
      publishedTime,
      modifiedTime,
      section,
      tags = [],
      locale = 'es_ES',
      alternateLocales = [],
      canonical,
      noindex = false,
      nofollow = false
    } = data

    const fullUrl = url ? `${this.baseUrl}${url}` : this.baseUrl
    const fullImage = image.startsWith('http') ? image : `${this.baseUrl}${image}`
    const canonicalUrl = canonical ? `${this.baseUrl}${canonical}` : fullUrl

    let metaTags = ''

    // Meta tags básicos
    metaTags += `<title>${title}</title>\n`
    metaTags += `<meta name="description" content="${description}">\n`
    
    if (keywords.length > 0) {
      metaTags += `<meta name="keywords" content="${keywords.join(', ')}">\n`
    }
    
    metaTags += `<meta name="author" content="${author}">\n`
    metaTags += `<meta name="robots" content="${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}">\n`
    metaTags += `<meta name="language" content="${locale}">\n`

    // Open Graph
    metaTags += `<meta property="og:type" content="${type}">\n`
    metaTags += `<meta property="og:title" content="${title}">\n`
    metaTags += `<meta property="og:description" content="${description}">\n`
    metaTags += `<meta property="og:url" content="${fullUrl}">\n`
    metaTags += `<meta property="og:image" content="${fullImage}">\n`
    metaTags += `<meta property="og:image:width" content="1200">\n`
    metaTags += `<meta property="og:image:height" content="630">\n`
    metaTags += `<meta property="og:site_name" content="Sensus">\n`
    metaTags += `<meta property="og:locale" content="${locale}">\n`

    if (type === 'article') {
      if (publishedTime) {
        metaTags += `<meta property="article:published_time" content="${publishedTime}">\n`
      }
      if (modifiedTime) {
        metaTags += `<meta property="article:modified_time" content="${modifiedTime}">\n`
      }
      if (author) {
        metaTags += `<meta property="article:author" content="${author}">\n`
      }
      if (section) {
        metaTags += `<meta property="article:section" content="${section}">\n`
      }
      if (tags.length > 0) {
        tags.forEach(tag => {
          metaTags += `<meta property="article:tag" content="${tag}">\n`
        })
      }
    }

    // Twitter Card
    metaTags += `<meta name="twitter:card" content="summary_large_image">\n`
    metaTags += `<meta name="twitter:title" content="${title}">\n`
    metaTags += `<meta name="twitter:description" content="${description}">\n`
    metaTags += `<meta name="twitter:image" content="${fullImage}">\n`
    metaTags += `<meta name="twitter:site" content="@sensus_app">\n`
    metaTags += `<meta name="twitter:creator" content="@sensus_app">\n`

    // Canonical URL
    metaTags += `<link rel="canonical" href="${canonicalUrl}">\n`

    // Alternate locales
    if (alternateLocales.length > 0) {
      alternateLocales.forEach(locale => {
        metaTags += `<link rel="alternate" hreflang="${locale}" href="${fullUrl}">\n`
      })
    }

    // Structured Data
    metaTags += this.generateStructuredData(data)

    return metaTags
  }

  /**
   * Generar datos estructurados
   */
  generateStructuredData(data: SEOData): string {
    const {
      title,
      description,
      url,
      type = 'website',
      author = this.defaultAuthor,
      publishedTime,
      modifiedTime,
      image = this.defaultImage
    } = data

    const fullUrl = url ? `${this.baseUrl}${url}` : this.baseUrl
    const fullImage = image.startsWith('http') ? image : `${this.baseUrl}${image}`

    let structuredData: any = {
      '@context': 'https://schema.org',
      '@type': type === 'article' ? 'Article' : 'WebApplication',
      name: title,
      description: description,
      url: fullUrl,
      image: fullImage,
      author: {
        '@type': 'Organization',
        name: author
      },
      publisher: {
        '@type': 'Organization',
        name: 'Sensus',
        logo: {
          '@type': 'ImageObject',
          url: `${this.baseUrl}/assets/images/logo.png`
        }
      }
    }

    if (type === 'article') {
      if (publishedTime) {
        structuredData.datePublished = publishedTime
      }
      if (modifiedTime) {
        structuredData.dateModified = modifiedTime
      }
    } else {
      structuredData.applicationCategory = 'HealthApplication'
      structuredData.operatingSystem = 'Web Browser'
      structuredData.offers = {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR'
      }
      structuredData.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '127000'
      }
    }

    return `<script type="application/ld+json">${JSON.stringify(structuredData, null, 2)}</script>\n`
  }

  /**
   * Generar sitemap XML
   */
  generateSitemap(pages: Array<{
    url: string
    lastmod?: string
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
    priority?: number
  }>): string {
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    pages.forEach(page => {
      sitemap += '  <url>\n'
      sitemap += `    <loc>${this.baseUrl}${page.url}</loc>\n`
      
      if (page.lastmod) {
        sitemap += `    <lastmod>${page.lastmod}</lastmod>\n`
      }
      
      if (page.changefreq) {
        sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`
      }
      
      if (page.priority) {
        sitemap += `    <priority>${page.priority}</priority>\n`
      }
      
      sitemap += '  </url>\n'
    })

    sitemap += '</urlset>'
    return sitemap
  }

  /**
   * Generar robots.txt
   */
  generateRobotsTxt(disallowPaths: string[] = []): string {
    let robots = 'User-agent: *\n'
    robots += 'Allow: /\n'
    
    disallowPaths.forEach(path => {
      robots += `Disallow: ${path}\n`
    })
    
    robots += `Sitemap: ${this.baseUrl}/sitemap.xml\n`
    return robots
  }

  /**
   * Optimizar título para SEO
   */
  optimizeTitle(title: string, maxLength: number = 60): string {
    if (title.length <= maxLength) {
      return title
    }
    
    const words = title.split(' ')
    let optimizedTitle = ''
    
    for (const word of words) {
      if ((optimizedTitle + ' ' + word).length <= maxLength) {
        optimizedTitle += (optimizedTitle ? ' ' : '') + word
      } else {
        break
      }
    }
    
    return optimizedTitle
  }

  /**
   * Optimizar descripción para SEO
   */
  optimizeDescription(description: string, maxLength: number = 160): string {
    if (description.length <= maxLength) {
      return description
    }
    
    return description.substring(0, maxLength - 3) + '...'
  }

  /**
   * Generar breadcrumbs
   */
  generateBreadcrumbs(items: Array<{
    name: string
    url: string
  }>): string {
    const breadcrumbData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${this.baseUrl}${item.url}`
      }))
    }

    return `<script type="application/ld+json">${JSON.stringify(breadcrumbData, null, 2)}</script>\n`
  }

  /**
   * Generar FAQ schema
   */
  generateFAQSchema(faqs: Array<{
    question: string
    answer: string
  }>): string {
    const faqData = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    }

    return `<script type="application/ld+json">${JSON.stringify(faqData, null, 2)}</script>\n`
  }
}

// Instancia global
export const seoOptimizer = new SEOOptimizer()

// Funciones de utilidad
export const generatePageSEO = (data: SEOData) => seoOptimizer.generateMetaTags(data)
export const generateSitemap = (pages: any[]) => seoOptimizer.generateSitemap(pages)
export const generateRobotsTxt = (disallowPaths?: string[]) => seoOptimizer.generateRobotsTxt(disallowPaths)
export const optimizeTitle = (title: string, maxLength?: number) => seoOptimizer.optimizeTitle(title, maxLength)
export const optimizeDescription = (description: string, maxLength?: number) => seoOptimizer.optimizeDescription(description, maxLength)
