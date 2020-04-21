
import Router from 'koa-router'
import passport from '../../lib/passport'

import rll from 'read-last-lines'

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

router.get('/errorLog', passport.authenticate('jwt', { session: false }), async (ctx, next) => {
  let text = await rll.read('./logs/error.log', 30)

  // 念のため api key とかを削除
  text = hideAsterisk(text, process.env.GOOGLE_API_KEY)
  text = hideAsterisk(text, process.env.DB_PASSWORD)
  text = hideAsterisk(text, process.env.API_ADMIN_USERNAME)
  text = hideAsterisk(text, process.env.API_ADMIN_PASSWORD)

  ctx.body = text
})

export default router
