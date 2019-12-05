import { MouseHandler } from "./MouseHandler";

export class TouchHandler extends MouseHandler {
	private onTouchDown: (e: TouchEvent) => void;
	private onTouchMove: (e: TouchEvent) => void;
	private onTouchUp: (e: TouchEvent) => void;

	constructor(inputView: HTMLElement, disablePreventDefault: boolean) {
		super(inputView, disablePreventDefault);
		this.onTouchDown = (e: TouchEvent) => {
			var touches = e.changedTouches;
			for (var i = 0, len = touches.length; i < len; i++) {
				var touch = touches[i];
				this.pointDown(touch.identifier, this.getOffsetPositionFromInputView(touch));
			}
			if (!this._disablePreventDefault) {
				e.stopPropagation();
				if (e.cancelable) e.preventDefault();
			}
		};
		this.onTouchMove = (e: TouchEvent) => {
			var touches = e.changedTouches;
			for (var i = 0, len = touches.length; i < len; i++) {
				var touch = touches[i];
				this.pointMove(touch.identifier, this.getOffsetPositionFromInputView(touch));
			}
			if (!this._disablePreventDefault) {
				e.stopPropagation();
				if (e.cancelable) e.preventDefault();
			}
		};
		this.onTouchUp = (e: TouchEvent) => {
			var touches = e.changedTouches;
			for (var i = 0, len = touches.length; i < len; i++) {
				var touch = touches[i];
				this.pointUp(touch.identifier, this.getOffsetPositionFromInputView(touch));
			}
			if (!this._disablePreventDefault) {
				e.stopPropagation();
				if (e.cancelable) e.preventDefault();
			}
		};
	}

	start(): void {
		super.start();
		this.inputView.addEventListener("touchstart", this.onTouchDown);
		this.inputView.addEventListener("touchmove", this.onTouchMove);
		this.inputView.addEventListener("touchend", this.onTouchUp);
	}

	stop(): void {
		super.stop();
		this.inputView.removeEventListener("touchstart", this.onTouchDown);
		this.inputView.removeEventListener("touchmove", this.onTouchMove);
		this.inputView.removeEventListener("touchend", this.onTouchUp);
	}
}
