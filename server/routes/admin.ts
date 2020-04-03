
import Router from 'koa-router'
import passport from '../lib/passport'
import { validator } from 'koa-router-joi-validator'

import ChannelInserter from '../../src/inserter/ChannelInserter'
import { google } from 'googleapis'

const router = new Router()

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.GOOGLE_API_KEY
})

const addChannelSchema = {
  text: {
    type: 'string',
    options: {
      required: true,
      min: 1
    }
  }
}

router.post('/addChannel', passport.authenticate('jwt', { session: false }),
  validator(addChannelSchema), async (ctx, next) => {
    const body = ctx.request.body || {}
    const text = body.text

    const cids = text.split(' ')

    // channel insert
    const ci = new ChannelInserter(youtube)
    const channels = await ci.exec({ ids: cids })

    const fcids = channels.map(e => e.key)

    ctx.body = {
      message: 'success',
      inputIds: cids,
      outputIds: fcids,
      items: channels
    }
  })

export default router
