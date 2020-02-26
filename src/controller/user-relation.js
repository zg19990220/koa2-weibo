/**
 *@description 用户关系
 */

const {
  getUserByFollower, addFollower, delectFollower, getFollowerByUser
} = require('../services/user-relation')
const { SuccessModel, ErrorModel } = require('../model/ResModel')
const { addFollowerFailInfo,deleteFollowerFailInfo } = require('../model/ErrorInfo')

/**
 * 
 * @param {string} userId 需要获取粉丝的用户id
 */
async function getFans(userId) {
  const { count, userList } = await getUserByFollower(userId)

  return new SuccessModel({
    count,
    fansList: userList
  })
}
/**
 * getFollowerByBlog
 * @param {string} userId 需要获取粉丝的用户id
 */
async function getFollowers(userId) {
  const {
    count,
    userList
  } = await getFollowerByUser(userId)

  return new SuccessModel({
    count,
    followersList: userList
  })
}


/**
 * 关注
 * @param {number} myUserId 当前登录id
 * @param {number} curUserId 要被关注的id
 */
async function follow(myUserId, curUserId) {
  let result
  try {
    result = await addFollower(myUserId, curUserId)
    return new SuccessModel(result)
  } catch{
    return new ErrorModel(addFollowerFailInfo)
  }
}

/**
 * 取消关注
 * @param {number} myUserId 当前登录id
 * @param {number} curUserId 要被取消关注的id
 */
async function unFollow(myUserId,curUserId) {
  const result = await delectFollower(myUserId, curUserId)
  if (result) {
    return new SuccessModel()
  }
  return  new ErrorModel(deleteFollowerFailInfo)
}

module.exports = {
  getFans, follow, unFollow, getFollowers
}