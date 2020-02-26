/**
 * @description blog数据校验
 * @author 曾刚
 */
const validate = require('./_vaildate')

const SCHEMA = {
  type: 'object',
  properties: {
    content: {
      type: 'string',
      minLength:1
    },
    image: {
      type: 'string'
    }
  }
}

//执行校验
function blogValidate(data = {}) {
  return validate(SCHEMA, data)
}

module.exports = blogValidate