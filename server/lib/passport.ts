import passport from 'koa-passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'

var opts: any = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'secret'
}

passport.use(new LocalStrategy(function (username, password, done) {
  console.log(`{ user: ${username}, passwd: ${'*'.repeat(password.length)}`)
  return done(null, { name: 'admin user' })
}))

passport.use(new JwtStrategy(opts, function (jwtPayload, done) {
  // console.log('payload', jwtPayload)
  return done(null, jwtPayload)
}))

export default passport
