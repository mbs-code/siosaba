import Router from 'koa-router'

import channel from './channel'
import video from './video'

const router = new Router()
router.use(channel.prefix('/channel').routes())
router.use(video.prefix('/video').routes())

export default router
