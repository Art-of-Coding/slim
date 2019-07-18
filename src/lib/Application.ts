'use strict'

import { Context, MiddlewareFunction, compose } from '@art-of-coding/lime-compose'
import { IncomingMessage, ServerResponse, STATUS_CODES } from 'http'
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

  public use (...middlewares: MiddlewareFunction<HttpContext>[]) {
    if (!middlewares.length) {
      throw new TypeError('use() expects at least one argument')
    }

    for (let middleware of middlewares) {
      this._stack.push(middleware)
    }

    return this
  }

  public compose () {
    return compose(...this._stack)
  }

  public callback () {
    const middleware = compose(...this._stack)

    return async (req: IncomingMessage, res: ServerResponse) => {
      const ctx: HttpContext = {
        respond: true,
        app: this,
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

  private async _respond (ctx: HttpContext<State>) {
    if (!ctx.respond || !ctx.raw.res.writable) {
      return
    }

    const { res } = ctx
    let body = res.json || res.body

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
      res.raw.writeHead(res.statusCode, res.headers.toObject())
    }

    if (body) {
      if (body instanceof Stream) {
        body.pipe(res.raw)
      } else {
        // res.raw.write(body, () => res.raw.end())
        await res.write(body)
        await res.end()
      }
    } else {
      // res.raw.end()
      await res.end()
    }
  }
}

export default Application
