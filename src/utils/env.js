/**
 * @description 环境变量
 * @author 曾刚
 */

const ENV = process.env.NODE_ENV

module.exports = {
  ENV,
  isDev: ENV === 'dev',
  notDev: ENV !== 'dev',
  isProd: ENV === 'production',
  notProd: ENV !== 'production',
  isTest: ENV === 'test',
  notTest: ENV !== 'test'
}