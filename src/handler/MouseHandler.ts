import { InputAbstractHandler } from "./InputAbstractHandler";

export class MouseHandler extends InputAbstractHandler {
	private onMouseDown: (e: MouseEvent) => void;
	private onMouseMove: (e: MouseEvent) => void;
	private onMouseUp: (e: MouseEvent) => void;

	constructor(inputView: HTMLElement, disablePreventDefault: boolean) {
		super(inputView, disablePreventDefault);
		var identifier = 1;
		this.onMouseDown = (e: MouseEvent) => {
			if (e.button !== 0) return; // NOTE: 左クリック以外を受け付けない
			this.pointDown(identifier, this.getOffsetPositionFromInputView(e));
			window.addEventListener("mousemove", this.onMouseMove, false);
			window.addEventListener("mouseup", this.onMouseUp, false);
			if (!this._disablePreventDefault) {
				e.stopPropagation();
				e.preventDefault();
			}
		};
		this.onMouseMove = (e: MouseEvent) => {
			this.pointMove(identifier, this.getOffsetPositionFromInputView(e));
			if (!this._disablePreventDefault) {
				e.stopPropagation();
				e.preventDefault();
			}
		};
		this.onMouseUp = (e: MouseEvent) => {
			this.pointUp(identifier, this.getOffsetPositionFromInputView(e));
			window.removeEventListener("mousemove", this.onMouseMove, false);
			window.removeEventListener("mouseup", this.onMouseUp, false);
			if (!this._disablePreventDefault) {
				e.stopPropagation();
				e.preventDefault();
			}
		};
	}

	start(): void {
		this.inputView.addEventListener("mousedown", this.onMouseDown, false);
	}

	stop(): void {
		this.inputView.removeEventListener("mousedown", this.onMouseDown, false);
	}
}
