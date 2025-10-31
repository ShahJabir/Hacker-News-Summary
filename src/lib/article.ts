import { Readability } from '@mozilla/readability'
import { parseHTML } from 'linkedom'

export async function getArticleandSummary(url: string) {
  try {
    const response = await fetch(url, {
      cf: {
        cacheTtl: 60 * 60 * 24,
        cacheEverything: true,
      },
    } as any)

    if (!response || !response.ok) {
      // Non-OK responses should not crash the renderer. Return nulls so caller can show a friendly message.

      console.error(`Failed to fetch article ${url} - status: ${response?.status}`)
      return {
        article: null,
        summary: null,
      }
    }

    const html = await response.text()
    // Avoid logging large HTML blobs in production/dev console. Log a short marker instead.

    const { document } = parseHTML(html)
    if (!document) {
      console.error(`parseHTML returned no document for ${url}`)
      return {
        article: null,
        summary: null,
      }
    }

    const reader = new Readability(document)
    const article = reader.parse()

    if (!article?.content) {
      return {
        article: null,
        summary: null,
      }
    }

    return {
      article: article.content,
      summary: article.excerpt,
    }
  }
  catch (err) {
    // Catch any unexpected errors (network, parse, Readability internals) and return safe nulls.
    console.error('Error while fetching/parsing article', url, err)
    return {
      article: null,
      summary: null,
    }
  }
}
