'use strict'

import { IncomingMessage } from 'http'

export class Request {
  public readonly raw: IncomingMessage

  public constructor (req: IncomingMessage) {
    this.raw = req
  }
}

export default Request
