'use strict'

import { BodyParser } from '../index'
import HttpError from '../../../util/HttpError'

export class JsonParser implements BodyParser {
  public readonly contentType: string

  public constructor (contentType: string = 'application/json') {
    this.contentType = contentType
  }

  public match (contentType: string) {
    return contentType.startsWith(this.contentType)
  }

  public parse<U = any> (body: Buffer | string) {
    let parsedBody: U

    try {
      parsedBody = JSON.parse(Buffer.isBuffer(body) ? body.toString() : body)
    } catch (e) {
      throw new HttpError(400)
    }

    return parsedBody
  }
}

export default JsonParser
