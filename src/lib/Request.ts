'use strict'

import { IncomingMessage } from 'http'

export class Request {
  public readonly raw: IncomingMessage

  public constructor (req: IncomingMessage) {
    this.raw = req
  }

  public get host () {
    return this.raw.headers['host']
  }

  public get pathname () {
    return this.raw.url
  }
}

export default Request
