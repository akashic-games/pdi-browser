# CHANGELOG

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
