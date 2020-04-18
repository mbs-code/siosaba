import Router from 'koa-router'
import passport from '../../lib/passport'
import { getConnection } from 'typeorm'

interface tableStatus {
  name: string,
  rows: number,
  length: number,
  rowLength: number,
  dataLength: number,
  indexLength: number,
  autoIncrement: number
}

const router = new Router()

router.get('/status', passport.authenticate('jwt', { session: false }), async (ctx, next) => {
  const conn = getConnection()
  const dbName = conn.driver.database

  const tables = await conn.query('SELECT ' +
    'TABLE_NAME AS name, TABLE_ROWS AS rowLength, DATA_LENGTH AS dataLength, INDEX_LENGTH AS indexLength, AUTO_INCREMENT AS autoIncrement ' +
    `FROM information_schema.tables WHERE table_schema = '${dbName}' ORDER BY table_name;`)

  const formatTables = tables.map((e: tableStatus) => {
    e.rows = Number(e.rowLength)
    e.length = Number(e.dataLength) + Number(e.indexLength)
    e.dataLength = Number(e.dataLength)
    e.indexLength = Number(e.indexLength)
    e.autoIncrement = Number(e.autoIncrement)
    return e
  })

  const length = formatTables.reduce((acc: number, current: any) => acc + current.length, 0)

  ctx.body = {
    status: 'ok',
    name: dbName,
    length: length,
    tables: formatTables
  }

  // const { 0: items, 1: count } = await query.getManyAndCount()
  // ctx.body = {
  //   items: items,
  //   length: size,
  //   totalLength: count,
  //   page: page,
  //   totalPages: Math.ceil(count / size)
  // }
})

export default router
