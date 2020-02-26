const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const { SESSION_SECRET_KEY } = require('./conf/secreKeys')
const session = require('koa-generic-session')
const redisStore = require('koa-redis')
const REDIS_CONF = require('./conf/db')
const { isProd } = require('./utils/env')
const koaStatic = require('koa-static')
const path = require('path')

//路由
const commentAPI = require('./routes/api/comment')
const userApi = require('./routes/api/user')
const homeApi = require('./routes/api/home')
const utilsApi = require('./routes/api/utils')
const publicApi = require('./routes/api/public')
// error handler
let onerrorConf = {}
if (isProd) {
  onerrorConf = {
    redirect: '/404'
  }
}
onerror(app, onerrorConf)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())

app.use(koaStatic(__dirname + '/public'))
app.use(koaStatic(path.join(__dirname,'..','uploadFiles')))

app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))


//session 配置
app.keys = [SESSION_SECRET_KEY]
app.use(session({
  key: 'weibo.sid', //cookie name 默认是koa.sid
  prefix: 'weibo:sess:', //redis key的前缀，默认是'koa:sess:'
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge:24*60*60*1000 //ms
  },
  store: redisStore({
    all: `${REDIS_CONF.host}:${REDIS_CONF.port}`
  })
}))



//routes 
app.use(commentAPI.routes(), commentAPI.allowedMethods())
app.use(userApi.routes(), userApi.allowedMethods())
app.use(utilsApi.routes(), utilsApi.allowedMethods())
app.use(homeApi.routes(), homeApi.allowedMethods())
app.use(publicApi.routes(), publicApi.allowedMethods())
//404必须注册到所有路下面

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
})

module.exports = app
