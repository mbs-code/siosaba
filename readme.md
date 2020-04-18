# siosaba

YouTube の動画情報を収集する鯖側のAPIです。

## Setup

``` console
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

##### Debug mode
```
$ npm run dev
# equal to $ npm run start -- --port=3001 --batch=false --dump=true
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
