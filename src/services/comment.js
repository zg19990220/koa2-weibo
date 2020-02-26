/**
 * @description 评论 services
 */
const { Blog, User, UserRelation, Comment,CommentTop } = require('../db/model/index')
const { formatUser, formatBlog } = require('./_format')
const Sequalize = require('sequelize')
const { timeFormat } = require('../utils/dt')

/**
 * 创建评论
 * @param {object} param0 创建评论所需参数 {userId,content,blogId}
 */
async function create({ userId, content, blogId }) {
  const result = await Comment.create({
    userId,
    content,
    blogId
  })
  const result2 = await User.findOne({
    attributes: ['id', 'userName', 'nickName', 'picture', 'city'],
    where: {
      id: userId
    }
  })

  result.dataValues.user = result2.dataValues
  result.dataValues.user = formatUser(result.dataValues.user)
  result.dataValues.createdAtFormat = timeFormat(result.dataValues.createdAt)
  return result.dataValues
}

/**
 * 获取评论
 * @param {int} blogId  blogId
 */
async function getComment(blogId,pageIndex=0) {
  const result = await Comment.findAndCountAll({
    limit: 5, // 每页多少条
    offset: 5 * pageIndex, // 跳过多少条
    attributes: ['id', 'userId', 'blogId', 'content','createdAt'],
    order: [
      ['id', 'desc']
    ],
    include: [
      {
        model: Blog,
        attributes: []
      }
    ],
    where: {
      blogId
    }
  })
  result = result.rows
  return result
}

/**
 * 点赞
 * @param {int} blogId  blogId
 */
async function Top(userId, commentId, blogId) {
  let result
  const topBoolenObj = await CommentTop.findOne({
    where: {
      userId, commentId, blogId
    },
    attributes: ['id']
  })
  if (topBoolenObj) {
    let id = topBoolenObj.dataValues.id
    await CommentTop.destroy({
      where: {
        id
      }
    })
  } else {
    await CommentTop.create({
      userId, commentId, blogId
    })
  }
  const countRes = await CommentTop.findAndCountAll({
    where: {
      commentId
    }
  })
  return {
    count: countRes.count
  }
}


module.exports = {
  create, getComment, Top
}