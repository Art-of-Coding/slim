'use strict'

import { Context } from '@art-of-coding/lime-compose'
import { State } from './Application'
import { IncomingMessage, ServerResponse } from 'http'

import Request from './Request'
import Response from './Response'

/**
 * Represents a context for an HTTP(S) connection.
 * @typeparam S The context state interface
 */
export interface HttpContext<S extends State = State> extends Context {
  respond: boolean,
  req: Request,
  res: Response,
  state: S,
  raw: {
    req: IncomingMessage,
    res: ServerResponse
  }
}

/**
 * Create a new `HttpContext`.
 * @typeparam S         The state definition
 * @param  req          The request object
 * @param  res          The response object
 * @param  state={}     Context state
 * @param  respond=true Whether or not to let the app handle response
 */
export function createContext<S extends State = State> (req: IncomingMessage, res: ServerResponse, state?: S, respond = true): HttpContext<S> {
  return {
    respond,
    // NOTE: This feels way to hackey.
    // There must be a better way to have state interfaces/types and
    // a default value (`{}`)
    state: state || <any>{},
    req: new Request(req),
    res: new Response(res),
    raw: { req, res }
  }
}
