/**
 * @description comment 评论 API 路由
 */
const router = require('koa-router')()
const { createComment, getCommentList, addTop } = require('../../controller/comment')
const { loginCheck } = require('../../middlewares/loginChecks')
router.prefix('/api/comment')

router.post('/create', loginCheck, async (ctx, next) => {
  const { userId,blogId, content } = ctx.request.body
  const result = await createComment({ userId, blogId, content })
  ctx.body = result
})

router.post('/top', loginCheck, async (ctx, next) => {
  const { commentId, blogId } = ctx.request.body
  const { id:userId} = ctx.session.userInfo
  const result = await addTop(userId, commentId, blogId)
  ctx.body = result
})

router.get('/commentList', loginCheck, async (ctx, next) => {
  const { blogId } = ctx.query
  const result = await getCommentList(blogId)
  ctx.body = result
})

module.exports = router