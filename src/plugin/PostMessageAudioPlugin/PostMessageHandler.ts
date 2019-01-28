import * as g from "@akashic/akashic-engine";

/**
 * PostMessageを利用したイベントエミッタ。
 * TODO: 暫定対応。このロジックを akashic-gameview-web 側に持たせる
 */
export class PostMessageHandler<T> {
	message: g.Trigger<T> = new g.Trigger();

	private targetWindow: Window;
	private targetOrigin: string;
	private onMessage_bound: (message: MessageEvent) => void;

	constructor(targetWindow: Window, targetOrigin: string) {
		this.targetWindow = targetWindow;
		this.targetOrigin = targetOrigin;
		this.onMessage_bound = this.onMessage.bind(this);
	}

	start(): void {
		window.addEventListener("message", this.onMessage_bound);
	}

	stop(): void {
		window.removeEventListener("message", this.onMessage_bound);
	}

	send(message: T): void {
		this.targetWindow.postMessage(message, this.targetOrigin);
	}

	private onMessage(message: MessageEvent): void {
		if (message.origin !== this.targetOrigin) {
			return;
		}
		this.message.fire(message.data);
	}
}
