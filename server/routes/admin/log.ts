
import Router from 'koa-router'
import passport from '../../lib/passport'

import rll from 'read-last-lines'
import paramUtil from '../../lib/paramUtil'

const router = new Router()

const hideAsterisk = function (text: string, hideText: string) {
  if (text && hideText) {
    if (text.indexOf(hideText) >= 0) {
      const join = '*'.repeat(hideText.length)
      return text.split(hideText).join(join)
    }
  }
  return text
}

router.get('/logs', passport.authenticate('jwt', { session: false }), async (ctx, next) => {
  const type = paramUtil.inArray(ctx.query.type, { arrays: ['trace', 'error'] }) || undefined
  const line = paramUtil.range(ctx.query.line, { min: 0, max: 100 }) || 30

  if (type) {
    let text = await rll.read(`./logs/${type}.log`, line)

    // 念のため api key とかを削除
    text = hideAsterisk(text, process.env.GOOGLE_API_KEY)
    text = hideAsterisk(text, process.env.DB_PASSWORD)
    text = hideAsterisk(text, process.env.API_ADMIN_USERNAME)
    text = hideAsterisk(text, process.env.API_ADMIN_PASSWORD)

    ctx.body = text
  }
})

export default router
