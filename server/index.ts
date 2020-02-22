import {
  createConnection,
  Connection // eslint-disable-line no-unused-vars
} from 'typeorm'
import 'reflect-metadata'

import argv from 'argv'
import yn from 'yn'

import Koa from 'koa'
import cors from '@koa/cors'
import KoaLogger from 'koa-logger'

import tableify from 'tableify'

import router from './routes'
import Cron from '../src/cron'

// init command
const args = argv.option([
  { name: 'host', short: 'h', type: 'string', description: 'API Host name. (default: localhost)' },
  { name: 'port', short: 'p', type: 'int', description: 'API Port number. (default: 3000)' },
  { name: 'batch', short: 'b', type: 'boolean', description: 'Run background batch process. (default:false)' },
  { name: 'dump', short: 'd', type: 'boolean', description: 'Show dump connection logs' }
]).run()

process.env.TYPEORM_LOGGING = 'true'

// init database
createConnection().then(async (connection: Connection) => {
  // configure
  const host = args.options.host || process.env.HOST || 'localhost'
  const port = args.options.port || process.env.PORT || 3000
  const batch = yn(args.options.batch, { default: yn(process.env.RUN_BATCH, { default: false }) })
  const dump = yn(args.options.debug, { default: false })

  const app = new Koa()
  app.use(cors()) // TODO: add options

  // add dump debugger
  if (dump) {
    app.use(KoaLogger())
  }

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
  app.use(async (ctx, next) => {
    await next()
    if (yn(ctx.query.table)) {
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
  app.listen(port, host)
  console.log(`listen to http://${host}:${port}`)

  if (batch) {
    // awake batch process
    const cron = new Cron() // eslint-disable-line no-unused-vars
    console.log('run cron batch')
  }

  console.log('wait...')
}).catch(error => console.log('TypeORM connection error: ', error))
