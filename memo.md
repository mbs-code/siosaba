

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
  - subscriber ってのはよく分からん
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
  - 実際は別ライブラリを使用している
  - [typestack/class\-validator](https://github.com/typestack/class-validator)
- decorator(@) が全て
  - [TypeORM - Decorator Reference](https://typeorm.io/#/decorator-reference)


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
- typescript + mysql
  - ts-node-dev
  - ESLint + ESLint + typescript plugin (JavaScript Standard Style)
- typeorm
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
$ npm install --save-dev @types/node
```

`tsconfig.json` に追記
```json
{
  "emitDecoratorMetadata": true,
  "experimentalDecorators": true
}
```

ここで一旦 git commit
- `.gitignore` を忘れずに
- [TypeScript\-Node\-Starter/\.gitignore at master · microsoft/TypeScript\-Node\-Starter](https://github.com/microsoft/TypeScript-Node-Starter/blob/master/.gitignore)