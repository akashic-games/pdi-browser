<p align="center">
<img src="https://raw.githubusercontent.com/akashic-games/pdi-browser/main/img/akashic.png"/>
</p>

# pdi-browser

**pdi-browser** は、 [akashic-pdi](https://github.com/akashic-games/akashic-pdi)のWebブラウザ向け実装です。

このモジュールは、 Akashic Engineの実行系([akashic-sandbox](https://github.com/akashic-games/akashic-sandbox)など)に組み込まれています。
**ゲーム開発者(Akashic Engineの利用者)がこのモジュールを直接利用する必要はありません**。

## インストール

Node.jsが必要です。次のコマンドでインストールできます。

```sh
npm install @akashic/pdi-browser
```

## ビルド方法

TypeScriptで書かれています。インストール後にビルドしてください。

```sh
npm install
npm run build
```

## 利用方法

`require()` してください。

```javascript
require("@akashic/pdi-browser");
require("@akashic/pdi-browser/lib/canvas");  // WebGLを利用するRenderer実装が不要な場合
```

## テスト方法

```sh
npm test
```

### jest によるユニットテスト

```sh
npm run jest:unit
```

### jest による E2E テスト

実行前に `npm run build` で `./build/pdi-browser.js` が生成されていることを確認してください。

```sh
npm run jest:e2e
```

#### レンダラの E2E テスト

Canvas, WebGL による E2E テストの描画結果は `./e2e/tests/renderer/results/` に出力されます。

## ライセンス
本リポジトリは MIT License の元で公開されています。
詳しくは [LICENSE](https://github.com/akashic-games/pdi-browser/blob/master/LICENSE) をご覧ください。

ただし、画像ファイルおよび音声ファイルは
[CC BY 2.1 JP](https://creativecommons.org/licenses/by/2.1/jp/) の元で公開されています。
