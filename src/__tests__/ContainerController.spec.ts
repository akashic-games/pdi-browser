import { ContainerController } from "../ContainerController";
import { AudioPluginManager } from "../plugin/AudioPluginManager";
import { ResourceFactory } from "../ResourceFactory";

describe("ContainerController", () => {
	describe("#setRootView", () => {
		it("設定済みrootは、新しいrootに置き換わる際に破棄される", () => {
			// FIXME: テストが不完全なので直す
			const resource = new ResourceFactory({
				audioPluginManager: new AudioPluginManager(),
				audioManager: undefined!,
				platform: undefined!
			});
			const controller = new ContainerController(resource);
			const prevDiv = document.createElement("div");
			controller.initialize({
				rendererRequirement: {
					primarySurfaceWidth: 100,
					primarySurfaceHeight: 100
				}
			});
			controller.setRootView(prevDiv);
			expect(controller.rootView).toBe(prevDiv);
			// 新しいrootに置き換える
			const newDiv = document.createElement("div");
			controller.setRootView(newDiv);
			// prevDivがどこにも所属してないことを確認する
			expect(controller.rootView).toBe(newDiv);
			expect(controller.rootView).not.toBe(prevDiv);
			expect(prevDiv.parentNode).toBeNull();
		});
	});
});
