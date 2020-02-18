# CHANGELOG

## 1.8.2
* Platform#setRendererRequirement() を二度以上呼び出すと例外が発生する問題を修正

## 1.8.1
* MouseHandler が画面外でキャンセルされてしまう問題を修正

## 1.8.0
* @akashic/akashic-engineのminor更新に伴うバージョンアップ

## 1.7.2
* `Renderer#drawSystemLabel()` が正常に描画できていなかった問題を修正

## 1.7.1
* バックサーフェスの描画時に context の状態が正常に初期化されていなかった問題を修正

## 1.7.0
* @akashic/akashic-engineのminor更新に伴うバージョンアップ

## 1.6.2
* `Context2DRenderer` のパフォーマンスを向上

## 1.6.1
* ProxyAudioPlugin 追加

## 1.6.0
* @akashic/amflowのminor更新に伴うバージョンアップ

## 1.5.14
* surfaceの削除と音量ミュートを実行する `Platform#destroy()` を追加

## 1.5.13
* Edge/Safari でゲームが実行できないことがある (new AudioContext() が null を返すことがある) 問題を修正

## 1.5.12
* ScriptAsset の最終行が1行コメントの場合にエラーになる問題を修正

## 1.5.11
* ImageAsset#hint に `untainted: true` が与えられたときに img タグに対して `crossOrigin = "anonymous"` を付加するように

## 1.5.10
* ゲーム開始前にタッチイベントが発生した場合、エラーになるケースを修正

## 1.5.9
* `crossOrigin` 属性の追加を revert

## 1.5.8
* window.location.protocol が `http:`, `https:` 以外の場合はHTMLImageAsset#\_load 時に img タグに対して `crossOrigin = "anonymous"` を付加しないように

## 1.5.7
* HTMLImageAsset#\_load 時に img タグに対して `crossOrigin = "anonymous"` を付加するように

## 1.5.6
* WebAudioPlayer#stop, HTMLAudioPlayer#stop で currentAudio が存在しない場合でも g.AudioPlayer#stop を呼び出すように修正

## 1.5.5
* 初期リリース
