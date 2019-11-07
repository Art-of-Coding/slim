'use strict'

import { HttpContext, HttpError } from '../../index'
import { NextFunction } from '@art-of-coding/lime-compose'

export function body (opts: { maxPayloadSize?: number, encoding?: BufferEncoding, verifyLength?: boolean } = {}) {
  return async (ctx: HttpContext, next: NextFunction) => {
    const { maxPayloadSize, encoding } = opts
    const { req } = ctx
    const { raw } = req
    const verifyLength = opts.verifyLength || false
    const contentLength = raw.headers['content-length'] ? parseInt(raw.headers['content-length']) : undefined

    if ((maxPayloadSize && contentLength) && (contentLength > maxPayloadSize)) {
      throw new HttpError(413)
    }

    return new Promise<void>((resolve, reject) => {
      let body: Buffer = Buffer.allocUnsafe(0)

      const onData = (data: Buffer) => {
        body = Buffer.concat([ body, data ])

        if (maxPayloadSize && body.byteLength > maxPayloadSize) {
          raw.removeListener('data', onData)
          raw.removeListener('error', onError)
          raw.removeListener('end', onEnd)
          raw.destroy()
          reject(new HttpError(413))
        }
      }

      const onError = (err: Error) => {
        raw.removeListener('end', onEnd)
        raw.removeListener('data', onData)
        reject(err)
      }

      const onEnd = () => {
        raw.removeListener('error', onError)
        raw.removeListener('data', onData)

        if (verifyLength && contentLength && contentLength !== body.byteLength) {
          return reject(new HttpError(400))
        }

        if (encoding && Buffer.isBuffer(body)) {
          req.body = body.toString(encoding)
        } else {
          req.body = body
        }

        resolve(next())
      }

      raw.on('data', onData)
      raw.once('error', onError)
      raw.once('end', onEnd)
    })
  }
}

export default body
