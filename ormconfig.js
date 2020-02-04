module.exports = {
  type: 'mysql',
  charset: process.env.DB_CHARSET,
  timezone: process.env.DB_TIMEZONE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  debug: false,
  logging: false,
  synchronize: false,
  entities: [
    'database/entity/**/*.ts'
  ],
  migrations: [
    'database/migration/**/*.ts'
  ],
  subscribers: [
    'database/subscriber/**/*.ts'
  ]
}
