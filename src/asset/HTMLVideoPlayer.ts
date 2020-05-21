import * as g from "@akashic/akashic-engine";

export class HTMLVideoPlayer implements g.VideoPlayerLike {
	currentVideo: g.VideoAssetLike;
	onPlay: g.Trigger<g.VideoPlayerEvent>;
	onStop: g.Trigger<g.VideoPlayerEvent>;
	volume: number;
	played: g.Trigger<g.VideoPlayerEvent>;
	stopped: g.Trigger<g.VideoPlayerEvent>;
	_loop: boolean;

	/**
	 * コンテンツからの参照用プロパティ。
	 * Note: このプロパティは暫定処理である。コンテンツ側はanyキャストして本値を参照する必要がある。
	 * 本値がtrueであった場合、その環境ではVideoの再生を行うことができないことを表す。
	 */
	isDummy: boolean;

	constructor(loop?: boolean) {
		this._loop = !!loop;
		this.onPlay = new g.Trigger();
		this.onStop = new g.Trigger();
		this.played = this.onPlay;
		this.stopped = this.onStop;
		this.currentVideo = undefined;
		this.volume = 1.0;
		this.isDummy = true;
	}

	play(_videoAsset: g.VideoAssetLike): void {
		// not yet supported
	}

	stop(): void {
		// not yet supported
	}

	changeVolume(_volume: number): void {
		// not yet supported
	}
}
