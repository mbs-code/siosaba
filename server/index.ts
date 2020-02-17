import { createConnection } from 'typeorm'
import 'reflect-metadata'

import * as yn from 'yn'

import * as Koa from 'koa'
import { userAgent, UserAgentContext } from 'koa-useragent' // eslint-disable-line no-unused-vars

import * as tableify from 'tableify'

import router from './routes'
import Cron from '../src/cron'

// init database
createConnection().then(async (connection) => {
  const app = new Koa()

  // error handlong
  app.use(async (ctx, next) => {
    try {
      await next()
    } catch (err) {
      ctx.status = err.status || 500
      ctx.body = err.message
      ctx.app.emit('error', err, ctx)
    }
  })

  // visualize APi table
  app.use(userAgent)
  app.use<Koa.BaseContext, UserAgentContext>(async (ctx, next) => {
    await next()
    if (ctx.userAgent.isDesktop) {
      ctx.type = 'text/html'
      ctx.body = tableify(ctx.body)
      // 簡易CSS
      ctx.body += '<style>'
      ctx.body += 'table{border-collapse: collapse;}'
      ctx.body += 'td{white-space:nowrap; overflow:hidden; text-overflow: ellipsis; min-width: 40px; max-width:400px; border: solid 1px gray;}'
      ctx.body += '.array table{display: block; overflow-y:scroll; height: 2em;}'
      ctx.body += '</style>'
    }
  })

  // routing
  app.use(router.routes())
  app.use(router.allowedMethods())
  app.use(async (ctx, next) => {
    ctx.body = 'no route!'
  })

  // awake server
  app.listen(3000)
  console.log('listen to http://localhost:3000')

  if (yn(process.env.RUN_BATCH)) {
    // awake batch process
    const cron = new Cron() // eslint-disable-line no-unused-vars
    console.log('run cron batch')
  }
}).catch(error => console.log('TypeORM connection error: ', error))
