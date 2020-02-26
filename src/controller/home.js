/**
 * @description home Controller
 * @author 曾刚
 */

const { getUserByFollower, getFollowerByUser } = require('../services/user-relation')
const { createBlog, getBlogListByUser, hotComment, getUserInfoByUserName } = require('../services/home')
const { SuccessModel, ErrorModel } = require('../model/ResModel')
const { createBlogFailInfo } = require('../model/ErrorInfo')
const { getUserInfoByName } = require('../services/user')
const { PAGE_SIZE, REG_FOR_AT_WHO, REG_FOR_TOPIC_WHO } = require('../conf/constants')
const { createAtRelation } = require('../services/at-relation')
const { addTopCount } = require('../services/top')
const { createTopic } = require('../services/topic')
const { getSquareCacheList } = require('../cache/blog')
const xss = require('xss')
const { timeFormat } = require('../utils/dt')
/**
* 右侧个人信息
* @param {String} userName 用户名
*/
async function getUserFansAndFollowers(ctx) { 
  let { userName } = ctx.request.query
  
  let userInfo = ctx.session.userInfo
  let userId


  if (userName == 'u' || userName == ctx.session.userInfo.userName) {
    
    userName = userInfo.userName
    userId = userInfo.id
    
    userInfo = await getUserInfoByUserName(userName)
    userInfo.isLoginUser = true
  } else {
    userInfo = await getUserInfoByUserName(userName)
    if (!userInfo) {
      return new SuccessModel({
        userInfo
      })
    }
    userId = userInfo.id
    userInfo.isLoginUser = false
    ctx.session.userInfo.id
  }

  
  userInfo.isFollower = false
  
  
  



  //获取用户粉丝
  const fans = await getUserByFollower(userId)
  //获取用户关注列表
  const followers = await getFollowerByUser(userId)
  followers.userList.forEach(item => {
    item.isFollower = true
  })
  fans.userList.forEach(item => {
    if (item.id == ctx.session.userInfo.id) {
      userInfo.isFollower = true
    }
  })
  // followers.count--
  // fans.count--
  followers.userList.map
  const pageIndex = 0
  const pageSize = 0
  //获取微博数量
  const wbList = await getBlogListByUser({ userName, pageIndex, pageSize, userId })
  return new SuccessModel({
    userInfo,
    fansList: fans,
    followList: followers,
    fansCount:fans.count,
    followCount: followers.count,
    wbCount: wbList.count
  })
} 

/**
  * 
  * @param {object} param0 创建微博所需参数 {userId,content,image}
  */
async function create({ userId, content, image, author, reprintContent, isReprint, authorBlogId }) {

  //分析content 中的@用户
  const atUserNameList = []

  //分析content 中的#
  let topicTitleList = []
  if (isReprint) {
    reprintContent = reprintContent.replace(
      REG_FOR_AT_WHO,
      (matchStr, nickName, userName) => {
        atUserNameList.push(nickName)
        return matchStr //替换不生效 目的不是replace 而是userName
      }
    )

    reprintContent = reprintContent.replace(
      REG_FOR_TOPIC_WHO,
      (matchStr, title) => {
        topicTitleList.push(title)
        return matchStr //替换不生效 目的不是replace 而是userName
      }
    )

  } else {
    content = content.replace(
      REG_FOR_AT_WHO,
      (matchStr, nickName, userName) => {
        atUserNameList.push(nickName)
        return matchStr //替换不生效 目的不是replace 而是userName
      }
    )
    content = content.replace(
      REG_FOR_TOPIC_WHO,
      (matchStr, title) => {
        topicTitleList.push(title)
        return matchStr //替换不生效 目的不是replace 而是userName
      }
    )
  }
  //根据@用户名查询用户信息
  const atUserList = await Promise.all(
    atUserNameList.map(userName => getUserInfoByName(userName))
  )



  //根据用户名 查询用户信息
  let atUserIdList = atUserList.map(user => {
    if (user) {
      return user.id
    }
  })

  try {
    const blog = await createBlog({
      userId,
      content: xss(content),
      image,
      author,
      reprintContent,
      isReprint,
      authorBlogId
    })
    
    atUserIdList = Array.from(new Set(atUserIdList))
    //创建 @ 关系
    await Promise.all(atUserIdList.map(userId => {
      if (userId) {
        return createAtRelation(blog.id, userId)
      }
    }))
    //根据#title查询
    topicTitleList = Array.from(new Set(topicTitleList))
    await Promise.all(
      topicTitleList.map(title => createTopic(blog.id,title))
    )

    //返回
    return new SuccessModel(blog)
  } catch (ex) {
    console.log(ex.message, ex.stack)
    return new ErrorModel(createBlogFailInfo)
  }
}


/**
 * 获取广场微博列表
 * @param {number} pageIndex
 */
async function getSquareBlogList(ctx, pageIndex, wbLastTime, userName) {
  if (userName == 'u') {
    userName = ctx.session.userInfo.userName
  }
  const { id: userId } = ctx.session.userInfo
  //cache 
  const result = await getSquareCacheList(pageIndex, PAGE_SIZE, userId, wbLastTime, userName)
  const blogList = result.blogList

  //获取登录用户的关注列表id
  const followersIdList = []
  const followersList = await getFollowerByUser(userId)
  followersList.userList.map(item => {
    followersIdList.push(item.id)
  })
  //加上登录用户的id
  followersIdList.push(userId)
  blogList.forEach(item => {
    if (item.image) {
      item.image = item.image.split(',')
    } else {
      item.image = false
    }
    item.isFollower = false

    //我是否关注这个微博的博主
    followersIdList.map(id => {
      if (id == item.userId) {
        item.isFollower = true
      }
    })

  })

  return new SuccessModel({
    isEmpty: blogList.length === 0,
    blogList,
    pageSize: PAGE_SIZE,
    pageIndex,
    count: result.count
  })
}

/**
 * 获取微博热评
 * @param {number} pageIndex
 */

async function getBlogHotComment(blogId) {
  const result = await hotComment(blogId)
  return new SuccessModel(result)
}

/**
 * 点赞
 * @param {number} myUserId
 * @param {number} blogId
 */

async function addTop(myUserId, blogId) {
  const result = await addTopCount(myUserId, blogId)
  return new SuccessModel(result)
}



module.exports = {
  getUserFansAndFollowers, create, getSquareBlogList, getBlogHotComment, addTop
}