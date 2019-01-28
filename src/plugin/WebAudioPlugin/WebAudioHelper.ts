"use strict";

// WebAudioのブラウザ間の差を吸収する
// Compatible Table: http://compatibility.shwups-cms.ch/en/home?&property=AudioParam.prototype
// http://qiita.com/mohayonao/items/d79e9fc56b4e9c157be1#polyfill
// https://github.com/cwilso/webkitAudioContext-MonkeyPatch
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Porting_webkitAudioContext_code_to_standards_based_AudioContext
var AudioContext = window.AudioContext || window.webkitAudioContext;
var singleContext: AudioContext = null;
module WebAudioHelper {
	// AudioContextをシングルトンとして取得する
	// 一つのページに一つのContextが存在すれば良い
	export function getAudioContext(): AudioContext {
		if (!singleContext) {
			singleContext = new AudioContext();
			WebAudioHelper._workAroundSafari();
		}
		return singleContext;
	}

	export function createGainNode(context: AudioContext): GainNode {
		if (context.createGain) {
			return context.createGain();
		}
		return context.createGainNode();
	}

	export function createBufferNode(context: AudioContext): AudioBufferSourceNode {
		var sourceNode = context.createBufferSource();
		// startがあるなら問題ないので、拡張しないで返す
		if (sourceNode.start) {
			return sourceNode;
		}
		// start/stopがない環境へのエイリアスを貼る
		(<any>sourceNode).start = (<any>sourceNode).noteOn;
		(<any>sourceNode).stop = (<any>sourceNode).noteOff;
		return sourceNode;
	}

	// Safari対策ワークアラウンド
	export function _workAroundSafari(): void {
		document.addEventListener("touchstart", function touchInitializeHandler() {
			document.removeEventListener("touchstart", touchInitializeHandler);
			singleContext.createBufferSource().start(0);
		}, true);
	}
}

export = WebAudioHelper;
