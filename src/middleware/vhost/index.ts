'use strict'

import Slim from '../../index'
import select from '../select'

/**
 * Selects contexts where `req.hostname` matches `hostname`.
 *
 * Example:
 *
 * ```ts
 * const app1 = new Slim()
 * const app2 = new Slim()
 *
 * app1.use(
 *   vhost('example.com', app2)
 * )
 * ```
 * @param  hostname The hostname to match
 * @param  app      The Slim instance to redirect to
 * @return          The middleware function
 */
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
