'use strict'

import { MiddlewareFunction, compose } from '@art-of-coding/lime-compose'
import { IncomingMessage, ServerResponse } from 'http'
import { Stream } from 'stream'

import { HttpContext, createContext } from './HttpContext'
import { empty as emptyStatus } from '../util/statuses'

/**
 * Context state for storing state data within `HttpContext.state`.
 */
export interface State {
  [x: string]: any
}

/**
 * Represents a middleware application.
 */
export class Application<S extends State = State> {
  /** The middleware stack. */
  private _stack: MiddlewareFunction<HttpContext<S>>[] = []
  /** The composed middleware stack (if any). */
  private _composed: MiddlewareFunction<HttpContext<S>> = null

  /**
   * Use one or more middlewares.
   * Middlewares are stored and run in the order they are inserted.
   *
   * Example:
   *
   * ```ts
   * app.use(middleware1(), middleware2())
   * ```
   */
  public use (...middlewares: MiddlewareFunction<HttpContext<S>>[]) {
    if (!middlewares.length) {
      throw new TypeError('use() expects at least one argument')
    }

    this._composed = null

    for (let middleware of middlewares) {
      this._stack.push(middleware)
    }

    return this
  }

  /**
   * Compose the middleware stack and return a composed middleware.
   */
  public compose () {
    if (!this._composed) {
      this._composed = compose(...this._stack)
    }

    return this._composed
  }

  /**
   * Return a request handler callback for node's http server.
   */
  public callback () {
    return async (req: IncomingMessage, res: ServerResponse) => {
      const middleware = this.compose()
      const ctx = createContext<S>(req, res)

      try {
        await middleware(ctx)
      } catch (e) {
        // TODO: rethrow error (?)
        ctx.res.statusCode = 500
        ctx.res.set('Connection', 'close')

        if (!ctx.res.body) {
          ctx.res.removeAll()
          ctx.res.set('Content-Length', 0)
        }
      }

      await this.respond(ctx)
    }
  }

  /**
   * Respond to the request defined in the context.
   * This is automatically called by `this.callback()`.
   */
  public async respond (ctx: HttpContext<S>) {
    if (!ctx.respond || !ctx.raw.res.writable) {
      return
    }

    const { res } = ctx
    let body = res.json || res.body

    if (!res.headersSent) {
      if (!res.statusCode) {
        if (body) {
          // Default to 200 OK
          res.statusCode = 200
        } else {
          // Default to 404 Not Found
          res.statusCode = 404
          res.remove('Content-Length', 'Transfer-Encoding')
        }
      }

      // Strip body if status code requires an empty body
      if (emptyStatus[res.statusCode]) {
        res.body = null
        body = null
      }
    }

    if (body) {
      if (body instanceof Stream) {
        body.pipe(res.raw)
      } else {
        await res.write(body)
      }
    }

    await res.end()
  }
}

export default Application
