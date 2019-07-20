'use strict'

import Slim, { HttpContext } from '../../index'
import { NextFunction } from '@art-of-coding/lime-compose'

export function select (fn: (ctx: HttpContext) => boolean | Promise<boolean>, app: Slim) {
  return async (ctx: HttpContext, next: NextFunction) => {
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
