const { user: UserModel } = require('../model')

module.exports = {
  userService: {
    /**
     * 登录
     * @param {string} username
     * @param {string} password
     */
    login(username, password) {
      const user = UserModel.find(
        (item) => item.password === password && item.username === username
      )
      return user
    },
    /**
     * 查找用户
     * @param {number} uid
     */
    find(uid) {
      const user = UserModel.find((item) => item.uid === uid)
      return user
    }
  }
}
