import "./helpers/mock";

import { AudioManager } from "../../../AudioManager";
import { MockAudioSystem } from "../../__tests__/helpers/MockAudioSystem";
import { WebAudioAsset } from "../WebAudioAsset";
import { WebAudioPlayer } from "../WebAudioPlayer";

describe("WebAudioPlayer", () => {
	it("can instantiate", () => {
		const system = new MockAudioSystem({ id: "audio-system" });
		const manager = new AudioManager();
		const player = new WebAudioPlayer(system, manager);
		expect(player.volume).toBe(1.0);
		expect(player._muted).toBe(false);
		expect(player._system).toEqual(system);
	});

	describe("#play", () => {
		beforeEach(() => {
			WebAudioAsset.supportedFormats = ["ogg", "aac"];
		});

		it("can play/stop", () => {
			const system = new MockAudioSystem({ id: "audio-system" });
			const manager = new AudioManager();
			const player = new WebAudioPlayer(system, manager);
			const asset = new WebAudioAsset("audio-asset", "/path/to/audio", 100, system, false, { streaming: false }, 0, undefined);

			expect(player.currentAudio).toBeUndefined();

			player.play(asset);
			expect(player.currentAudio).toEqual(asset);

			player.stop();
			expect(player.currentAudio).toBeUndefined();
		});
	});
});
