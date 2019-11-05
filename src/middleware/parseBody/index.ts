'use strict'

import { HttpContext } from '../../index'
import { NextFunction } from '@art-of-coding/lime-compose'

interface BodyParser<B = any> {
  contentType: string
  match (type: string): boolean
  parse<U = B> (body: Buffer): U | Promise<U>
}

export function parseBody (...parsers: BodyParser[]) {
  if (!parsers.length) {
    throw new Error('parseBody() expects at least one BodyParser')
  }

  function matchParser (contentType: string) {
    for (const parser of parsers) {
      if (parser.match(contentType)) {
        return parser
      }
    }
  }

  return async (ctx: HttpContext, next: NextFunction) => {
    const { req } = ctx
    const contentType: string = req.raw.headers['content-type']

    if (!contentType) {
      // What to do when no content type is defined?
      return next()
    }

    const parser = matchParser(contentType)

    if (!parser) {
      // What to do when there's no parser?
      return next()
    }

    let newBody: any

    try {
      newBody = parser.parse(req.body)
    } catch (e) {
      // Error parsing body - what to do?
      return next()
    }

    req.body = newBody
    return next()
  }
}

export default parseBody
