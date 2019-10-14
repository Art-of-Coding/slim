'use strict'

import { EventEmitter } from 'events'
import { HttpContext } from '../../index'
import { State } from '../../lib/Application'
import { MiddlewareFunction } from '@art-of-coding/lime-compose'

export class ServerSentEvents<S extends State = State> extends EventEmitter {
  public readonly statusCode: number

  private _clients: Set<HttpContext<S>> = new Set()

  public constructor (statusCode: number = 200) {
    super()

    this.statusCode = statusCode
  }

  /**
   * Send an event `name` to all clients.
   * @param  name    The name of the event
   * @param  id      The event id (if any)
   * @param  ...data The data to append
   */
  public async event (name: string, id?: string | number, ...data: string[]) {
    let message = `event: ${name}\n`

    if (id) {
      message += `id: ${id}\n`
    }

    if (data.length) {
      for (const chunk of data) {
        message += `data: ${chunk}\n`
      }
    }

    return this.broadcast(`${message}\n`)
  }

  /**
   * Send data `data` to all clients.
   * @param  data The data to send
   */
  public async data (data: string) {
    return this.broadcast(`data: ${data}\n\n`)
  }

  /**
   * Send a comment to all clients.
   * @param  comment The comment to send
   */
  public async comment (comment: string) {
    return this.broadcast(`; ${comment}\n\n`)
  }

  /**
   * Send `message` to all clients.
   * @param  message The message to send
   */
  public async broadcast (message: string) {
    if (!this._clients.size) {
      return
    }

    for (const client of this._clients) {
      if (client.raw.res.writable) {
        await client.res.write(message)
      } else {
        this.remove(client)
      }
    }
  }

  /**
   * Add a context to the clients list.
   * @param  ctx The context to add
   */
  public add (ctx: HttpContext<S>) {
    if (ctx.raw.res.writable) {
      this._clients.add(ctx)
      ctx.raw.res.once('close', () => this.remove(ctx))
      this.emit('add', ctx)
    }
  }

  /**
   * Remove a context from the clients list.
   * @param  ctx The context to remove
   */
  public remove (ctx: HttpContext<S>) {
    if (this._clients.delete(ctx)) {
      this.emit('remove', ctx)
      return true
    }

    return false
  }

  /**
   * Get the middleware function.
   *
   * Example:
   *
   * ```ts
   * const app = new Slim()
   * const sse = new ServerSentEvents()
   *
   * app.use(
   *   sse.middleware()
   * )
   * ```
   */
  public middleware (): MiddlewareFunction<HttpContext<S>> {
    return async ctx => {
      // Stop the default response handler
      ctx.respond = false

      const { res } = ctx

      if (!res.headersSent) {
       res.statusCode = this.statusCode
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
