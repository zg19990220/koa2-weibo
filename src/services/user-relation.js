/**
 * @description 用户关系 services
 */
const { User, UserRelation, Blog} = require('../db/model/index')
const { formatUser } = require('./_format')
const Sequalize = require('sequelize')
const { timeFormat } = require('../utils/dt')
/**
* 获取关注该用户的id， 即followerId用户的粉丝
* @param {number} followerId 被关注人的id
*/

async function getUserByFollower(followerId) {
  const result = await User.findAndCountAll({
    attributes: ['id', 'userName', 'nickName', 'picture', 'bgPic','signature'],
    order: [
      ['id','desc']
    ],
    include: [
      {
        model: UserRelation,
        where: {
          followerId,
          userId: {
            [Sequalize.Op.ne]: followerId
          }
        }
      }
    ]
  })

  let userList = result.rows.map(row => {
    return row.dataValues
  })
  userList = formatUser(userList)

  return {
    count: result.count,
    userList
  }
  
}

/**
* 获取该用户的关注id， 即userId用户的关注人
* @param {number} userId 
*/
async function getFollowerByUser(userId) {
  const result = await UserRelation.findAndCountAll({
    order: [
      ['id','desc']
    ],
    include: [
      {
        model: User,
        attributes: ['id', 'userName', 'nickName', 'picture', 'bgPic', 'signature']
      }
    ],
    where: {
      userId,
      followerId: {
        [Sequalize.Op.ne]: userId
      }
    }
  })

  let userList = result.rows.map(row => {
    return row.dataValues
  })
  userList = userList.map(item => {
    let user = item.user.dataValues
    user = formatUser(user)
    return user
  })
  return {
    count: result.count,
    userList
  }
  
}

/**
* @param {number} userId 
*/
async function getFollowerByBlog(userId) {
  const result = await UserRelation.findAndCountAll({
    order: [
      ['id', 'desc']
    ],
    include: [
      {
        model: User,
        attributes: ['id', 'userName', 'nickName', 'picture', 'bgPic', 'signature'],
        include: [{
          model: Blog,
          order:[['id','desc']],
          attributes: ['createdAt'],
          limit:1
        }]
      }
    ],
    where: {
      userId,
      followerId: {
        [Sequalize.Op.ne]: userId
      }
    }
  })

  // const time = result.rows[0].dataValues.user.dataValues.blogs[0].dataValues.createdAt
  // /blogs[0].dataValues.createdAt
  let userList = result.rows.map(row => {
    return row.dataValues
  })
  userList = userList.map(item => {
    let user = item.user.dataValues
    let blogUpdate = timeFormat(user.blogs[0].dataValues.createdAt)
    user.blogUpdate = blogUpdate
    user = formatUser(user)

    return user
  })
  return {
    count: result.count,
    userList
  }

}


/**
 * 添加关注关系
 * @param {number} userId 粉丝id
 * @param {number} followerId 被关注id
 */
async function addFollower(userId, followerId) {
  const int = 90
  const result = await UserRelation.create({
    userId,
    followerId
  })
  const userInfo = await User.findOne({
    attributes: ['id', 'userName', 'nickName', 'picture', 'city'],
    where: {
      id: followerId
    }
  })
  return userInfo
}

/**
 * 取消关注关系
 * @param {number} userId 粉丝id
 * @param {number} followerId 被关注id
 */
async function delectFollower(userId, followerId) {
  const result = await UserRelation.destroy({
    where: {
      userId,
      followerId
    }
  })
  return result > 0
}
module.exports = {
  getUserByFollower, addFollower, delectFollower, getFollowerByUser, getFollowerByBlog
}