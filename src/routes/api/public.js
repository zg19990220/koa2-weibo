/**
 * api 关注  
 */
const router = require('koa-router')()
const { loginCheck } = require('../../middlewares/loginChecks')
// const { loginRedirect } = require('../../middlewares/loginChecks')

const { getHomeBlogList } = require('../../controller/blog-home')
const { chengeInfo, getAtList, markAsRead, getAtListCount, hotBlog } = require('../../controller/public')

const { getFans, getFollowers } = require('../../controller/user-relation')
const { getFollowersAndUpDate, getTopicRank, getRankDetails, getDetails, getDetailsComment } = require('../../controller/public')  
const { addTop } = require('../../controller/home')
const {
  follow,
  unFollow
} = require('../../controller/user-relation')

router.prefix('/api/public')


//关注
router.post('/follow', loginCheck, async (ctx, next) => {
  const { id: myUserId } = ctx.session.userInfo
  const { userId: curUserId } = ctx.request.body
  ctx.body = await follow(myUserId, curUserId)
})

//取消关注
router.post('/unfollow', loginCheck, async (ctx, next) => {
  const { id: myUserId } = ctx.session.userInfo
  const { userId: curUserId } = ctx.request.body
  ctx.body = await unFollow(myUserId, curUserId)
})

router.post('/top', loginCheck,async (ctx, next) => {
  const { id:userId } = ctx.session.userInfo
  const { blogId } = ctx.request.body
  ctx.body = await addTop(userId, blogId)
})

router.post('/editUserInfo', loginCheck, async (ctx, next) => {
  const { nickName, city, bgPic, picture, signature, gender } = ctx.request.body
  
  ctx.body = await chengeInfo(ctx, { nickName, city, bgPic, picture, signature, gender })
})

//获取当前登录用户 userInfo
router.get('/getUserInfo', loginCheck, async (ctx, next) => {
  // 已登录用户的信息
  const userInfo = ctx.session.userInfo
  const { id: userId } = userInfo

  // 获取所有微博数量
  const result = await getHomeBlogList(userId)
  const { isEmpty, blogList, pageSize, pageIndex, count } = result.data

  // 获取粉丝
  const fansResult = await getFans(userId)
  const { count: fansCount } = fansResult.data

  // 获取关注人列表
  const followersResult = await getFollowers(userId)
  const { count: followersCount } = followersResult.data
  ctx.body = {
    userInfo
  }
})

//获取关注人列表和最近更新时间
router.get('/getFollowUpdate', loginCheck, async (ctx, next) => {
  const userId = ctx.session.userInfo.id
  const follower = await getFollowersAndUpDate(userId)
  ctx.body = follower
})

//获取用户@
router.get('/getAtList', loginCheck, async (ctx, next) => {
  let { index: pageIndex } = ctx.request.query
  pageIndex = parseInt(pageIndex)
  const pageSize = 5
  const userId = ctx.session.userInfo.id
  const follower = await getAtList(userId, pageIndex, pageSize)
  ctx.body = follower
})

//获取未读
router.get('/getAtListCount', loginCheck, async (ctx, next) => {
  const userId = ctx.session.userInfo.id
  const count = await getAtListCount(userId)
  ctx.body = count
})

//已读
router.get('/read', loginCheck, async (ctx, next) => {
  const userId = ctx.session.userInfo.id
  const result = await markAsRead(userId)
  ctx.body = result
})

//推荐
router.get('/getHotBlog', loginCheck, async (ctx, next) => {
  const { id: userId, userName } = ctx.session.userInfo
  const result = await hotBlog({ userId, userName})
  ctx.body = result
})

//话题list
router.get('/getTopicRank', loginCheck, async (ctx, next) => {
  const result = await getTopicRank()
  ctx.body = result
})


//话题详情list
router.get('/getRankDetails', loginCheck, async (ctx, next) => {
  const { title, index, wbLastTime } = ctx.request.query
  console.log('index', ctx.request.query)
  const userId = ctx.session.userInfo.id
  const result = await getRankDetails(title, userId, index, wbLastTime)
  ctx.body = result
})


//是否登录
router.get('/getLoginState', async (ctx, next) => {
  let LoginState = false
  if (ctx.session.userInfo) {
    LoginState = true
  }
  ctx.body = LoginState
})

//验证码code
router.get('/code', async (ctx, next) => {
  let randomNum = ''
  for (let i = 0; i < 4; i++) {
    randomNum += Math.floor(Math.random() * 10)
  }
  ctx.body = randomNum
})

//details
router.get('/getDetails', async (ctx, next) => {
  const { id } = ctx.request.query
  const { id: userId } = ctx.session.userInfo
  console.log('???', ctx.request.query)
  const result = await getDetails(id, userId)
  ctx.body = result
})


//details
router.get('/getDetailsComment', async (ctx, next) => {
  const { id:blogId,index } = ctx.request.query
  const { id: userId } = ctx.session.userInfo
  console.log(blogId)
  const result = await getDetailsComment({ blogId, userId, index })
  ctx.body = result
})

module.exports = router