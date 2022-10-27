/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/naming-convention */

import type { AssetLoadError, AssetLoadHandler, AudioAsset, AudioPlayer } from "@akashic/pdi-types";
import type { Page } from "puppeteer";
import type * as index from "../../src";

describe("HTMLAudio", () => {
	const audioAssetPath = "audio/bgm";
	const timeout = 5000;

	let page: Page;

	beforeAll(async () => {
		page = await globalThis.__BROWSER_GLOBAL__.newPage();
		await page.goto(process.env.BASE_URL);
	}, timeout);

	afterAll(async () => {
		await page.close();
	});

	beforeEach(async () => {
		await page.reload();
	});

	it("サポートしてる実行環境ではtrueを返す", async () => {
		const isSupported = await page.evaluate(() => {
			const { HTMLAudioPlugin } = require("@akashic/pdi-browser") as typeof index;
			return HTMLAudioPlugin.isSupported();
		});

		expect(isSupported).toBe(true);
	});

	describe("HTMLAudioAsset", () => {
		it("#load() すると audio data が取得できる", async () => {
			const asset = await page.evaluate((audioAssetPath) => {
				const { HTMLAudioPlugin } = require("@akashic/pdi-browser") as typeof index;
				const plugin = new HTMLAudioPlugin();
				const system = new window.__mock__.MockAudioSystem({id: "voice"});
				const asset = plugin.createAsset("id", audioAssetPath, 100, system, false, {});
				return new Promise<AudioAsset>((resolve, reject) => {
					const loader: AssetLoadHandler = {
						_onAssetLoad: (asset: AudioAsset) => {
							resolve(asset);
						},
						_onAssetError: (_asset, error) => {
							reject(error);
						}
					};
					asset._load(loader);
				});
			}, audioAssetPath);

			expect(asset.data).not.toBeUndefined();
			expect(asset.path).toContain(audioAssetPath);
		});

		it("オーディオアセットの拡張子がファイル名の末尾につく", async () => {
			const query = "rev=1234";
			const asset = await page.evaluate((audioAssetPath, query) => {
				const { HTMLAudioPlugin } = require("@akashic/pdi-browser") as typeof index;
				const plugin = new HTMLAudioPlugin();
				const system = new window.__mock__.MockAudioSystem({id: "voice"});
				const asset = plugin.createAsset("id", audioAssetPath + "?" + query, 100, system, false, {});
				return new Promise<AudioAsset>((resolve, reject) => {
					const loader: AssetLoadHandler = {
						_onAssetLoad: (asset: AudioAsset) => {
							resolve(asset);
						},
						_onAssetError: (_asset, error) => {
							reject(error);
						}
					};
					asset._load(loader);
				});
			}, audioAssetPath, query);

			expect(asset.path).toBe(`${audioAssetPath}.ogg?${query}`);
		});

		it("存在しないファイルを #load() すると onAssetError が呼ばれる", async () => {
			const error = await page.evaluate(() => {
				const { HTMLAudioPlugin } = require("@akashic/pdi-browser") as typeof index;
				const plugin = new HTMLAudioPlugin();
				const system = new window.__mock__.MockAudioSystem({id: "voice"});
				const asset = plugin.createAsset("id", "not_found_audio", 100, system, false, {});
				return new Promise<AssetLoadError>((resolve, reject) => {
					const loader: AssetLoadHandler = {
						_onAssetLoad: (_asset: AudioAsset) => {
							reject(new Error("failed"));
						},
						_onAssetError: (_asset, error) => {
							resolve(error);
						}
					};
					asset._load(loader);
				});
			});

			expect(error.name).toEqual("AssetLoadError");
			expect(typeof error.message).toEqual("string");
		});

		it("サポートされているファイルの種類でロードが行われる", async () => {
			for (const format of ["ogg", "aac"]) {
				const asset = await page.evaluate((audioAssetPath, format) => {
					const { HTMLAudioPlugin } = require("@akashic/pdi-browser") as typeof index;
					const plugin = new HTMLAudioPlugin();
					plugin.supportedFormats = [format];
					const system = new window.__mock__.MockAudioSystem({id: "voice"});
					const asset = plugin.createAsset("id", audioAssetPath, 100, system, false, {});
					return new Promise<AudioAsset>((resolve) => {
						const loader: AssetLoadHandler = {
							_onAssetLoad: (asset: AudioAsset) => {
								resolve(asset);
							},
							_onAssetError: (asset: AudioAsset) => {
								// NOTE: puppeteer でデコードできない場合があるがそこは本質ではない (パスが解決できるかが重要) のためエラーを無視
								resolve(asset);
							}
						};
						asset._load(loader);
					});
				}, audioAssetPath, format);

				expect(asset.path).toContain(`${audioAssetPath}.${format}`);
			}
		});

		it(".aac ファイルが存在しない場合 .mp4 ファイルが読み込まれる", async () => {
			const audioAsset2Path = "audio/bgm2";
			const query = "rev=4321";
			const asset = await page.evaluate((audioAsset2Path, query) => {
				const { HTMLAudioPlugin } = require("@akashic/pdi-browser") as typeof index;
				const plugin = new HTMLAudioPlugin();
				plugin.supportedFormats = ["aac", "mp4"];
				const system = new window.__mock__.MockAudioSystem({id: "voice"});
				const asset = plugin.createAsset("id", audioAsset2Path + "?" + query, 100, system, false, {});
				return new Promise<AudioAsset>((resolve) => {
					const loader: AssetLoadHandler = {
						_onAssetLoad: (asset: AudioAsset) => {
							resolve(asset);
						},
						_onAssetError: (asset: AudioAsset) => {
							// NOTE: puppeteer でデコードできない場合があるがそこは本質ではない (パスが解決できるかが重要) のためエラーを無視
							resolve(asset);
						}
					};
					asset._load(loader);
				});
			}, audioAsset2Path, query);

			expect(asset.path).toBe(`${audioAsset2Path}.mp4?${query}`);
		});
	});

	describe("HTMLAudioPlayer", () => {
		const seAssetPath = "audio/se";

		// 音の再生は AudioSystem の実装側の責務となっているので一旦無効にしておく
		xit("#play() すると音を再生できる", async () => {
			const [asset, player] = await page.evaluate((seAssetPath) => {
				const { HTMLAudioPlugin } = require("@akashic/pdi-browser") as typeof index;
				const plugin = new HTMLAudioPlugin();
				plugin.supportedFormats = ["aac", "mp4"];
				const system = new window.__mock__.MockAudioSystem({id: "voice"});
				const asset = plugin.createAsset("id", seAssetPath, 100, system, false, {});
				const player = asset.play();
				player.changeVolume(0.1);
				return new Promise<[AudioAsset, AudioPlayer]>((resolve, reject) => {
					const loader: AssetLoadHandler = {
						_onAssetLoad: (asset: AudioAsset) => {
							(player as any)._endedEventHandler = () => {
								resolve([asset, player]);
							};
						},
						_onAssetError: (_asset, error) => {
							reject(error);
						}
					};
					asset._load(loader);
				});
			}, seAssetPath);

			expect(asset).toBeDefined();
			expect(player).toBeDefined();
		});
	});
});
