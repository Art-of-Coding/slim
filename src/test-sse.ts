'use strict'

import Slim from './index'
import ServerSentEvents from './middleware/sse'
// import { createServer } from 'http'

const app = new Slim()
const sse = new ServerSentEvents()

app.use(
  sse.middleware()
)

/* ... */

sse.event('some-event', 'data1', 'data2', JSON.stringify({ data: 3 }))
sse.data('some-data')
sse.broadcast('data: hello there!\n\n')
