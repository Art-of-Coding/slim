'use strict'

import { HttpContext } from '../../index'
import { NextFunction } from '@art-of-coding/lime-compose'

export function body () {
  return async (ctx: HttpContext, next: NextFunction) => {
    const { req } = ctx

    return new Promise<void>((resolve, reject) => {
      let body: Buffer = Buffer.alloc(0)

      const onData = (data: Buffer) => {
        body = Buffer.concat([ data, data ])
      }

      const onError = (err: Error) => {
        req.raw.removeListener('end', onEnd)
        req.raw.removeListener('data', onData)
        reject(err)
      }

      const onEnd = () => {
        req.body = body
        req.raw.removeListener('error', onError)
        req.raw.removeListener('data', onData)
        resolve(next())
      }

      req.raw.on('data', onData)
      req.raw.once('error', onError)
      req.raw.once('end', onEnd)
    })
  }
}

export default body
