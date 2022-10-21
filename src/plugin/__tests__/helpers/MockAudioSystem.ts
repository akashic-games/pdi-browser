import type { Asset, AudioSystem } from "@akashic/pdi-types";

export class MockAudioSystem implements AudioSystem {
	id: string;
	volume: number;
	_muted: boolean;

	constructor(param: { id: string }) {
		this.id = param.id;
		this.volume = 1;
		this._muted = false;
	}

	stopAll(): never {
		throw new Error("stopAll(): not implemented");
	}

	findPlayers(): never {
		throw new Error("findPlayers(): not implemented");
	}

	createPlayer(): never {
		throw new Error("createPlayer(): not implemented");
	}

	requestDestroy(_asset: Asset): never {
		throw new Error("requestDestroy(): not implemented");
	}

	_reset(): never {
		throw new Error("_reset(): not implemented");
	}

	_setMuted(_value: boolean): never {
		throw new Error("_setMuted(): not implemented");
	}

	_setPlaybackRate(_value: number): never {
		throw new Error("_setPlaybackRate(): not implemented");
	}
}
