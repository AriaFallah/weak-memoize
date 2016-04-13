// @flow

import debounce from 'lodash.debounce'
import type { memoizeOptions } from './types'

// Weakly hold timers that invalidate the cache
const timers: WeakMap<Array<any>, Function> = new WeakMap()

export default function weakMemoize(callback: Function, options: memoizeOptions = { delay: 0 }): Function {
  function memoized(...parameters: Array<mixed>) {
    const parametersLength = parameters.length

    // Cache hit
    if (memoized.cache.has(parameters)) {
      const value = memoized.cache.get(parameters)

      // If the cache updated a promise in the cache to the
      // value inside the promise resolve the value as a promise
      if (options.async && !(value && value.constructor.name === 'Promise')) {
        return Promise.resolve(value)
      }
      return value
    }

    // Get the result of invoking the function with the given parameters
    // Prefer .call to apply due to performance benefits
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

    // Add the value to the cache
    memoized.cache.set(parameters, value)

    // Create and call the debounced function that'll invalidate the cache
    const invalidate = debounce(clearCacheKey, options.delay)
    invalidate(memoized.cache, parameters)

    // Add the invalidation function to our WeakMap
    timers.set(parameters, invalidate)

    // If the async option is specified handle a promise
    if (options.async) {
      if (!value || value.constructor.name !== 'Promise') {
        throw new Error('Memoization Error, Async function returned non-promise value')
      }
      return value.then((realValue) => {
        // Once the promise resolves update the cache with the resolved value
        memoized.cache.set(parameters, realValue)
        return realValue
      })
    }
    return value
  }
  memoized.cache = new Map()
  return memoized
}

function clearCacheKey(cache, key) { cache.delete(key) }
