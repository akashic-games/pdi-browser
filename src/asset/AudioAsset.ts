import type * as pdi from "@akashic/pdi-types";
import { Asset } from "./Asset";

export abstract class AudioAsset extends Asset implements pdi.AudioAsset {
	type: "audio" = "audio";
	data: any = undefined;
	duration: number;
	loop: boolean;
	hint: pdi.AudioAssetHint;
	offset: number;
	loopOffset: number | undefined;
	_system: pdi.AudioSystem;
	_lastPlayedPlayer: pdi.AudioPlayer | undefined;

	constructor(
		id: string,
		path: string,
		duration: number,
		system: pdi.AudioSystem,
		loop: boolean,
		hint: pdi.AudioAssetHint,
		offset: number,
		loopOffset: number | undefined,
	) {
		super(id, path);
		this.duration = duration;
		this.loop = loop;
		this.hint = hint;
		this._system = system;
		this.offset = offset;
		this.loopOffset = loopOffset;
		this.path = this._modifyPath(this.path);
	}

	play(): pdi.AudioPlayer {
		const player = this._system.createPlayer();
		player.play(this);
		this._lastPlayedPlayer = player;
		return player;
	}

	stop(): void {
		const players = this._system.findPlayers(this);
		for (let i = 0; i < players.length; ++i) players[i].stop();
	}

	inUse(): boolean {
		return this._system.findPlayers(this).length > 0;
	}

	destroy(): void {
		if (this._system) this.stop();

		this.data = undefined;
		this._system = undefined!;
		this._lastPlayedPlayer = undefined!;
		super.destroy();
	}

	abstract _load(loader: pdi.AssetLoadHandler): void;

	abstract _assetPathFilter(path: string): string;

	// this._assetPathFilter() の呼び出しタイミングでは hint 等のプロパティを参照することができないため、それらのプロパティを考慮してパスを書き換えるために用意したメソッド
	abstract _modifyPath(path: string): string;
}
