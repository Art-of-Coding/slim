# vhost

Virtual host middleware for [Slim](https://github.com/Art-of-Coding/slim).

### API

#### vhost

```ts
vhost(hostname: string, app: Slim): MiddlewareFunction<HttpContext>
```

If the request has the `Host` header set to `hostname`,
call the middleware stack for the given Slim instance (`app`).

### Example

```ts
import Slim from './index'
import vhost from './middleware/vhost'
import { createServer } from 'http'

const app1 = new Slim()
const app2 = new Slim()

app1.use(
  vhost('example.com', app2),
  async ctx => {
    ctx.res.statusCode = 404
    cts.res.body = `Not Found`
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
