import { InputAbstractHandler } from "./InputAbstractHandler";

export class MouseHandler extends InputAbstractHandler {
	private eventTarget: EventTarget;
	private onMouseDown: (e: MouseEvent) => void;
	private onMouseMove: (e: MouseEvent) => void;
	private onMouseUp: (e: MouseEvent) => void;

	constructor(inputView: HTMLElement, disablePreventDefault: boolean) {
		super(inputView, disablePreventDefault);
		var identifier = 1;
		this.onMouseDown = (e: MouseEvent) => {
			if (e.button !== 0) return; // NOTE: 左クリック以外を受け付けない
			this.eventTarget = e.target;
			this.pointDown(identifier, e);
			window.addEventListener("mousemove", this.onMouseMove, false);
			window.addEventListener("mouseup", this.onMouseUp, false);
			if (!this._disablePreventDefault) {
				e.stopPropagation();
				e.preventDefault();
			}
		};
		this.onMouseMove = (e: MouseEvent) => {
			if (e.target !== this.eventTarget) return; // 対象の要素が異なる場合、イベントを発火しない
			this.pointMove(identifier, e);
			if (!this._disablePreventDefault) {
				e.stopPropagation();
				e.preventDefault();
			}
		};
		this.onMouseUp = (e: MouseEvent) => {
			if (e.target !== this.eventTarget) return; // 対象の要素が異なる場合、イベントを発火しない
			this.pointUp(identifier, e);
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
