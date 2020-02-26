/**
 * comment 评论api
 */
const { SuccessModel } = require('../model/ResModel')
const { create, getComment, Top } = require('../services/comment')


async function createComment({userId,blogId,content}) {
  const result = await create({ userId, blogId, content })
  return new SuccessModel(result)
}

async function getCommentList(blogId) {
  const result = await getComment(blogId)
  return new SuccessModel(result)
}

async function addTop(userId, commentId, blogId) {
  const result = await Top(userId, commentId, blogId)
  return new SuccessModel(result)
}
module.exports = {
  createComment, getCommentList, addTop
}