import { PlatformButtonType } from "@akashic/pdi-types";
import { InputEventHandler, preventEventDefault } from "./InputEventHandler";

type EventHandler = (event: PointerEvent) => void;

type EventHandlersMap = {
	[pointerId: number]: {
		onPointerMove: EventHandler;
		onPointerUp: EventHandler;
	};
};

/**
 * Pointer Events を利用した入力ハンドラ。
 *
 * コンストラクタで受け取ったViewに対して Pointer Events のハンドラを設定する。
 * DOMイベント情報から `PlatformPointEvent` へ変換したデータを `pointTrigger` を通して通知する。
 * Down -> Move -> Up のフローにおける、Moveイベントのロックを管理する。
 */
export class PointerEventHandler extends InputEventHandler {
	// pointerId ごとのハンドラのマップ情報
	private _eventHandlersMap: EventHandlersMap;

	// `start()` で設定するDOMイベントをサポートしているかを返す
	static isSupported(): boolean {
		return false;
	}

	constructor(inputView: HTMLElement) {
		super(inputView);
		this._eventHandlersMap = Object.create(null);
	}

	start(): void {
		this.inputView.addEventListener("pointerdown", this.onPointerDown, false);
		this.inputView.addEventListener("contextmenu", preventEventDefault, false);
	}

	stop(): void {
		this.inputView.removeEventListener("pointerdown", this.onPointerDown, false);
		this.inputView.removeEventListener("contextmenu", preventEventDefault, false);
	}

	private getPlatformButtonType(e: PointerEvent): PlatformButtonType {
		switch (e.button) {
			case 0:
				// 左クリック
				return PlatformButtonType.Primary;
			case 1:
				// ミドルクリック
				return PlatformButtonType.Auxiliary;
			case 2:
				// 右クリック
				return PlatformButtonType.Secondary;
			default:
				// 上記以外のボタンは左クリックとして扱う
				return PlatformButtonType.Primary;
		}
	}

	private onPointerDown: (e: PointerEvent) => void = (e: PointerEvent): void => {
		this.pointDown(e.pointerId, this.getOffsetPositionFromInputView(e), this.getPlatformButtonType(e));
		const onPointerMove = (event: PointerEvent): void => {
			this.pointMove(event.pointerId, this.getOffsetPositionFromInputView(event), this.getPlatformButtonType(event));
		};
		const onPointerUp = (event: PointerEvent): void => {
			this.pointUp(event.pointerId, this.getOffsetPositionFromInputView(event), this.getPlatformButtonType(event));

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
}
