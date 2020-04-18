import Router from 'koa-router'
import passport from '../lib/passport'
import { validator } from 'koa-router-joi-validator'

import { App } from '../../database/entity/App'

const router = new Router()

router.get('/apps', async (ctx, next) => {
  const apps = await App.find()

  const data = {}
  for (const item of apps) {
    data[item.key] = item.value
  }

  ctx.body = data
})

const postSchema = {
  keys: {
    type: 'array',
    options: {
      required: true
    }
  },
  memo: {
    type: 'string',
    options: {}
  }
}

router.post('/apps', passport.authenticate('jwt', { session: false }),
  validator(postSchema), async (ctx, next) => {
    const body = ctx.request.body || {}
    const keys = body.keys || []

    // key で指定したものを上書きしていく
    const items = []
    for (const key of keys) {
      const app = await App.findOrCreate({ key: key })
      app.value = body[key]
      await app.save()
      items.push(app)
    }

    ctx.body = {
      items: items
    }
  })

export default router
