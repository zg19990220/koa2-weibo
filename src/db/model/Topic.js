/**
 * @description 话题数据模型
 * @author 曾刚
 */

const seq = require('../seq')
const {
  INTEGER,
  STRING,
  TEXT
} = require('../types')

const Topic = seq.define('topic', {
  blogId: {
    type: INTEGER,
    allowNull: false,
    comment: 'blogId'
  },
  title: {
    type: STRING,
    allowNull: false,
    comment: '话题'
  }
})

module.exports = Topic
