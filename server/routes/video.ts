
import * as Router from 'koa-router'

import { Video } from '../../database/entity/Video'
import { VideoStat } from './../../database/entity/VideoStat'
import { VideoMeta } from './../../database/entity/VideoMeta'

const router = new Router()
router.get('/', async (ctx, next) => {
  const videos = await Video.find()
  ctx.body = videos
})

router.get('/:id', async (ctx, next) => {
  const video = await Video.findOneOrFail({ id: ctx.params.id })
  ctx.body = video
})

router.get('/:id/metas', async (ctx, next) => {
  const metas = await VideoMeta.find({ videoId: ctx.params.id })
  ctx.body = metas
})

router.get('/:id/stats', async (ctx, next) => {
  const stats = await VideoStat.find({ videoId: ctx.params.id })
  ctx.body = stats
})

export default router
