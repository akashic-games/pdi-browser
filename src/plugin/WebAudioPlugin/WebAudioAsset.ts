import * as pdi from "@akashic/pdi-types";
import { AudioAsset } from "../../asset/AudioAsset";
import { ExceptionFactory } from "../../utils/ExceptionFactory";
import { XHRLoader } from "../../utils/XHRLoader";
import { addExtname } from "../../PathUtil";
import * as helper from "./WebAudioHelper";

export class WebAudioAsset extends AudioAsset {
	// _assetPathFilterの判定処理を小さくするため、予めサポートしてる拡張子一覧を持つ
	static supportedFormats: string[] = [];
	_lastPlayedPlayer: pdi.AudioPlayer = null!;

	_load(loader: pdi.AssetLoadHandler): void {
		if (this.path == null) {
			// 再生可能な形式がない。実際には鳴らない音声としてロード成功しておく
			this.data = null;
			setTimeout(() => loader._onAssetLoad(this), 0);
			return;
		}

		var successHandler = (decodedAudio: AudioBuffer) => {
			this.data = decodedAudio;
			loader._onAssetLoad(this);
		};
		var errorHandler = () => {
			loader._onAssetError(this, ExceptionFactory.createAssetLoadError("WebAudioAsset unknown loading error"));
		};

		var onLoadArrayBufferHandler = (response: any) => {
			var audioContext = helper.getAudioContext();
			audioContext.decodeAudioData(
				response,
				successHandler,
				errorHandler
			);
		};

		var xhrLoader = new XHRLoader();
		var loadArrayBuffer = (path: string, onSuccess: (response: any) => void, onFailed: (err: pdi.AssetLoadError) => void) => {
			xhrLoader.getArrayBuffer(path, (error, response) => {
				error ? onFailed(error) : onSuccess(response);
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
		return null!;
	}
}
