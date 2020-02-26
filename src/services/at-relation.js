/**
 * @description 微博 @ 用户关系 service
 * @author 双越老师
 */

const { AtRelation, Blog, User, Comment, CommentTop,Top } = require('../db/model/index')
const { formatBlog, formatUser } = require('./_format')
const { timeFormat } = require('../utils/dt')

/**
 * 创建微博 @ 用户的关系
 * @param {number} blogId 微博 id
 * @param {number} userId 用户 id
 */
async function createAtRelation(blogId, userId) {
  const result = await AtRelation.create({
    blogId,
    userId
  })
  return result.dataValues
}

/**
 * 获取 @ 用户的微博数量(未读的)
 */
async function createAtRelationCount(userId) {
  const result = await AtRelation.findAndCountAll({
    where: {
      userId,
      isRead:false
    }
  })
  return result.count
}
async function getAtUserBlogListCountById(userId){
  const result = await Blog.findAndCountAll({
    order: [
      ['id', 'desc']
    ],
    include: [
      {
        model: AtRelation,
        attributes: ['userId', 'blogId', 'isRead'],
        where: { userId,isRead:0}
      },
    ]
  })
  console.log(result)
  return result
}
/**
 * 获取 @ 用户的微博列表
 * @param {Object} param0 查询条件 { userId, pageIndex, pageSize = 10 }
 */
async function getAtUserBlogList({ userId, pageIndex,pageSize }) {
  if (!pageSize) {
    pageSize = null
  }
  const result = await Blog.findAndCountAll({
    limit: pageSize,
    offset: pageSize * pageIndex,
    order: [
      ['id', 'desc']
    ],
    include: [
      // @ 关系
      {
        model: AtRelation,
        attributes: ['userId', 'blogId','isRead'],
        where: { userId }
      },
      // User
      {
        model: User,
        attributes: ['userName', 'nickName', 'picture', 'bgPic', 'signature', 'city']
      },
      {
        model: Comment,
        include: [
          {
            model: User,
            attributes: ['userName', 'nickName', 'picture', 'bgPic', 'signature']
          },
          {
            model: CommentTop,
            attributes: ['id'],
            include: [
              {
                model: User,
                attributes: ['userName', 'nickName', 'picture', 'bgPic', 'signature']
              }
            ]
          }
        ]
      },
      {
        model: Top
      },
    ]
  })


  // result.count 总数，跟分页无关
  // result.rows 查询结果，数组
  let blogList = result.rows.map(row => row.dataValues)
  // 格式化
  blogList = blogList.map(blogItem => {
    const user = blogItem.user.dataValues
    blogItem.user = formatUser(user)
    return blogItem
  })

  //获取用户点赞数
  const topResult = await Top.findAndCountAll({
    where: {
      userId
    },
    attributes: ['blogId']
  })
  const TopArr = topResult.rows

  //获取用户点赞评论数
  const commenttopResult = await CommentTop.findAndCountAll({
    where: {
      userId,
    },
    attributes: ['commentId']
  })
  const commentTopArr = commenttopResult.rows

  //commentsCount TopCount 
  blogList.forEach(blogItem => {

    //点赞数
    blogItem.isTop = false
    blogItem.tops = blogItem.tops.length

    //是否已经点赞
    TopArr.map(TopArrItem => {
      if (TopArrItem.blogId == blogItem.id) {
        blogItem.isTop = true
      }
    })



    //评论
    if (blogItem.comments.length > 0) {
      blogItem.commentsCount = blogItem.comments.length

      //前三
      blogItem.comments = blogItem.comments.sort((a, b) => {
        return b.dataValues.CommentTops.length - a.dataValues.CommentTops.length
      })
      blogItem.comments = blogItem.comments.slice(0, 3)

      blogItem.comments.forEach(commentsItem => {
        const createdAtFormat = timeFormat(commentsItem.dataValues.createdAt)
        commentsItem.dataValues.createdAtFormat = createdAtFormat
        commentsItem.dataValues.user = commentsItem.dataValues.user.dataValues
        commentsItem.dataValues.user = formatUser(commentsItem.dataValues.user)
        //评论点赞数
        commentsItem.dataValues.CommentTops = commentsItem.dataValues.CommentTops.length

        commentsItem.dataValues.iscommentTop = false
        //是否已经点赞该评论
        commentTopArr.map(commentTopArrItem => {
          if (commentTopArrItem.commentId == commentsItem.id) {
            commentsItem.dataValues.iscommentTop = true
          }
        })
      })




    } else {
      blogItem.commentsCount = 0
    }
  })

  blogList = formatBlog(blogList)

  return {
    count: result.count,
    blogList
  }
}


/**
 * 更新 AtRelation
 * @param {Object} param0 更新内容
 * @param {Object} param1 查询条件
 */
async function updateAtRelation(
  { newIsRead }, // 要更新的内容
  { userId, isRead } // 条件
) {
  // 拼接更新内容
  const updateData = {}
  if (newIsRead) {
    updateData.isRead = newIsRead
  }

  // 拼接查询条件
  const whereData = {}
  if (userId) {
    whereData.userId = userId
  }
  if (isRead) {
    whereData.isRead = isRead
  }

  // 执行更新
  const result = await AtRelation.update(updateData, {
    where: whereData
  })
  return result[0] > 0
}


module.exports = {
  createAtRelation,
  createAtRelationCount,
  getAtUserBlogList,
  updateAtRelation,
  getAtUserBlogListCountById
}
