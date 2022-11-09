import { MockAudioSystem } from "../../__tests__/helpers/MockAudioSystem";
import { HTMLAudioAsset } from "../HTMLAudioAsset";

describe("HTMLAudioAsset", () => {
	beforeEach(() => {
		HTMLAudioAsset.supportedFormats = ["ogg", "aac"];
	});

	it("can instantiate", () => {
		const system = new MockAudioSystem({ id: "audio-system" });
		const asset = new HTMLAudioAsset("audio-asset", "/path/to/audio", 100, system, false, { streaming: false }, 10);
		expect(asset.id).toBe("audio-asset");
		expect(asset.path).toBe("/path/to/audio.ogg");
		expect(asset.offset).toBe(10);
		expect(asset.duration).toBe(100);
		expect(asset.hint).toEqual({ streaming: false });
		expect(asset.loop).toBe(false);
		expect(asset._system).toEqual(system);
	});
});
