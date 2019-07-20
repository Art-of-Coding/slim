'use strict'

import Slim, { HttpContext } from '../../index'
import { MiddlewareFunction, NextFunction } from '@art-of-coding/lime-compose'

export class Router {
  private _respondWith405 = false
  private _routes: Map<string, Map<string, Slim>> = new Map()

  public constructor (options: { respondWith405?: boolean } = {}) {
    if (options.respondWith405) {
      this._respondWith405 = true
    }
  }

  public set (method: string, path: string, ...middleware: MiddlewareFunction<HttpContext>[]) {
    method = method.toUpperCase()

    if (!this._routes.has(path)) {
      this._routes.set(path, new Map())
    }

    const route = this._routes.get(path)

    if (!route.has(method)) {
      route.set(method, new Slim())
    }

    if (middleware.length) {
      route.get(method).use(...middleware)
    }

    return this
  }

  public get (path: string, ...middleware: MiddlewareFunction<HttpContext>[]) {
    return this.set('GET', path, ...middleware)
  }

  public head (path: string, ...middleware: MiddlewareFunction<HttpContext>[]) {
    return this.set('HEAD', path, ...middleware)
  }

  public post (path: string, ...middleware: MiddlewareFunction<HttpContext>[]) {
    return this.set('POST', path, ...middleware)
  }

  public put (path: string, ...middleware: MiddlewareFunction<HttpContext>[]) {
    return this.set('PUT', path, ...middleware)
  }

  public delete (path: string, ...middleware: MiddlewareFunction<HttpContext>[]) {
    return this.set('DELETE', path, ...middleware)
  }

  public options (path: string, ...middleware: MiddlewareFunction<HttpContext>[]) {
    return this.set('OPTIONS', path, ...middleware)
  }

  public patch (path: string, ...middleware: MiddlewareFunction<HttpContext>[]) {
    return this.set('PATCH', path, ...middleware)
  }

  public middleware () {
    return async (ctx: HttpContext, next: NextFunction) => {
      const pathname = ctx.req.pathname

      if (this._routes.has(pathname)) {
        const route = this._routes.get(pathname)

        if (route.has(ctx.req.method)) {
          // Run the route middleware
          await route.get(ctx.req.method).compose()(ctx)
        } else {
          // No valid method for this route
          if (this._respondWith405) {
            // Response with 405 Method Not Allowed
            ctx.res.statusCode = 405
          } else {
            // Continue the middleware stack
            await next()
          }
        }
      } else {
        // No valid route for this path; continue the stack
        await next()
      }
    }
  }
}

export default Router
