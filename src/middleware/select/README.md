# Select

Middleware for [Slim](https://github.com/Art-of-Coding/slim).

### API

#### select

```ts
select(fn: (ctx: HttpContext) => boolean | Promise<boolean>, app: Slim): MiddlewareFunction<HttpContext>
```

If `fn` evaluates to `true`, call the middleware stack for the given Slim instance (`app`).

### Example

```ts
import Slim from './index'
import select from './middleware/select'
import { createServer } from 'http'

const app1 = new Slim()
const app2 = new Slim()

app1.use(
  select(ctx => ctx.hostname === 'example.com', app2),
  async ctx => {
    ctx.res.statusCode = 404
    cts.res.body = `Host ${ctx.req.hostname} not found`
  }
)

app2.use(
  async (ctx) => {
    ctx.res.body = 'Welcome to example.com!'
  }
)

createServer(app1.callback()).listen(3000)
```

### License

Copyright 2019 [Michiel van der Velde](http://www.michielvdvelde.nl).

This software is licensed under the [MIT License](LICENSE).
