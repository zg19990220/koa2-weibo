/**
 * @description 评论数据模型
 * @author 曾刚
 */
const seq = require('../seq')
const {
  INTEGER,
  TEXT
} = require('../types')

const Comment = seq.define('comment', {
  blogId: {
    type: INTEGER,
    allowNull: false,
    comment: '微博 ID'
  },
  userId: {
    type: INTEGER,
    allowNull: false,
    comment: '用户 ID'
  },
  content: {
    type: TEXT,
    allowNull: false,
    comment: '评论'
  },
  count: {
    type: INTEGER,
    comment: '点赞数',
    defaultValue:0
  }

})

module.exports = Comment
