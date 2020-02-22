import Router from 'koa-router'

import channel from './channel'
import video from './video'

const router = new Router()
router.use(channel.prefix('/channels').routes())
router.use(video.prefix('/videos').routes())

export default router
