const http = require('http')
const routerMiddleware = require('./router')

const server = http.createServer(routerMiddleware).listen(3000)
