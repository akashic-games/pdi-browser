import type * as pdi from "@akashic/pdi-types";
import { AudioAsset } from "../../asset/AudioAsset";
import { CachedLoader } from "../../utils/CachedLoader";
import { ExceptionFactory } from "../../utils/ExceptionFactory";
import { addExtname, resolveExtname } from "../audioUtil";

export interface MediaLoaderEventHandlerSet {
	success: () => void;
	error: () => void;
}

export class HTMLAudioAsset extends AudioAsset {
	// _assetPathFilterの判定処理を小さくするため、予めサポートしてる拡張子一覧を持つ
	static supportedFormats: string[];
	// 音声ファイルのファイルサイズ取得が困難なので、保存可能容量として音声の合計再生時間を利用。100分を上限とする
	private static _loader: CachedLoader<string, HTMLAudioElement> =
		new CachedLoader<string, HTMLAudioElement>(HTMLAudioAsset._loadImpl, { limitSize: 6000000 });

	_load(loader: pdi.AssetLoadHandler): void {
		if (this.path == null) {
			// 再生可能な形式がない。実際には鳴らない音声としてロード成功しておく
			this.data = null;
			setTimeout(() => loader._onAssetLoad(this), 0);
			return;
		}

		HTMLAudioAsset._loader.load(this.path).then(audioData => {
			if (this.path !== audioData.key) {
				this.path = audioData.key;
			}
			this.data = audioData.value;
			setTimeout(() => loader._onAssetLoad(this), 0);
		}).catch(_e => {
			loader._onAssetError(this, ExceptionFactory.createAssetLoadError("HTMLAudioAsset loading error"));
		});
	}

	cloneElement(): HTMLAudioElement | null {
		return this.data ? HTMLAudioAsset.createAudioElement(this.data.src) : null;
	}

	_assetPathFilter(path: string): string {
		if (HTMLAudioAsset.supportedFormats.indexOf("ogg") !== -1) {
			return addExtname(path, ".ogg");
		}
		if (HTMLAudioAsset.supportedFormats.indexOf("aac") !== -1) {
			return addExtname(path, ".aac");
		}
		// ここで検出されるのは最初にアクセスを試みるオーディオアセットのファイルパスなので、
		// supportedFormatsに(後方互換性保持で使う可能性がある)mp4が含まれていても利用しない
		// TODO: _assetPathFilter() における戻り値 `null` の扱い
		return null!;
	}

	_modifyPath(path: string): string {
		const ext = resolveExtname(this.hint?.extensions, HTMLAudioAsset.supportedFormats);
		return ext ? addExtname(this.originalPath, ext) : path;
	}

	protected static createAudioElement(src?: string): HTMLAudioElement {
		return new Audio(src);
	}

	private static async _loadImpl(url: string): Promise<{ value: HTMLAudioElement; size: number; key: string }> {
		try {
			return await HTMLAudioAsset._startLoadingAudio(url);
		} catch (e) {
			const delIndex = url.indexOf("?");
			const basePath = delIndex >= 0 ? url.substring(0, delIndex) : url;
			if (basePath.slice(-4) === ".aac" && HTMLAudioAsset.supportedFormats.indexOf("mp4") !== -1) {
				const newUrl = url.substring(0, delIndex - 4) + ".mp4";
				const query = delIndex >= 0 ? url.substring(delIndex, url.length) : "";
				return await HTMLAudioAsset._startLoadingAudio(newUrl + query);
			}
			throw e;
		}
	}

	private static _startLoadingAudio (url: string): Promise<{ value: HTMLAudioElement; size: number; key: string }> {
		const audio = HTMLAudioAsset.createAudioElement();
		const attachAll = (audio: HTMLAudioElement, handlers: MediaLoaderEventHandlerSet): void => {
			if (handlers.success) {
				/* eslint-disable max-len */
				// https://developer.mozilla.org/en-US/docs/Web/Events/canplaythrough
				// https://github.com/goldfire/howler.js/blob/1dad25cdd9d6982232050454e8b45411902efe65/howler.js#L372
				// https://github.com/CreateJS/SoundJS/blob/e2d4842a84ff425ada861edb9f6e9b57f63d7caf/src/soundjs/htmlaudio/HTMLAudioSoundInstance.js#L145-145
				/* eslint-enable max-len */
				audio.addEventListener("canplaythrough", handlers.success, false);
			}
			if (handlers.error) {
				// https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
				// stalledはfetchして取れなかった時に起きるイベント
				audio.addEventListener("stalled", handlers.error, false);
				audio.addEventListener("error", handlers.error, false);
				audio.addEventListener("abort", handlers.error, false);
			}
		};
		const detachAll = (audio: HTMLAudioElement, handlers: MediaLoaderEventHandlerSet): void => {
			if (handlers.success) {
				audio.removeEventListener("canplaythrough", handlers.success, false);
			}
			if (handlers.error) {
				audio.removeEventListener("stalled", handlers.error, false);
				audio.removeEventListener("error", handlers.error, false);
				audio.removeEventListener("abort", handlers.error, false);
			}
		};

		return new Promise((resolve, reject) => {
			let intervalId: number = -1;
			const handlers = {
				success: (): void => {
					detachAll(audio, handlers);
					window.clearInterval(intervalId);
					resolve({ value: audio, size: 1000 * audio.duration, key: url });
				},
				error: (): void => {
					detachAll(audio, handlers);
					window.clearInterval(intervalId);
					reject();
				}
			};

			const setAudioLoadInterval = (audio: HTMLAudioElement, handlers: MediaLoaderEventHandlerSet): void => {
				// IE11において、canplaythroughイベントが正常に発火しない問題が確認されたため、その対処として以下の処理を行っている。
				// なお、canplaythroughはreadyStateの値が4になった時点で呼び出されるイベントである。
				// インターバルとして指定している100msに根拠は無い。
				let intervalCount = 0;
				intervalId = window.setInterval((): void => {
					if (audio.readyState === 4) {
						handlers.success();
					} else {
						++intervalCount;
						// readyStateの値が4にならない状態が1分（100ms×600）続いた場合、
						// 読み込みに失敗したとする。1分という時間に根拠は無い。
						if (intervalCount === 600) {
							handlers.error();
						}
					}
				}, 100);
			};

			audio.autoplay = false;
			audio.preload = "none";
			audio.src = url;
			attachAll(audio, handlers);
			/* eslint-disable max-len */
			// Firefoxはpreload="auto"でないと読み込みされない
			// preloadはブラウザに対するHint属性なので、どう扱うかはブラウザの実装次第となる
			// https://html.spec.whatwg.org/multipage/embedded-content.html#attr-media-preload
			// https://developer.mozilla.org/ja/docs/Web/HTML/Element/audio#attr-preload
			// https://github.com/CreateJS/SoundJS/blob/e2d4842a84ff425ada861edb9f6e9b57f63d7caf/src/soundjs/htmlaudio/HTMLAudioSoundInstance.js#L147-147
			/* eslint-enable max-len */
			audio.preload = "auto";
			setAudioLoadInterval(audio, handlers);
			audio.load();
		});
	}
}
