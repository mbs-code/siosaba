
import Router from 'koa-router'
import SearchQueryBuilder from '../lib/SearchQueryBuilder'
import { MoreThan } from 'typeorm'
import dayjs from 'dayjs'
import yn from 'yn'

import { Channel } from '../../database/entity/Channel'
import { ChannelStat } from './../../database/entity/ChannelStat'
import { ChannelMeta } from './../../database/entity/ChannelMeta'

const router = new Router()
router.get('/', async (ctx, next) => {
  const fulltext = yn(ctx.query.fulltext)
  const searchColumn = ['key', 'title', 'channel.title']
  if (fulltext) searchColumn.push('description')

  const { query, page, size } = SearchQueryBuilder.builder(ctx.query, Channel, 'channel')
    .search('text', searchColumn)
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
  const all = yn(ctx.query.all) || false

  const query: any = {
    channelId: ctx.params.id
  }

  if (!all) {
    const start = dayjs().subtract(7, 'day').toDate()
    query.createdAt = MoreThan(start)
  }

  const metas = await ChannelMeta.find(query)
  ctx.body = metas
})

router.get('/:id/stats', async (ctx, next) => {
  const all = yn(ctx.query.all) || false

  const query: any = {
    channelId: ctx.params.id
  }

  if (!all) {
    const start = dayjs().subtract(7, 'day').toDate()
    query.createdAt = MoreThan(start)
  }

  const stats = await ChannelStat.find(query)
  ctx.body = stats
})

export default router
