/**
 * @description 数据模型入口文件
 */

const User = require('./User')
const Blog = require('./Blog')
const Top = require('./top')
const Topic = require('./Topic')
const CommentTop = require('./CommentTop')
const Comment = require('./Comment')
const UserRelation = require('./UserRelation')
const AtRelation = require('./AtRelation')
Blog.belongsTo(User, {
  foreignKey: 'userId'
})

User.hasMany(Blog, {
  foreignKey: 'userId'
})



UserRelation.belongsTo(User, {
  foreignKey:'followerId'
})

User.hasMany(UserRelation, {
  foreignKey:'userId'
})

// UserRelation.belongsTo(User, {
//   foreignKey: 'followerId'
// })

// User.hasMany(UserRelation, {
//   foreignKey: 'userId'
// })

//将blog中的id 对应到Comment的blogId上
Comment.belongsTo(Blog, {
  foreignKey: 'blogId'
})
Blog.hasMany(Comment, {
  foreignKey: 'blogId'
})

Comment.belongsTo(User, {
  foreignKey: 'userId'
})
User.hasMany(Comment, {
  foreignKey: 'userId'
})

Blog.belongsTo(UserRelation, {
  foreignKey: 'userId',
  targetKey:'followerId'
})

Blog.hasMany(AtRelation, {
  foreignKey: 'blogId'
})

//帖子赞
Top.belongsTo(Blog, {
  foreignKey: 'blogId'
})
Blog.hasMany(Top, {
  foreignKey: 'blogId'
})

Top.belongsTo(User, {
  foreignKey: 'userId'
})
User.hasMany(Top, {
  foreignKey: 'userId'
})

//评论赞
CommentTop.belongsTo(Comment, {
  foreignKey: 'commentId'
})
Comment.hasMany(CommentTop, {
  foreignKey: 'commentId'
})

CommentTop.belongsTo(User, {
  foreignKey: 'userId'
})
User.hasMany(CommentTop, {
  foreignKey: 'userId'
})

CommentTop.belongsTo(Blog, {
  foreignKey: 'blogId'
})
Blog.hasMany(CommentTop, {
  foreignKey: 'blogId'
})

Topic.belongsTo(Blog, {
  foreignKey: 'blogId'
})

Blog.hasMany(Topic, {
  foreignKey: 'blogId'
})

module.exports = {
  User, Blog, UserRelation, AtRelation, Comment, Top, CommentTop, Topic
}