'use strict'

import Slim, { HttpContext } from '../../index'
import { MiddlewareFunction } from '@art-of-coding/lime-compose'

export function select (fn: (ctx: HttpContext) => boolean | Promise<boolean>, app: Slim): MiddlewareFunction<HttpContext> {
  return async (ctx, next) => {
    let isSelected = fn(ctx)

    if (isSelected instanceof Promise) {
      isSelected = await isSelected
    }

    if (isSelected) {
      await app.compose()(ctx)
    } else {
      await next()
    }
  }
}

export default select
