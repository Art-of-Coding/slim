'use strict'

import Slim, { HttpContext } from '../../index'
import { MiddlewareFunction, NextFunction } from '@art-of-coding/lime-compose'

export class Router {
  private _respondWith405 = false
  private _respondWith501 = false
  private _routes: Map<string, Map<string, Slim>> = new Map()

  public constructor (options: { respondWith405?: boolean, respondWith501?: boolean } = {}) {
    if (options.respondWith405) {
      this._respondWith405 = true
    }

    if (options.respondWith501) {
      this._respondWith501 = true
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

  public post (path: string, ...middleware: MiddlewareFunction<HttpContext>[]) {
    return this.set('POST', path, ...middleware)
  }

  public put (path: string, ...middleware: MiddlewareFunction<HttpContext>[]) {
    return this.set('PUT', path, ...middleware)
  }

  public delete (path: string, ...middleware: MiddlewareFunction<HttpContext>[]) {
    return this.set('DELETE', path, ...middleware)
  }

  public patch (path: string, ...middleware: MiddlewareFunction<HttpContext>[]) {
    return this.set('PATCH', path, ...middleware)
  }

  public match (pathname: string) {
    let pathMatch = false
    let pathRoute: Map<string, Slim> = null
    let pathParams: { [x: string]: string } = {}

    const splitPath = pathname.split('/')
    for (const route of this._routes.keys()) {
      const splitRoute = route.split('/')

      if (splitRoute.length === splitPath.length) {
        pathMatch = true
        pathRoute = this._routes.get(route)

        if (route.includes('/:')) {
          for (let i = 0; i < splitRoute.length; i++) {
            if (splitRoute[i].startsWith(':')) {
              pathParams[splitRoute[i].substr(1)] = splitPath[i]
            }
          }
        }

        break
      }
    }

    return {
      match: pathMatch,
      route: pathRoute,
      params: pathParams
    }
  }

  public middleware () {
    return async (ctx: HttpContext, next: NextFunction) => {
      const { pathname, method } = ctx.req
      const { match, route, params } = this.match(pathname)

      if (match) {
        if (route.has(method === 'HEAD' ? 'GET' : method)) {
          if (Object.keys(params).length) {
            // Only add params if there are actual params
            ctx.req.params = params
          }
          // Run the route middleware
          await route.get(method).compose()(ctx)
        } else {
          // No valid method for this route
          if (this._respondWith405) {
            // Respond with 405 Method Not Allowed
            ctx.res.statusCode = 405
          } else {
            // Continue the middleware stack
            await next()
          }
        }
      } else {
        // No valid route for this path
        if (this._respondWith501) {
          // Respond with 501 Not Implemented
          ctx.res.statusCode = 501
        } else {
          // Continue the middleware stack
          await next()
        }
      }
    }
  }
}

export default Router
