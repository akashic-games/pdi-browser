import * as g from "@akashic/akashic-engine";
import { AudioManager } from "../../AudioManager";
import { AudioPlayer } from "../AudioPlayer";
import { PostMessageAudioAsset } from "./PostMessageAudioAsset";
import { PostMessageAudioPlugin } from "./PostMessageAudioPlugin";

export class PostMessageAudioPlayer extends g.AudioPlayer implements AudioPlayer {
	id: string;
	private _manager: AudioManager;

	constructor(system: g.AudioSystem, manager: AudioManager, id: string) {
		super(system);
		this._manager = manager;
		this.id = id;
		PostMessageAudioPlugin.send("akashic:AudioPlayer#new", {id});
	}

	play(asset: PostMessageAudioAsset): void {
		PostMessageAudioPlugin.send("akashic:AudioPlayer#play", {id: this.id, assetId: asset.id});
	}

	stop(): void {
		PostMessageAudioPlugin.send("akashic:AudioPlayer#stop", {id: this.id});
	}

	changeVolume(volume: number): void {
		super.changeVolume(volume);
		PostMessageAudioPlugin.send("akashic:AudioPlayer#changeVolume", {id: this.id, volume: this._calculateVolume()});
	}

	_changeMuted(muted: boolean): void {
		super._changeMuted(muted);
		PostMessageAudioPlugin.send("akashic:AudioPlayer#changeVolume", {id: this.id, volume: this._calculateVolume()});
	}

	notifyMasterVolumeChanged(): void {
		PostMessageAudioPlugin.send("akashic:AudioPlayer#changeVolume", {id: this.id, volume: this._calculateVolume()});
	}

	private _calculateVolume(): number {
		return this._muted ? 0 : this.volume * this._system.volume * this._manager.getMasterVolume();
	}
}
