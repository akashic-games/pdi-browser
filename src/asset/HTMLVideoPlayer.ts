import * as g from "@akashic/akashic-engine";

export class HTMLVideoPlayer extends g.VideoPlayer {
	/**
	 * コンテンツからの参照用プロパティ。
	 * Note: このプロパティは暫定処理である。コンテンツ側はanyキャストして本値を参照する必要がある。
	 * 本値がtrueであった場合、その環境ではVideoの再生を行うことができないことを表す。
	 */
	isDummy: boolean;

	constructor(loop?: boolean) {
		super(loop);
		this.isDummy = true;
	}

	play(videoAsset: g.VideoAsset): void {
		// not yet supported
	}

	stop(): void {
		// not yet supported
	}

	changeVolume(volume: number): void {
		// not yet supported
	}
}
