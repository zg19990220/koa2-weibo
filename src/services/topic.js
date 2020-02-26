/**
 * @description topic services
 */
const { Blog, User, UserRelation, Comment, Topic, Top, CommentTop } = require('../db/model/index')
const { formatUser, formatBlog } = require('./_format')
const { timeFormat } = require('../utils/dt')
const Sequelize = require('sequelize')

async function createTopic(blogId, title) {
  const result = await Topic.create({
    title, blogId
  })

  return result
}
async function findAllTopic() {
  const result = await Topic.findAndCountAll({
    order: [
      ['id', 'desc']
    ],
  })
  let arr = []
  let list = []
  result.rows.map(item => {
    arr.push(item.dataValues.title)
  })
  console.log(arr)

  arr.sort()
  for (var i = 0; i < arr.length;) {
    var count = 0
    for (var j = i; j < arr.length; j++) {
      if (arr[i] === arr[j]) {
        count++
      }
    }
    list.push({
      title: arr[i],
      count: count
    })
    i += count
  }
  list.sort((a, b) => {
    return b.count - a.count
  })
  list = list.slice(0, 9)
  return list
}

async function findRankByTitle(title, userId, index, wbLastTime) {
  
  const whereOpt = {
    title
  }
  if (wbLastTime) {
    whereOpt.createdAt = {
      [Sequelize.Op.lte]: wbLastTime
    }
  }
  let result = await Topic.findAndCountAll({
    order: [
      ['id', 'desc']
    ],
    limit: 5, // 每页多少条
    offset: index * 5, // 跳过多少条
    where: whereOpt,
    include: [
      {
        model: Blog,
        order: [
          ['id', 'desc']
        ],
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
      }

    ]
  })
  let blogList = result.rows.map(item => {
    return item.dataValues.blog.dataValues
  })
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
  // blogList.sort((a, b) => {
  //   return b.tops - a.tops
  // })
  // console.log(blogList)
  blogList.forEach(item => {
    if (item.image) {
      item.image = item.image.split(',')
    } else {
      item.image = []
    }
  })
  return blogList
}

module.exports = {
  createTopic, findAllTopic, findRankByTitle
}
// include: [
//   {
//     model: Blog,
//     attributes: ['id', 'userId', 'content', 'image', 'author', 'reprintContent', 'isReprint'],
//     include: [
//       {
//         model: User
//       }
//     ]
//   }
// ]