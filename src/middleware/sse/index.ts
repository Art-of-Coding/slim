'use strict'

import { HttpContext } from '../../index'
import { MiddlewareFunction } from '@art-of-coding/lime-compose'

export class ServerSentEvents {
  private _clients: Set<HttpContext> = new Set()

  public async event (name: string, ...data: string[]) {
    let message = `event: ${name}`

    if (data.length) {
      for (let chunk of data) {
        message += `\ndata: ${chunk}`
      }
    }

    return this.broadcast(`${message}\n\n`)
  }

  public async data (data: string) {
    return this.broadcast(`data: ${data}\n\n`)
  }

  public async comment (comment: string) {
    return this.broadcast(`; ${comment}\n\n`)
  }

  public async broadcast (message: string) {
    if (!this._clients.size) {
      return
    }

    for (let client of this._clients) {
      if (!client.raw.res.writable) {
        this._clients.delete(client)
        continue
      }

      await client.res.write(message)
    }
  }

  public add (ctx: HttpContext) {
    if (ctx.raw.res.writable) {
      this._clients.add(ctx)

      // NOTE: Consider using `WeakSet`?
      ctx.raw.res.once('close', () => this._clients.delete(ctx))
    }
  }

  public middleware (): MiddlewareFunction<HttpContext> {
    return async ctx => {
      // Stop de default response handler
      ctx.respond = false

      const { res } = ctx

      if (!res.headersSent) {
       res.statusCode = 200
       res.body = null
       res.set('Connection', 'keep-alive')
       res.set('Cache-Control', 'no-cache')
       res.set('Context-Type', 'text/event-stream')
      }

      this.add(ctx)
    }
  }
}

export default ServerSentEvents
