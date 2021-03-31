/* eslint-disable @typescript-eslint/no-unused-vars */
// 定義のみ必要なため no-unused-vars を無効とする。
interface Window {
	AudioContext: {
		prototype: AudioContext;
		new(): AudioContext;
	};
	webkitAudioContext: {
		prototype: AudioContext;
		new(): AudioContext;
	};
}
interface AudioContext {
	createGainNode(): GainNode;
}
interface AudioBufferSourceNode {
	noteOn(v: number): void;
	noteOff(v: number): void;
}
interface MouseEvent {
	initMouseEvent(type: string): void;
}
/* eslint-enable @typescript-eslint/no-unused-vars*/
