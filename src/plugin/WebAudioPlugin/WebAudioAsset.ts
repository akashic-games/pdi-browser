import type * as pdi from "@akashic/pdi-types";
import { AudioAsset } from "../../asset/AudioAsset";
import { addExtname } from "../../PathUtil";
import { ExceptionFactory } from "../../utils/ExceptionFactory";
import { XHRLoader } from "../../utils/XHRLoader";
import * as helper from "./WebAudioHelper";

export class WebAudioAsset extends AudioAsset {
	// _assetPathFilterの判定処理を小さくするため、予めサポートしてる拡張子一覧を持つ
	static supportedFormats: string[] = [];

	_load(loader: pdi.AssetLoadHandler): void {
		if (this.path == null) {
			// 再生可能な形式がない。実際には鳴らない音声としてロード成功しておく
			this.data = null;
			setTimeout(() => loader._onAssetLoad(this), 0);
			return;
		}

		const successHandler = (decodedAudio: AudioBuffer): void => {
			this.data = decodedAudio;
			loader._onAssetLoad(this);
		};
		const errorHandler = (): void => {
			loader._onAssetError(this, ExceptionFactory.createAssetLoadError("WebAudioAsset unknown loading error"));
		};

		const onLoadArrayBufferHandler = (response: any): void => {
			const audioContext = helper.getAudioContext();
			audioContext.decodeAudioData(
				response,
				successHandler,
				errorHandler
			);
		};

		const xhrLoader = new XHRLoader();
		const loadArrayBuffer = (path: string, onSuccess: (response: any) => void, onFailed: (err: pdi.AssetLoadError) => void): void => {
			xhrLoader.getArrayBuffer(path, (error, response) => {
				if (error) {
					onFailed(error);
				} else {
					onSuccess(response);
				}
			});
		};

		const delIndex = this.path.indexOf("?");
		const basePath = delIndex >= 0 ? this.path.substring(0, delIndex) : this.path;
		if (basePath.slice(-4) === ".aac") {
			// 暫定対応：後方互換性のため、aacファイルが無い場合はmp4へのフォールバックを試みる。
			// この対応を止める際には、WebAudioPluginのsupportedExtensionsからaacを除外する必要がある。
			loadArrayBuffer(this.path, onLoadArrayBufferHandler, _error => {
				const altPath = addExtname(this.originalPath, "mp4");
				loadArrayBuffer(altPath, (response) => {
					this.path = altPath;
					onLoadArrayBufferHandler(response);
				}, errorHandler);
			});
			return;
		}
		loadArrayBuffer(this.path, onLoadArrayBufferHandler, errorHandler);
	}

	_assetPathFilter(path: string): string {
		if (WebAudioAsset.supportedFormats.indexOf("ogg") !== -1) {
			return addExtname(path, "ogg");
		}
		if (WebAudioAsset.supportedFormats.indexOf("aac") !== -1) {
			return addExtname(path, "aac");
		}
		// ここで検出されるのは最初にアクセスを試みるオーディオアセットのファイルパスなので、
		// supportedFormatsに(後方互換性保持で使う可能性がある)mp4が含まれていても利用しない
		// TODO: _assetPathFilter() における戻り値 `null` の扱い
		return null!;
	}

	_getPathFromExtensions(): string | null {
		if (this.hint && this.hint.extensions && this.hint.extensions.length > 0) {
			for (const ext of this.hint.extensions) {
				if (WebAudioAsset.supportedFormats.indexOf(ext) !== -1) {
					return addExtname(this.originalPath, ext);
				}
			}
		}
		return null;
	}
}
