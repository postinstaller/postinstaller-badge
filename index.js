const {join} = require('path')

const badgen = require('badgen')
const {send} = require('micro')
const _get = require('lodash.get')

const got = require('got')

const jot = got.extend({
  baseUrl: 'https://unpkg.com/',
  json: true,
  throwHttpErrors: false
})

module.exports = async (req, res) => {
  try {
    if (req.url === '/favicon.ico' || req.url === '/') {
      send(res, 404, '404')
      return
    }
    const url = require('url').parse(req.url, true)

    const pkgResponse = await jot(join(req.url.replace(/\?.*/, ''), 'package.json'))

    const hasPostinstaller = Boolean(_get(pkgResponse, 'body.postinstaller'))
    const error = pkgResponse.statusCode >= 400
    const status = error ? 'error' : hasPostinstaller ? 'ready' : 'missing'
    res.setHeader('Content-type', 'image/svg+xml')
    res.setHeader('X-Status', status)
    send(res, pkgResponse.statusCode, badgen({
      subject: 'postinstaller',
      status,
      color: error ? 'red' : hasPostinstaller ? 'green' : 'orange',
      style: url.query.style
    }))
  } catch (error) {
    console.log(error)
    send(res, error.statusCode || 500, error.message || 'Error')
  }
}
