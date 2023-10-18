import type * as pdi from "@akashic/pdi-types";
import { Trigger } from "@akashic/trigger";
import type { InputEventHandler } from "./handler/InputEventHandler";
import { MouseTouchEventHandler } from "./handler/MouseTouchEventHandler";
import { PointerEventHandler } from "./handler/PointerEventHandler";

export interface InputHandlerLayerParameterObject {
	width: number;
	height: number;
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

	_inputHandler: InputEventHandler;

	/**
	 * @example
	 *
	 * const inputHandlerLayer = new InputHandlerLayer();
	 * inputHandlerLayer.pointEventTrigger.add(function(pointEvent){
	 *   console.log(pointEvent);
	 * });
	 * containerController.appendChild(inputHandlerLayer.view);
	 */
	constructor(param: InputHandlerLayerParameterObject) {
		this.view = this._createInputView(param.width, param.height);
		this._inputHandler = undefined!;
		this.pointEventTrigger = new Trigger<pdi.PlatformPointEvent>();
	}

	// 実行環境でサポートしてるDOM Eventを使い、それぞれonPoint*Triggerを関連付ける
	enablePointerEvent(): void {
		const pointerEventAvailable = !!window.PointerEvent;
		this._inputHandler = pointerEventAvailable ? new PointerEventHandler(this.view) : new MouseTouchEventHandler(this.view);

		// 各種イベントのTrigger
		this._inputHandler.pointTrigger.add((e: pdi.PlatformPointEvent) => {
			this.pointEventTrigger.fire(e);
		});
		this._inputHandler.start();
	}

	// DOMイベントハンドラを開放する
	disablePointerEvent(): void {
		this._inputHandler?.stop();
	}

	setOffset(offset: pdi.CommonOffset): void {
		const inputViewStyle = `position:relative; left:${offset.x}px; top:${offset.y}px`;
		this._inputHandler.inputView.setAttribute("style", inputViewStyle);
	}

	setViewSize(size: pdi.CommonSize): void {
		const view = this.view;
		view.style.width = size.width + "px";
		view.style.height = size.height + "px";
	}

	setViewTabIndex(tabIndex: string): void {
		const view = this.view;
		view.setAttribute("tabindex", tabIndex);
	}

	private _createInputView(width: number, height: number): HTMLDivElement {
		const view = document.createElement("div");
		view.setAttribute("style", "display:inline-block; outline:none;");
		view.style.width = width + "px";
		view.style.height = height + "px";
		view.setAttribute("tabindex", "0");
		return view;
	}
}
