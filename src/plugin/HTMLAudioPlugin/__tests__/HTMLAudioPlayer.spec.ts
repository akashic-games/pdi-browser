import { AudioManager } from "../../../AudioManager";
import { MockAudioSystem } from "../../__tests__/helpers/MockAudioSystem";
import { HTMLAudioAsset } from "../HTMLAudioAsset";
import { HTMLAudioPlayer } from "../HTMLAudioPlayer";

describe("HTMLAudioPlayer", () => {
	it("can instantiate", () => {
		const system = new MockAudioSystem({ id: "audio-system" });
		const manager = new AudioManager();
		const player = new HTMLAudioPlayer(system, manager);
		expect(player.volume).toBe(1.0);
		expect(player._muted).toBe(false);
		expect(player._system).toEqual(system);
	});

	describe("#play", () => {
		beforeEach(() => {
			HTMLAudioAsset.supportedFormats = ["ogg", "aac"];
		});

		it("can play/stop", () => {
			const system = new MockAudioSystem({ id: "audio-system" });
			const manager = new AudioManager();
			const player = new HTMLAudioPlayer(system, manager);
			const asset = new HTMLAudioAsset("audio-asset", "/path/to/audio", 100, system, false, { streaming: false }, 0);

			expect(player.currentAudio).toBeUndefined();

			player.play(asset);
			expect(player.currentAudio).toEqual(asset);

			player.stop();
			expect(player.currentAudio).toBeUndefined();
		});
	});
});
