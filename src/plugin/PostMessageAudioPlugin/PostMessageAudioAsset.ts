import * as g from "@akashic/akashic-engine";
import { PostMessageAudioPlugin } from "./PostMessageAudioPlugin";

export class PostMessageAudioAsset extends g.AudioAsset {
	_load(loader: g.AssetLoadHandler): void {
		const param = {
			id: this.id,
			assetPath: this.path,
			duration: this.duration,
			loop: this.loop,
			hint: this.hint
		};
		PostMessageAudioPlugin.send("akashic:AudioAsset#_load", param);

		// TODO: 暫定対応。本来はPDI(iframeの親)側からの `akashic:AudioAsset#_load#success` または `akashic:AudioAsset#_load#failure` を待つ必要がある。
		setTimeout(() => loader._onAssetLoad(this));
	}

	destroy(): void {
		PostMessageAudioPlugin.send("akashic:AudioAsset#destroy", {id: this.id});
		super.destroy();
	}
}
