/**
 * @description utlis controller
 */
const path = require('path')
const fse = require('fs-extra')
const { ErrorModel, SuccessModel } = require('../model/ResModel')
const { uploadFileSizeFailInfo } = require('../model/ErrorInfo')
const MIX_SIZE = 1024 * 1024 * 1024 * 10


// 文件夹存储目录
const DIST_FOLDER_PATH = path.join(__dirname,'..','..','uploadFiles')
/**
 * 
 * @param {string} name 
 * @param {string} type 
 * @param {Number} size 
 * @param {string} filePath 
 */
async function saveFile({ name, type, size, filePath }){
  if (size > MIX_SIZE) {
    //因为此时已经上传到服务器了，需要手动删除
    await fse.remove(filePath)
    return new ErrorModel(uploadFileSizeFailInfo)
  }

  //移动文件
  const fileName = Date.now() + '.' + name
  const distFilePath = path.join(DIST_FOLDER_PATH, fileName)
  await fse.move(filePath, distFilePath)
  return new SuccessModel({
    url: '/' + fileName
  })
}

module.exports = {
  saveFile
}