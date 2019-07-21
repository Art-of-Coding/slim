# Redirect

Middleware for [Slim](https://github.com/Art-of-Coding/slim).

### API

#### redirect

```ts
redirect(url: string, statusCode = 302): MiddlewareFunction<HttpContext>
```

Set the `statusCode` (e.g. 302) and add a `Location` header with the specified URL.

### Example

```ts
import Slim from './index'
import redirect from './middleware/redirect'
import { createServer } from 'http'

const app = new Slim()

app.use(
  redirect('http://github.com')
)

createServer(app1.callback()).listen(3000)
```

### License

Copyright 2019 [Michiel van der Velde](http://www.michielvdvelde.nl).

This software is licensed under the [MIT License](LICENSE).
