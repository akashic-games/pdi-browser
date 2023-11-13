import { AudioManager } from "../../../AudioManager";
import { MockAudioSystem } from "../../__tests__/helpers/MockAudioSystem";
import { ProxyAudioAsset } from "../ProxyAudioAsset";
import { ProxyAudioPlayer } from "../ProxyAudioPlayer";
import { MockProxyAudioHandlerSet } from "./helpers/MockProxyAudioHandlerSet";

describe("ProxyAudioPlayer", () => {
	beforeEach(() => {
		// NOTE: 各テストで handlerSet から渡される AudioPlayer の ID を常に "ap0" から始まるようにする (もう少し賢いやり方があるかもしれない)
		(ProxyAudioPlayer as any)._audioPlayerIdCounter = 0;
	});

	it("can instantiate", () => {
		const system = new MockAudioSystem({ id: "audio-system" });
		const manager = new AudioManager();
		const handlerSet = new MockProxyAudioHandlerSet();
		const player = new ProxyAudioPlayer(handlerSet, system, manager);
		expect(player.volume).toBe(1.0);
		expect(player._muted).toBe(false);
		expect(player._system).toEqual(system);
	});

	it("can play/stop", () => {
		const system = new MockAudioSystem({ id: "audio-system" });
		const manager = new AudioManager();
		const handlerSet = new MockProxyAudioHandlerSet();
		const player = new ProxyAudioPlayer(handlerSet, system, manager);
		const asset = new ProxyAudioAsset(handlerSet, "audio-asset", "/path/to/audio", 100, system, false, { streaming: false }, 0, 20);

		expect(player.currentAudio).toBeUndefined();
		expect(handlerSet.playAudioPlayer).not.toBeCalled();
		expect(handlerSet.stopAudioPlayer).not.toBeCalled();

		player.play(asset);
		expect(player.currentAudio).toEqual(asset);

		player.stop();
		expect(player.currentAudio).toBeUndefined();
		expect(handlerSet.stopAudioPlayer).toBeCalledWith("ap0");
	});

	it("can stop the player called play() twice", () => {
		const system = new MockAudioSystem({ id: "audio-system" });
		const manager = new AudioManager();
		const handlerSet = new MockProxyAudioHandlerSet();
		const player = new ProxyAudioPlayer(handlerSet, system, manager);
		const asset = new ProxyAudioAsset(handlerSet, "audio-asset", "/path/to/audio", 100, system, false, { streaming: false }, 0, 20);

		player.play(asset);
		player.play(asset);
		expect(handlerSet.stopAudioPlayer).toBeCalledTimes(1);
		expect(handlerSet.stopAudioPlayer).toBeCalledWith("ap0");
	});

	it("can call ProxyAudioHandlerSet#createAudioPlayer", () => {
		const system = new MockAudioSystem({ id: "audio-system" });
		const manager = new AudioManager();
		const handlerSet = new MockProxyAudioHandlerSet();
		const player = new ProxyAudioPlayer(handlerSet, system, manager);
		const asset = new ProxyAudioAsset(handlerSet, "audio-asset", "/path/to/audio", 100, system, false, { streaming: false }, 0, 20);

		expect(handlerSet.createAudioPlayer).not.toBeCalled();

		player.play(asset);
		expect(handlerSet.createAudioPlayer).toBeCalledWith({
			assetId: "audio-asset",
			audioPlayerId: "ap0",
			isPlaying: true,
			playbackRate: 1,
			volume: 1
		});
	});

	it("can call ProxyAudioHandlerSet#destroyAudioPlayer", () => {
		const system = new MockAudioSystem({ id: "audio-system" });
		const manager = new AudioManager();
		const handlerSet = new MockProxyAudioHandlerSet();
		const player = new ProxyAudioPlayer(handlerSet, system, manager);
		const asset = new ProxyAudioAsset(handlerSet, "audio-asset", "/path/to/audio", 100, system, false, { streaming: false }, 0, 20);

		expect(handlerSet.destroyAudioPlayer).not.toBeCalled();

		player.play(asset);
		player.stop();
		expect(handlerSet.destroyAudioPlayer).toBeCalledWith("ap0");
	});

	it("can call ProxyAudioHandlerSet#changeAudioVolume", () => {
		const system = new MockAudioSystem({ id: "audio-system" });
		const manager = new AudioManager();
		const handlerSet = new MockProxyAudioHandlerSet();
		const player = new ProxyAudioPlayer(handlerSet, system, manager);
		const asset = new ProxyAudioAsset(handlerSet, "audio-asset", "/path/to/audio", 100, system, false, { streaming: false }, 0, 20);

		expect(handlerSet.changeAudioVolume).not.toBeCalled();

		const vol = 0.124;
		player.play(asset);
		player.changeVolume(vol);

		expect(handlerSet.changeAudioVolume).toBeCalledWith("ap0", vol);
	});
});
