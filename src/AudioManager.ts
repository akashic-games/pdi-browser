import { AudioAsset } from "./asset/AudioAsset";
import { AudioPlayer } from "./plugin/AudioPlayer";

export class AudioManager {
	audioAssets: AudioAsset[] = [];
	_masterVolume: number = 1.0;

	registerAudioAsset(asset: AudioAsset): void {
		if (this.audioAssets.indexOf(asset) === -1)
			this.audioAssets.push(asset);
	}

	removeAudioAsset(asset: AudioAsset): void {
		const index = this.audioAssets.indexOf(asset);
		if (index === -1)
			this.audioAssets.splice(index, 1);
	}

	setMasterVolume(volume: number): void {
		this._masterVolume = volume;

		for (let i = 0; i < this.audioAssets.length; i++) {
			if (this.audioAssets[i]._lastPlayedPlayer) {
				(this.audioAssets[i]._lastPlayedPlayer as AudioPlayer).notifyMasterVolumeChanged();
			}
		}
	}

	getMasterVolume(): number {
		return this._masterVolume;
	}
}
