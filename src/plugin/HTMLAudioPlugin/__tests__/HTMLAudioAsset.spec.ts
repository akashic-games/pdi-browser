import { MockAudioSystem } from "../../__tests__/helpers/MockAudioSystem";
import { HTMLAudioAsset } from "../HTMLAudioAsset";

describe("HTMLAudioAsset", () => {
	beforeEach(() => {
		HTMLAudioAsset.supportedFormats = ["m4a", "ogg", "aac"];
	});

	it("can instantiate", () => {
		const system = new MockAudioSystem({ id: "audio-system" });
		const asset = new HTMLAudioAsset("audio-asset", "/path/to/audio", 100, system, false, { streaming: false }, 10, undefined);
		expect(asset.id).toBe("audio-asset");
		expect(asset.path).toBe("/path/to/audio.ogg");
		expect(asset.offset).toBe(10);
		expect(asset.loopOffset).toBeUndefined();
		expect(asset.duration).toBe(100);
		expect(asset.hint).toEqual({ streaming: false });
		expect(asset.loop).toBe(false);
		expect(asset._system).toEqual(system);
	});

	it("hint.extensionsが指定されている場合、supportredFormats の登録順の早いものが優先的に選択される", () => {
		const system = new MockAudioSystem({ id: "audio-system" });
		const asset = new HTMLAudioAsset(
			"audio-asset",
			"/path/to/audio",
			100,
			system,
			false,
			{ streaming: false, extensions: [".m4a", ".aac"] },
			10,
			undefined
		);
		expect(asset.id).toBe("audio-asset");
		expect(asset.path).toBe("/path/to/audio.m4a");
	});

	it("hint.extensionsで指定されている拡張子でもsupportredFormatsに登録されていないものは選択されない", () => {
		const system = new MockAudioSystem({ id: "audio-system" });
		const asset = new HTMLAudioAsset(
			"audio-asset",
			"/path/to/audio",
			100,
			system,
			false,
			{ streaming: false, extensions: [".mp4", ".aac"] },
			10,
			undefined
		);
		expect(asset.id).toBe("audio-asset");
		expect(asset.path).toBe("/path/to/audio.aac");
	});
});
