/**
 * @description 评论点赞数据模型
 * @author 曾刚
 */
const seq = require('../seq')
const {
  INTEGER,
  TEXT
} = require('../types')

const CommentTop = seq.define('CommentTop', {
  commentId: {
    type: INTEGER,
    allowNull: false,
    comment: '评论ID'
  },
  userId: {
    type: INTEGER,
    allowNull: false,
    comment: '用户ID'
  },
  blogId: {
    type: INTEGER,
    allowNull: false,
    comment: 'blogID'
  }
})

module.exports = CommentTop
