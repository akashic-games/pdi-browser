import * as g from "@akashic/akashic-engine";
import { Asset } from "./Asset";

export abstract class AudioAsset extends Asset implements g.AudioAssetLike {
	type: "audio" = "audio";
	data: any;
	duration: number;
	loop: boolean;
	hint: g.AudioAssetHint;
	_system: g.AudioSystemLike;
	_lastPlayedPlayer: g.AudioPlayerLike;

	constructor(id: string, path: string, duration: number, system: g.AudioSystemLike, loop: boolean, hint: g.AudioAssetHint) {
		super(id, path);
		this.duration = duration;
		this.loop = loop;
		this.hint = hint;
		this._system = system;
		this.data = undefined;
	}

	play(): g.AudioPlayerLike {
		const player = this._system.createPlayer();
		player.play(this);
		this._lastPlayedPlayer = player;
		return player;
	}

	stop(): void {
		const players = this._system.findPlayers(this);
		for (var i = 0; i < players.length; ++i) players[i].stop();
	}

	inUse(): boolean {
		return this._system.findPlayers(this).length > 0;
	}

	destroy(): void {
		if (this._system) this.stop();

		this.data = undefined;
		this._system = undefined;
		this._lastPlayedPlayer = undefined;
		super.destroy();
	}

	abstract _load(loader: g.AssetLoadHandler): void;

	abstract _assetPathFilter(path: string): string;
}
