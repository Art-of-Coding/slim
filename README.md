# Slim

Slim is a small web framework which uses ***async/await*** middleware.
Only basic functionality has been implemented, and there is no roadmap for
an eventual publish on npm.

Slim is heavily inspired by [Koa](https://koajs.com/).

## Example with Node's HTTP server

```ts
import { createServer } from 'http'
import Slim from '@art-of-coding/slim'

// Create a new app
const app = new Slim()

// Add middleware
app.use(
  async (ctx, next) => {
    if (ctx.req.pathname === '/go-to-github') {
      ctx.res.statusCode = 302
      ctx.res.set('Location', 'http://github.com')
      ctx.res.body = 'Redirecting to Github...'
    } else {
      await next()
    }
  },
  async ctx => {
    ctx.res.statusCode = 200
    ctx.res.body = 'Welcome!'
  }
)

// Create the server
const server = createServer(app.callback())

// Start the server
server.listen(3000)
```

### License

Copyright 2019 [Michiel van der Velde](http://www.michielvdvelde.nl).

This software is licensed under the [MIT License](LICENSE).
