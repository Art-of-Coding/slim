'use strict'

import { ServerResponse } from 'http'
import { Stream } from 'stream'

import HeaderMap from './HeaderMap'

export class Response {
  public readonly raw: ServerResponse
  public readonly headers = new HeaderMap()

  private _statusCode: number
  private _body: any = null

  public constructor (res: ServerResponse) {
    this.raw = res
  }

  public get statusCode () {
    return this._statusCode
  }

  public set statusCode (code: number) {
    this._statusCode = code
  }

  public get statusMessage () {
    return 'OK'
  }

  public get body () {
    return this._body
  }

  public set body (body: any) {
    if (body === null) {
      this.headers.delete('Content-Type')
      this.headers.delete('Content-Length')
      this.headers.delete('Transfer-Encoding')
    } else if (typeof body === 'string') {
      this.headers.setIfNotSet('Content-Type', 'text/plain')
      this.headers.setIfNotSet('Content-Length', Buffer.byteLength(body))
    } else if (Buffer.isBuffer(body)) {
      this.headers.setIfNotSet('Content-Type', 'application/octet-stream')
      this.headers.setIfNotSet('Content-Length', body.byteLength)
    } else if (body instanceof Stream) {
      this.headers.set('Content-Type', 'application/octet-stream')
      this.headers.set('Transfer-Encoding', 'chunked')
    } else {
      try {
        body = JSON.stringify(body)
        this.headers.setIfNotSet('Content-Type', 'application/json')
        this.headers.setIfNotSet('Content-Length', Buffer.byteLength(body))
      } catch (e) {
        throw new Error('unable to parse body')
      }
    }

    this._body = body
  }
}

export default Response
