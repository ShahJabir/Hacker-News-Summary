import type { ArticleSummary } from './types'
import { Readability } from '@mozilla/readability'
import { parseHTML } from 'linkedom'

export async function getArticleandSummary(options: {
  url: string
  articlesKV: KVNamespace
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
      // Non-OK responses should not crash the renderer. Return nulls so caller can show a friendly message.

      console.error(`Failed to fetch article ${options.url} - status: ${response?.status}`)
      return {
        article: null,
        summary: null,
      }
    }

    const html = await response.text()
    // Avoid logging large HTML blobs in production/dev console. Log a short marker instead.

    const { document } = parseHTML(html)
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
      result = {
        article: article.content,
        summary: article.excerpt,
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
    // Catch any unexpected errors (network, parse, Readability internals) and return safe nulls.
    console.error('Error while fetching/parsing article', options.url, err)
    return {
      article: null,
      summary: null,
    }
  }
}
