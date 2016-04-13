import test from 'ava'
import assert from 'assert'
import memoizeD from '../lib/delay'
import memoizeP from '../lib/promise'

test('Delay works', async (t) => {
  let i = 0
  const memoized = memoizeD(() => {
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

test('Promise works', async (t) => {
  let i = 0
  const memoized = memoizeP(() => {
    i++
    if (i === 1) {
      return new Promise((resolve) => setTimeout(() => resolve(1), 1000))
    }
    return Promise.resolve()
  })
  try {
    const first = memoized()
    memoized()
    memoized()
    memoized()
    memoized()
    memoized()
    assert.equal(i, 1)
    await first
    memoized()
    assert.equal(i, 2)
  } catch (err) {
    t.fail(err.stack)
  }
})
