import * as g from "@akashic/akashic-engine";
import { AudioAsset } from "../../asset/AudioAsset";
import { ExceptionFactory } from "../../utils/ExceptionFactory";
import { XHRLoader } from "../../utils/XHRLoader";
import * as helper from "./WebAudioHelper";

export class WebAudioAsset extends AudioAsset {
	// _assetPathFilterの判定処理を小さくするため、予めサポートしてる拡張子一覧を持つ
	static supportedFormats: string[] = [];

	_load(loader: g.AssetLoadHandler): void {
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
		var loadArrayBuffer = (path: string, onSuccess: (response: any) => void, onFailed: (err: g.AssetLoadError) => void) => {
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
				const altPath = g.PdiCommonUtil.addExtname(this.originalPath, "mp4"); // TODO: pdi-browser 側で独自の実装を持つようにする
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
			return g.PdiCommonUtil.addExtname(path, "ogg"); // TODO: pdi-browser 側で独自の実装を持つようにする
		}
		if (WebAudioAsset.supportedFormats.indexOf("aac") !== -1) {
			return g.PdiCommonUtil.addExtname(path, "aac"); // TODO: pdi-browser 側で独自の実装を持つようにする
		}
		// ここで検出されるのは最初にアクセスを試みるオーディオアセットのファイルパスなので、
		// supportedFormatsに(後方互換性保持で使う可能性がある)mp4が含まれていても利用しない
		return null;
	}
}
