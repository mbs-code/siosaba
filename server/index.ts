import { createConnection } from 'typeorm'
import 'reflect-metadata'

import * as Koa from 'koa'
import * as Router from 'koa-router'
import { userAgent, UserAgentContext } from 'koa-useragent' // eslint-disable-line no-unused-vars

import * as tableify from 'tableify'

import routes from './routes'

createConnection().then(async (connection) => {
  const app = new Koa()
  const router = new Router()

  // visualize APi table
  app.use(userAgent)
  app.use<Koa.BaseContext, UserAgentContext>(async (ctx, next) => {
    await next()
    if (ctx.userAgent.isDesktop) {
      ctx.type = 'text/html'
      ctx.body = tableify(ctx.body)
    }
  })

  app.use(router.routes())
  app.use(router.allowedMethods())

  app.use(routes.routes())
  app.use(async (ctx, next) => {
    ctx.body = 'no route!'
  })

  app.listen(3000)
  console.log('listen to http://localhost:3000')
}).catch(error => console.log('TypeORM connection error: ', error))
