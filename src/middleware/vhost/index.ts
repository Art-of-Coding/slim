'use strict'

import Slim from '../../index'
import select from '../select'

export function vhost (hostname: string, app: Slim) {
  return select(ctx => ctx.req.hostname === hostname, app)
}

export default vhost
