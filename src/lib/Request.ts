'use strict'

import { IncomingMessage } from 'http'

export class Request {
  public readonly raw: IncomingMessage
  public readonly originalUrl: string
  public readonly url: URL

  public params: { [x: string]: string } = {}

  public constructor (req: IncomingMessage) {
    this.raw = req
    this.originalUrl = req.url

    const protocol = this.encrypted ? 'https' : 'http'
    this.url = new URL(`${protocol}://${this.host}${req.url}`)
  }

  public get encrypted () {
    // @ts-ignore
    // NOTE: TS node types do not include `encrypted`
    return <boolean>this.raw.connection.encrypted
  }

  public get protocol () {
    return this.url.protocol || this.encrypted ? 'https' : 'http'
  }

  public get method () {
    return this.raw.method
  }

  public get host () {
    return this.url ? this.url.host : this.raw.headers['host'] || undefined
  }

  public get hostname () {
    return this.url.hostname
  }

  public get pathname () {
    return this.url.pathname
  }

  public get href () {
    return this.url.href
  }

  public get hash () {
    return this.url.hash
  }

  public get search () {
    return this.url.search
  }

  public get searchParams () {
    return this.url.searchParams
  }
}

export default Request
