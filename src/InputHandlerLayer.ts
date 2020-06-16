import * as pdi from "@akashic/akashic-pdi";
import { Trigger } from "@akashic/trigger";
import { InputAbstractHandler } from "./handler/InputAbstractHandler";
import { TouchHandler } from "./handler/TouchHandler";

export interface InputHandlerLayerParameterObject {
	width: number;
	height: number;
	disablePreventDefault?: boolean;
}

/**
 * ユーザの入力を受け付けるViewのレイヤー。
 *
 * 実行環境に適切なDOMイベントを設定し、DOMイベントから座標データへ変換した結果をGameに伝える。
 * InputHandlerLayerはあくまで一つのレイヤーであり、Containerではない。
 * 従ってこのViewの親子要素がどうなっているかを知る必要はない。
 */
export class InputHandlerLayer {
	view: HTMLDivElement;

	// DOMで起きたイベントを通知するTrigger
	pointEventTrigger: Trigger<pdi.PlatformPointEvent>;

	_inputHandler: InputAbstractHandler;
	private _disablePreventDefault: boolean;

	/**
	 * @example
	 *
	 * var inputHandlerLayer = new InputHandlerLayer();
	 * inputHandlerLayer.pointEventTrigger.add(function(pointEvent){
	 *   console.log(pointEvent);
	 * });
	 * containerController.appendChild(inputHandlerLayer.view);
	 */
	constructor(param: InputHandlerLayerParameterObject) {
		this.view = this._createInputView(param.width, param.height);
		this._inputHandler = undefined;
		this.pointEventTrigger = new Trigger<pdi.PlatformPointEvent>();

		this._disablePreventDefault = !!param.disablePreventDefault;
	}

	// 実行環境でサポートしてるDOM Eventを使い、それぞれonPoint*Triggerを関連付ける
	enablePointerEvent(): void {
		this._inputHandler = new TouchHandler(this.view, this._disablePreventDefault);
		// 各種イベントのTrigger
		this._inputHandler.pointTrigger.add((e: pdi.PlatformPointEvent) => {
			this.pointEventTrigger.fire(e);
		});
		this._inputHandler.start();
	}

	// DOMイベントハンドラを開放する
	disablePointerEvent(): void {
		if (this._inputHandler)
			this._inputHandler.stop();
	}

	setOffset(offset: pdi.CommonOffset): void {
		var inputViewStyle = `position:relative; left:${offset.x}px; top:${offset.y}px`;
		this._inputHandler.inputView.setAttribute("style", inputViewStyle);
	}

	setViewSize(size: pdi.CommonSize): void {
		const view = this.view;
		view.style.width = size.width + "px";
		view.style.height = size.height + "px";
	}

	private _createInputView(width: number, height: number): HTMLDivElement {
		var view = document.createElement("div");
		view.setAttribute("tabindex", "1");
		view.className = "input-handler";
		view.setAttribute("style", "display:inline-block; outline:none;");
		view.style.width = width + "px";
		view.style.height = height + "px";
		return view;
	}
}
