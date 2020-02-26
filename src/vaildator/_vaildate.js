/**
 * @description json schema校验
 * @author 曾刚
 */

const Ajv = require('ajv')
const ajv = new Ajv({
  // allErrors:true 输出所有的错误
})
/**
 * json schema校验
 * @param {Object} schema json schema 规则
 * @param {Object} data 待校验的数据
 */
function vaildate(schema, data={}) {
  const vaild = ajv.validate(schema, data)
  if (!vaild) {
    return ajv.errors[0]
  }
}

module.exports = vaildate