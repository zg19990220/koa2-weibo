/**
 * @description 微博缓存层
 * @author 曾刚
 */


const { get, set } = require('./_redis')
const { getBlogListByUser } = require('../services/home')

//redis key 前缀
const KEY_PREFIX = 'weibo:square:'

/**
 * 获取广场列表缓存
 * @param {number} pageIndex 
 * @param {number} pageSize 
 */
async function getSquareCacheList(pageIndex, pageSize, userId, wbLastTime, userName) {
  const key = `${KEY_PREFIX}${pageIndex}_${pageSize}`

  //尝试获取缓存
  const cacheResult = await get(key)
  if (cacheResult !== null) {
    return cacheResult
  }

  //没有缓存或已过期
  const result = await getBlogListByUser({ pageIndex, pageSize, userId, wbLastTime, userName})
  
  //设置缓存 键 值 过期时间1min
  set(key,result,1)
  return result
}

module.exports = {
  getSquareCacheList
}
