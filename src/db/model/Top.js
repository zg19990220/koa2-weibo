/**
 * @description 点赞数据模型
 * @author 曾刚
 */

const seq = require('../seq')
const {
  INTEGER,
  STRING,
  TEXT
} = require('../types')

const Top = seq.define('top', {
  userId: {
    type: INTEGER,
    allowNull: false,
    comment: '用户 ID'
  },
  blogId: {
    type: INTEGER,
    allowNull: false,
    comment: 'blogId'
  },
})

module.exports = Top
