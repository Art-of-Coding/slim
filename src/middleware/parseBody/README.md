# parseBody

Middleware for [Slim](https://github.com/Art-of-Coding/slim).

This middleware assumes a previous middleware that sets `ctx.req.body` as a Buffer
or string, such as [body](../body/README.md).

### API

#### parseBody

```ts
parseBody(...parsers: BodyParser): MiddlewareFunction<HttpContext>
```

Attempt to parse the body using one of the given parsers. If no parser matches
the request's `Content-Type`, the middleware continues the stack without updating
`ctx.req.body`.

If a parser's `parse()` method throws an error, a 400 Bad Request is sent.

A `BodyParser` is any object which satisfies the following interface:

```ts
interface BodyParser<B = any> {
  // content type for this parser
  // a parser may implement wild cards (e.g. 'application/*') - it's up to you!
  contentType: string
  // matches the given `Content-Type` header value to a parser, if any
  match (contentType: string): boolean
  // parses the raw body
  parse<U = B> (body: Buffer | string): U | Promise<U>
}
```

### Example

```ts
import Slim from './index'
import body from './middleware/body'
import parseBody from './middleware/parseBody'
import JsonParser from './middleware/parseBody/parsers/json'
import { createServer } from 'http'

const app = new Slim()
const jsonParser = new JsonParser()

app.use(
  body(),
  parseBody(jsonParser)
)

createServer(app1.callback()).listen(3000)
```

### License

Copyright 2019 [Michiel van der Velde](http://www.michielvdvelde.nl).

This software is licensed under the [MIT License](LICENSE).
