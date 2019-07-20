'use strict'

import { ServerResponse, STATUS_CODES } from 'http'
import { Stream } from 'stream'

export class Response {
  public readonly raw: ServerResponse

  private _statusCode: number
  private _body: any = null
  private _json: string = null

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

  public get headersSent () {
    return this.raw.headersSent
  }

  public get json () {
    // NOTE: this returns the stringified version
    // For the original object/array, use this.body
    return this._json
  }

  public get body () {
    return this._body
  }

  public set body (body: any) {
    // Reset json
    this._json = null

    // Convert number to string
    if (!isNaN(body)) {
      body = String(body)
    }

    if (body === null) {
      this.remove('Content-Type')
      this.remove('Transfer-Encoding')
      this.set('Content-Length', 0)
    } else if (typeof body === 'string') {
      this.setIfNotSet('Content-Type', 'text/plain')
      this.set('Content-Length', Buffer.byteLength(body))
    } else if (Buffer.isBuffer(body)) {
      this.setIfNotSet('Content-Type', 'application/octet-stream')
      this.set('Content-Length', body.byteLength)
    } else if (body instanceof Stream) {
      this.setIfNotSet('Content-Type', 'application/octet-stream')
      if (!this.has('Content-Length') || this.get('Content-Length') === 0) {
        this.remove('Content-Length')
        this.set('Transfer-Encoding', 'chunked')
      }
    } else {
      try {
        this._json = JSON.stringify(body)
        this.setIfNotSet('Content-Type', 'application/json')
        this.set('Content-Length', Buffer.byteLength(this._json))
      } catch (e) {
        throw new Error('unable to parse body')
      }
    }

    this._body = body
  }

  public has (key: string) {
    return this.raw.hasHeader(key)
  }

  public get (key: string) {
    return this.raw.getHeader(key)
  }

  public set (key: string, value: string | number) {
    this.raw.setHeader(key, value)
    return this
  }

  // Shortcut method to set header if no value has been set yet
  public setIfNotSet (key: string, value: string | number) {
    if (!this.has(key)) {
      this.set(key, value)
    }
  }

  public remove (key: string) {
    this.raw.removeHeader(key)
  }

  public removeAll () {
    for (let key in this.raw.getHeaderNames()) {
      this.raw.removeHeader(key)
    }
  }

  public async write (chunk: Buffer | string) {
    return new Promise<void>((resolve, reject) => {
      this.raw.write(chunk, (err => {
        if (err) return reject(err)
        resolve()
      }))
    })
  }

  public async end () {
    return new Promise<void>(resolve => {
      this.raw.end(resolve)
    })
  }
}

export default Response
