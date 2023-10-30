const jwt = require('jsonwebtoken')
const config = require('../config')

module.exports = {
  /**
   * 生成jwt
   * @param {number} uid
   * @param {boolean} longTime
   */
  jwtGenerate(uid, longTime = false) {
    const token = jwt.sign({ sub: uid }, config.JWT_KEY, {
      expiresIn: longTime ? config.JWT_REFRESH_TIME : config.JWT_ACCESSCE_TIME
    })
    return token
  },
  /**
   * 解密jwt
   * @param {string} token
   * @returns {{sub:number}}
   */
  jwtDecode(token) {
    const payload = jwt.verify(token, config.JWT_KEY)
    return payload
  }
}
