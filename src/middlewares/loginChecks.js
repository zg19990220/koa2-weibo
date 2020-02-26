/**
 * @description 登陆验证中间件
 * @author 曾刚
 */
const { ErrorModel } = require('../model/ResModel')
const { loginCheckFailInfo } = require('../model/ErrorInfo')

/**
  * API登录验证 用于所有需要登录请求的api使用前的验证
  * @param {Object} ctx ctx
  * @param {Object} next next
  */
async function loginCheck(ctx, next) {
  //已登录
  if (ctx.session && ctx.session.userInfo) {
    await next()
    return
  }
  //未登录
  ctx.body = new ErrorModel(loginCheckFailInfo) 
}

module.exports = {
  loginCheck
}