import Router from 'koa-router'

import addChannel from './addChannel'
import status from './status'

const router = new Router()
router.use(addChannel.routes())
router.use(status.routes())

export default router
