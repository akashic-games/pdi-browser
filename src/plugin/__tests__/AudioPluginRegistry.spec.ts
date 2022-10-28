import { AudioPluginRegistry } from "../AudioPluginRegistry";
import { FailurePlugin } from "./helpers/FailurePlugin";
import { SuccessPlugin } from "./helpers/SuccessPlugin";

describe("AudioPluginRegistrySpec", () => {
	afterEach(() => {
		AudioPluginRegistry.clear();
	});
	describe("#addPlugin", () => {
		it("プラグインを登録予約リストへ追加する", () => {
			expect(AudioPluginRegistry.getRegisteredAudioPlugins().length).toBe(0);
			AudioPluginRegistry.addPlugin(SuccessPlugin as any);
			AudioPluginRegistry.addPlugin(FailurePlugin as any);
			expect(AudioPluginRegistry.getRegisteredAudioPlugins().length).toBe(2);
			expect(AudioPluginRegistry.getRegisteredAudioPlugins()).toContain(SuccessPlugin);
			expect(AudioPluginRegistry.getRegisteredAudioPlugins()).toContain(FailurePlugin);
		});
		it("同じプラグインは二重に追加されない", () => {
			expect(AudioPluginRegistry.getRegisteredAudioPlugins().length).toBe(0);
			AudioPluginRegistry.addPlugin(SuccessPlugin as any);
			AudioPluginRegistry.addPlugin(SuccessPlugin as any);
			expect(AudioPluginRegistry.getRegisteredAudioPlugins().length).toBe(1);
		});
	});
});
