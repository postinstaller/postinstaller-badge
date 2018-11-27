const {join} = require('path')
const {send} = require('micro')

const got = require('got')

const jot = got.extend({
  baseUrl: 'https://unpkg.com/',
  json: true
})

module.exports = async (req, res) => {
  try {
    if (req.url === '/favicon.ico' || req.url === '/') {
      send(res, 404, '404')
      return
    }

    const {body} = await jot(join(req.url.replace(/\?.*/, ''), 'package.json'))
    const hasPostinstaller = Boolean(body.postinstaller)
    const status = hasPostinstaller ? 'ready' : 'missing'
    const color = hasPostinstaller ? 'green' : 'red'
    const [/* unused */, /* unused */, options] = req.url.match(/^(.*?)(\?.*)/) || [undefined, undefined, '']
    const url = `https://img.shields.io/badge/postinstaller-${status}-${color}.svg${options}`
    send(res, 200, got.stream(url))
  } catch (error) {
    console.log(error)
    send(res, error.statusCode || 500, error.message || 'Error')
  }
}
