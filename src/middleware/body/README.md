# Body

Middleware for [Slim](https://github.com/Art-of-Coding/slim).

### API

#### body

```ts
body(opts: { maxPayloadLength?: number }): MiddlewareFunction<HttpContext>
```

Gets the entire body of a request. Continues running middleware after the full
body has been received.

Body is stored as a `Buffer`, and no interpretation is done.

If `maxPayloadSize` is set and the payload exceeds this number in bytes,
the middleware throws a status 413 (Payload Too Large) error.

### Example

```ts
import Slim from './index'
import body from './middleware/body'
import { createServer } from 'http'

const app = new Slim()

app.use(
  body(),
  async ctx => {
    // body is now available as ctx.req.body (Buffer)
  }
)

createServer(app1.callback()).listen(3000)
```

### License

Copyright 2019 [Michiel van der Velde](http://www.michielvdvelde.nl).

This software is licensed under the [MIT License](LICENSE).
