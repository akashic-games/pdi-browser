import type { Asset, AudioPlayer, AudioSystem } from "@akashic/pdi-types";

export class MockAudioSystem implements AudioSystem {
	id: string;
	volume: number;
	_muted: boolean;

	stopAll: () => void = jest.fn();
	findPlayers: () => AudioPlayer[] = jest.fn().mockImplementation(() => []);
	createPlayer: () => AudioPlayer = jest.fn();
	requestDestroy: (_asset: Asset) => void = jest.fn();
	_reset: () => void = jest.fn();
	_setMuted: (_value: boolean) => void = jest.fn();
	_setPlaybackRate: (_value: number) => void = jest.fn();

	constructor(param: { id: string }) {
		this.id = param.id;
		this.volume = 1;
		this._muted = false;
	}
}
