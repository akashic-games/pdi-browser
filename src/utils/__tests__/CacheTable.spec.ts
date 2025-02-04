import { CacheTable } from "../CacheTable";

describe("CacheTable", () => {
	it("can register loading-resoruce", () => {
		const cacheTable = new CacheTable<string>();
		const id = "id_resource_1";
		expect(cacheTable.isExistLoadingResoruce(id)).toBeFalsy();
		expect(cacheTable.registerLoadingResoruce(id)).toBeTruthy();
		expect(cacheTable.isExistLoadingResoruce(id)).toBeTruthy();
		const loadingResource = cacheTable.getLoadingResoruce(id);
		expect(loadingResource).toBeDefined();
		expect(loadingResource?.resource).toBe(null);
		expect(loadingResource?.size).toBe(0);
		expect(loadingResource?.reserveFuncs.length).toBe(0);
		expect(cacheTable.registerLoadingResoruce(id)).toBeFalsy();
	});
	it("can register loading-resoruce", () => {
		const cacheTable = new CacheTable<string>();
		const id = "id_resource_1";
		cacheTable.registerLoadingResoruce(id);
		cacheTable.saveResoruce(id, "resource_1", 100);
		const loadingResource = cacheTable.getLoadingResoruce(id);
		expect(loadingResource).toBeDefined();
		expect(loadingResource?.resource).toBe("resource_1");
		expect(loadingResource?.size).toBe(100);
		expect(loadingResource?.reserveFuncs.length).toBe(0);
	});
	it("can use registered resoruce", () => {
		const cacheTable = new CacheTable<string>();
		const id = "id_resource_111";
		cacheTable.registerLoadingResoruce(id);
		cacheTable.saveResoruce(id, "resource_111", 111);
		let resource = "";
		cacheTable.useResoruce(id, (r => resource = r));
		expect(resource).toBe("resource_111");
		const loadingResource = cacheTable.getLoadingResoruce(id);
		expect(loadingResource).toBeDefined();
		expect(loadingResource?.resource).toBe("resource_111");
		expect(loadingResource?.size).toBe(111);
		expect(loadingResource?.reserveFuncs.length).toBe(0);
	});
	it("can reserve to use resoruce", () => {
		const cacheTable = new CacheTable<string>();
		const id = "id_resource_1";
		let callCount = 0;
		const addCallCount = (): void => {
			callCount++;
		};
		cacheTable.registerLoadingResoruce(id);
		cacheTable.useResoruce(id, addCallCount);
		cacheTable.useResoruce(id, addCallCount);
		const loadingResource = cacheTable.getLoadingResoruce(id);
		expect(loadingResource).toBeDefined();
		expect(loadingResource?.reserveFuncs.length).toBe(2);
		expect(loadingResource?.reserveFuncs[0]).toBe(addCallCount);
		expect(loadingResource?.reserveFuncs[1]).toBe(addCallCount);
		expect(callCount).toBe(0);
		cacheTable.saveResoruce(id, "resource_1", 100);
		expect(loadingResource?.resource).toBe("resource_1");
		expect(loadingResource?.size).toBe(100);
		expect(loadingResource?.reserveFuncs.length).toBe(0);
		expect(callCount).toBe(2);
	});
	it("delete old resource, when total size is over limit", () => {
		const cacheTable = new CacheTable<string>(1000);
		const id1 = "id_resource_1";
		const id2 = "id_resource_2";
		const id3 = "id_resource_3";
		let resource = "";
		cacheTable.registerLoadingResoruce(id1);
		cacheTable.saveResoruce(id1, "resource_1", 700);
		cacheTable.registerLoadingResoruce(id2);
		cacheTable.useResoruce(id2, r => resource = r);
		cacheTable.saveResoruce(id2, "resource_2", 300);
		expect(cacheTable.isExistLoadingResoruce(id1)).toBeTruthy();
		expect(cacheTable.isExistLoadingResoruce(id2)).toBeTruthy();
		expect(resource).toBe("resource_2");
		cacheTable.useResoruce(id1, r => resource = r);
		expect(resource).toBe("resource_1");
		cacheTable.registerLoadingResoruce(id3);
		cacheTable.saveResoruce(id1, "resource_3", 300);
		expect(cacheTable.isExistLoadingResoruce(id1)).toBeTruthy();
		expect(cacheTable.isExistLoadingResoruce(id2)).toBeFalsy();
		expect(cacheTable.isExistLoadingResoruce(id3)).toBeTruthy();
	});
});
