'use strict'

import { BodyParser } from '../index'

export class JsonParser implements BodyParser {
  public readonly contentType: string

  public constructor (contentType: string = 'application/json') {
    this.contentType = contentType
  }

  public match (contentType: string) {
    return this.contentType === contentType
  }

  public parse (body: Buffer | string) {
    return JSON.parse(Buffer.isBuffer(body) ? body.toString() : body)
  }
}

export default JsonParser
