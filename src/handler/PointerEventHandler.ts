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

	private getPlatformButtonType(e: PointerEvent, defaultValue: number): PlatformButtonType {
		switch (e.button) {
			case -1:
				// 変化なし
				return PlatformButtonType.Unchanged;
			case 0:
				// 主ボタン（通常は左ボタン）
				return PlatformButtonType.Primary;
			case 1:
				// 予備ボタン（通常は中ボタン）
				return PlatformButtonType.Auxiliary;
			case 2:
				// 副ボタン（通常は右ボタン）
				return PlatformButtonType.Secondary;
			default:
				return defaultValue;
		}
	}

	private onPointerDown: (e: PointerEvent) => void = (e: PointerEvent): void => {
		this.pointDown(e.pointerId, this.getOffsetPositionFromInputView(e), this.getPlatformButtonType(e, PlatformButtonType.Primary));

		const onPointerMove = (event: PointerEvent): void => {
			if (e.pointerId !== event.pointerId) {
				return;
			}
			this.pointMove(
				event.pointerId,
				this.getOffsetPositionFromInputView(event),
				this.getPlatformButtonType(event, PlatformButtonType.Unchanged)
			);
		};

		const onPointerUp = (event: PointerEvent): void => {
			if (e.pointerId !== event.pointerId) {
				return;
			}
			this.pointUp(
				event.pointerId,
				this.getOffsetPositionFromInputView(event),
				this.getPlatformButtonType(event, PlatformButtonType.Primary)
			);

			const handlers = this._eventHandlersMap[event.pointerId];
			if (!handlers) return;
			const { onPointerMove, onPointerUp } = handlers;
			window.removeEventListener("pointermove", onPointerMove, false);
			window.removeEventListener("pointerup", onPointerUp, false);
			window.removeEventListener("pointercancel", onPointerUp, false);
			delete this._eventHandlersMap[event.pointerId];
		};

		window.addEventListener("pointermove", onPointerMove, false);
		window.addEventListener("pointerup", onPointerUp, false);
		window.addEventListener("pointercancel", onPointerUp, false);
		this._eventHandlersMap[e.pointerId] = { onPointerMove, onPointerUp };
	};
}
