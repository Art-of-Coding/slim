# Server Sent Events

Middleware for [Slim](https://github.com/Art-of-Coding/slim).

### API

#### new ServerSentEvents()

```ts
const sse = new ServerSentEvents()
```

Create a new SSE instance

#### sse.middleware()

```ts
sse.middleware (): MiddlewareFunction<HttpContext>
```

The sever sent middleware.

#### sse.event (name: string, ...data: string[])

```ts
sse.event (name: string, ...data: string[]): Promise<void>
```

Sends an event with the specified `name` and `data` to all active clients.

#### sse.data (data: string)

```ts
sse.data (data: string): Promise<void>
```

Sends some data to all active clients.

#### sse.broadcast ()

```ts
sse.broadcast (message: string): Promise<void>
```

Broadcasts `message` to all active clients. The message will be sent as-is!

### Example

```ts
import Slim from './index'
import ServerSentEvents from './middleware/sse'
import { createServer } from 'http'

const app = new Slim()
const sse = new ServerSentEvents()

// Add the middleware to the app
app.use(
  sse.middleware()
)

createServer(app1.callback()).listen(3000)

// Sometime later or somewhere else...

await sse.event('my-event', 'data1', 'data2')

await sse.data('some-data')

await sse.broadcast(': this is a comment\n\n')
```

### License

Copyright 2019 [Michiel van der Velde](http://www.michielvdvelde.nl).

This software is licensed under the [MIT License](LICENSE).
