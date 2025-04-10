import type * as pdi from "@akashic/pdi-types";
import { AudioAsset } from "../../asset/AudioAsset";
import { ExceptionFactory } from "../../utils/ExceptionFactory";
import { XHRLoader } from "../../utils/XHRLoader";
import { addExtname, resolveExtname } from "../audioUtil";
import * as helper from "./WebAudioHelper";

export async function loadArrayBuffer(url: string): Promise<{ value: { audio: AudioBuffer; url: string }; size: number }> {
	function _loadArrayBuffer(url: string): Promise<{ value: { audio: AudioBuffer; url: string }; size: number }> {
		const l = new XHRLoader();
		return new Promise((resolve, reject) => {
			l.getArrayBuffer(url, (err, result) => {
				if (err) {
					return reject(err);
				}
				if (!result) {
					return reject(`response is undefined: ${url}`);
				}
				const audioContext = helper.getAudioContext();
				audioContext.decodeAudioData(
					result,
					(audio) => resolve({ value: { audio, url }, size: result.byteLength ?? 0 }),
					reject
				).catch((e) => {
					reject(e);
				});
			});
		});
	}

	try {
		return await _loadArrayBuffer(url);
	} catch (e) {
		// 暫定対応：後方互換性のため、aacファイルが無い場合はmp4へのフォールバックを試みる。
		// この対応を止める際には、WebAudioPluginのsupportedExtensionsからaacを除外する必要がある。
		const delIndex = url.indexOf("?");
		const basePath = delIndex >= 0 ? url.substring(0, delIndex) : url;
		if (basePath.slice(-4) === ".aac") {
			const newUrl = url.substring(0, delIndex - 4) + ".mp4";
			const query = delIndex >= 0 ? url.substring(delIndex, url.length) : "";
			return await _loadArrayBuffer(newUrl + query);
		}
		throw e;
	}
}

export class WebAudioAsset extends AudioAsset {
	// _assetPathFilterの判定処理を小さくするため、予めサポートしてる拡張子一覧を持つ
	static supportedFormats: string[] = [];
	private _loadFun: ((url: string) => Promise<{ value: { audio: AudioBuffer; url: string }; size: number }> ) | undefined;

	constructor(
		id: string,
		path: string,
		duration: number,
		system: pdi.AudioSystem,
		loop: boolean,
		hint: pdi.AudioAssetHint,
		offset: number,
		loadFun?: (url: string) => Promise<{ value: { audio: AudioBuffer; url: string }; size: number }>
	) {
		super(id, path, duration, system, loop, hint, offset);
		this._loadFun = loadFun;
	}

	_load(loader: pdi.AssetLoadHandler): void {
		if (this.path == null) {
			// 再生可能な形式がない。実際には鳴らない音声としてロード成功しておく
			this.data = null;
			setTimeout(() => loader._onAssetLoad(this), 0);
			return;
		}

		const load = this._loadFun ? this._loadFun : loadArrayBuffer;
		load(this.path).then(data => {
			// aac読み込み失敗時に代わりにmp4が読み込まれるなど、パスの拡張子が変わるケースがある
			if (this.path !== data.value.url) {
				this.path = data.value.url;
			}
			this.data = data.value.audio;
			loader._onAssetLoad(this);
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
}
