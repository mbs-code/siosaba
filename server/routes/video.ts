import Router from 'koa-router'
import SearchQueryBuilder from '../lib/SearchQueryBuilder'

import { Video } from '../../database/entity/Video'
import { VideoStat } from './../../database/entity/VideoStat'
import { VideoMeta } from './../../database/entity/VideoMeta'
import { VideoStatus } from './../../database/entity/type/VideoStatus'
import { VideoType } from './../../database/entity/type/VideoType'

const router = new Router()
router.get('/', async (ctx, next) => {
  const qb = SearchQueryBuilder.builder(ctx.query, Video, 'video')
    .search('text', ['key', 'title', 'description'])
    .enum('type', VideoType)
    .enum('status', VideoStatus)
    .untilDatetime('end', 'startTime')
    .sinceDatetime('start', 'endTime')
    .pagination()
    .build()

  const videos = await qb.getMany()
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
