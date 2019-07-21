'use strict'

import { HttpContext } from '../../index'

export function redirect (url: string, statusCode = 302) {
  return async (ctx: HttpContext) => {
    ctx.res.statusCode = statusCode
    ctx.res.set('Location', url)
  }
}

export default redirect
