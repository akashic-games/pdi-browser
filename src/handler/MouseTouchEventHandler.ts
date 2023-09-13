import { PlatformButtonType } from "@akashic/pdi-types";
import { InputEventHandler, preventEventDefault } from "./InputEventHandler";

/**
 * Mouse/Touch Events を利用した入力ハンドラ。
 *
 * Pointer Event が利用できない環境を想定するフォールバック実装。
 * preventDefault() による副作用があるので、可能な環境では PointerEventHandler を利用すること。
 */
export class MouseTouchEventHandler extends InputEventHandler {
	private static MOUSE_IDENTIFIER: number = 1;
	private pressingMouseButton: number | null = null;

	// `start()` で設定するDOMイベントをサポートしているかを返す
	static isSupported(): boolean {
		return false;
	}

	start(): void {
		this.inputView.addEventListener("mousedown", this.onMouseDown, false);
		this.inputView.addEventListener("touchstart", this.onTouchStart);
		this.inputView.addEventListener("touchmove", this.onTouchMove);
		this.inputView.addEventListener("touchend", this.onTouchEnd);
		this.inputView.addEventListener("contextmenu", preventEventDefault);
	}

	stop(): void {
		this.inputView.removeEventListener("mousedown", this.onMouseDown, false);
		this.inputView.removeEventListener("touchstart", this.onTouchStart);
		this.inputView.removeEventListener("touchmove", this.onTouchMove);
		this.inputView.removeEventListener("touchend", this.onTouchEnd);
		this.inputView.removeEventListener("contextmenu", preventEventDefault);
	}

	private getPlatformButtonType(e: MouseEvent): PlatformButtonType {
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

	private onMouseDown: (e: MouseEvent) => void = e => {
		// TODO ボタンが複数押される状態をサポートする
		if (this.pressingMouseButton != null) return null;
		this.pressingMouseButton = e.button;

		this.pointDown(MouseTouchEventHandler.MOUSE_IDENTIFIER, this.getOffsetPositionFromInputView(e), this.getPlatformButtonType(e));
		window.addEventListener("mousemove", this.onWindowMouseMove, false);
		window.addEventListener("mouseup", this.onWindowMouseUp, false);
		// NOTE ここで e.preventDefault() してはならない。
		// preventDefault() すると、iframe 内で動作していて iframe 外にドラッグした時に mousemove が途切れるようになる。
	};

	private onWindowMouseMove: (e: MouseEvent) => void = e => {
		this.pointMove(MouseTouchEventHandler.MOUSE_IDENTIFIER, this.getOffsetPositionFromInputView(e), this.getPlatformButtonType(e));
	};

	private onWindowMouseUp: (e: MouseEvent) => void = e => {
		if (this.pressingMouseButton !== e.button) return;
		this.pressingMouseButton = null;

		this.pointUp(MouseTouchEventHandler.MOUSE_IDENTIFIER, this.getOffsetPositionFromInputView(e), this.getPlatformButtonType(e));
		window.removeEventListener("mousemove", this.onWindowMouseMove, false);
		window.removeEventListener("mouseup", this.onWindowMouseUp, false);
	};

	private onTouchStart: (e: TouchEvent) => void = e => {
		const touches = e.changedTouches;
		for (let i = 0, len = touches.length; i < len; i++) {
			const touch = touches[i];
			this.pointDown(touch.identifier, this.getOffsetPositionFromInputView(touch), PlatformButtonType.Primary);
		}

		// NOTE touch に追従して発生する mouse イベントを抑止するために preventDefault() する。
		// ref. https://w3c.github.io/touch-events/#mouse-events
		// なおこの preventDefault() は iOS WebView では別の副作用を持つ: このクラスは iOS では利用すべきでない。
		e.preventDefault();
	};

	private onTouchMove: (e: TouchEvent) => void = e => {
		const touches = e.changedTouches;
		for (let i = 0, len = touches.length; i < len; i++) {
			const touch = touches[i];
			this.pointMove(touch.identifier, this.getOffsetPositionFromInputView(touch), PlatformButtonType.Primary);
		}
	};

	private onTouchEnd: (e: TouchEvent) => void = e => {
		const touches = e.changedTouches;
		for (let i = 0, len = touches.length; i < len; i++) {
			const touch = touches[i];
			this.pointUp(touch.identifier, this.getOffsetPositionFromInputView(touch), PlatformButtonType.Primary);
		}
		window.removeEventListener("touchmove", this.onTouchMove, false);
		window.removeEventListener("touchend", this.onTouchEnd, false);
	};
}
