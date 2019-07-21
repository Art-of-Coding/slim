'use strict'

import { MiddlewareFunction, compose } from '@art-of-coding/lime-compose'
import { IncomingMessage, ServerResponse } from 'http'
import { Stream } from 'stream'

import { HttpContext, createContext } from './HttpContext'

export interface State {
  [x: string]: any
}

export class Application {
  private _stack: MiddlewareFunction<HttpContext>[] = []
  private _composed: MiddlewareFunction<HttpContext> = null

  public use (...middlewares: MiddlewareFunction<HttpContext>[]) {
    if (!middlewares.length) {
      throw new TypeError('use() expects at least one argument')
    }

    this._composed = null

    for (let middleware of middlewares) {
      this._stack.push(middleware)
    }

    return this
  }

  public compose () {
    if (!this._composed) {
      this._composed = compose(...this._stack)
    }

    return this._composed
  }

  public callback () {
    return async (req: IncomingMessage, res: ServerResponse) => {
      const middleware = this.compose()
      const ctx = createContext(req, res)

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

  public async respond (ctx: HttpContext) {
    if (!ctx.respond || !ctx.raw.res.writable) {
      return
    }

    const { res } = ctx
    const body = res.json || res.body

    if (!res.headersSent) {
      if (!res.statusCode) {
        if (body) {
          // Default to 200 OK
          res.statusCode = 200
        } else {
          // Default to 404 Not Found
          res.statusCode = 404
        }

        res.remove('Transfer-Encoding')
        res.set('Content-Length', 0)
      }

      res.raw.writeHead(res.statusCode)
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
