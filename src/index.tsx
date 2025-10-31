import { Hono } from 'hono'
import { jsxRenderer } from 'hono/jsx-renderer'
import { getFeed } from './lib/hacker-news'

const app = new Hono()

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
  })
)

app.get('/', async (c) => {
    const items = await getFeed()
  return c.render((
    <>
    {items?.map((entry) => {
        return (
            <details>
                <summary role="button" class="outline contrast">{entry.title}</summary>
                <article>
                    <header>
                        <a href={entry.link} target="_blank" rel="nofollow noopener">Article</a>
                        {" | "}
                        <a href={entry.comments} target="_blank" rel="nofollow noopener">Comments</a>
                    </header>
                </article>
            </details>
        )
    })}
    </>
  ))
})

app.notFound((c) => {
  return c.render(<h1>Not Found - {c.req.path}</h1>)
})

app.onError((error, c) => {
  return c.render(<h1>Error - {error.message}</h1>)
})

export default app
