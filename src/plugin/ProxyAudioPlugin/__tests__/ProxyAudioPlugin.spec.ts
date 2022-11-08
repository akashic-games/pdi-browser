import { AudioManager } from "../../../AudioManager";
import { MockAudioSystem } from "../../__tests__/helpers/MockAudioSystem";
import { ProxyAudioPlugin } from "../ProxyAudioPlugin";
import { MockProxyAudioHandlerSet } from "./helpers/MockProxyAudioHandlerSet";

describe("ProxyAudioPlugin", () => {
	it("isSupported()", () => {
		expect(typeof ProxyAudioPlugin.isSupported).toBe("function");
		expect(typeof ProxyAudioPlugin.isSupported()).toBe("boolean");
	});

	it("createAsset", () => {
		const handlerSet = new MockProxyAudioHandlerSet();
		const plugin = new ProxyAudioPlugin(handlerSet);
		const system = new MockAudioSystem({ id: "audio-system" });
		const asset = plugin.createAsset("audio-asset", "/path/to/audio", 100, system, false, { streaming: false }, 10);

		expect(asset.id).toBe("audio-asset");
		expect(asset.path).toBe("/path/to/audio");
		expect(asset.offset).toBe(10);
		expect(asset.duration).toBe(100);
		expect(asset.hint).toEqual({ streaming: false });
		expect(asset.loop).toBe(false);
		expect(asset._system).toEqual(system);
	});

	it("createPlayer", () => {
		const handlerSet = new MockProxyAudioHandlerSet();
		const plugin = new ProxyAudioPlugin(handlerSet);
		const system = new MockAudioSystem({ id: "audio-system" });
		const manager = new AudioManager();
		const player = plugin.createPlayer(system, manager);
		expect(player._system).toEqual(system);
	});
});
