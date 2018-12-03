const badgen = require('badgen')
const {send} = require('micro')

module.exports = async (req, res) => {
  try {
    if (req.url === '/favicon.ico' || req.url === '/') {
      send(res, 404, '404')
      return
    }

    const url = require('url').parse(req.url, true)
    const packageName = req.url.replace(/\?.*/, '').substr(1)

    const pkgResponse = await (
      require('package-json')(packageName, {fullMetadata: true})
        .catch(() => undefined)
    )

    const error = !pkgResponse
    const hasPostinstaller = !error && Boolean(pkgResponse.postinstaller)
    const status = error ? 'error' : hasPostinstaller ? 'ready' : 'missing'

    res.setHeader('Content-type', 'image/svg+xml')
    res.setHeader('X-Status', status)
    send(res, error ? 404 : 200, badgen({
      subject: 'postinstaller',
      status,
      color: error ? 'red' : hasPostinstaller ? 'green' : 'orange',
      style: url.query.style
    }))
    res.end()
  } catch (error) {
    console.log(error)
    send(res, error.statusCode || 500, error.message || 'Error')
    res.end()
  }
}
