/**
 * @description 首页 Controller
 * @author 曾刚
 */
const { createBlog, getFollowersBlogList, getBlogListByUserCount } = require('../services/blog')
const { SuccessModel, ErrorModel } = require('../model/ResModel')
const { createBlogFailInfo } = require('../model/ErrorInfo')
const { PAGE_SIZE, REG_FOR_AT_WHO } = require('../conf/constants')
const { getUserInfo } = require('../services/user')
const { createAtRelation } = require('../services/at-relation')
const xss = require('xss')
/**
  * 
  * @param {object} param0 创建微博所需参数 {userId,content,image}
  */
async function create({ userId, content, image }) {
  
  //分析content 中的@用户
  const atUserNameList = []
  content = content.replace(
    REG_FOR_AT_WHO,
    (matchStr, nickName, userName) => {
      atUserNameList.push(userName)
      return matchStr //替换不生效 目的不是replace 而是userName
    }
  )
  //根据@用户名查询用户信息
  const atUserList = await Promise.all(
    atUserNameList.map(userName => getUserInfo(userName))
  )

  //根据用户名 查询用户信息
  const atUserIdList = atUserList.map(user => {
    return user.id
  })

  try {
    const blog = await createBlog({
      userId,
      content: xss(content),
      image
    })
    //创建 @ 关系
    await Promise.all(atUserIdList.map(userId => {
      return createAtRelation(blog.id, userId)
    }))

    //返回
    return new SuccessModel(blog)
  } catch (ex) {
    console.log(ex.message, ex.stack)
    return new ErrorModel(createBlogFailInfo)
  }
}

/**
 * 获取我的关注人微博列表   
 * @param {number} userId 
 * @param {number} pageIndex 
 */
async function getHomeBlogList(userId,pageIndex=0) {
  const result = await getFollowersBlogList(
    { userId, pageIndex, pageSize:PAGE_SIZE }
  )
  
  const { count, blogList } = result
  return new SuccessModel({
    isEmpty: blogList.length === 0,
    blogList,
    pageSize: PAGE_SIZE,
    pageIndex,
    count
  })
}

/**
 * 获取首页微博
 * @param {*} userId 
 * @param {*} pageIndex 
 */
async function getHomeBlogListAll(userId, pageIndex = 0) {
  const result = await getBlogListAll(
    { userId, pageIndex, pageSize: PAGE_SIZE }
  )

  const { count, blogList } = result
  return new SuccessModel({
    isEmpty: blogList.length === 0,
    blogList,
    pageSize: PAGE_SIZE,
    pageIndex,
    count
  })
}

/** */
module.exports = {
  create, getHomeBlogList, getHomeBlogListAll
}