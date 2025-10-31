import type { ArticleSummary } from './types'
import { Readability } from '@mozilla/readability'
import DOMPurify from 'dompurify'
import { parseHTML } from 'linkedom'
import summerize from './summerize'

export async function getArticleandSummary(options: {
  url: string
  articlesKV: KVNamespace
  ai: Ai
}) {
  try {
    let result = await options.articlesKV.get<ArticleSummary>(options.url, 'json')
    if (result) {
      return result
    }
    const response = await fetch(options.url, {
      cf: {
        cacheTtl: 60 * 60 * 24,
        cacheEverything: true,
      },
    } as any)

    if (!response || !response.ok) {
      console.error(`Failed to fetch article ${options.url} - status: ${response?.status}`)
      return {
        article: null,
        summary: null,
      }
    }

    const html = await response.text()
    const { document } = parseHTML(html)
    Array.from(document.getElementsByTagName('img')).forEach((link) => {
      link.src = new URL(link.src, options.url).href
    })
    Array.from(document.getElementsByTagName('a')).forEach((link) => {
      link.href = new URL(link.href, options.url).href
      link.setAttribute('rel', 'nofollow noopener')
      link.setAttribute('target', '_blank')
    })
    if (!document) {
      console.error(`parseHTML returned no document for ${options.url}`)
      return {
        article: null,
        summary: null,
      }
    }

    const reader = new Readability(document)
    const article = reader.parse()

    result = {
      article: null,
      summary: null,
    }

    if (article?.content) {
      const { window } = parseHTML('')
      const purify = DOMPurify(window)
      const cleanArticle = purify.sanitize(article.content ?? '')
      console.warn(`Generating summary for article: ${options.url}`)
      const summary = await summerize(options.ai, options.url, cleanArticle)
      result = {
        article: cleanArticle,
        summary,
      }
    }
    await options.articlesKV.put(options.url, JSON.stringify(result))
    // If I want to cache for limited time then uncomment it but I want to catch forever because I don't want to pay Cloudflare costs
    // await options.articlesKV.put(options.url, JSON.stringify(result), {
    //   expirationTtl: 60 * 60 * 24, // Cache for 1 days
    // })
    return result
  }
  catch (err) {
    console.error('Error while fetching/parsing article', options.url, err)
    return {
      article: null,
      summary: null,
    }
  }
}
