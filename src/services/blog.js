/**
 * @description 微博 services
 */

const { Blog, User, UserRelation, Comment,Top } = require('../db/model/index')
const { formatUser, formatBlog } = require('./_format')
const Sequalize = require('sequelize')
/**
 * 创建微博
 * @param {object} param0 创建微博所需参数 {userId,content,image}
 */
async function createBlog({userId,content,image}) {
  const result = await Blog.create({
    userId,
    content,
    image
  })
  return result.dataValues
}

/**
 * 根据用户获取微博列表
 * @param {Object} param0 查询参数 { userName, pageIndex = 0, pageSize = 10 }
 */
async function getBlogListByUser({
  userName,
  pageIndex = 0,
  pageSize = 10
}) {
  // 拼接查询条件
  const userWhereOpts = {}
  if (userName) {
    userWhereOpts.userName = userName
  }
  // 执行查询
  const result = await Blog.findAndCountAll({
    limit: pageSize, // 每页多少条
    offset: pageSize * pageIndex, // 跳过多少条
    order: [
      ['id', 'desc']
    ],
    include: [
      {
        model: Top,
        attributes: ['userId', 'blogId'],
      },
      {
        model: User,
        attributes: ['userName', 'nickName', 'picture'],
        where: userWhereOpts
      },
      {
        model: Comment,
        attributes: ['userId', 'blogId', 'content', 'createdAt'],
        order: [
          ['id', 'desc']
        ],
      }
    ]
  })
  // result.count 总数，跟分页无关
  // result.rows 查询结果，数组
  console.log('result',result)
  // 获取 dataValues
  let blogList = result.rows.map(row => row.dataValues)
  // 格式化
  blogList = formatBlog(blogList)
  blogList = blogList.map(blogItem => {
    const user = blogItem.user.dataValues
    blogItem.user = formatUser(user)
    return blogItem
  })
  return {
    count: result.count,
    blogList
  }
}

/**
 * 获取关注列表中的所有微博
 * @param {Objectr} param0 查询条件 {userId,pageIndex=0,pageSize=0}
 */
async function  getFollowersBlogList({userId,pageIndex=0,pageSize=10}) {
  const result = await Blog.findAndCountAll({
    limit: pageSize, //每页数量
    offset: pageSize * pageIndex,
    order: [
      ['id','desc']
    ],
    include: [
      {
        model: User,
        attributes:['userName','nickName','picture']
      },
      {
        model: UserRelation,
        attributes: ['userId', 'followerId'],
        where:{
          userId
        }
      }
    ]
  })
 
  let blogList = result.rows.map(row => row.dataValues)
  blogList = formatBlog(blogList)
  blogList = blogList.map(blogItem => {
    blogItem.user = formatUser(blogItem.user.dataValues)
    return blogItem
  })
  return {
    count: result.count,
    blogList
  }
}
module.exports = {
  createBlog, getBlogListByUser, getFollowersBlogList
}