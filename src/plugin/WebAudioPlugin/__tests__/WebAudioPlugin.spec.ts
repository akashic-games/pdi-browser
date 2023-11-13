import "./helpers/mock";

import { AudioManager } from "../../../AudioManager";
import { MockAudioSystem } from "../../__tests__/helpers/MockAudioSystem";
import { WebAudioAsset } from "../WebAudioAsset";
import { WebAudioPlugin } from "../WebAudioPlugin";

describe("WebAudioPlugin", () => {
	it("isSupported()", () => {
		expect(typeof WebAudioPlugin.isSupported).toBe("function");
		expect(typeof WebAudioPlugin.isSupported()).toBe("boolean");
	});

	it("createAsset", () => {
		const plugin = new WebAudioPlugin();
		plugin.supportedFormats = ["ogg", "aac"];
		const system = new MockAudioSystem({ id: "audio-system" });
		const asset = plugin.createAsset("audio-asset", "/path/to/audio", 100, system, false, { streaming: false }, 10, 20);

		expect(asset.id).toBe("audio-asset");
		expect(asset.path).toBe("/path/to/audio.ogg");
		expect(asset.offset).toBe(10);
		expect(asset.loopOffset).toBe(20);
		expect(asset.duration).toBe(100);
		expect(asset.hint).toEqual({ streaming: false });
		expect(asset.loop).toBe(false);
		expect(asset._system).toEqual(system);
	});

	it("createPlayer", () => {
		const plugin = new WebAudioPlugin();
		const system = new MockAudioSystem({ id: "audio-system" });
		const manager = new AudioManager();
		const player = plugin.createPlayer(system, manager);
		expect(player._system).toEqual(system);
	});

	it("supportedFormats", () => {
		const plugin = new WebAudioPlugin();
		expect(plugin.supportedFormats).toEqual([]);

		plugin.supportedFormats = ["ogg", "aac"];
		expect(plugin.supportedFormats).toEqual(["ogg", "aac"]);
		expect(WebAudioAsset.supportedFormats).toEqual(["ogg", "aac"]);
	});
});
