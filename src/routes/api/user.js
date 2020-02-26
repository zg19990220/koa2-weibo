/**
 * @description user API 路由
 */
const router = require('koa-router')()
const {
  isExist,
  register,
  login,
  chengeInfo,
  chengePassword,
  logout,
  isExistName,
  isExistNum
} = require('../../controller/user')
const { loginCheck } = require('../../middlewares/loginChecks')


/**
 * @description 验证中间件
 */
const userValidate = require('../../vaildator/user')
const { genValidator } = require('../../middlewares/validators')
router.prefix('/api/user')

// 注册
router.post('/register', genValidator(userValidate), async (ctx, next) => {
  const { userName, password, gender, userNumber } = ctx.request.body
  console.log({ userName, password, gender, userNumber })
  ctx.body = await register({
    userName, password, gender, userNumber
  })
})
 
// 检测昵称是否存在
router.get('/isExistName', async (ctx, next) => {
  const { userName } = ctx.request.query
  // console.log('ctxctxctxctxctxctxctxctxctxctxctxctx',ctx)
  console.log('userName', userName)
  ctx.body = await isExistName(userName)
})

// 检测用户名是否存在
router.get('/isExistNum', async (ctx, next) => {
  // console.log('ctxctxctxctxctxctxctxctxctxctxctxctxctxctx', ctx)
  const { userNumber } = ctx.request.query
  console.log('userNumber', userNumber)
  ctx.body = await isExistNum(userNumber)
})

// 登录
router.post('/login', async (ctx, next) => {
  const { userNumber, password} = ctx.request.body
  ctx.body = await login(ctx, userNumber, password)
})

//更新个人信息
router.patch('/changeInfo', loginCheck, genValidator(userValidate), async (ctx, next) => {
  const { nickName, city, picture } = ctx.request.body
  ctx.body = await chengeInfo(ctx,{ nickName, city, picture })
  
})

// //修改密码
// router.patch('/changePassword', loginCheck, genValidator(userValidate), async (ctx, next) => {
//   const { password, newPassword } = ctx.request.body
//   const { userName } = ctx.session.userInfo
//   ctx.body = await chengePassword(
//     userName,
//     password,
//     newPassword
//   )
// })


router.post('/logout', loginCheck, async (ctx, next) => {
  ctx.body = await logout(ctx)
})
module.exports = router