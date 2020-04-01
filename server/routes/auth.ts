import Router from 'koa-router'
import passport from '../lib/passport'

import jwt from 'jsonwebtoken'

const router = new Router()

router.post('/login', passport.authenticate('local', { session: false }), async (ctx, name) => {
  console.log('user', ctx.state.user)

  const payload = ctx.state.user
  const token = jwt.sign(payload, 'secret')
  ctx.body = {
    user: ctx.state.user,
    token: token
  }
})

router.get('/secure', passport.authenticate('jwt', { session: false }), async (ctx, next) => {
  console.log('user', ctx.state.user)
  ctx.body = {
    message: 'You are logged in.',
    user: ctx.state.user
  }
})

export default router
