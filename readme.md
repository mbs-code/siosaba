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
$ npm run start -- --host=localhost --port=3000
```
