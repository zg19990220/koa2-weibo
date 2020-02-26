/**
 * @description blog 首页 API 路由
 */
const router = require('koa-router')()
const { loginCheck } = require('../../middlewares/loginChecks')
const { getSquareBlogList } = require('../../controller/home')
const { getBlogListStr } = require('../../utils/blog')
const blogValidate = require('../../vaildator/blog')
const { genValidator } = require('../../middlewares/validators')
const { getUserFansAndFollowers, create, getBlogHotComment } = require('../../controller/home')

router.prefix('/api/home')

router.get('/list', loginCheck, async (ctx, next) => {
  let { index, wbLastTime, userName } = ctx.request.query
  if (!wbLastTime) {
    wbLastTime = 0
  }
  if (!index) {
    index = 0
  }
  const result = await getSquareBlogList(ctx, index, wbLastTime, userName)
  const {
    isEmpty,
    blogList,
    pageSize,
    pageIndex,
    count
  } = result.data
  ctx.body = {
    wbData: {
      isEmpty,
      wbList:blogList,
      pageSize,
      pageIndex,
      count
    }
  }
})

//加载更多
router.get('/loadMore/:pageIndex', loginCheck, async (ctx, next) => {
  let { pageIndex } = ctx.params
  pageIndex = parseInt(pageIndex)
  const result = await getSquareBlogList(pageIndex)
  //渲染html模板str
  result.data.blogListTpl = getBlogListStr(result.data.blogList)
  ctx.body = result
})

//获取首页右侧个人信息
router.get('/userInfo', loginCheck, async (ctx, next) => {
  ctx.body = await getUserFansAndFollowers(ctx)
})

//发布微博
router.post('/create', genValidator(blogValidate), loginCheck, async (ctx, next) => {
  let { content, image, author, reprintContent, isReprint, id:authorBlogId} = ctx.request.body 
  const { id: userId, userName } = ctx.session.userInfo
  if (!author) {
    author = userName
  }
  if (!reprintContent) {
    reprintContent=''
  }
  if (!isReprint) {
    isReprint = false
    authorBlogId = -1
  }
  ctx.body = await create({ userId, content, image, author, reprintContent, isReprint, authorBlogId })

  
})


//热评
router.get('/hotComment', loginCheck, async (ctx, next) => {
  const { blogId } = ctx.query
  ctx.body = await getBlogHotComment(blogId)
})

module.exports = router