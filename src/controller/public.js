/**
 * 公共api
 */
const { getUserInfo, createUser, updataUser } = require('../services/user')
const {
  registerUserNameNotExistInfo,
  registerUserNameExistInfo,
  registerFailInfo,
  loginFailInfo,
  changeInfoFailInfom,
  changePasswordFailInfo
} = require('../model/ErrorInfo')
const {
  getFollowerByBlog
} = require('../services/user-relation')
const { getUserByFollower, getFollowerByUser } = require('../services/user-relation')
const {
  getHotBlogList, getWbDetils, getComment
} = require('../services/home')
const { 
  getAtUserBlogList, updateAtRelation, getAtUserBlogListCountById
} = require('../services/at-relation')
const {
  findAllTopic, findRankByTitle
} = require('../services/topic')
const { SuccessModel, ErrorModel } = require('../model/ResModel')
const doCrypto = require('../utils/cryp')

/**
 * 修改个人信息
 * @param {object} ctx
 * @param {string} nickName 
 * @param {string} city
 * @param {string} picture
 */
async function chengeInfo(ctx, { nickName, city, bgPic, picture, signature, gender }) {
  const { userName } = ctx.session.userInfo
  const result = updataUser({
    newNickName: nickName,
    newCity: city,
    newPicture: picture,
    newBgPic: bgPic,
    newSignature: signature,
    newGender:gender
  }, {
    userName
  })
  if (result) {
    Object.assign(ctx.session.userInfo, { nickName, city, bgPic, picture, signature, gender })
    return new SuccessModel()
  }
  return new ErrorModel(changeInfoFailInfo)
}
async function getFollowersAndUpDate(userId) {
  const {
    count,
    userList
  } = await getFollowerByBlog(userId)

  return new SuccessModel({
    count,
    followersList: userList
  })
}
//

async function getAtList(userId, pageIndex, pageSize) {
  const result = await getAtUserBlogList({ userId, pageIndex, pageSize })
  result.blogList.forEach(item =>{
    if (item.image) {
      item.image = item.image.split(',')
    } else {
      item.image=[]
    }
  })
  //获取登录用户的关注列表id
  const followersIdList = []
  const followersList = await getFollowerByUser(userId)
  followersList.userList.map(item => {
    followersIdList.push(item.id)
  })

  //加上登录用户的id
  followersIdList.push(userId)
  result.blogList.forEach(item => {
    item.isFollower = false

    //我是否关注这个微博的博主
    followersIdList.map(id => {
      if (id == item.userId) {
        item.isFollower = true
      }
    })

  })
  return new SuccessModel(result)
}
async function getAtListCount(userId) {
  const result = await getAtUserBlogListCountById(userId)
  // result.blogList.forEach(item => {
  //   if (item.image) {
  //     item.image = item.image.split(',')
  //   } else {
  //     item.image = []
  //   }
  // })
  return new SuccessModel({ count:result.count })
}
/**
 * 标记为已读
 * @param {number} userId userId
 */
async function markAsRead(userId) {
  try {
    await updateAtRelation(
      { newIsRead: true },
      { userId, isRead: false }
    )
  } catch (ex) {
    console.error(ex)
  }

  // 不需要返回 SuccessModel 或者 ErrorModel
}
/**
 * 标记为已读
 * @param {number} userId userId
 */
async function hotBlog({ userId }) {
  
  const result = await getHotBlogList(userId)

  result.blogList.sort((a, b) => {
    return (a.tops + a.reprintCount + a.commentsCount)/3 < (b.tops + b.reprintCount + b.commentsCount)/3
  })

  //获取登录用户的关注列表id
  const followersIdList = []
  const followersList = await getFollowerByUser(userId)
  followersList.userList.map(item => {
    followersIdList.push(item.id)
  })

  //加上登录用户的id
  followersIdList.push(userId)
  result.blogList.forEach(item => {
    item.isFollower = false

    //我是否关注这个微博的博主
    followersIdList.map(id => {
      if (id == item.userId) {
        item.isFollower = true
      }
    })

  })

  return new SuccessModel(result)
}
async function getTopicRank(){
  const result = await findAllTopic()
  return new SuccessModel(result)
}

async function getRankDetails(title, userId, index, wbLastTime) {
  const result = await findRankByTitle(title, userId, index, wbLastTime)
  //获取登录用户的关注列表id
  const followersIdList = []
  const followersList = await getFollowerByUser(userId)
  followersList.userList.map(item => {
    followersIdList.push(item.id)
  })

  //加上登录用户的id
  followersIdList.push(userId)
  console.log(followersIdList)
  result.forEach(item => {
    item.isFollower = false

    //我是否关注这个微博的博主
    followersIdList.map(id => {
      if (id == item.userId) {
        item.isFollower = true
      }
    })

  })
  return new SuccessModel(result)
}

async function getDetails(id,userId) {
  const result = await getWbDetils(id, userId)
  //获取登录用户的关注列表id
  const followersIdList = []
  const followersList = await getFollowerByUser(userId)
  followersList.userList.map(item => {
    followersIdList.push(item.id)
  })

  //加上登录用户的id
  followersIdList.push(userId)
  console.log(followersIdList)
  result.forEach(item => {
    item.isFollower = false

    //我是否关注这个微博的博主
    followersIdList.map(id => {
      if (id == item.userId) {
        item.isFollower = true
      }
    })

  })
  return new SuccessModel(result[0])
}

async function getDetailsComment({ blogId, userId, index }) {
  const result = await getComment({ blogId, userId, index })
 
  return new SuccessModel(result)
}
module.exports = {
  chengeInfo, getFollowersAndUpDate, getAtList, markAsRead, getAtListCount, hotBlog, getTopicRank, getRankDetails, getDetails, getDetailsComment
}

