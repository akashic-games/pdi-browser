import type { CommonOffset, PlatformButtonType, PlatformPointEvent } from "@akashic/pdi-types";
import { PlatformPointType } from "@akashic/pdi-types";
import { Trigger } from "@akashic/trigger";
import type { OffsetPosition } from "./OffsetPosition";

export interface Scale {
	x: number;
	y: number;
}

export interface PagePosition {
	pageX: number;
	pageY: number;
}

/**
 * 入力ハンドラ。
 *
 * コンストラクタで受け取ったViewに対してのハンドラを設定する。
 * DOMイベント情報から `PlatformPointEvent` へ変換したデータを `pointTrigger` を通して通知する。
 * Down -> Move -> Up のフローにおける、Moveイベントのロックを管理する。
 */
export abstract class InputEventHandler {
	inputView: HTMLElement;
	pointTrigger: Trigger<PlatformPointEvent>;

	protected _xScale: number;
	protected _yScale: number;
	// 移動中にdownなしでmoveやupを発生してしまうのを防ぐためのロック
	protected pointerEventLock: { [key: number]: boolean };

	// `start()` で設定するDOMイベントをサポートしているかを返す
	static isSupported(): boolean {
		return false;
	}

	constructor(inputView: HTMLElement) {
		this.inputView = inputView;
		this.pointerEventLock = {};
		this._xScale = 1;
		this._yScale = 1;
		this.pointTrigger = new Trigger<PlatformPointEvent>();
		inputView.style.touchAction = "none";
		inputView.style.userSelect = "none";
	}

	abstract start(): void;
	abstract stop(): void;

	setScale(xScale: number, yScale: number = xScale): void {
		this._xScale = xScale;
		this._yScale = yScale;
	}

	pointDown(identifier: number, pagePosition: OffsetPosition, button: PlatformButtonType): void {
		// chrome で view の境界部分をクリックした際にポイント座標が view の外の座標となることがあるため、view 外の座標の場合は除外する
		if ( pagePosition.offsetX < 0
			|| pagePosition.offsetY < 0
			|| pagePosition.offsetX > this.inputView.offsetWidth
			|| pagePosition.offsetY > this.inputView.offsetHeight
		) return;

		this.pointTrigger.fire({
			type: PlatformPointType.Down,
			identifier: identifier,
			offset: this.getOffsetFromEvent(pagePosition),
			button
		});

		// downのイベントIDを保存して、moveとupのイベントの抑制をする(ロックする)
		this.pointerEventLock[identifier] = true;
	}

	pointMove(identifier: number, pagePosition: OffsetPosition, button: PlatformButtonType): void {
		if (!this.pointerEventLock.hasOwnProperty(identifier + "")) {
			return;
		}
		this.pointTrigger.fire({
			type: PlatformPointType.Move,
			identifier: identifier,
			offset: this.getOffsetFromEvent(pagePosition),
			button
		});
	}

	pointUp(identifier: number, pagePosition: OffsetPosition, button: PlatformButtonType): void {
		if (!this.pointerEventLock.hasOwnProperty(identifier + "")) {
			return;
		}
		this.pointTrigger.fire({
			type: PlatformPointType.Up,
			identifier: identifier,
			offset: this.getOffsetFromEvent(pagePosition),
			button
		});
		// Upが完了したら、Down->Upが完了したとしてロックを外す
		delete this.pointerEventLock[identifier];
	}

	getOffsetFromEvent(e: OffsetPosition): CommonOffset {
		return { x: e.offsetX, y: e.offsetY };
	}

	getScale(): Scale {
		return { x: this._xScale, y: this._yScale };
	}

	getOffsetPositionFromInputView(position: PagePosition): OffsetPosition {
		// windowの左上を0,0とした時のinputViewのoffsetを取得する
		const bounding = this.inputView.getBoundingClientRect();
		const scale = this.getScale();
		return {
			offsetX: (position.pageX - Math.round(window.pageXOffset + bounding.left)) / scale.x,
			offsetY: (position.pageY - Math.round(window.pageYOffset + bounding.top)) / scale.y
		};
	}
}

export function preventEventDefault(ev: Event): void {
	ev.preventDefault();
}
