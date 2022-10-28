import type { AssetLoadHandler, AudioAsset } from "@akashic/pdi-types";
import { AudioManager } from "../../../AudioManager";
import { MockAudioSystem } from "../../__tests__/helpers/MockAudioSystem";
import { WebAudioAsset } from "../WebAudioAsset";
import { WebAudioPlugin } from "../WebAudioPlugin";

xdescribe("WebAudioPlugin", () => {
	if (!WebAudioPlugin.isSupported()) {
		// WebAudioをサポートしてない環境ではSkipする
		// NOTE: jest の仕様上ひとつ以上のテストケースが存在しない場合エラーとなるためダミーのテストを追加
		it("skipped", () => {
			expect(1).toBe(1);
		});
		return;
	}
	const audioAssetPath = "/spec/fixtures/audio/bgm";
	it("サポートしてる実行環境ではtrueを返す", () => {
		expect(WebAudioPlugin.isSupported()).toBeTruthy();
	});
	describe("#createAsset", () => {
		it("should WebAudioAsset", () => {
			const plugin = new WebAudioPlugin();
			const system = new MockAudioSystem({id: "voice"});
			const asset = plugin.createAsset("id", audioAssetPath, 100, system, false, {}, 10);
			expect(asset).toBeInstanceOf(WebAudioAsset);
			expect(asset.duration).toBe(100);
			expect(asset.offset).toBe(10);
		});
	});
	describe("WebAudioAsset", () => {
		it("#loadするとaudio dataが取得できる", (done) => {
			const plugin = new WebAudioPlugin();
			const system = new MockAudioSystem({id: "voice"});
			const asset = plugin.createAsset("id", audioAssetPath, 100, system, false, {}, 0);
			const loader: AssetLoadHandler = {
				_onAssetLoad: (asset: AudioAsset) => {
					expect(asset.data).not.toBeUndefined();
					expect(asset.path).toBe(audioAssetPath);
					done();
				},
				_onAssetError: (_asset, error) => {
					done.fail(error);
				}
			};
			asset._load(loader);
		});
		it("オーディオアセットの拡張子がファイル名の末尾につく", (done) => {
			const plugin = new WebAudioPlugin();
			const system = new MockAudioSystem({id: "voice"});
			const query = "rev=1234";
			const asset = plugin.createAsset("id", audioAssetPath + "?" + query, 100, system, false, {}, 0);
			const loader: AssetLoadHandler = {
				_onAssetLoad: (asset) => {
					expect(asset.path).toBe(audioAssetPath + ".ogg?" + query);
					done();
				},
				_onAssetError: (_asset, error) => {
					done.fail(error);
				}
			};
			asset._load(loader);
		});
		it("存在しないファイルを#loadするとonAssetErrorが呼ばれる", (done) => {
			const plugin = new WebAudioPlugin();
			const system = new MockAudioSystem({id: "voice"});
			const asset = plugin.createAsset("id", "not_found_audio", 100, system, false, {}, 0);
			const loader: AssetLoadHandler = {
				_onAssetLoad: (_asset) => {
					done.fail();
				},
				_onAssetError: (_asset, error) => {
					expect(error.name).toEqual("AssetLoadError");
					expect(typeof error.message).toEqual("string");
					done();
				}
			};
			asset._load(loader);
		});
		it("サポートされているファイルの種類でロードが行われる", (done) => {
			const supportedFormat = "ogg";
			const plugin = new WebAudioPlugin();
			// aacとoggがサポート対象にあるが、このテストではどちらか一方のみサポートしてると限定して行う
			plugin.supportedFormats = plugin.supportedFormats.length >= 2 ? [supportedFormat] : plugin.supportedFormats;
			const system = new MockAudioSystem({id: "voice"});
			const asset = plugin.createAsset("id", audioAssetPath, 100, system, false, {}, 0);
			const loader: AssetLoadHandler = {
				_onAssetLoad: (asset) => {
					expect(asset.path).toContain(audioAssetPath + "." + plugin.supportedFormats[0]);
					done();
				},
				_onAssetError: (_asset, error) => {
					done.fail(error);
				}
			};
			asset._load(loader);
		});
		it("aacファイルが存在しない場合mp4ファイルが読み込まれる", (done) => {
			const plugin = new WebAudioPlugin();
			plugin.supportedFormats = ["aac"];
			const system = new MockAudioSystem({id: "voice"});
			const audioAsset2Path = "/spec/fixtures/audio/bgm2";
			const query = "rev=4321";
			const asset = plugin.createAsset("id", audioAsset2Path + "?" + query, 100, system, false, {}, 0);
			const loader: AssetLoadHandler = {
				_onAssetLoad: (asset) => {
					expect(asset.path).toBe(audioAsset2Path + ".mp4?" + query);
					done();
				},
				_onAssetError: (_asset, error) => {
					done.fail(error);
				}
			};
			asset._load(loader);
		});
	});
	describe("WebAudioPlayer", () => {
		const seAssetPath = "/spec/fixtures/audio/se";
		// 音の再生検知はtestemでサポートされていないので無効にしておく
		xit("#playすると音を再生できる", (done) => {
			const manager = new AudioManager();
			const plugin = new WebAudioPlugin();
			const system = new MockAudioSystem({id: "voice"});
			const asset = plugin.createAsset("id", seAssetPath, 100, system, false, {}, 0);
			const player = plugin.createPlayer(system, manager);
			player.changeVolume(0.1);
			const loader: AssetLoadHandler = {
				_onAssetLoad: (asset: WebAudioAsset) => {
					expect(asset).not.toBeUndefined();
					(player as any)._endedEventHandler = () => {
						done();
					};
					player.play(asset);
				},
				_onAssetError: (_asset, _error) => {
					done.fail(new Error("not found audio asset"));
				}
			};
			asset._load(loader);
		});
	});
});
