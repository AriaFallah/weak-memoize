type Memoize$Options = {
  async?: boolean
}

export default function weakMemoize(callback, options: Memoize$Options = {}) {
  const cache: Map<Array, any> = new Map()
  function memoized(...parameters: Array<mixed>) {
    const parametersLength = parameters.length

    if (cache.get(parameters)) {
      const value = cache.get(parameters)
      if (options.async && !(value && value.constructor.name === 'Promise')) {
        return Promise.resolve(value)
      }
      return value
    }

    let value
    if (parametersLength === 1) {
      value = callback.call(this, parameters[0])
    } else if (parametersLength === 2) {
      value = callback.call(this, parameters[0], parameters[1])
    } else if (parametersLength === 3) {
      value = callback.call(this, parameters[0], parameters[1], parameters[2])
    } else if (parametersLength === 4) {
      value = callback.call(this, parameters[0], parameters[1], parameters[2], parameters[3])
    } else {
      value = callback.apply(this, parameters)
    }

    cache.set(parameters, value)
    if (options.async) {
      if (!value || value.constructor.name !== 'Promise') {
        throw new Error('Memoization Error, Async function returned non-promise value')
      }
      return value.then((realValue) => {
        cache.set(parameters, realValue)
        return realValue
      })
    }
    return value
  }
  return memoized
}
