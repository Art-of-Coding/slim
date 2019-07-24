'use strict'

import Slim, { HttpContext } from '../../index'
import { State } from '../../lib/Application'
import { MiddlewareFunction } from '@art-of-coding/lime-compose'

export function select<S extends State = State> (fn: (ctx: HttpContext<S>) => boolean | Promise<boolean>, app: Slim): MiddlewareFunction<HttpContext<S>> {
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
