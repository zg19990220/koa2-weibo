/**
 * @description 微博数据相关方法
 */
const ejs = require('ejs')
const path = require('path')
const fs = require('fs')

//获取blog-list.ejs 文件内容
const BLOG_LIST_TPL = fs.readFileSync(
  path.join(__dirname,'..','views','widgets','blog-list.ejs')
).toString()

/**
 * 根据bloglist 渲染html字符串
 * @param {Array} blogList 微博列表
 * @param {boolen} canReply 是否可以回复
 */
function getBlogListStr(blogList = [], canReply = false) {
  return ejs.render(BLOG_LIST_TPL, {
    blogList,
    canReply
  } )
}

module.exports = {
  getBlogListStr
}