# Router

Middleware for [Slim](https://github.com/Art-of-Coding/slim).

### API

#### new Router (options: { respondWith405?: boolean, respondWith501?: boolean })

Creates a new `Router` instance

```ts
const router = new Router({
  // Respond with 405 Method Not Allowed when an invalid method
  // for the route is used (e.g. `GET` instead of `POST`)
  respondWith405: false,
  // Respond with 501 Not Implemented when the route exists but
  // not for the given method (e.g. `GET`)
  respondWith501: false
})
```

#### router.set (method: string, path: string, ...middleware: MiddlewareFunction<HttpContext>[])

Set one or more middlewares for the given request method (e.g. `GET`) and path
(e.g. `/about`).

The other methods are shortcuts:
 * `router.get (path: string, ...middleware: MiddlewareFunction<HttpContext>[])`
 * `router.post (path: string, ...middleware: MiddlewareFunction<HttpContext>[])`
 * `router.put (path: string, ...middleware: MiddlewareFunction<HttpContext>[])`
 * `router.delete (path: string, ...middleware: MiddlewareFunction<HttpContext>[])`
 * `router.patch (path: string, ...middleware: MiddlewareFunction<HttpContext>[])`

### Example

```ts
import Slim from './index'
import Router from './middleware/router'
import { createServer } from 'http'

const app = new Slim()
const router = new Router()

router.get(
  '/',
  async ctx => ctx.body = 'Hello there!'
)

router.get(
  '/about',
  async ctx => ctx.body = 'About me'
)

router.get(
  '/blog',
  async ctx => ctx.body = 'My blog'
)

// Support for named parameters as well
router.get(
  '/blog/:id',
  async ctx => ctx.body = `Article #${ctx.params.id}`
)

app.use(
  router.middleware()
)

createServer(app1.callback()).listen(3000)
```

### License

Copyright 2019 [Michiel van der Velde](http://www.michielvdvelde.nl).

This software is licensed under the [MIT License](LICENSE).
