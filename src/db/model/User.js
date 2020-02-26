/**
 * @description 用户数据模型
 * @author 曾刚
 */

const seq = require('../seq')
const {
  STRING,
  DECIMAL,
  INTEGER
} = require('../types')

// users
const User = seq.define('user', {
  userNumber: {
    type: STRING,
    allowNull: false,
    unique: true,
    comment: '账号，唯一'
  },
  userName: {
    type: STRING,
    allowNull: false,
    unique: true,
    comment: '用户名，唯一'
  },
  password: {
    type: STRING,
    allowNull: false,
    comment: '密码'
  },
  nickName: {
    type: STRING,
    allowNull: false,
    comment: '昵称'
  },
  gender: {
    type: DECIMAL,
    allowNull: false,
    defaultValue: 3,
    comment: '性别（1 男性，2 女性，3 保密）'
  },
  picture: {
    type: STRING,
    comment: '头像，图片地址'
  },
  city: {
    type: STRING,
    comment: '城市'
  },
  signature: {
    type: STRING,
    allowNull: false,
    defaultValue:'这个人很懒什么都没有留下。',
    comment: '签名',
  },
  bgPic: {
    type: STRING,
    comment: '背景地址'
  }
})

module.exports = User
