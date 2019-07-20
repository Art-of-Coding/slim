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

    if (path[0] !== '/') {
      throw new TypeError('path should start with a /')
    }

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

  public match (pathname: string) {
    let match: string | false = false
    let params: { [x: string]: string | number } = {}

    const splitPath = pathname.split('/')
    for (let [ route, ] of this._routes) {
      const splitRoute = route.split('/')

      if (splitRoute.length === splitPath.length) {
        match = route

        if (route.includes('/:')) {
          for (let i = 0; i < splitRoute.length; i++) {
            if (splitRoute[i].startsWith(':')) {
              params[splitRoute[i].substr(1)] = splitPath[i]
            }
          }
        }

        break
      }
    }

    return { match, params }
  }

  public middleware () {
    return async (ctx: HttpContext, next: NextFunction) => {
      const { pathname, method } = ctx.req
      const match = this.match(pathname)

      if (match.match && typeof match.match === 'string') {
        const route = this._routes.get(match.match)

        if (route.has(method)) {
          ctx.req.params = match.params
          // Run the route middleware
          await route.get(method).compose()(ctx)
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
