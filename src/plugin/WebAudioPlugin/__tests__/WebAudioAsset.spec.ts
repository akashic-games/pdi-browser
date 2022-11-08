import "./helpers/mock";

import { MockAudioSystem } from "../../__tests__/helpers/MockAudioSystem";
import { WebAudioAsset } from "../WebAudioAsset";

describe("HTMLAudioAsset", () => {
	beforeEach(() => {
		WebAudioAsset.supportedFormats = ["ogg", "aac"];
	});

	it("can instantiate", () => {
		const system = new MockAudioSystem({ id: "audio-system" });
		const asset = new WebAudioAsset("audio-asset", "/path/to/audio", 100, system, false, { streaming: false }, 10);
		expect(asset.id).toBe("audio-asset");
		expect(asset.path).toBe("/path/to/audio.ogg");
		expect(asset.offset).toBe(10);
		expect(asset.duration).toBe(100);
		expect(asset.hint).toEqual({ streaming: false });
		expect(asset.loop).toBe(false);
		expect(asset._system).toEqual(system);
	});
});
