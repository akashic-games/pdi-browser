"use strict";
import * as pdi from "@akashic/pdi-types";
import { ExceptionFactory } from "./ExceptionFactory";
import { XHRLoaderOption } from "./XHRLoaderOption";
export interface XHRRequestObject {
	url: string;
	responseType: XMLHttpRequestResponseType;
}

export class XHRLoader {
	timeout: number;

	constructor(options: XHRLoaderOption = {}) {
		// デフォルトのタイムアウトは15秒
		// TODO: タイムアウト値はこれが妥当であるか後日詳細を検討する
		this.timeout = options.timeout || 15000;
	}

	get(url: string, callback: (error: pdi.AssetLoadError, data?: string) => void): void {
		this._getRequestObject({
			url: url,
			responseType: "text"
		}, callback);
	}

	getArrayBuffer(url: string, callback: (error: pdi.AssetLoadError, data?: ArrayBuffer) => void): void {
		this._getRequestObject({
			url: url,
			responseType: "arraybuffer"
		}, callback);
	}

	private _getRequestObject(requestObject: XHRRequestObject, callback: (error: pdi.AssetLoadError, data?: any) => void): void {
		var request = new XMLHttpRequest();
		request.open("GET", requestObject.url, true);
		request.responseType = requestObject.responseType;
		request.timeout = this.timeout;
		request.addEventListener("timeout", () => {
			callback(ExceptionFactory.createAssetLoadError("loading timeout"));
		}, false);
		request.addEventListener("load", () => {
			if (request.status >= 200 && request.status < 300) {
				// "text" とそれ以外で取得方法を分類する
				var response = requestObject.responseType === "text" ? request.responseText : request.response;
				callback(null!, response);
			} else {
				callback(ExceptionFactory.createAssetLoadError("loading error. status: " + request.status));
			}
		}, false);
		request.addEventListener("error", () => {
			callback(ExceptionFactory.createAssetLoadError("loading error. status: " + request.status));
		}, false);
		request.send();
	}
}
