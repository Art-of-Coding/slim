# Body

Middleware for [Slim](https://github.com/Art-of-Coding/slim).

### API

#### body

```ts
body(opts: { maxPayloadLength?: number, encoding?: BufferEncoding, verifyLength?: boolean }): MiddlewareFunction<HttpContext>
```

Gets the entire body of a request. Continues running middleware after the full
body has been received. The body will then be available as `ctx.req.body`.

If `maxPayloadSize` is set and the payload exceeds this number in bytes,
the middleware throws a status 413 (Payload Too Large) error.

If `encoding` is set, the payload will be a string. Otherwise it is a `Buffer`.

If `verifyLength` is true and the request contains a `Content-Length` header,
throws a status 400 (Bad Request) error if the body's byte length does not match
the header value.

### Example

```ts
import Slim from './index'
import body from './middleware/body'
import { createServer } from 'http'

const app = new Slim()

app.use(
  body({ maxPayload: 10 * 1024 * 1024 /* 10mb */ }),
  async ctx => {
    // body is now available as ctx.req.body (Buffer)
  }
)

createServer(app1.callback()).listen(3000)
```

### License

Copyright 2019 [Michiel van der Velde](http://www.michielvdvelde.nl).

This software is licensed under the [MIT License](LICENSE).
