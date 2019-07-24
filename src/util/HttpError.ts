'use strict'

import { STATUS_CODES } from 'http'

export interface HttpErrorProperties {
  expose?: boolean,
  error?: Error,
  headers?: { [x: string]: string | number }
}

export class HttpError extends Error {
  public readonly statusCode: number
  public readonly expose: boolean = false
  public readonly headers: { [x: string]: string | number }
  public readonly wrappedError?: Error

  public constructor (statusCode = 500, message = STATUS_CODES[statusCode], properties: HttpErrorProperties = {}) {
    super(message)

    this.statusCode = statusCode

    if (properties.expose || statusCode < 500) {
      this.expose = true
    }

    if (properties.error) {
      this.wrappedError = properties.error
    }

    if (properties.headers && Object.keys(properties.headers).length) {
      this.headers = properties.headers
    }
  }
}

export default HttpError
