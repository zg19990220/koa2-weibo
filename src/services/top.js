/**
 * @description top services
 */
const { Blog, User, UserRelation, Comment,Top } = require('../db/model/index')
const { formatUser, formatBlog } = require('./_format')
const { timeFormat } = require('../utils/dt')
const Sequalize = require('sequelize')

/**
 * add 
 * @param {int} myUserId 
 *  * @param {int} blogId 
 */
async function addTopCount(userId, blogId) {
  let result
  const topBoolenObj = await Top.findOne({
    where: {
      blogId, userId
    },
    attributes:['id']
  })
  if (topBoolenObj) {
    let id = topBoolenObj.dataValues.id
    await Top.destroy({
      where: {
        id
      }
    })
  } else {
    await Top.create({
      userId, blogId
    })
  }
  const countRes = await Top.findAndCountAll({
    where: {
      blogId
    }
  })
  return {
    count: countRes.count
  }
}

module.exports = {
  addTopCount
}