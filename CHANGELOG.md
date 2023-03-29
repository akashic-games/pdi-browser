# CHANGELOG

## unreleased changes
* `Platform#usingPointerEvents` を追加

## 2.4.4
* `MouseHandler` と `TouchHandler` を `PointerPointerEvent` に統合するように
* `InputHandlerLayer` に付加されていたクラス名 `input-handler` を削除
* `InputHandlerLayer` に付加されていた tabindex の指定を削除

## 2.4.3
* HTMLAudioPlugin で offset を利用できるように

## 2.4.2
* AudioAsset の拡張子を AudioAsset#hint で指定できるように

## 2.4.1
* WebAudioPlugin で music がループ再生されない問題を修正

## 2.4.0
* @akashic/pdi-types@1.5.0 に追従

## 2.3.2
* `FinalizationRegistry` がない環境で例外が発生する問題を修正

## 2.3.1
* 参照されなくなった HTMLCanvasElement のメモリリークを検知して開放するように

## 2.3.0
* @akashic/pdi-types@1.4.0 に追従

## 2.3.0-beta.0
* @akashic/pdi-types@1.4.0-beta.1 に追従

## 2.2.3
* `AudioPlayer#_muted` が未使用のため `_muted` を変更する箇所を削除

## 2.2.2
* @akashic/trigger 更新に伴うバージョンアップ

## 2.2.1
* `AudioPlayer` の生成時、 volume と mute に `AudioSystem` の値を設定している問題を修正

## 2.2.0
* @akashic/pdi-types@1.3.0 に追従
* `SVGImageAsset` の実装を追加

## 2.1.0
* @akashic/amflow@3.1.0, @akashic/pdi-types@1.2.0 に追従

## 2.0.0
* @akashic/akashic-engine@3.0.0 への追従対応

## 2.0.0-beta.11
* `CanvasSurfaceContext#restore()` で描画状態を復元された時に変数 `_contextXXXXX` が現在の状態を保持したままになる問題を修正

## 2.0.0-beta.10
* @akashic/akashic-engine@3.0.0-beta.30 への追従対応

## 2.0.0-beta.9
* シェーダの `uniform.value` で `Float32Array` を取得できない問題を修正

## 2.0.0-beta.8
* @akashic/pdi-types@1.0.1 への追従対応

## 2.0.0-beta.7
* @akashic/pdi-types を利用するように

## 2.0.0-beta.6
* @akashic/akashic-engine@3.0.0-beta.24 への追従対応

## 2.0.0-beta.5
* @akashic/akashic-engine@3 への追従対応

## 2.0.0-beta.4
* @akashic/akashic-engine@3.0.0-beta.18 までに追従

## 2.0.0-beta.3
* `g.Glyph` が deprecated になったので、`g.GlyphLike` に置き換える対応

## 2.0.0-beta.2
* 各AudioPlayerの `_calculateVolume()` の計算条件を `AudioPlayer#_muted` から `AudioSystem#_muted`へ変更
* 未使用の `PostMessageAudioPlugin` 関連を削除

## 2.0.0-beta.1
* AudioAssetにクエリパラメータを付与可能とする対応
* `Platform#setRendererRequirement()` を2度呼び出したとき、null参照によって例外が発生する問題を修正

## 1.11.1
* `CanvasSurfaceContext#restore()` で描画状態を復元された時に変数 `_contextXXXXX` が現在の状態を保持したままになる問題を修正

## 1.11.0
* @akashic/amflowのmajor更新と@akashic/playlogのminor更新に伴うバージョンアップ

## 1.10.1
* シェーダの `uniform.value` で `Float32Array` が取得できない問題を修正

## 1.10.0
* @akashic/amflowと@akashic/playlogのmajor更新に伴うバージョンアップ

## 1.9.0
* @akashic/amflowと@akashic/playlogのmajor更新に伴うバージョンアップ

## 1.8.3
* AudioAssetにクエリパラメータを付与できるように修正

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
