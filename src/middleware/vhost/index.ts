'use strict'

import Slim from '../../index'
import select from '../select'

export function vhost (hostname: string | RegExp, app: Slim) {
  return select(ctx => {
    if (typeof hostname === 'string') {
      return ctx.req.hostname === hostname
    } else {
      return hostname.test(ctx.req.hostname)
    }
  }, app)
}

export default vhost
