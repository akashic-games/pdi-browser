import * as pdi from "@akashic/akashic-pdi";
import { Trigger } from "@akashic/trigger";

export class HTMLVideoPlayer implements pdi.VideoPlayer {
	currentVideo: pdi.VideoAsset;
	onPlay: Trigger<pdi.VideoPlayerEvent>;
	onStop: Trigger<pdi.VideoPlayerEvent>;
	volume: number;
	played: Trigger<pdi.VideoPlayerEvent>;
	stopped: Trigger<pdi.VideoPlayerEvent>;
	_loop: boolean;

	/**
	 * コンテンツからの参照用プロパティ。
	 * Note: このプロパティは暫定処理である。コンテンツ側はanyキャストして本値を参照する必要がある。
	 * 本値がtrueであった場合、その環境ではVideoの再生を行うことができないことを表す。
	 */
	isDummy: boolean;

	constructor(loop?: boolean) {
		this._loop = !!loop;
		this.onPlay = new Trigger();
		this.onStop = new Trigger();
		this.played = this.onPlay;
		this.stopped = this.onStop;
		this.currentVideo = undefined;
		this.volume = 1.0;
		this.isDummy = true;
	}

	play(_videoAsset: pdi.VideoAsset): void {
		// not yet supported
	}

	stop(): void {
		// not yet supported
	}

	changeVolume(_volume: number): void {
		// not yet supported
	}
}
