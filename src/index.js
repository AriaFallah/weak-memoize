// @flow

import debounce from 'lodash.debounce'
import type { memoizeOptions } from './types'

export default function weakMemoize(callback: Function, options: memoizeOptions = { delay: 0 }): Function {
  function memoized(...parameters: Array<mixed>) {
    const cacheKey = JSON.stringify(parameters)
    const parametersLength = parameters.length

    // Cache hit
    if (memoized.cache.has(cacheKey)) {
      // $FlowIgnore Restart the invalidation
      memoized.timers.get(cacheKey)()

      // Get the cached value
      const value = memoized.cache.get(cacheKey)

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

    // Create the debounced function that'll invalidate the caches
    const invalidate =
      debounce(clearCacheKeys, options.delay)
        .bind(null, [memoized.cache, memoized.timers], cacheKey)

    // Add the value and timer to the caches
    memoized.cache.set(cacheKey, value)
    memoized.timers.set(cacheKey, invalidate)

    // If the async option is specified, handle a promise
    if (options.async) {
      if (!value || value.constructor.name !== 'Promise') {
        throw new Error('Memoization Error, Async function returned non-promise value')
      }
      return value.then((realValue) => {
        // Once the promise resolves update the cache with the resolved value
        memoized.cache.set(parameters, realValue)

        // Only begin invalidation once promise resolves
        invalidate()
        return realValue
      })
    }

    // Return value, and begin invalidation countdown
    invalidate()
    return value
  }
  memoized.cache = new Map()
  memoized.timers = new Map()
  return memoized
}

function clearCacheKeys(caches: Array<Map>, key: string) {
  for (const cache of caches) {
    cache.delete(key)
  }
}
