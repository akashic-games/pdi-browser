"use strict";

// WebAudioのブラウザ間の差を吸収する
// Compatible Table: http://compatibility.shwups-cms.ch/en/home?&property=AudioParam.prototype
// http://qiita.com/mohayonao/items/d79e9fc56b4e9c157be1#polyfill
// https://github.com/cwilso/webkitAudioContext-MonkeyPatch
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Porting_webkitAudioContext_code_to_standards_based_AudioContext
// eslint-disable-next-line @typescript-eslint/naming-convention
const AudioContext = window.AudioContext || window.webkitAudioContext;

interface ExtWindow extends Window {
	__akashic__: {
		audioContext: AudioContext;
	};
}

declare const window: ExtWindow;

module WebAudioHelper {
	// AudioContextをシングルトンとして取得する
	// 一つのページに一つのContextが存在すれば良い
	export function getAudioContext(): AudioContext {
		if (!window.__akashic__) {
			Object.defineProperty(window, "__akashic__", {
				value: {},
				enumerable: false,
				configurable: false,
				writable: false
			});
		}
		let ctx = window.__akashic__.audioContext;
		if (!(ctx instanceof AudioContext)) {
			ctx = window.__akashic__.audioContext = new AudioContext();
			WebAudioHelper._workAroundSafari();
		}
		return ctx;
	}

	export function createGainNode(context: AudioContext): GainNode {
		if (context.createGain) {
			return context.createGain();
		}
		return context.createGainNode();
	}

	export function createBufferNode(context: AudioContext): AudioBufferSourceNode {
		const sourceNode = context.createBufferSource();
		// @ts-ignore startがあるなら問題ないので、拡張しないで返す
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
			WebAudioHelper.getAudioContext().createBufferSource().start(0);
		}, true);
	}
}

export = WebAudioHelper;
