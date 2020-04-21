# siosaba

YouTube の動画情報を収集する鯖側のAPIです。

## Setup

``` bash
$ npm install

# edit env file
$ cp .env.example .env
$ vi .env

# create database
$ mysql
  CREATE DATABASE <db_name> DEFAULT CHARACTER SET utf8mb4;
$ npm db:sync

# listen localhost:3000
$ npm run start
```

##### Debug Mode
``` bash
$ npm run dev
```

##### PM2 Persistence (永続化)
``` bash
$ npm install -g pm2

# [any] to daemon
$ pm2 startup centos

# run pm2 
$ npm run pm2:start
# equal to $ pm2 start ./pm2.config.js
# equal to $ pm2 start "npm run start" --name 'siosaba'

# show console
$ pm2 log 'siosaba'

# stop pm2
$ pm2 stop 'siosaba'

# stop all
$ pm2 kill
```

## Configure

priority: `command-line` > `.env` > `default value`

|arg|short|.env key|description|default|
|:--|:--|:--|:--|:--|
|host|h|HOST|listen hostname|localhost|
|port|p|PORT|listen port number|3000|
|batch|b|RUN_BATCH|run background batch|false|
|cors|c|-|Use CORS: *|false|
|dump|d|-|show connection log|false|

## TypeORM Command Memo

- [typeorm/using\-cli\.md at master · typeorm/typeorm](https://github.com/typeorm/typeorm/blob/master/docs/using-cli.md)

|desc|command|
|:--|:--|
|Drop All Table|`$ npm run typeorm -- schema:drop`|
|Raw Query|`$ npm run typeorm -- query "SELECT * FROM USERS"`|
