/**
 * @description 用户关注关系
 */

const seq = require('../seq')
const { INTEGER } = require('../types')

const UserRelation = seq.define('userRelation', {
  userId: {
    type: INTEGER,
    allowNull: false,
    comment: '用户 ID'
  },
  followerId: {
    type: INTEGER,
    allowNull: false,
    comment: '被关注用户的id'
  }
})

module.exports = UserRelation