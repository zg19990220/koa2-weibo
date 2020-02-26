/**
 * @description 加密方法
 * @author 曾刚
 */
const crypto = require('crypto')
const { CRYPTO_SECRET_KEY } = require('../conf/secreKeys')

/**
 * md5加密
 * @param {String} content 明文
 */
function _MD5(content) {
  const md5 = crypto.createHash('md5')
  return md5.update(content).digest('hex')
}

/**
 * 加密方法
 * @param {string} content 明文
 */
function doCrypto(content) {
  const md5_pwd = `password=${content}&key=${CRYPTO_SECRET_KEY}`
  return _MD5(md5_pwd)
}

module.exports = doCrypto