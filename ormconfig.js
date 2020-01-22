module.exports = {
  type: 'mysql',
  charset: 'utf8mb4',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  debug: false,
  logging: true,
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
