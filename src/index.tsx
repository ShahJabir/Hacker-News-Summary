import type { AppEnv } from './lib/types'
import { Hono } from 'hono'
import { jsxRenderer } from 'hono/jsx-renderer'
import { getArticleandSummary } from './lib/article'
import { getFeed } from './lib/hacker-news'

const app = new Hono<AppEnv>()

app.get(
  '/*',
  jsxRenderer(({ children }) => {
    return (
      <html>
        <head>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"></link>
        </head>
        <body class="container">
          <h1>Hacker News Summary</h1>
          {children}
        </body>
      </html>
    )
  }),
)

app.get('/', async (c) => {
  const items = await getFeed()
  return c.render((
    <>
      {await Promise.all(items?.map(async (entry) => {
        let result: { article: string | null, summary: string | null | undefined } = { article: null, summary: null }
        try {
          result = await getArticleandSummary({
            url: entry.link!,
            articlesKV: c.env.articles,
          })
        }
        catch (err) {
          // Don't let one failing article crash the whole page render
          console.error('Failed to fetch/parse article', entry.link, err)
        }
        return (
          <details>
            <summary role="button" class="outline contrast">{entry.title}</summary>
            <article>
              <header>
                <a href={entry.link} target="_blank" rel="nofollow noopener">Article</a>
                {' | '}
                <p>{entry.pubDate}</p>
              </header>
              {result.article
                ? (
                    <div>
                      <h2>Summary</h2>
                      {result.summary ? result.summary : <p> No summary available. </p>}
                      <h2>Article Content</h2>
                      {result.article}
                    </div>
                  )
                : <h2>Unable to retrieve article.</h2>}
            </article>
          </details>
        )
      }))}
    </>
  ))
})

app.notFound((c) => {
  return c.render(
    <h1>
      Not Found -
      {c.req.path}
    </h1>,
  )
})

app.onError((error, c) => {
  return c.render(
    <h1>
      Error -
      {error.message}
    </h1>,
  )
})

export default app
