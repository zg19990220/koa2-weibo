/**
 * @description 存储配置
 * @author 曾刚
 */
const { isProd } = require('../utils/env')

let REDIS_CONF = {
  port:6379,
  host: '127.0.0.1'
}
let MYSQL_CONF = {
  host: 'localhost',
  port: 3306,
  user:'root',
  password: 'root',
  database:'koa2_weibo_db'
}
//线上redis mysql
if (isProd) {
  REDIS_CONF = {
    port: 6379,
    host: '127.0.0.1'
  }
  MYSQL_CONF = {
    host: '172.0.0.1',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'koa2_weibo_db'
  }
}

module.exports = {
  REDIS_CONF, MYSQL_CONF
}