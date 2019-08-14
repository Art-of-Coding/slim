'use strict'

import { HttpContext } from '../../index'
import { State } from '../../lib/Application'
import { MiddlewareFunction } from '@art-of-coding/lime-compose'

import { stat as statCb, Stats, createReadStream } from 'fs'
import { isAbsolute as isAbsolutePath, resolve as resolvePath } from 'path'

export function serveStatic<S extends State = State> (basePath: string): MiddlewareFunction<HttpContext<S>> {
  if (!isAbsolutePath(basePath)) {
    basePath = resolvePath(process.cwd(), basePath)
  }

  const statsCache: Map<string, Stats> = new Map()

  const getStats = async (path: string) => {
    return new Promise<Stats>((resolve, reject) => {
      if (statsCache.has(path)) {
        return resolve(statsCache.get(path))
      }

      statCb(path, (err, stats) => {
        if (err) {
          reject(err)
        } else {
          resolve(stats)
        }
      })
    })
  }

  return async (ctx, next) => {
    const path = resolvePath(basePath, `.${ctx.req.pathname}`)
    let stats: Stats = null

    try {
      stats = await getStats(path)
    } catch (e) {}

    if (stats && stats.isFile()) {
      // TODO: Set `Content-Type` header
      ctx.res.body = createReadStream(path)
      ctx.res.remove('Transfer-Encoding')
      ctx.res.set('Content-Length', stats.size)
    }
  }
}

export default serveStatic
