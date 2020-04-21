import Router from 'koa-router'

import addChannel from './addChannel'
import status from './status'
import log from './log'

const router = new Router()
router.use(addChannel.routes())
router.use(status.routes())
router.use(log.routes())

export default router
