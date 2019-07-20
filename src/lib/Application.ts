'use strict'

import { Context, MiddlewareFunction, compose } from '@art-of-coding/lime-compose'
import { IncomingMessage, ServerResponse } from 'http'
import { Stream } from 'stream'

import Request from './Request'
import Response from './Response'

export interface State {
  [x: string]: any
}

export interface HttpContext<S = State> extends Context {
  respond: boolean,
  app: Application,
  req: Request,
  res: Response,
  state: S,
  raw: {
    req: IncomingMessage,
    res: ServerResponse
  }
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
      const ctx = this.createContext(req, res)

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

  public createContext (req: IncomingMessage, res: ServerResponse, respond = true): HttpContext {
    return {
      respond,
      app: this,
      state: {},
      req: new Request(req),
      res: new Response(res),
      raw: { req, res }
    }
  }

  public async respond (ctx: HttpContext) {
    if (!ctx.respond || !ctx.raw.res.writable) {
      return
    }

    const { res } = ctx
    const body = res.json || res.body

    if (!res.statusCode) {
      if (body) {
        // Default to 200 OK
        res.statusCode = 200
      } else {
        // Default to 404 Not Found
        res.statusCode = 404
      }
    }

    if (!res.headersSent) {
      // NOTE: Headers up to this point are qeued and sent
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
