/* eslint-disable @typescript-eslint/typedef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { Trigger } from "@akashic/trigger";
import type { HTMLAudioAsset } from "./HTMLAudioAsset";
import { setupChromeMEIWorkaround } from "./HTMLAudioAutoplayHelper";

export interface HTMLAudioPlayerContextParameterObject {
	asset: HTMLAudioAsset;
}

export class HTMLAudioPlayerContext {
	onStop: Trigger<void>;

	asset: HTMLAudioAsset;
	element: HTMLAudioElement | null;
	offsetStart: number;
	offsetEnd: number;
	loopOffset: number;
	duration: number;
	loop: boolean;

	_dummyTimerId: number | null;
	_reachEndTimerId: number | null;
	_previousCurrentTime: number;

	constructor({ asset }: HTMLAudioPlayerContextParameterObject) {
		this.asset = asset;
		this.duration = asset.duration ?? +Infinity;
		this.offsetStart = asset.offset ?? 0;
		this.offsetEnd = this.offsetStart + this.duration;
		this.loop = !!asset.loop;
		this.loopOffset = asset.loopOffset ?? 0;
		this.onStop = new Trigger();
		this._dummyTimerId = null;
		this._reachEndTimerId = null;

		const element = asset.cloneElement();
		if (element) {
			setupChromeMEIWorkaround(element);
			element.addEventListener("timeupdate", this._onTimeupdate, false);
			element.addEventListener("ended", this._onEnded, false);
			element.currentTime = this.offsetStart / 1000;
		} else {
			if (!asset.loop && asset.duration != null) {
				this._setDummyTimer(this.duration);
			}
		}
		this.element = element;
		this._previousCurrentTime = element?.currentTime ?? 0;
	}

	rewind() {
		this.pause();
		this.setCurrentTime(this.loopOffset || this.offsetStart);
		this.play();
	}

	play() {
		this.element?.play().catch((_err) => {
			// user interact の前に play() を呼ぶとエラーになる。これは HTMLAudioAutoplayHelper で吸収する
		});
	}

	pause() {
		this.element?.pause();
		this._clearRewindTimer();
	}

	setCurrentTime(offset: number) {
		if (!this.element) return;
		this.element.currentTime = offset / 1000;
		this._previousCurrentTime = this.element.currentTime;
	}

	setVolume(volume: number) {
		if (!this.element) return;
		this.element.volume = volume;
	}

	destroy() {
		this.onStop.destroy();
		const element = this.element;
		if (element) {
			element.removeEventListener("timeupdate", this._onTimeupdate, false);
			element.removeEventListener("ended", this._onEnded, false);
		}
		this._clearDummyTimer();
		this._clearRewindTimer();
	}

	_setDummyTimer(duration: number) {
		this._clearDummyTimer();
		this._dummyTimerId = window.setTimeout(() => this.pause(), duration);
	}

	_clearDummyTimer() {
		if (this._dummyTimerId == null) return;
		window.clearTimeout(this._dummyTimerId);
		this._dummyTimerId = null;
	}

	_setRewindTimer(duration: number) {
		this._clearRewindTimer();
		this._reachEndTimerId = window.setTimeout(() => this._onReachEnd(), duration);
	}

	_clearRewindTimer() {
		if (this._reachEndTimerId == null) return;
		window.clearTimeout(this._reachEndTimerId);
		this._reachEndTimerId = null;
	}

	_onReachEnd() {
		if (this.loop) {
			this.rewind();
		} else {
			this.pause();
			this.onStop.fire();
		}

		this._clearRewindTimer();
	}

	_onTimeupdate = () => {
		const element = this.element!; // this.element が存在する場合にのみ呼び出される
		if (element.paused) return;

		const currentOffset = element.currentTime * 1000;
		const deltaSinceLastCall = Math.max(element.currentTime * 1000 - this._previousCurrentTime, 0);
		const deltaUntilEnd = Math.max(this.offsetEnd - element.currentTime * 1000, 0);
		this._previousCurrentTime = element.currentTime * 1000;

		if (this.offsetEnd < currentOffset + deltaSinceLastCall || this.offsetEnd <= currentOffset) {
			this._setRewindTimer(deltaUntilEnd);
		}
	};

	_onEnded = () => {
		this._onReachEnd();
	};
}
