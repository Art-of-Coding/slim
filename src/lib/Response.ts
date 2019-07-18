'use strict'

import { ServerResponse, STATUS_CODES } from 'http'
import { Stream } from 'stream'

import HeaderMap from './HeaderMap'

export class Response {
  public readonly raw: ServerResponse
  public readonly headers = new HeaderMap()

  private _statusCode: number
  private _body: any = null
  private _json: any = null

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
    return this._statusCode ? STATUS_CODES[this._statusCode] : undefined
  }

  public get body () {
    return this._body
  }

  public get json () {
    return this._json
  }

  public set body (body: any) {
    // Reset json
    this._json = null

    // Convert number to string
    if (!isNaN(body)) {
      body = String(body)
    }

    if (body === null) {
      this.headers.delete('Content-Type')
      this.headers.delete('Content-Length')
      this.headers.delete('Transfer-Encoding')
    } else if (typeof body === 'string') {
      this.headers.setIfNotSet('Content-Type', 'text/plain')
      this.headers.set('Content-Length', Buffer.byteLength(body))
    } else if (Buffer.isBuffer(body)) {
      this.headers.setIfNotSet('Content-Type', 'application/octet-stream')
      this.headers.set('Content-Length', body.byteLength)
    } else if (body instanceof Stream) {
      this.headers.setIfNotSet('Content-Type', 'application/octet-stream')
      this.headers.setIfNotSet('Transfer-Encoding', 'chunked')
    } else {
      try {
        this._json = JSON.stringify(body)
        this.headers.setIfNotSet('Content-Type', 'application/json')
        this.headers.set('Content-Length', Buffer.byteLength(this._json))
      } catch (e) {
        throw new Error('unable to parse body')
      }
    }

    this._body = body
  }
}

export default Response
