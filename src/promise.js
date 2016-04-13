// @flow

import { getFunctionResult } from './util'

function promiseMemoize(callback: Function): Function {
  function memoized(...parameters: Array<mixed>) {
    const cacheKey = JSON.stringify(parameters)

    // Cache hit
    if (memoized.cache.has(cacheKey)) {
      // Get the cached value
      const value = memoized.cache.get(cacheKey)
      return value
    }

    // Get and add the value to the cache
    const value = getFunctionResult.call(this, callback, parameters)
    memoized.cache.set(cacheKey, value)

    if (!value || value.constructor.name !== 'Promise') {
      throw new Error('Memoization Error, Async function returned non-promise value')
    }

    // Delete the value regardless of whether it resolves or rejects
    return value.then((realValue) => {
      memoized.cache.delete(cacheKey)
      return realValue
    }).catch((err) => {
      memoized.cache.delete(cacheKey)
      throw err
    })
  }

  memoized.cache = new Map()
  return memoized
}

export default promiseMemoize
