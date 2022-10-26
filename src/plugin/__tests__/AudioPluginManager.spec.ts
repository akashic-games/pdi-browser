import { AudioPluginManager } from "../AudioPluginManager";
import { FailurePlugin } from "./helpers/FailurePlugin";
import { SuccessPlugin } from "./helpers/SuccessPlugin";

describe("AudioPluginManager", () => {
	describe("#tryInstallPlugin", () => {
		let manager: AudioPluginManager;
		beforeEach(() => {
			manager = new AudioPluginManager();
		});
		describe("サポートしてないプラグインを登録する時", () => {
			it("should return false", () => {
				const result = manager.tryInstallPlugin([FailurePlugin as any]);
				expect(result).toBeFalsy();
			});
		});
		describe("サポートしているプラグインを登録する時", () => {
			it("should return true", () => {
				const result = manager.tryInstallPlugin([SuccessPlugin as any]);
				expect(result).toBeTruthy();
			});
			it("アクティブなプラグインとして登録される", () => {
				manager.tryInstallPlugin([SuccessPlugin as any]);
				const plugin = manager.getActivePlugin();
				expect(plugin).toBeInstanceOf(SuccessPlugin);
			});
		});
		describe("非サポート -> サポート とプラグインが登録される時", () => {
			it("should return true", () => {
				const result = manager.tryInstallPlugin([SuccessPlugin as any]);
				expect(result).toBeTruthy();
			});
			it("SuccessPluginがアクティブなプラグインとして登録される", () => {
				manager.tryInstallPlugin([FailurePlugin as any, SuccessPlugin as any]);
				const plugin = manager.getActivePlugin();
				expect(plugin).toBeInstanceOf(SuccessPlugin);
			});
		});
	});
});
