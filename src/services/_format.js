/**
 * @description 数据格式化
 * @author 双越老师
 */

const { DEFAULT_PICTURE, REG_FOR_AT_WHO, REG_FOR_TOPIC_WHO, DEFAULT_BGTURE } = require('../conf/constants')
const { timeFormat } = require('../utils/dt')
/**
 * 用户默认头像
 * @param {Object} obj 用户对象
 */
function _formatUserPicture(obj) {
  if (obj.picture == null) {
    obj.picture = DEFAULT_PICTURE
  }
  if (obj.bgPic== null) {
    obj.bgPic = DEFAULT_BGTURE
  }
  if (obj.city == null) {
    obj.city = ''
  }
  return obj
}

/**
 * 格式化用户信息
 * @param {Array|Object} list 用户列表或者单个用户对象
 */
function formatUser(list) {
  if (list == null) {
    return list
  }

  if (list instanceof Array) {
    // 数组 用户列表
    return list.map(_formatUserPicture)
  }

  // 单个对象
  return _formatUserPicture(list)
}

/**
 * 格式化数据的时间
 * @param {Object} obj 数据
 */
function _formatDBTime(obj) {
  obj.createdAtFormat = timeFormat(obj.createdAt)
  obj.updatedAtFormat = timeFormat(obj.updatedAt)
  return obj
}

/**
 * 格式化微博内容
 * @param {Object} obj 微博数据对象
 */
function _formatContent(obj) {
  obj.contentFormat = obj.content

  // 格式化 @
  // from '哈喽 @张三 你好'
  // to '哈喽 <a href="/profile/zhangsan">张三</a> 你好'

  obj.contentFormat = obj.contentFormat.replace(
    REG_FOR_AT_WHO,
    (matchStr, nickName) => {
      return `<a href="/profile/${nickName}" class="atAtag" target="_blank" >@${nickName} </a>`
    }
  )

  obj.contentFormat = obj.contentFormat.replace(
    REG_FOR_TOPIC_WHO,
    (matchStr, title) => {
      return `<a href="/topic/${title}" class="topic" target="_blank" >#${title} </a>`
    }
  )
  console.log(obj)
  if (obj.isReprint) {
    obj.reprintContent = obj.reprintContent.replace(
      REG_FOR_AT_WHO,
      (matchStr, nickName) => {
        return `<a href="/profile/${nickName}" class="atAtag" target="_blank" >@${nickName} </a>`
      }
    )

    obj.reprintContent = obj.reprintContent.replace(
      REG_FOR_TOPIC_WHO,
      (matchStr, title) => {
        return `<a href="/topic/${title}" class="topic" target="_blank" >#${title} </a>`
      }
    )
  }
  return obj
}

/**
 * 格式化微博信息
 * @param {Array|Object} list 微博列表或者单个微博对象
 */
function formatBlog(list) {
  let result
  if (list == null) {
    return list
  }
  if (list instanceof Array) {

    return list.map(_formatDBTime).map(_formatContent)
  }
  // 对象
  result = list
  result = _formatDBTime(result)
  result = _formatContent(result)
  return result
}

module.exports = {
  formatUser,
  formatBlog,
  _formatDBTime
}
