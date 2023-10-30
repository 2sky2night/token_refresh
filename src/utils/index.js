const { jwtDecode } = require('../auth')
const { AUTH_PATH } = require('../config')

/**
 * 从url中解析query和path
 * @param {import('http').IncomingMessage} req
 */
const pathQueryParse = (req) => {
  const [path, queryString] = req.url.split('?')
  if (queryString === undefined) {
    req.queryString = ''
    req.query = {}
  } else {
    req.queryString = decodeURIComponent(queryString)
    req.query = req.queryString.split('&').reduce((obj, item) => {
      const [key, value] = item.split('=')
      return {
        ...obj,
        [key]: value ? value : ''
      }
    }, {})
  }
  req.path = path
}

/**
 * 响应数据
 * @param {unknown} data
 * @param {string} msg
 * @param {number} code
 * @returns
 */
const response = (data = null, msg = 'ok', code = 200) => {
  return JSON.stringify({ data, msg, code })
}

/**
 * auth中间件
 * @param {import('http').IncomingMessage&{path:string}} req
 * @param {import('http').ServerResponse} res
 */
const authMiddleware = (req, res) => {
  // 需要鉴权的路径
  if (AUTH_PATH.includes(req.path)) {
    const authorization = req.headers.authorization
    if (authorization) {
      // 携带了
      const [_, token] = authorization.split(' ')
      if (token) {
        // 可以解析出token
        try {
          const payload = jwtDecode(token)
          req.payload = payload
          return true
        } catch (error) {
          // token错误
          res.writeHead(401, undefined, {
            'Content-Type': 'application/json;charset=utf-8'
          })
          res.end(response(null, error.toString(), 401))
          return false
        }
      } else {
        // 无效的token
        res.writeHead(401, undefined, {
          'Content-Type': 'application/json;charset=utf-8'
        })
        res.end(response(null, '无效的token!', 401))
        return false
      }
    } else {
      // 未携带
      res.writeHead(401, undefined, {
        'Content-Type': 'application/json;charset=utf-8'
      })
      res.end(response(null, '未携带Authorization字段!', 401))
      return false
    }
  } else {
    // 无需鉴权的路径
    return true
  }
}

module.exports = {
  /**
   * 从url中解析query和path
   * @param {import('http').IncomingMessage} req
   */
  pathQueryParse,
  /**
   * 响应数据
   * @param {unknown} data
   * @param {string} msg
   * @param {number} code
   * @returns
   */
  response,
  /**
   * auth中间件
   * @param {import('http').IncomingMessage&{path:string}} req
   * @param {import('http').ServerResponse} res
   */
  authMiddleware
}
