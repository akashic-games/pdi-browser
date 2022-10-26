import type { AssetLoadHandler, AudioAsset } from "@akashic/pdi-types";
import { AudioManager } from "../../../AudioManager";
import { MockAudioSystem } from "../../__tests__/helpers/MockAudioSystem";
import { HTMLAudioAsset } from "../HTMLAudioAsset";
import type { HTMLAudioPlayer } from "../HTMLAudioPlayer";
import { HTMLAudioPlugin } from "../HTMLAudioPlugin";
import { MockHTMLAudioPlugin } from "./helpers/MockHTMLAudioPlugin";

let supportedFormats: string[] = [];

jest.spyOn(window.HTMLAudioElement.prototype, "canPlayType")
	.mockImplementation(type => supportedFormats.some(f => f === type) ? "maybe" : "");

describe("HTMLAudioPlugin", () => {
	const audioAssetPath = "audio/bgm";
	const audioAsset2Path = "audio/bgm2";

	it("サポートしてる実行環境ではtrueを返す", () => {
		expect(HTMLAudioPlugin.isSupported()).toBeTruthy();
	});

	describe("#createAsset", () => {
		it("should HTMLAudioAsset", () => {
			const plugin = new HTMLAudioPlugin();
			const system = new MockAudioSystem({id: "voice"});
			const asset = plugin.createAsset("id", audioAssetPath, 100, system, false, {});
			expect(asset).toBeInstanceOf(HTMLAudioAsset);
		});
	});

	describe("HTMLAudioAsset", () => {
		beforeEach(() => {
			supportedFormats = [];
		});

		it("#loadするとaudio dataが取得できる", (done) => {
			supportedFormats = ["audio/ogg"];
			const plugin = new MockHTMLAudioPlugin();
			const system = new MockAudioSystem({id: "voice"});
			const asset = plugin.createAsset("id", audioAssetPath, 100, system, false, {});
			const loader: AssetLoadHandler = {
				_onAssetLoad: (asset: AudioAsset) => {
					expect(asset.data).not.toBeUndefined();
					expect(asset.path).toContain(audioAssetPath);
					done();
				},
				_onAssetError: (_asset, error) => {
					done(error);
				}
			};
			asset._load(loader);
		});

		it("オーディオアセットの拡張子がファイル名の末尾につく", (done) => {
			supportedFormats = ["audio/ogg"];
			const plugin = new MockHTMLAudioPlugin();
			const system = new MockAudioSystem({id: "voice"});
			const query = "rev=1234";
			const asset = plugin.createAsset("id", audioAssetPath + "?" + query, 100, system, false, {});
			const loader: AssetLoadHandler = {
				_onAssetLoad: (asset) => {
					expect(asset.path).toBe(audioAssetPath + ".ogg?" + query);
					done();
				},
				_onAssetError: (_asset, error) => {
					done(error);
				}
			};
			asset._load(loader);
		});

		it("存在しないファイルを#loadするとonAssetErrorが呼ばれる", (done) => {
			supportedFormats = ["audio/ogg"];
			const plugin = new MockHTMLAudioPlugin();
			const system = new MockAudioSystem({id: "voice"});

			const asset = plugin.createAsset("id", "not_found_audio", 100, system, false, {});
			const loader: AssetLoadHandler = {
				_onAssetLoad: (_asset) => {
					done(new Error("failed"));
				},
				_onAssetError: (asset: AudioAsset, error) => {
					expect(asset.data).not.toBeUndefined();
					expect(error.name).toEqual("AssetLoadError");
					expect(typeof error.message).toEqual("string");
					done();
				}
			};
			asset._load(loader);
		});

		it("サポートされているファイルの種類でロードが行われる", (done) => {
			// aacとoggがサポート対象にあるが、このテストではどちらか一方のみサポートしてると限定して行う
			supportedFormats = ["audio/ogg"];
			const plugin = new MockHTMLAudioPlugin();
			const system = new MockAudioSystem({id: "voice"});
			const asset = plugin.createAsset("id", audioAssetPath, 100, system, false, {});
			const loader: AssetLoadHandler = {
				_onAssetLoad: (asset) => {
					expect(asset.path).toBe(audioAssetPath + "." + plugin.supportedFormats[0]);
					done();
				},
				_onAssetError: (_asset, error) => {
					done(error);
				}
			};
			asset._load(loader);
		});

		it("aacファイルが存在しない場合mp4ファイルが読み込まれる", (done) => {
			supportedFormats = ["audio/aac", "audio/mp4"];
			const plugin = new MockHTMLAudioPlugin();
			const system = new MockAudioSystem({id: "voice"});
			const query = "rev=4321";
			const asset = plugin.createAsset("id", audioAsset2Path + "?" + query, 100, system, false, {});
			const loader: AssetLoadHandler = {
				_onAssetLoad: (asset) => {
					expect(asset.path).toBe(audioAsset2Path + ".mp4?" + query);
					done();
				},
				_onAssetError: (_asset, error) => {
					done(error);
				}
			};
			asset._load(loader);
		});
	});

	describe("HTMLAudioPlayer", () => {
		const seAssetPath = "audio/se";

		it("#playすると音を再生できる", (done) => {
			supportedFormats = ["audio/aac", "audio/mp4"];
			const manager = new AudioManager();
			const plugin = new MockHTMLAudioPlugin();
			const system = new MockAudioSystem({id: "voice"});
			const asset = plugin.createAsset("id", seAssetPath, 100, system, false, {});
			const player = plugin.createPlayer(system, manager) as HTMLAudioPlayer;
			player.changeVolume(0.1);
			const loader: AssetLoadHandler = {
				_onAssetLoad: (asset: HTMLAudioAsset) => {
					expect(asset).not.toBeUndefined();
					(player as any)._endedEventHandler = () => {
						// play ended
						done();
					};
					player.play(asset);
				},
				_onAssetError: (_asset, _error) => {
					done(new Error("not found audio asset"));
				}
			};
			asset._load(loader);
		});
	});
});
