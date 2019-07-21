'use strict'

import { Context } from '@art-of-coding/lime-compose'
import Application, { State } from './Application'
import { IncomingMessage, ServerResponse } from 'http'

import Request from './Request'
import Response from './Response'

export interface HttpContext<S = State> extends Context {
  respond: boolean,
  app: Application,
  req: Request,
  res: Response,
  state: S,
  raw: {
    req: IncomingMessage,
    res: ServerResponse
  }
}

export function createContext (req: IncomingMessage, res: ServerResponse, respond = true, state: { [x: string]: any } = {}): HttpContext {
  return {
    respond,
    app: this,
    state: state,
    req: new Request(req),
    res: new Response(res),
    raw: { req, res }
  }
}
