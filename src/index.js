// @flow

function memoize<T: Function>(callback: T): T {
  const cache = {}
  function memoized(...parameters: Array<mixed>) {
    const cacheKey = JSON.stringify(parameters)

    if (cache[cacheKey]) {
      return cache[cacheKey]
    }

    // Get and add the value to the cache
    const value = callback.apply(this, parameters)
    cache[cacheKey] = value

    if (!value || value.constructor.name !== 'Promise') {
      throw new Error('Memoization Error, Async function returned non-promise value')
    }

    // Delete the value regardless of whether it resolves or rejects
    return value.then(function(internalValue) {
      cache[cacheKey] = false
      return internalValue
    }, function(err) {
      cache[cacheKey] = false
      throw err
    })
  }

  memoized.cache = cache
  return ((memoized: any): T)
}

export default memoize
