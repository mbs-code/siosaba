import passport from 'koa-passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'

import cryptoRandomString from 'crypto-random-string'

export const secretKey = process.env.TOKEN_SECRET_KEY || cryptoRandomString({ length: 10 })

const opts: any = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secretKey
}

passport.use(new LocalStrategy(function (username, password, done) {
  console.log(`login: { user: ${username}, passwd: ${'*'.repeat(password.length)} }`)

  // Admin user との照合
  const adminUser = process.env.API_ADMIN_USERNAME
  const adminPass = process.env.API_ADMIN_PASSWORD
  if (adminUser && adminPass) {
    if (username === adminUser && password === adminPass) {
      return done(null, { name: 'ADMIN' })
    }
  }

  return done(null, false) // failure
}))

passport.use(new JwtStrategy(opts, function (jwtPayload, done) {
  return done(null, jwtPayload)
}))

export default passport
