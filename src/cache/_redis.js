/**
 * @description 连接redis
 * @author 曾刚
 */

const redis = require('redis')
const {
  REDIS_CONF
} = require('../conf/db.js')

//创建客户端
const redisClient = redis.createClient(REDIS_CONF.port, REDIS_CONF.host)
redisClient.on('error', err => {
  console.error('redis error', err)
})

/**
 * @param {string} key 键
 * @param {string} val 值
 * @param {number} timeout 过期时间 单位s
 */
function set(key, val, timeout = 60 * 60) {
  if (typeof val === 'object') {
    val = JSON.stringify(val)
  }
  redisClient.set(key, val)
  redisClient.expire(key, timeout)
}

/**
 * @param {string} key 键
 */
function get(key) {
  const promise = new Promise((reslove, reject) => {
    redisClient.get(key, (err, val) => {
      if (err) {
        reject(err)
        return
      }
      if (val == null) {
        reslove(null)
        return
      }
      try {
        reslove(JSON.parse(val))
      } catch (ex) {
        reslove(val)
      }
    })
  })
  return promise
}
module.exports = {
  set,get
}