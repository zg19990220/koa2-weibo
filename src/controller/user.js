/**
 * @description user Controller
 * @author 曾刚
 */

const { getUserInfo, createUser, updataUser, getUserInfoByNum, getUserInfoByName } = require('../services/user')
const {
  registerUserNameNotExistInfo,
  registerUserNameExistInfo,
  registerFailInfo,
  loginFailInfo,
  changeInfoFailInfom,
  changePasswordFailInfo,
  registerUserNumNotExistInfo
} = require('../model/ErrorInfo')
 
const { SuccessModel, ErrorModel } = require('../model/ResModel')
const doCrypto = require('../utils/cryp')
/**
 * 昵称是否存在
 * @param {String} userName 昵称
 */
async function isExistName(userName) {
  const userInfo = await getUserInfoByNum(userName)
  if (userInfo) {
    //已存在
    return new SuccessModel(userInfo)
  } else {
    //不存在
    return new ErrorModel(registerUserNameNotExistInfo)
  }
} 
/**
 * 用户名是否存在
 * @param {String} userNumber 用户名
 */
async function isExistNum(userNumber) {
  const userInfo = await getUserInfoByNum(userNumber)
  if (userInfo) {
    //已存在
    return new SuccessModel(userInfo)
  } else {
    //不存在
    return new ErrorModel(registerUserNumNotExistInfo)
  }
} 
/**
 * 注册账号
 * @param {String} userName 
 * @param {String} password 
 * @param {Number} gender 1.男 2.女 3.保密
 */
async function register({ userName, password, gender, userNumber }) {
  const userInfo = await getUserInfoByName(userName)
  const resultInfo = await getUserInfoByNum(userNumber)
  console.log('userName', userName)
  console.log('userNumber', userNumber)
  if (userInfo) {
    //已存在用户名
    console.log('userInfo',userInfo)
    return new ErrorModel({
      errno: -1,
      message: '用户名已存在'
    })
  } 
  if (resultInfo) {
    console.log('resultInfo', resultInfo)
    //已存在账号
    return new ErrorModel({
      errno: -1,
      message: '账号已存在'
    })
  }

  try {
    await createUser({
      userName, password: doCrypto(password), gender, userNumber
    })
    return new SuccessModel()
  } catch (ex) {
    return new ErrorModel(registerFailInfo)
  }
}

async function login(ctx, userNumber, password) {
  const userInfo = await getUserInfo(userNumber, doCrypto(password))
  if (!userInfo) {
    return new ErrorModel(loginFailInfo)
  }
  ctx.session.userInfo = userInfo
  return new SuccessModel()
}

/**
 * 修改个人信息
 * @param {object} ctx ctx
 * @param {string} nickName 
 * @param {string} city
 * @param {string} picture
 */
async function chengeInfo(ctx, { nickName, city, picture} ) {
  const { userName } = ctx.session.userInfo
  const result = updataUser({
    newNickName: nickName,
    newCity: city,
    newPicture: picture
  }, {
    userName
  })
  if (result) {
    Object.assign(ctx.session.userInfo, {
      nickName, city, picture
    })
    return new SuccessModel()
  }
  return new ErrorModel(changeInfoFailInfo)
}

/**
 * 修改密码
 * @param {string} userName 
 * @param {string} password
 * @param {string} newPassword
 */
async function chengePassword( userName, password, newPassword) {
  const result = await updataUser({ newPassword:doCrypto(newPassword) }, { userName, password:doCrypto(password) })
  
  if (result) {
    return new SuccessModel()
  }

  return new ErrorModel(changePasswordFailInfo)
}

/**
 * 
 * @param {object} ctx 
 */
async function logout(ctx) {
  delete ctx.session.userInfo
  return new SuccessModel()
}
module.exports = {
  isExistName, isExistNum, register, login, chengeInfo, chengePassword, logout
}

