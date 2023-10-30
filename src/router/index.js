const routes = require('./routes')
const { pathQueryParse, authMiddleware } = require('../utils')

/**
 * 路由中间件
 * @param {import('http').IncomingMessage&{path:string;queryString:string;query:Record<string,string>}} req
 * @param {import('http').ServerResponse} res
 */
module.exports = (req, res) => {
  pathQueryParse(req)
  if (!authMiddleware(req, res)) return
  const controller = routes.find((item) => item.path === req.path)
  if (controller) {
    controller.handler(req, res)
  } else {
    // 404
    res.writeHead(404, undefined, {
      'Content-Type': 'text/html;charset=utf-8'
    })
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>404</title>
      </head>
      <body>
        <h1>404</h1>
        <h2>当前请求路径：${req.path}，没有对应资源。</h2>
      </body>
      </html>
    `)
  }
}
