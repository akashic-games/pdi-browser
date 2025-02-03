import { ResourceManager } from "../ResourceManager";

describe("ResourceManager", () => {
	it("can register loading-resoruce", () => {
		const resourceManager = new ResourceManager<string>();
		const id = "id_resource_1";
		expect(resourceManager.isExistLoadingResoruce(id)).toBeFalsy();
		expect(resourceManager.registerLoadingResoruce(id)).toBeTruthy();
		expect(resourceManager.isExistLoadingResoruce(id)).toBeTruthy();
		const loadingResource = resourceManager.getLoadingResoruce(id);
		expect(loadingResource).toBeDefined();
		expect(loadingResource?.resource).toBe(null);
		expect(loadingResource?.size).toBe(0);
		expect(loadingResource?.reserveFuncs.length).toBe(0);
		expect(resourceManager.registerLoadingResoruce(id)).toBeFalsy();
	});
	it("can register loading-resoruce", () => {
		const resourceManager = new ResourceManager<string>();
		const id = "id_resource_1";
		resourceManager.registerLoadingResoruce(id);
		resourceManager.saveResoruce(id, "resource_1", 100);
		const loadingResource = resourceManager.getLoadingResoruce(id);
		expect(loadingResource).toBeDefined();
		expect(loadingResource?.resource).toBe("resource_1");
		expect(loadingResource?.size).toBe(100);
		expect(loadingResource?.reserveFuncs.length).toBe(0);
	});
	it("can use registered resoruce", () => {
		const resourceManager = new ResourceManager<string>();
		const id = "id_resource_111";
		resourceManager.registerLoadingResoruce(id);
		resourceManager.saveResoruce(id, "resource_111", 111);
		let resource = "";
		resourceManager.useResoruce(id, (r => resource = r));
		expect(resource).toBe("resource_111");
		const loadingResource = resourceManager.getLoadingResoruce(id);
		expect(loadingResource).toBeDefined();
		expect(loadingResource?.resource).toBe("resource_111");
		expect(loadingResource?.size).toBe(111);
		expect(loadingResource?.reserveFuncs.length).toBe(0);
	});
	it("can reserve to use resoruce", () => {
		const resourceManager = new ResourceManager<string>();
		const id = "id_resource_1";
		let callCount = 0;
		const addCallCount = (): void => {
			callCount++;
		};
		resourceManager.registerLoadingResoruce(id);
		resourceManager.useResoruce(id, addCallCount);
		resourceManager.useResoruce(id, addCallCount);
		const loadingResource = resourceManager.getLoadingResoruce(id);
		expect(loadingResource).toBeDefined();
		expect(loadingResource?.reserveFuncs.length).toBe(2);
		expect(loadingResource?.reserveFuncs[0]).toBe(addCallCount);
		expect(loadingResource?.reserveFuncs[1]).toBe(addCallCount);
		expect(callCount).toBe(0);
		resourceManager.saveResoruce(id, "resource_1", 100);
		expect(loadingResource?.resource).toBe("resource_1");
		expect(loadingResource?.size).toBe(100);
		expect(loadingResource?.reserveFuncs.length).toBe(0);
		expect(callCount).toBe(2);
	});
	it("delete old resource, when total size is over limit", () => {
		const resourceManager = new ResourceManager<string>(1000);
		const id1 = "id_resource_1";
		const id2 = "id_resource_2";
		const id3 = "id_resource_3";
		let resource = "";
		resourceManager.registerLoadingResoruce(id1);
		resourceManager.saveResoruce(id1, "resource_1", 700);
		resourceManager.registerLoadingResoruce(id2);
		resourceManager.useResoruce(id2, r => resource = r);
		resourceManager.saveResoruce(id2, "resource_2", 300);
		expect(resourceManager.isExistLoadingResoruce(id1)).toBeTruthy();
		expect(resourceManager.isExistLoadingResoruce(id2)).toBeTruthy();
		expect(resource).toBe("resource_2");
		resourceManager.useResoruce(id1, r => resource = r);
		expect(resource).toBe("resource_1");
		resourceManager.registerLoadingResoruce(id3);
		resourceManager.saveResoruce(id1, "resource_3", 300);
		expect(resourceManager.isExistLoadingResoruce(id1)).toBeTruthy();
		expect(resourceManager.isExistLoadingResoruce(id2)).toBeFalsy();
		expect(resourceManager.isExistLoadingResoruce(id3)).toBeTruthy();
	});
});
