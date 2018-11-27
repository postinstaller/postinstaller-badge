const micro = require('micro')
const test = require('ava')
const listen = require('test-listen')

let requestBadge

test.before(async () => {
  const service = micro(require('.'))
  const baseUrl = await listen(service)
  requestBadge = require('got').extend({
    baseUrl,
    throwHttpErrors: false
  })
})

test('existing package with postinstaller support', async t => {
  const result = await requestBadge('postinstaller')
  t.is(result.statusCode, 200)
  t.is(result.headers['x-status'], 'ready')
})

test('existing package without postinstaller support', async t => {
  const result = await requestBadge('true')
  t.is(result.statusCode, 200)
  t.is(result.headers['x-status'], 'missing')
})

test('non-existing package', async t => {
  const randomString = Math.random().toString(36).substr(2)
  const result = await requestBadge(`@test/test-nonexisting-package-${randomString}`)
  t.is(result.statusCode, 404)
  t.is(result.headers['x-status'], 'error')
})

test('/ and /favicon.ico', async t => {
  t.is((await requestBadge('favicon.ico')).statusCode, 404)
  t.is((await requestBadge('/')).statusCode, 404)
})
