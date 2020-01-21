

# 開発環境

- [TypeStrong/ts\-node](https://github.com/TypeStrong/ts-node)
- [whitecolor/ts\-node\-dev](https://github.com/whitecolor/ts-node-dev)
- [typeorm / typeorm](https://github.com/typeorm/typeorm)
  - Doc: [TypeORM](https://typeorm.io/#/)


# メモ

----
### type orm について
- typeorm を使っていく
- model じゃなくて entity で管理する感じ？
  - DB sync などもできる
  - entity は継承可能
  - ツリー構造専用の entity がある
    - [TypeORM - Tree Entities](https://typeorm.io/#/tree-entities)
  - decorator(@) と json 形式の二種類の定義方法がある
    - js 方式は json 指定のみ
  - view を entity に定義できる(read only?)
  - read only な column も作れそう
- CRUD は entity manager を使用する
- migration はもちろんある
  - entity と synchronize することも可能 
  - query runner で create db も可能
  - 既存のテーブルから引用も可能
    - [TypeORM - Using CLI - User content generate a migration from existing table schema](https://typeorm.io/#/using-cli#user-content-generate-a-migration-from-existing-table-schema)
- unique 制約は index に内包される
- 空間インデックス？(初耳)
  - どうやら座標やポリゴンのことらしい
- model hook 系は entity listener
  - after load とか
  - subscriber ってのがよく分からん TODO:
- logger も標準装備
  - custom logger で別出力も可能
- なんなら CLI で 生SQL も叩ける
- Active Record と Data Mapper 方式
  - entity 基準で操作するのが active record
  - repository / entity manager で間接的に操作するのが data mapper 方式？
  - 当然 AR 方式だよなぁ！
    - 公式では巨大なプロジェクトは data mapper が良いって書いてある
    - でもシンプルさを保てるのは active record だとさ
    - まぁどっちかが優れてるなら両方用意しないしお好みでってことかな
- transaction などを除いた mongoDB も扱える！！
  - まだ実験的らしい
  - コードそのままで切り替えれるかはしらん
- validation も entity に組み込める(神かな？)
  - 実装は別ライブラリを使用している
  - [typestack/class\-validator](https://github.com/typestack/class-validator)
- decorator(@) が全て
  - [TypeORM - Decorator Reference](https://typeorm.io/#/decorator-reference)

- ソース読んできた
  - BaseEntity は内部で Repository Manager を呼び出してる
  - Repository は find, save などの命令のみ保持
  - 実装はそこから entity manager を呼び出してる
  - save() は更に entity persist executor を呼び出してる (持続する？永続性？)
    - パーサーかなこれ
    - 数字がなにしてるか分かんないから読めねぇ… 
    - mode ってのに save や remove を指定してる？
    - [typeorm/EntityPersistExecutor\.ts at master · typeorm/typeorm](https://github.com/typeorm/typeorm/blob/master/src/persistence/EntityPersistExecutor.ts)
  - そこで query runner と subject builder を呼び出す
    - subject builder が 保存部分
      - subject ってので値読みしてるのかな
    - query runner は transaction とか
  - ソース引用して拡張できるかなって思ったけど、複雑すぎて自作したほうがコスト低そう

### ESlint について
- 昔は TSlint が使われてきたけど時代が変わったらしい
- [JavaScript Standard Style](https://standardjs.com/) ってのが自分に合ってる気がする
  - 以下引用
  - npm、GitHub、Elastic、Express、Electron などが使用
  - インデントはスペース2個
  - 文字列はシングルクォートで囲む
  - 未使用の変数は禁止
  - 文末のセミコロンは禁止
  - キーワードの後にスペースを入れる
  - 関数名の後にスペースを入れる
  - 値の比較に == ではなく === を使用
  - ただしobj == nullはnull || undefinedをチェックするために許容される
  - 常にNode.jsのerr引数をハンドル
  - ファイルの先頭に/* global */コメントでブラウザのグローバルオブジェクトを宣言

- 参考
  - [初心者向け TypeScript用にESLintとPrettierを導入する \- Qiita](https://qiita.com/y-w/items/dcf5fb4af52e990109eb#%E8%A3%9C%E8%B6%B3-%E3%82%A8%E3%83%A9%E3%83%BC-unable-to-resolve-path-to-module-%E3%81%AE%E8%A7%A3%E6%B1%BA%E7%AD%96)
  - [JavaScript Standard Styleのススメ \- Qiita](https://qiita.com/munieru_jp/items/ca16cbfa859468137d2e)



----
### 環境構築
- typescript
  - ESLint + typescript plugin (JavaScript Standard Style)
  - ts-node-dev
- typeorm + mysql
- koa
- axios, dayjs

でいいかな？

```bash
$ npm init
# 適当に enter で飛ばして、後で `private: true` を追記しておく

$ npm install --save-dev typescript ts-node ts-node-dev

$ npx eslint --init
? How would you like to use ESLint? To check syntax, find problems, and enforce code style
? What type of modules does your project use? JavaScript modules (import/export)
? Which framework does your project use? None of these
? Does your project use TypeScript? Yes
? Where does your code run? Browser
? How would you like to define a style for your project? Use a popular style guide
? Which style guide do you want to follow? Standard: https://github.com/standard/standard
? What format do you want your config file to be in? JSON
```

次は type orm 周り

```bash
$ npm install --save typeorm reflect-metadata mysql2
$ npm install --save-dev tsconfig-paths @types/node
```

`tsconfig.json` に追記
```json
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  }
```

ここで一旦 git commit
- `.gitignore` を忘れずに
- [TypeScript\-Node\-Starter/\.gitignore at master · microsoft/TypeScript\-Node\-Starter](https://github.com/microsoft/TypeScript-Node-Starter/blob/master/.gitignore)


----
### type orm の設定構築

.env の実装 (パスワード丸出しはまずいからね)
[motdotla/dotenv](https://github.com/motdotla/dotenv)

```bash
$ npm install --save dotenv
$ npm install --save-dev @types/dotenv
```

[TypeORM - Using Configuration Sources](https://typeorm.io/#/using-ormconfig)

`ormconfig.js` の作成
ディレクトリは `database/*` にしておく

```js
module.exports = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
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
```
`.env` を作成
`.env.example` も作っておくと便利

```text
DB_HOST = ''
DB_PORT = 0

DB_NAME = ''
DB_USERNAME = ''
DB_PASSWORD = ''
```

npm script で dotenv を外部読み込みする
`package.json` の変更

```json
"scripts": {
  "test": "ts-node -r dotenv/config ./src/test.ts"
}
```

[プログラム内でdotenvを読み込むのをやめた話 \| WEB EGG](https://blog.leko.jp/post/you-might-not-need-dotenv-in-source/)

### type orm を組んでいく

- この辺を参考に entity を生成する
  - [TypeORM - Entities](https://typeorm.io/#/entities)
  - [typeorm/decorator\-reference\.md at master · typeorm/typeorm](https://github.com/typeorm/typeorm/blob/master/docs/decorator-reference.md)
  - [TypeORM - How do I change a column name in the database?](https://typeorm.io/#/faq/how-do-i-change-a-column-name-in-the-database)

- active record で扱うなら `BaseEntity` を extend するべし
- デコレーター系
  - インクリメント ID は `@PrimaryGeneratedColumn()`
  - index と unique は `@Index({ unique: true })`
  - created at は `@CreateDateColumn()`
  - updated at は `@UpdateDateColumn()`
  - null 許容 は `@Column({ nullable: true })` , default: false
  - unsigned は `@Column({ unsigned: true })`
  - テーブル名変更は `@Entity('<Table Name>')`
  - カラム名変更は `@Column({ name: <Column Name> })`
  - カラムのDBでの型指定は `@Column({ type: '<Type Name>' })`
    - mysql : bit, int, integer, tinyint, smallint, mediumint, bigint, float, double, double precision, dec, decimal, numeric, fixed, bool, boolean, date, datetime, timestamp, time, year, char, nchar, national char, varchar, nvarchar, national varchar, text, tinytext, mediumtext, blob, longtext, tinyblob, mediumblob, longblob, enum, set, json, binary, varbinary, geometry, point, linestring, polygon, multipoint, multilinestring, multipolygon, geometrycollection


### migration する

`package.json` に追記
`-r dotenv/config` は dotenv を使用する場合のみ
配列指定ってこれでいいのかな？

```json
"scripts": {
  "typeorm": "ts-node -r tsconfig-paths/register -r dotenv/config ./node_modules/typeorm/cli.js"
}
```

- 予め database を作っておく
- entity を基準に db table を生成する
  - `$ npm run typeorm -- schema:sync`


### Diff Entity の作成 (自作)

- 変更点を抽出できるやつ
- Laravel の isDirty みたいな感じの実装
- これがないと色々とね…

```ts
import { BaseEntity, AfterLoad, getConnection, AfterInsert, AfterUpdate, AfterRemove } from 'typeorm'

export class DiffEntity extends BaseEntity {

  private _raw: Object = undefined

  getChangeValues () {
    if (this._raw) {
      const keys = Object.keys(this._raw)

      const obj = {}
      for (const key of keys) {
        const nowVal = this[key]
        const rawVal = this._raw[key]
        if (nowVal !== rawVal) {
          obj[key] = { before: rawVal, after: nowVal }
        }
      }
      return obj
    }
    return undefined
  }

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  @AfterRemove()
  _pickupRawColumns () {
    const conn = getConnection()
    const columns = conn.getMetadata(this.constructor).ownColumns
    const array = columns.map(column => [column.propertyName, this[column.propertyName]])

    this._raw = array.reduce((obj, [key, val]) => {
      obj[key] = val
      return obj
    }, {})
  }
}
```

内部で生値を持って比較するだけ
`Entity.getChangeValues()` で変更点を取得する
戻り値は `{ key: { before: val1, after: val2 }}`

- [LaravelのEloquentでカラムの変更情報を取得 \- Qiita](https://qiita.com/tmf16/items/e9169b416ab4011a3a09)
- [Get all properties from a entity · Issue \#1764 · typeorm/typeorm](https://github.com/typeorm/typeorm/issues/1764)
- [Object\.fromEntries\(\) \- JavaScript \| MDN](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries)
- [fromentries/index\.js at master · feross/fromentries](https://github.com/feross/fromentries/blob/master/index.js)
