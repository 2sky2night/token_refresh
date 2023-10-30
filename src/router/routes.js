const { jwtGenerate } = require('../auth')
const { userService } = require('../service')
const { response } = require('../utils')
const { createReadStream } = require('fs')
const { resolve } = require('path')

/**
 * @type {{path:string;handler(req:import('http').IncomingMessage&{path:string;queryString:string;query:Record<string,string>;payload?:{sub:number;iat:number;exp:number}},res:import('http').ServerResponse)}[]}
 */
const routes = [
  {
    // 测试页面
    path: '/',
    handler(_, res) {
      res.setHeader('content-type', 'text/html;charset=utf-8')
      const rs = createReadStream(resolve(__dirname, '../views/index.html'))
      rs.pipe(res)
    }
  },
  {
    // 登录
    path: '/api/login',
    handler(req, res) {
      const { username, password } = req.query
      // 参数校验
      if (!username || !password) {
        res.writeHead(400, undefined, {
          'Content-Type': 'application/json;charset=utf-8'
        })
        res.end(response(null, 'username或password参数错误', 400))
        return
      }
      const user = userService.login(username, password)
      if (user) {
        // 查找到用户，生成access_token和refresh_token
        const access_token = jwtGenerate(user.uid)
        const refresh_token = jwtGenerate(user.uid, true)
        res.writeHead(200, undefined, {
          'Content-Type': 'application/json;charset=utf-8'
        })
        res.end(
          response({
            access_token,
            refresh_token
          })
        )
      } else {
        // 未查找到用户
        res.writeHead(400, undefined, {
          'Content-Type': 'application/json;charset=utf-8'
        })
        res.end(response(null, '用户名或密码错误', 400))
      }
    }
  },
  {
    // 解析token数据 (需要鉴权)
    path: '/api/token',
    handler(req, res) {
      res.end(response(req.payload))
    }
  },
  {
    // 根据token获取用户数据
    path: '/api/user/info',
    handler(req, res) {
      const payload = req.payload
      if (payload) {
        const user = userService.find(payload.sub)
        if (user) {
          res.setHeader('Content-Type', 'application/json;charset=utf-8')
          res.end(response(user))
        } else {
          res.writeHead(404, undefined, {
            'Content-Type': 'application/json;charset=utf-8'
          })
          res.end(response(null, '不存在该用户.', 404))
        }
      } else {
        console.log('没有解析token!!!')
        res.writeHead(500, undefined, {
          'Content-Type': 'application/json;charset=utf-8'
        })
        res.end(response(null, '服务器内部错误.', 500))
      }
    }
  },
  {
    // 刷新token (需要鉴权)
    path: '/api/refresh-token',
    handler(req, res) {
      const payload = req.payload
      if (payload) {
        const access_token = jwtGenerate(payload.sub)
        res.writeHead(200, undefined, {
          'Content-Type': 'application/json;charset=utf-8'
        })
        res.end(response({ access_token }))
      } else {
        console.log('没有解析token!!!')
        res.writeHead(500, undefined, {
          'Content-Type': 'application/json;charset=utf-8'
        })
        res.end(response(null, '服务器内部错误.', 500))
      }
    }
  }
]

module.exports = routes
