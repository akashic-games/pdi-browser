import * as g from "@akashic/akashic-engine";
import { AudioPlayer } from "./plugin/AudioPlayer";

export class AudioManager {
	audioAssets: g.AudioAsset[] = [];
	_masterVolume: number = 1.0;

	registerAudioAsset(asset: g.AudioAsset): void {
		if (this.audioAssets.indexOf(asset) === -1)
			this.audioAssets.push(asset);
	}

	removeAudioAsset(asset: g.AudioAsset): void {
		var index = this.audioAssets.indexOf(asset);
		if (index === -1)
			this.audioAssets.splice(index, 1);
	}

	setMasterVolume(volume: number) {
		this._masterVolume = volume;

		for (var i = 0; i < this.audioAssets.length; i++) {
			if (this.audioAssets[i]._lastPlayedPlayer) {
				(this.audioAssets[i]._lastPlayedPlayer as AudioPlayer).notifyMasterVolumeChanged();
			}
		}
	}

	getMasterVolume(): number {
		return this._masterVolume;
	}
}
