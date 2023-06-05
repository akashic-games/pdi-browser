import type { CommonOffset, PlatformButtonType, PlatformPointEvent} from "@akashic/pdi-types";
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

type EventHandler = (event: PointerEvent) => void;

type EventHandlersMap = {
	[pointerId: number]: {
		onPointerMove: EventHandler;
		onPointerUp: EventHandler;
	};
};

/**
 * pointer-events を利用した入力ハンドラ。
 *
 * コンストラクタで受け取ったViewに対して pointer-events のハンドラを設定する。
 * DOMイベント情報から `PlatformPointEvent` へ変換したデータを `pointTrigger` を通して通知する。
 * Down -> Move -> Up のフローにおける、Moveイベントのロックを管理する。
 */
export class PointerEventHandler {
	inputView: HTMLElement;
	pointTrigger: Trigger<PlatformPointEvent>;

	private _xScale: number;
	private _yScale: number;
	// 移動中にdownなしでmoveやupを発生してしまうのを防ぐためのロック
	private pointerEventLock: { [key: number]: boolean };
	// pointerId ごとのハンドラのマップ情報
	private _eventHandlersMap: EventHandlersMap;

	// `start()` で設定するDOMイベントをサポートしているかを返す
	static isSupported(): boolean {
		return false;
	}

	constructor(inputView: HTMLElement) {
		this.inputView = inputView;
		this.pointerEventLock = {};
		this._eventHandlersMap = Object.create(null);
		this._xScale = 1;
		this._yScale = 1;
		this.pointTrigger = new Trigger<PlatformPointEvent>();
		inputView.style.touchAction = "none";
		inputView.style.userSelect = "none";
	}

	start(): void {
		this.inputView.addEventListener("pointerdown", this.onPointerDown, false);
		this.inputView.addEventListener("contextmenu", this.onContextMenu, false);
	}

	stop(): void {
		this.inputView.removeEventListener("pointerdown", this.onPointerDown, false);
		this.inputView.removeEventListener("contextmenu", this.onContextMenu, false);
	}

	setScale(xScale: number, yScale: number = xScale): void {
		this._xScale = xScale;
		this._yScale = yScale;
	}

	pointDown(identifier: number, pagePosition: OffsetPosition, button: PlatformButtonType): void {
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

	private onPointerDown: (e: PointerEvent) => void = (e: PointerEvent): void => {
		this.pointDown(e.pointerId, this.getOffsetPositionFromInputView(e), e.button);
		const onPointerMove = (event: PointerEvent): void => {
			this.pointMove(event.pointerId, this.getOffsetPositionFromInputView(event), e.button);
		};
		const onPointerUp = (event: PointerEvent): void => {
			this.pointUp(event.pointerId, this.getOffsetPositionFromInputView(event), e.button);

			if (e.pointerId === event.pointerId) {
				const handlers = this._eventHandlersMap[event.pointerId];
				if (!handlers) return;
				const { onPointerMove, onPointerUp } = handlers;
				window.removeEventListener("pointermove", onPointerMove, false);
				window.removeEventListener("pointerup", onPointerUp, false);
				delete this._eventHandlersMap[event.pointerId];
			}
		};

		window.addEventListener("pointermove", onPointerMove, false);
		window.addEventListener("pointerup", onPointerUp, false);
		this._eventHandlersMap[e.pointerId] = { onPointerMove, onPointerUp };
	};

	private onContextMenu: (ev: Event) => void = (ev: Event) => {
		ev.preventDefault();
	};
}
