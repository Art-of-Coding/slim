'use strict'

import { Context, MiddlewareFunction, compose } from '@art-of-coding/lime-compose'
import { IncomingMessage, ServerResponse } from 'http'
import { Stream } from 'stream'

import Request from './Request'
import Response from './Response'

export interface HttpContext<S = { [x:string]: any }> extends Context {
  respond: boolean,
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

  public use (...middlewares: MiddlewareFunction<HttpContext>[]) {
    if (!middlewares.length) {
      throw new TypeError('use() expects at least one argument')
    }

    for (let middleware of middlewares) {
      this._stack.push(middleware)
    }

    return this
  }

  public callback () {
    const middleware = compose(...this._stack)

    return async (req: IncomingMessage, res: ServerResponse) => {
      const ctx: HttpContext = {
        respond: true,
        state: {},
        req: new Request(req),
        res: new Response(res),
        raw: { req, res }
      }

      try {
        await middleware(ctx)
      } catch (e) {
        // TODO: rethrow error (?)
        ctx.res.statusCode = 500
      }

      await this._respond(ctx)
    }
  }

  private async _respond (ctx: HttpContext) {
    if (!ctx.respond || !ctx.raw.res.writable) {
      return
    }

    const { res } = ctx

    // Default to 404 Not Found
    if (!res.statusCode) {
      res.statusCode = 404
    }

    res.raw.writeHead(res.statusCode, res.headers.toObject())

    if (res.body) {
      if (res.body instanceof Stream) {
        res.body.pipe(res.raw)
      } else {
        res.raw.write(res.body, () => res.raw.end())
      }
    } else {
      res.raw.end()
    }
  }
}

export default Application
