/**
 * @description user services
 * @author 曾刚
 */

const { User } = require('../db/model/index')
const {
  formatUser
} = require('./_format')
const { addFollower } = require('./user-relation')

/**
 * 获取用户信息
 * @param {string} userNumber 用户账号
 * @param {string} password 密码
 */
async function getUserInfo(userNumber, password) {
  // 查询条件
  const whereOpt = {
    userNumber
  }
  if (password) {
    Object.assign(whereOpt, {
      password
    })
  }

  // 查询
  const result = await User.findOne({
    attributes: ['id', 'userName', 'nickName', 'picture', 'city'],
    where: whereOpt
  })
  if (result == null) {
    // 未找到
    return result
  }
  // 格式化
  const formatRes = formatUser(result.dataValues)

  return formatRes
}
 

async function getUserInfoByNum(userNumber) {
  // 查询条件
  const whereOpt = {
    userNumber
  }
  // 查询
  const result = await User.findOne({
    attributes: ['id', 'userName', 'nickName', 'picture', 'city'],
    where: whereOpt
  })
  if (result == null) {
    // 未找到
    return result
  }
  // 格式化
  const formatRes = formatUser(result.dataValues)

  return formatRes
}

async function getUserInfoByName(userName) {
  // 查询条件
  const whereOpt = {
    userName
  }
  // 查询
  const result = await User.findOne({
    attributes: ['id', 'userName', 'nickName', 'picture', 'city'],
    where: whereOpt
  })
  if (result == null) {
    // 未找到
    return result
  }
  // 格式化
  const formatRes = formatUser(result.dataValues)

  return formatRes
}

/**
 * 
 * @param {String} userName 用户名
 * @param {String} password 密码
 * @param {Number} gender 性别
 * @param {String} nickName 昵称
 */
async function createUser({
  userName,
  password,
  gender = 3,
  nickName,
  userNumber
}) {
  const result = await User.create({
    userName,
    password,
    gender,
    nickName: nickName ? nickName : userName,
    userNumber
  })
  const data = result.dataValues
  //自己关注自己
  addFollower(data.id, data.id)
  return data
}

/**
 * 更新用户信息
 * @param {Object} param0 { newPassword, newNickName, newCity, newPicture } 新的数据
 * @param {Object} param1 { userName, newPicture } 查询条件
 */
async function updataUser({
  newNickName,
  newCity,
  newPicture,
  newBgPic,
  newSignature,
  newGender,
  newPassword
}, {
  userName,
  password
}) {
  const updataData = {}
  if (newPassword) {
    updataData.password = newPassword
  }
  if (newNickName) {
    updataData.nickName = newNickName
  }
  if (newCity) {
    updataData.city = newCity
  }
  if (newBgPic) {
    updataData.bgPic = newBgPic
  }
  if (newSignature) {
    updataData.signature = newSignature
  }
  if (newGender) {
    updataData.gender = newGender
  }
  if (newPicture) {
    updataData.picture = newPicture
  }
  const whereData = {
    userName
  }
  if (password) {
    whereData.password = password
  }
  const result = await User.update(updataData, {
    where: whereData
  })
  return result[0] > 0
}
module.exports = {
  getUserInfo,
  createUser,
  updataUser,
  getUserInfoByNum,
  getUserInfoByName
}