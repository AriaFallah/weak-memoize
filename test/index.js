import test from 'ava'
import assert from 'assert'
import memoize from '../lib'

test('It works', async (t) => {
  let i = 0
  const memoized = memoize(() => {
    i++
    if (i === 1) {
      return 1
    }
    return 2
  }, { delay: 1000 })
  try {
    assert.equal(memoized(), 1)
    assert.equal(memoized(), 1)
    assert.equal(memoized(), 1)
    assert.equal(memoized(), 1)
    assert.equal(memoized(), 1)
    assert.equal(i, 1)
    await Promise.all([
      new Promise((resolve) =>
        setTimeout(() => assert.notEqual(memoized.cache.size, 0) || resolve(), 500)),
      new Promise((resolve) =>
        setTimeout(() => assert.equal(memoized.cache.size, 0) || resolve(), 1000))
    ])
  } catch (err) {
    t.fail(err)
  }
})
