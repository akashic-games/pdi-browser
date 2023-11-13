import { MockAudioSystem } from "../../__tests__/helpers/MockAudioSystem";
import { ProxyAudioAsset } from "../ProxyAudioAsset";
import { MockProxyAudioHandlerSet } from "./helpers/MockProxyAudioHandlerSet";

describe("ProxyAudioAsset", () => {
	it("can instantiate", () => {
		const system = new MockAudioSystem({ id: "audio-system" });
		const handlerSet = new MockProxyAudioHandlerSet();
		const asset = new ProxyAudioAsset(
			handlerSet,
			"audio-asset",
			"/path/to/audio",
			100,
			system,
			false,
			{ streaming: false },
			10,
			undefined
		);

		expect(asset.id).toBe("audio-asset");
		expect(asset.path).toBe("/path/to/audio");
		expect(asset.offset).toBe(10);
		expect(asset.loopOffset).toBeUndefined();
		expect(asset.duration).toBe(100);
		expect(asset.hint).toEqual({ streaming: false });
		expect(asset.loop).toBe(false);
		expect(asset._system).toEqual(system);
	});

	it("can load", done => {
		const system = new MockAudioSystem({ id: "audio-system" });
		const handlerSet = new MockProxyAudioHandlerSet();
		const asset = new ProxyAudioAsset(handlerSet, "audio-asset", "/path/to/audio", 100, system, false, { streaming: false }, 10, 20);

		asset._load({
			_onAssetLoad: (a) => {
				expect(a).toEqual(asset);
				expect(handlerSet.loadAudioAsset).toBeCalledTimes(1);
				done();
			},
			_onAssetError: (_a, error) => {
				done(error);
			},
		});
	});

	it("can unload", done => {
		const system = new MockAudioSystem({ id: "audio-system" });
		const handlerSet = new MockProxyAudioHandlerSet();
		const asset = new ProxyAudioAsset(handlerSet, "audio-asset", "/path/to/audio", 100, system, false, { streaming: false }, 10, 20);

		asset._load({
			_onAssetLoad: (a) => {
				expect(handlerSet.unloadAudioAsset).not.toBeCalled();
				a.destroy();
				expect(handlerSet.unloadAudioAsset).toBeCalledWith("audio-asset");
				done();
			},
			_onAssetError: (_a, error) => {
				done(error);
			},
		});
	});
});
