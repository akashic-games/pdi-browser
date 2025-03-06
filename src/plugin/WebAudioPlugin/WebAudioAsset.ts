import type * as pdi from "@akashic/pdi-types";
import { AudioAsset } from "../../asset/AudioAsset";
import { CachedLoader } from "../../utils/CachedLoader";
import { ExceptionFactory } from "../../utils/ExceptionFactory";
import { XHRLoader } from "../../utils/XHRLoader";
import { addExtname, resolveExtname } from "../audioUtil";
import * as helper from "./WebAudioHelper";

export class WebAudioAsset extends AudioAsset {
	// _assetPathFilterの判定処理を小さくするため、予めサポートしてる拡張子一覧を持つ
	static supportedFormats: string[] = [];
	// 保存可能容量としてファイルサイズの合計値を利用。100MBを上限とする
	private static _loader: CachedLoader<string, AudioBuffer> =
		new CachedLoader<string, AudioBuffer>(WebAudioAsset._loadImpl, { limitSize: 100000000 });

	static clearCache(): void {
		WebAudioAsset._loader.reset();
	}

	_load(loader: pdi.AssetLoadHandler): void {
		if (this.path == null) {
			// 再生可能な形式がない。実際には鳴らない音声としてロード成功しておく
			this.data = null;
			setTimeout(() => loader._onAssetLoad(this), 0);
			return;
		}

		WebAudioAsset._loader.load(this.path).then(audioData => {
			if (this.path !== audioData.url) {
				this.path = audioData.url;
			}
			this.data = audioData.value;
			setTimeout(() => loader._onAssetLoad(this), 0);
		}).catch(_e => {
			loader._onAssetError(this, ExceptionFactory.createAssetLoadError("WebAudioAsset unknown loading error"));
		});
	}

	_assetPathFilter(path: string): string {
		if (WebAudioAsset.supportedFormats.indexOf("ogg") !== -1) {
			return addExtname(path, ".ogg");
		}
		if (WebAudioAsset.supportedFormats.indexOf("aac") !== -1) {
			return addExtname(path, ".aac");
		}
		// ここで検出されるのは最初にアクセスを試みるオーディオアセットのファイルパスなので、
		// supportedFormatsに(後方互換性保持で使う可能性がある)mp4が含まれていても利用しない
		// TODO: _assetPathFilter() における戻り値 `null` の扱い
		return null!;
	}

	_modifyPath(path: string): string {
		const ext = resolveExtname(this.hint?.extensions, WebAudioAsset.supportedFormats);
		return ext ? addExtname(this.originalPath, ext) : path;
	}

	private static async _loadImpl(url: string): Promise<{ value: AudioBuffer; size: number; url: string }> {
		try {
			return await WebAudioAsset._loadArrayBuffer(url);
		} catch (e) {
			const delIndex = url.indexOf("?");
			const basePath = delIndex >= 0 ? url.substring(0, delIndex) : url;
			if (basePath.slice(-4) === ".aac") {
				const newUrl = url.substring(0, delIndex - 4) + ".mp4";
				const query = delIndex >= 0 ? url.substring(delIndex, url.length) : "";
				return await WebAudioAsset._loadArrayBuffer(newUrl + query);
			}
			throw e;
		}
	}

	private static _loadArrayBuffer(url: string): Promise<{ value: AudioBuffer; size: number; url: string }> {
		const l = new XHRLoader();
		return new Promise((resolve, reject) => {
			l.getArrayBuffer(url, (err, result) => {
				if (err) {
					return reject(err);
				}
				if (!result) {
					return reject(`respone is undefined: ${url}`);
				}
				const audioContext = helper.getAudioContext();
				audioContext.decodeAudioData(
					result,
					(value) => resolve({ value, size: result.byteLength ?? 0, url }),
					reject
				);
			});
		});
	}
}
