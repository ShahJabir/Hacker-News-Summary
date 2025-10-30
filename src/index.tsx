import { Hono } from 'hono'
import { jsxRenderer } from 'hono/jsx-renderer'

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

app.get('/', (c) => {
  return c.render(<h1>Hello, World!</h1>)
})

app.get('/error', (_) => {
    throw new Error("This is a Error");
})

app.notFound((c) => {
  return c.render(<h1>Not Found - {c.req.path}</h1>)
})

app.onError((error, c) => {
  return c.render(<h1>Error - {error.message}</h1>)
})

export default app
