import "./helpers/mock";

import { MockAudioSystem } from "../../__tests__/helpers/MockAudioSystem";
import { WebAudioAsset } from "../WebAudioAsset";

describe("HTMLAudioAsset", () => {
	beforeEach(() => {
		WebAudioAsset.supportedFormats = ["ogg", "aac", "m4a"];
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

	it("can decide path by hint.extensions", () => {
		// hint.extensionsで指定されている拡張子が優先的に選択される
		const system = new MockAudioSystem({ id: "audio-system" });
		const asset1 = new WebAudioAsset(
			"audio-asset1",
			"/path/to/audio",
			100,
			system,
			false,
			{ streaming: false, extensions: ["m4a", "aac"] },
			10
		);
		expect(asset1.id).toBe("audio-asset1");
		expect(asset1.path).toBe("/path/to/audio.m4a");

		// hint.extensionsで指定されている拡張子でもサポートされていないものは選択されない
		const asset2 = new WebAudioAsset(
			"audio-asset2",
			"/path/to/audio",
			100,
			system,
			false,
			{ streaming: false, extensions: ["mp4", "aac"] },
			10
		);
		expect(asset2.id).toBe("audio-asset2");
		expect(asset2.path).toBe("/path/to/audio.aac");
	});
});
