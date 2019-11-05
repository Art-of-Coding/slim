'use strict'

import { HttpContext, HttpError } from '../../index'
import { NextFunction } from '@art-of-coding/lime-compose'

export function body (opts: { maxPayloadSize?: number, encoding?: BufferEncoding }) {
  return async (ctx: HttpContext, next: NextFunction) => {
    const { maxPayloadSize, encoding } = opts
    const { req } = ctx

    return new Promise<void>((resolve, reject) => {
      let body: Buffer = Buffer.alloc(0)

      const onData = (data: Buffer) => {
        body = Buffer.concat([ body, data ])

        if (maxPayloadSize && body.byteLength > maxPayloadSize) {
          req.raw.removeListener('data', onData)
          req.raw.removeListener('error', onError)
          req.raw.removeListener('end', onEnd)
          req.raw.destroy()
          reject(new HttpError(413))
        }
      }

      const onError = (err: Error) => {
        req.raw.removeListener('end', onEnd)
        req.raw.removeListener('data', onData)
        reject(err)
      }

      const onEnd = () => {
        req.raw.removeListener('error', onError)
        req.raw.removeListener('data', onData)

        if (encoding) {
          req.body = body.toString(encoding)
        } else {
          req.body = body
        }

        resolve(next())
      }

      req.raw.on('data', onData)
      req.raw.once('error', onError)
      req.raw.once('end', onEnd)
    })
  }
}

export default body