'use strict'

import { IncomingMessage } from 'http'
import { getClientIp as getIp } from 'request-ip'

export class Request {
  /** The original request */
  public readonly raw: IncomingMessage
  /** The oritinal url */
  public readonly originalUrl: string
  /** An URL object */
  public readonly url: URL
  /** Request route parameters */
  public params: { [x: string]: string } = {}

  /** Request body **/
  private _body: any

  public constructor (req: IncomingMessage) {
    this.raw = req
    this.originalUrl = req.url

    const protocol = this.encrypted ? 'https' : 'http'
    this.url = new URL(`${protocol}://${this.host}${req.url}`)
  }

  public get body () {
    return this._body
  }

  public getBody<U = any> (): U {
    return this._body ? this._body : undefined
  }

  public set body (body: any) {
    this._body = body
  }

  public get ip () {
    return getIp(this.raw)
  }

  /** Whether or not the connection is encrypted (e.g. HTTPS). */
  public get encrypted () {
    // @ts-ignore
    // NOTE: TS node types do not include `encrypted`
    return <boolean>this.raw.connection.encrypted
  }

  /** The protocol (`http` or `https`). */
  public get protocol () {
    return this.url.protocol || this.encrypted ? 'https' : 'http'
  }

  /** The request method. */
  public get method () {
    return this.raw.method
  }

  /** The request host */
  public get host () {
    return this.url ? this.url.host : this.raw.headers['host'] || undefined
  }

  /** The request hostname */
  public get hostname () {
    return this.url.hostname
  }

  /** The request pathname */
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
