/* eslint-env jest */

import memoize from '../src'

test('Promise works', async function() {
  let i = 0
  const memoized = memoize(function() {
    i++
    if (i === 1) return new Promise(resolve => setTimeout(() => resolve(1), 1000))
    return Promise.resolve()
  })
  const first = memoized()
  memoized()
  memoized()
  memoized()
  memoized()
  memoized()
  expect(i).toBe(1)
  await first
  memoized()
  expect(i).toBe(2)
})

test('Throws if you do not return a promise', function() {
  const memoized = memoize(function() {
    return 1
  })
  expect(memoized).toThrow()
})

test('Throws if promise rejects', async function() {
  const memoized = memoize(function() {
    return Promise.reject(new Error('You suck'))
  })

  try {
    await memoized()
  } catch (err) {
    expect(err).toEqual(new Error('You suck'))
  }
})
