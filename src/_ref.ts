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
