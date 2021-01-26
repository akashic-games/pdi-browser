import * as pdi from "@akashic/pdi-types";
import { AudioAsset } from "../../asset/AudioAsset";
import { ExceptionFactory } from "../../utils/ExceptionFactory";
import { addExtname } from "../../PathUtil";

export interface MediaLoaderEventHandlerSet {
	success: () => void;
	error: () => void;
}

export class HTMLAudioAsset extends AudioAsset {
	// _assetPathFilterの判定処理を小さくするため、予めサポートしてる拡張子一覧を持つ
	static supportedFormats: string[];
	private _intervalId: number | undefined;
	private _intervalCount: number = 0;

	_load(loader: pdi.AssetLoadHandler): void {
		if (this.path == null) {
			// 再生可能な形式がない。実際には鳴らない音声としてロード成功しておく
			this.data = null;
			setTimeout(() => loader._onAssetLoad(this), 0);
			return;
		}

		var audio = new Audio();
		var startLoadingAudio = (path: string, handlers: MediaLoaderEventHandlerSet) => {
			// autoplay は preload よりも優先されるため明示的にfalseとする
			audio.autoplay = false;
			audio.preload = "none";
			audio.src = path;
			this._attachAll(audio, handlers);
			/* tslint:disable */
			// Firefoxはpreload="auto"でないと読み込みされない
			// preloadはブラウザに対するHint属性なので、どう扱うかはブラウザの実装次第となる
			// https://html.spec.whatwg.org/multipage/embedded-content.html#attr-media-preload
			// https://developer.mozilla.org/ja/docs/Web/HTML/Element/audio#attr-preload
			// https://github.com/CreateJS/SoundJS/blob/e2d4842a84ff425ada861edb9f6e9b57f63d7caf/src/soundjs/htmlaudio/HTMLAudioSoundInstance.js#L147-147
			/* tslint:enable:max-line-length */
			audio.preload = "auto";
			setAudioLoadInterval(audio, handlers);
			audio.load();
		}

		var handlers: MediaLoaderEventHandlerSet = {
			success: (): void => {
				this._detachAll(audio, handlers);
				this.data = audio;
				loader._onAssetLoad(this);
				window.clearInterval(this._intervalId);
			},
			error: (): void => {
				this._detachAll(audio, handlers);
				this.data = audio;
				loader._onAssetError(this, ExceptionFactory.createAssetLoadError("HTMLAudioAsset loading error"));
				window.clearInterval(this._intervalId);
			}
		};

		var setAudioLoadInterval = (audio: HTMLAudioElement, handlers: MediaLoaderEventHandlerSet) => {
			// IE11において、canplaythroughイベントが正常に発火しない問題が確認されたため、その対処として以下の処理を行っている。
			// なお、canplaythroughはreadyStateの値が4になった時点で呼び出されるイベントである。
			// インターバルとして指定している100msに根拠は無い。
			this._intervalCount = 0;
			this._intervalId = window.setInterval((): void => {
				if (audio.readyState === 4) {
					handlers.success();
				} else {
					++this._intervalCount;
					// readyStateの値が4にならない状態が1分（100ms×600）続いた場合、
					// 読み込みに失敗したとする。1分という時間に根拠は無い。
					if (this._intervalCount === 600) {
						handlers.error();
					}
				}
			}, 100);
		}

		// 暫定対応：後方互換性のため、aacファイルが無い場合はmp4へのフォールバックを試みる。
		// この対応を止める際には、HTMLAudioPluginのsupportedExtensionsからaacを除外する必要がある。
		const delIndex = this.path.indexOf("?");
		const basePath = delIndex >= 0 ? this.path.substring(0, delIndex) : this.path;
		if (basePath.slice(-4) === ".aac" && HTMLAudioAsset.supportedFormats.indexOf("mp4") !== -1) {
			var altHandlers: MediaLoaderEventHandlerSet = {
				success: handlers.success,
				error: () => {
					this._detachAll(audio, altHandlers);
					window.clearInterval(this._intervalId);
					this.path = addExtname(this.originalPath, "mp4");
					startLoadingAudio(this.path, handlers);
				}
			};
			startLoadingAudio(this.path, altHandlers);
			return;
		}

		startLoadingAudio(this.path, handlers);
	}

	cloneElement(): HTMLAudioElement | null {
		return this.data ? new Audio(this.data.src) : null;
	}

	_assetPathFilter(path: string): string {
		if (HTMLAudioAsset.supportedFormats.indexOf("ogg") !== -1) {
			return addExtname(path, "ogg");
		}
		if (HTMLAudioAsset.supportedFormats.indexOf("aac") !== -1) {
			return addExtname(path, "aac");
		}
		// ここで検出されるのは最初にアクセスを試みるオーディオアセットのファイルパスなので、
		// supportedFormatsに(後方互換性保持で使う可能性がある)mp4が含まれていても利用しない
		return path;
	}

	private _attachAll(audio: HTMLAudioElement, handlers: MediaLoaderEventHandlerSet): void {
		if (handlers.success) {
			/* tslint:disable:max-line-length */
			// https://developer.mozilla.org/en-US/docs/Web/Events/canplaythrough
			// https://github.com/goldfire/howler.js/blob/1dad25cdd9d6982232050454e8b45411902efe65/howler.js#L372
			// https://github.com/CreateJS/SoundJS/blob/e2d4842a84ff425ada861edb9f6e9b57f63d7caf/src/soundjs/htmlaudio/HTMLAudioSoundInstance.js#L145-145
			/* tslint:enable:max-line-length */
			audio.addEventListener("canplaythrough", handlers.success, false);
		}
		if (handlers.error) {
			// https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
			// stalledはfetchして取れなかった時に起きるイベント
			audio.addEventListener("stalled", handlers.error, false);
			audio.addEventListener("error", handlers.error, false);
			audio.addEventListener("abort", handlers.error, false);
		}
	}

	private _detachAll(audio: HTMLAudioElement, handlers: MediaLoaderEventHandlerSet): void {
		if (handlers.success) {
			audio.removeEventListener("canplaythrough", handlers.success, false);
		}
		if (handlers.error) {
			audio.removeEventListener("stalled", handlers.error, false);
			audio.removeEventListener("error", handlers.error, false);
			audio.removeEventListener("abort", handlers.error, false);
		}
	}
}
