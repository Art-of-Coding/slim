# Slim

Slim is a small web framework which uses ***async/await*** middleware.
Only basic functionality has been implemented, and there is no roadmap for
an eventual publish on npm.

Slim is heavily inspired by [Koa](https://koajs.com/).

**Note**: This is currently a work-in-progress and as such may not work as intended,
and (breaking) API changes are frequent.

### Example

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

// Create the server and listen
createServer(app.callback()).listen(3000)
```

### To Do

This list is incomplete.

 * Supply API documentation
 * Support proxies (e.g. `X-Forwarded-For`)
 * Support `100 Continue` (and thus `Expect: 100-Continue`)
 * Support HTTP Trailers
 * Support content type setters (e.g. `res.type = 'xml'`) and checkers
   (e.g. `req.type('html'): boolean`)
 * Support accept helpers (e.g. `req.accepts('xml'): boolean`)

### License

Copyright 2019 [Michiel van der Velde](http://www.michielvdvelde.nl).

This software is licensed under the [MIT License](LICENSE).
