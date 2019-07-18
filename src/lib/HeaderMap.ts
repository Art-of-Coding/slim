'use strict'

export class HeaderMap extends Map<string, string | number> {
  public static capitalize (key: string) {
    return key.split('-').map(k => {
      return `${k.substr(0, 1).toUpperCase()}${k.substr(1)}`
    }).join('-')
  }

  public has (key: string) {
    return super.has(key.toLowerCase())
  }

  public get (key: string) {
    return super.get(key.toLowerCase())
  }

  public delete (key: string) {
    return super.delete(key.toLowerCase())
  }

  public set (key: string, value: string | number) {
    super.set(key.toLowerCase(), value)
    return this
  }

  public setIfNotSet (key: string, value: string | number) {
    key = key.toLowerCase()
    if (!super.has(key)) {
      super.set(key, value)
    }
    return this
  }

  public toObject () {
    const obj: { [x: string]: string | number } = {}

    for (let [ key, value ] of this.entries()) {
      obj[key] = value
    }

    return obj
  }
}

export default HeaderMap
