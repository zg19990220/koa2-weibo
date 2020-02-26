/**
 * @description 微博数据模型
 * @author 曾刚
 */

const seq = require('../seq')
const {
  INTEGER,
  STRING,
  TEXT,
  BOOLEAN,
  BIGINT
} = require('../types')

const Blog = seq.define('blog', {
  userId: {
    type: INTEGER,
    allowNull: false,
    comment: '用户 ID'
  },
  content: {
    type: TEXT,
    allowNull: false,
    comment: '微博内容'
  },
  image: {
    type: TEXT,
    comment: '图片地址'
  },
  author: {
    type: STRING,
    allowNull: false,
    comment: '作者'
  },
  reprintContent: {
    type: TEXT,
    allowNull: true,
    comment: '转载内容'
  },
  isReprint: {
    type: BOOLEAN,
    allowNull: false,
    defaultValue:false,
    comment: '转载内容'
  },
  reprintCount: {
    type: INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: '转载数量'
  }
})

module.exports = Blog
