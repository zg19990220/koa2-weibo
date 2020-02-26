/**
 * @description home services
 */
const { Blog, User, UserRelation, Comment,Top,CommentTop } = require('../db/model/index')
const { formatUser, formatBlog } = require('./_format')
const { timeFormat } = require('../utils/dt')
const Sequelize = require('sequelize')



/**
 * 根据用户获取微博列表
 * @param {Object} param0 查询参数 { userName, pageIndex = 0, pageSize = 10 }
 */
async function getBlogListByUser({
  userName,
  pageIndex = 0,
  pageSize = 5,
  userId,
  wbLastTime,
}) {
  if (wbLastTime == 0) {
    wbLastTime = new Date()
  }
  // 拼接查询条件
  const userWhereOpts = {}
  let userInfoWhereOpts = {
    createdAt: {
      [Sequelize.Op.lte]: wbLastTime
    }
  }
  
  if (userName) {
    userInfoWhereOpts = {
    }
    userWhereOpts.userName = userName
  }
  // 执行查询
  const result = await Blog.findAndCountAll({
    limit: pageSize, // 每页多少条
    offset: pageSize * pageIndex, // 跳过多少条
    order: [
      ['id', 'desc']
    ],
    where: userInfoWhereOpts,
    include: [
      {
        model: User,
        attributes: ['userName', 'nickName', 'picture', 'bgPic', 'signature','city'],
        where: userWhereOpts
      },
      {
        model: Comment,
        attributes: ['userId', 'blogId', 'content', 'createdAt','id'],
        include: [
          {
            model: User,
            attributes: ['userName', 'nickName', 'picture','bgPic', 'signature']
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
 * 根据用户获取微博列表
 * @param {Object} param0 查询参数 { userName, pageIndex = 0, pageSize = 10 }
 */
async function getHotBlogList(userId) {
  // 执行查询
  const result = await Blog.findAndCountAll({
    include: [
      {
        model: User,
        attributes: ['userName', 'nickName', 'picture', 'bgPic', 'signature', 'city']
      },
      {
        model: Comment,
        attributes: ['userId', 'blogId', 'content', 'createdAt', 'id'],
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
  console.log('??????????????????????????',blogList[0])
  // blogList[0]
  blogList.sort((a, b) => {

    return (b.tops + b.reprintCount + b.commentsCount) - (a.tops + a.reprintCount + a.commentsCount)
  })

  blogList = blogList.slice(0, 5)

  let data = []
  blogList.map((item) => {
    if (item.tops > 0 || item.reprintCount > 0 || item.commentsCount>0) {
      data.push(item)
    }
  })
  console.log(data)
  data.forEach(item => {
    if (item.image) {
      item.image = item.image.split(',')
    } else {
      item.image = []
    }
  })
  return {
    count: result.count,
    blogList: data
  }
}

async function getWbDetils(id, userId) {
  console.log(id, userId)
  // 执行查询
  const result = await Blog.findAndCountAll({
    where: {
      id
    },
    include: [
      {
        model: User,
        attributes: ['userName', 'nickName', 'picture', 'bgPic', 'signature', 'city']
      },
      {
        model: Comment,
        attributes: ['userId', 'blogId', 'content', 'createdAt', 'id'],
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
  console.log(blogList)
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

      blogItem.comments = blogItem.comments.sort((a, b) => {
        return b.dataValues.CommentTops.length - a.dataValues.CommentTops.length
      })

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
  blogList.forEach(item => {
    if (item.image) {
      item.image = item.image.split(',')
    } else {
      item.image = []
    }
  })
  return  blogList
}

/**
 * 根据用户userName 获取用户信息
 * @param {int} userName
 */
async function getUserInfoByUserName(userName) { 
  const result =await User.findOne({
    attributes: ['id', 'userName', 'nickName', 'picture', 'city', 'bgPic','signature','userNumber'],
    where: {
      userName
    }
  })
  if (result) {
    result.dataValues = formatUser(result.dataValues)
    return result.dataValues
  } else {
    return false
  }
  
}
/**
 * 获取热评3条
 * @param {int} blogId 创建微博所需参数 {userId,content,image}
 */
async function hotComment(blogId) {
  const result = await Comment.findAndCountAll({
    attributes: ['userId', 'blogId', 'content', 'createdAt'],
    where: {
      blogId
    }
  })
  let blogList = result.rows.map(row => row.dataValues)
  return blogList
}

/**
 * 创建微博
 * @param {object} param0 创建微博所需参数 {userId,content,image}
 */
async function createBlog({ userId, content, image, author, reprintContent, isReprint, authorBlogId }) {

  const result = await Blog.create({
    userId,
    content,
    image,
    author,
    reprintContent:reprintContent,
    isReprint: isReprint
  })
  if (authorBlogId != -1) {
    await Blog.update({ reprintCount: Sequelize.literal('reprintCount+1') }, {
      where: {
        id: authorBlogId
      }
    })
  }
  result.dataValues.comments = []
  result.dataValues.commentsCount = 0
  result.dataValues.isFollower = true
  result.dataValues.isTop = false
  result.dataValues.tops = 0
  
  if (result.dataValues.image) {
    result.dataValues.image = result.dataValues.image.split(',')
  } else {
    result.dataValues.image = []
  }
  
  result.dataValues = formatBlog(result.dataValues)
  return result.dataValues
}
async function getComment({ blogId, userId, index }) {
  const hotResult = await Blog.findOne({
    where: {
      id:blogId
    },
    include: [
      {
        model: Comment,
        attributes: ['userId', 'blogId', 'content', 'createdAt', 'id'],
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
  const result = await Blog.findOne({
    where: {
      id: blogId
    },
    include: [
      {
        model: Comment,
        order:[['id','desc']],
        limit: 10, // 每页多少条
        offset: 10 * index, // 跳过多少条
        attributes: ['userId', 'blogId', 'content', 'createdAt', 'id'],
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
  let hotBlogList = []
  let list = []
  hotBlogList.push(hotResult.dataValues)
  list.push(result.dataValues)
  //获取用户点赞评论数
  const commenttopResult = await CommentTop.findAndCountAll({
    where: {
      userId,
    },
    attributes: ['commentId']
  })
  const commentTopArr = commenttopResult.rows

  //commentsCount TopCount 
  hotBlogList.forEach(blogItem => {

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

  list.forEach(blogItem => {

    //评论
    if (blogItem.comments.length > 0) {
      blogItem.commentsCount = blogItem.comments.length

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
  const hotList = hotBlogList[0].comments
  list = list[0].comments
  return [
    hotList,list
  ]
}
module.exports = {
  getBlogListByUser, createBlog, hotComment, getUserInfoByUserName, getHotBlogList, getWbDetils, getComment
}

//格式化评论时间
// blogList.forEach(blogItem => {
//   if (blogItem.comments.length > 0) {
//     blogItem.comments.forEach(commentsItem => {
//       const createdAtFormat = timeFormat(commentsItem.dataValues.createdAt)
//       commentsItem.dataValues.createdAtFormat = createdAtFormat
//     })
//   }
// })