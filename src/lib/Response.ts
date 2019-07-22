'use strict'

import { ServerResponse, STATUS_CODES } from 'http'
import { Stream } from 'stream'

export class Response {
  public readonly raw: ServerResponse

  /** The response body (if any). */
  private _body: any = null
  private _json: string = null

  public constructor (res: ServerResponse) {
    this.raw = res
  }

  /** The response status code. */
  public get statusCode () {
    return this.raw.statusCode
  }

  /** Set the response status code. */
  public set statusCode (code: number) {
    // Only allow setting status code if headers are not sent yet
    if (!this.raw.headersSent) {
      this.raw.statusCode = code
    }
  }

  /** The status message for the status code (e.g. 'Not Found' for code 404). */
  public get statusMessage () {
    return this.statusCode ? STATUS_CODES[this.statusCode] : undefined
  }

  /** Whether or not the headers have been sent to the client. */
  public get headersSent () {
    return this.raw.headersSent
  }

  /**
   * If the set body is JSON, this stores the stringified version of the body.
   */
  public get json () {
    // NOTE: this returns the stringified version
    // For the original object/array, use this.body
    return this._json
  }

  /** The response body (if any). */
  public get body () {
    return this._body
  }

  /** Set the response body and update headers accordingly. */
  public set body (body: any) {
    // Reset json
    this._json = null

    // Convert number to string
    if (!isNaN(body)) {
      body = String(body)
    }

    if (body === null) {
      this.remove('Content-Type', 'Transfer-Encoding', 'Content-Length')
    } else if (typeof body === 'string') {
      this.setIfNotSet('Content-Type', 'text/plain')
      this.set('Content-Length', Buffer.byteLength(body))
    } else if (Buffer.isBuffer(body)) {
      this.setIfNotSet('Content-Type', 'application/octet-stream')
      this.set('Content-Length', body.byteLength)
    } else if (body instanceof Stream) {
      this.setIfNotSet('Content-Type', 'application/octet-stream')
      this.set('Transfer-Encoding', 'chunked')
      if (!this.has('Content-Length') || this.get('Content-Length') === 0) {
        this.remove('Content-Length')
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

  /** Whether or not a header `key` exists. */
  public has (key: string) {
    return this.raw.hasHeader(key)
  }

  /** Get the value of header `key`. */
  public get (key: string) {
    return this.raw.getHeader(key)
  }

  /** Set the value of header `key`. */
  public set (key: string, value: string | number) {
    this.raw.setHeader(key, value)
    return this
  }

  /** Shortcut method to set header if no value has been set yet. */
  public setIfNotSet (key: string, value: string | number) {
    if (!this.has(key)) {
      this.set(key, value)
    }
  }

  /** Remove header(s) `keys`. */
  public remove (...keys: string[]) {
    for (let key of keys ) {
      this.raw.removeHeader(key)
    }
  }

  /** Remove all headers. */
  public removeAll () {
    for (let key in this.raw.getHeaderNames()) {
      this.raw.removeHeader(key)
    }
  }

  /**
   * Write a chunk of data to the client.
   * This is a Promise-based version of `this.raw.write`.
   */
  public async write (chunk: Buffer | string) {
    return new Promise<void>((resolve, reject) => {
      this.raw.write(chunk, (err => {
        if (err) return reject(err)
        resolve()
      }))
    })
  }

  /**
   * End the response.
   * This is a Promise-based version of `this.raw.end()`.
   */
  public async end () {
    return new Promise<void>(resolve => {
      this.raw.end(resolve)
    })
  }
}

export default Response
