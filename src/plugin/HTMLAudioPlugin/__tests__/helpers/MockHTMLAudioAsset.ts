import fetch from "node-fetch";
import { HTMLAudioAsset } from "../../HTMLAudioAsset";

export class MockHTMLAudioAsset extends HTMLAudioAsset {
	protected createAudioElement(src: string): HTMLAudioElement {
		const audio = mock(new Audio());
		audio.src = src;
		return audio;
	}
}

function mock(audio: HTMLAudioElement): HTMLAudioElement {
	jest.spyOn(audio, "load").mockImplementation(() => {
		fetch(audio.src, { method: "GET" })
			.then((res) => {
				if (!res.ok) {
					jest.spyOn(audio, "networkState", "get").mockReturnValue(HTMLMediaElement.NETWORK_EMPTY);
					const event = new ErrorEvent("error");
					audio.dispatchEvent(event);
					return;
				}
				// https://html.spec.whatwg.org/multipage/media.html#event-media-canplaythrough
				jest.spyOn(audio, "readyState", "get").mockReturnValue(HTMLMediaElement.HAVE_ENOUGH_DATA); // 4
				const event = new Event("canplaythrough");
				audio.dispatchEvent(event);
			})
			.catch(e => {
				jest.spyOn(audio, "networkState", "get").mockReturnValue(HTMLMediaElement.NETWORK_EMPTY);
				const event = new ErrorEvent("abort", e);
				audio.dispatchEvent(event);
			});
	});

	jest.spyOn(audio, "play").mockImplementation(() => {
		window.setTimeout(() => {
			const event = new Event("play");
			audio.dispatchEvent(event);
		}, 0);

		// NOTE: 一律で 1 秒後に ended イベントを発火
		window.setTimeout(() => {
			const event = new Event("ended");
			audio.dispatchEvent(event);
		}, 1000);

		return Promise.resolve();
	});

	// NOTE: 自動的に BaseUrl が補完される (http://localhost/${src} となる) ため setter, getter を上書きする
	jest.spyOn(audio, "src", "set").mockImplementation((src: string) => void (audio.dataset.src = toAbsoluteUrl(src)));
	jest.spyOn(audio, "src", "get").mockImplementation(() => audio.dataset.src ?? "");

	return audio;
}

function toAbsoluteUrl(path: string): string {
	return new URL(path, process.env.BASE_URL).toString();
}
