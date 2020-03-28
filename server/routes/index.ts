import Router from 'koa-router'

import channel from './channel'
import video from './video'
import admin from './admin'

const router = new Router()
router.use(channel.prefix('/channels').routes())
router.use(video.prefix('/videos').routes())
router.use(admin.prefix('/admin').routes())

export default router
