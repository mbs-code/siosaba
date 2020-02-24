
import Router from 'koa-router'
import SearchQueryBuilder from '../lib/SearchQueryBuilder'

import { Channel } from '../../database/entity/Channel'
import { ChannelStat } from './../../database/entity/ChannelStat'
import { ChannelMeta } from './../../database/entity/ChannelMeta'

const router = new Router()
router.get('/', async (ctx, next) => {
  const { query, page, size } = SearchQueryBuilder.builder(ctx.query, Channel, 'channel')
    .search('text', ['key', 'title', 'description'])
    .pagination()
    .build()

  const { 0: items, 1: count } = await query.getManyAndCount()
  ctx.body = {
    items: items,
    length: size,
    totalLength: count,
    page: page,
    totalPages: Math.ceil(count / size)
  }
})

router.get('/:id', async (ctx, next) => {
  const channel = await Channel.findOneOrFail({ id: ctx.params.id })
  ctx.body = channel
})

router.get('/:id/metas', async (ctx, next) => {
  const metas = await ChannelMeta.find({ channelId: ctx.params.id })
  ctx.body = metas
})

router.get('/:id/stats', async (ctx, next) => {
  const stats = await ChannelStat.find({ channelId: ctx.params.id })
  ctx.body = stats
})

export default router
