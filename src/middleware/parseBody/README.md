# parseBody

Middleware for [Slim](https://github.com/Art-of-Coding/slim).

This middleware assumes a previous middleware that sets `req.body` as a Buffer,
such as [body](../body/README.md).

### API

#### parseBody

```ts
parseBody(...parsers: BodyParser<B = any>): MiddlewareFunction<HttpContext>
```

Attempt to parse the body using one of the given parsers.

A `BodyParser` is any object which satisfies the following interface:

```ts
interface BodyParser<B = any> {
  // content type for this parser
  // a parser may implement whildcards (e.g. application/*)
  contentType: string
  // matches the given `Content-Type` header value to a parser, if any
  match (contentType: string): boolean
  // parses the raw body
  parse<U = B> (body: Buffer): U | Promise<U>
}
```

### Example

```ts
import Slim from './index'
import body from './middleware/body'
import parseBody, { BodyParser } from './middleware/parseBody'
import { createServer } from 'http'

const app = new Slim()

class JsonParser<B = { [key: string]: any }> implements BodyParser<B> {
  public readonly contentType = 'application/json'
  
  public match (contentType: string) {
    return this.contentType === contentType
  }
  
  public parse (body: Buffer) {
    return JSON.parse(body)
  }
}

app.use(
  body(),
  parseBody()
)

createServer(app1.callback()).listen(3000)
```

### License

Copyright 2019 [Michiel van der Velde](http://www.michielvdvelde.nl).

This software is licensed under the [MIT License](LICENSE).
