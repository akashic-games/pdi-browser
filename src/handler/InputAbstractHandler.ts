"use strict";
import * as g from "@akashic/akashic-engine";
import * as pdi from "@akashic/akashic-pdi";
import { OffsetPosition } from "./OffsetPosition";

export interface Scale {
	x: number;
	y: number;
}

/**
 * 入力ハンドラ。
 *
 * コンストラクタで受け取ったViewに対してDOMイベントのハンドラを設定する。
 * DOMイベント情報から `PointEventResponse` へ変換したデータを `point{Down, Move, Up}Trigger` を通して通知する。
 * Down -> Move -> Up のフローにおける、Moveイベントのロックを管理する。
 */
export class InputAbstractHandler {
	// `start()` で設定するDOMイベントをサポートしているかを返す
	static isSupported(): boolean {
		return false;
	}

	inputView: HTMLElement;
	pointTrigger: g.Trigger<pdi.PointEvent>;
	_disablePreventDefault: boolean;

	private _xScale: number;
	private _yScale: number;

	// 移動中にdownなしでmoveやupを発生してしまうのを防ぐためのロック
	private pointerEventLock: {[key: number]: boolean};

	/**
	 * @param inputView inputViewはDOMイベントを設定するHTMLElement
	 */
	constructor(inputView: HTMLElement, disablePreventDefault?: boolean) {
		if (Object.getPrototypeOf && (Object.getPrototypeOf(this) === InputAbstractHandler.prototype)) {
			throw new Error("InputAbstractHandler is abstract and should not be directly instantiated");
		}
		this.inputView = inputView;
		this.pointerEventLock = {};
		this._xScale = 1;
		this._yScale = 1;
		this._disablePreventDefault = !!disablePreventDefault;
		this.pointTrigger = new g.Trigger<pdi.PointEvent>();
	}

	// 継承したクラスにおいて、適切なDOMイベントを設定する
	start(): void {
		throw new Error("This method is abstract");
	}

	// start() に対応するDOMイベントを開放する
	stop(): void {
		throw new Error("This method is abstract");
	}


	setScale(xScale: number, yScale: number = xScale): void {
		this._xScale = xScale;
		this._yScale = yScale;
	}

	pointDown(identifier: number, pagePosition: OffsetPosition): void {
		this.pointTrigger.fire({
			type: pdi.PointType.Down,
			identifier: identifier,
			offset: this.getOffsetFromEvent(pagePosition)
		});

		// downのイベントIDを保存して、moveとupのイベントの抑制をする(ロックする)
		this.pointerEventLock[identifier] = true;
	}

	pointMove(identifier: number, pagePosition: OffsetPosition): void {
		if (!this.pointerEventLock.hasOwnProperty(identifier + "")) {
			return;
		}
		this.pointTrigger.fire({
			type: pdi.PointType.Move,
			identifier: identifier,
			offset: this.getOffsetFromEvent(pagePosition)
		});
	}

	pointUp(identifier: number, pagePosition: OffsetPosition): void {
		if (!this.pointerEventLock.hasOwnProperty(identifier + "")) {
			return;
		}
		this.pointTrigger.fire({
			type: pdi.PointType.Up,
			identifier: identifier,
			offset: this.getOffsetFromEvent(pagePosition)
		});
		// Upが完了したら、Down->Upが完了したとしてロックを外す
		delete this.pointerEventLock[identifier];
	}

	getOffsetFromEvent(e: OffsetPosition): g.CommonOffset {
		return { x: e.offsetX, y: e.offsetY };
	}

	getScale(): Scale {
		return { x: this._xScale, y: this._yScale };
	}

	getOffsetPositionFromInputView(x: number, y: number): OffsetPosition {
		// windowの左上を0,0とした時のinputViewのoffsetを取得する
		var bounding = this.inputView.getBoundingClientRect();
		var scale = this.getScale();
		return {
			offsetX: (x - Math.round(window.pageXOffset + bounding.left)) / scale.x,
			offsetY: (y - Math.round(window.pageYOffset + bounding.top)) / scale.y
		};
	}
}
