import { CacheTable } from "../CacheTable";

describe("CacheTable", () => {
	it("can register cache", () => {
		const cacheTable = new CacheTable<string>();
		const id = "id_resource_1";
		expect(cacheTable.hasExist(id)).toBeFalsy();
		expect(cacheTable.register(id)).toBeTruthy();
		expect(cacheTable.hasExist(id)).toBeTruthy();
		const cachedResource = cacheTable.get(id);
		expect(cachedResource).toBeDefined();
		expect(cachedResource?.resource).toBe(null);
		expect(cachedResource?.size).toBe(0);
		expect(cachedResource?.reserveFuncs.length).toBe(0);
		expect(cacheTable.register(id)).toBeFalsy();
	});
	it("can add resoruce", () => {
		const cacheTable = new CacheTable<string>();
		const id = "id_resource_1";
		cacheTable.register(id);
		cacheTable.add(id, "resource_1", 100);
		const cachedResource = cacheTable.get(id);
		expect(cachedResource).toBeDefined();
		expect(cachedResource?.resource).toBe("resource_1");
		expect(cachedResource?.size).toBe(100);
		expect(cachedResource?.reserveFuncs.length).toBe(0);
	});
	it("can exec function with resoruce", () => {
		const cacheTable = new CacheTable<string>();
		const id = "id_resource_111";
		cacheTable.register(id);
		cacheTable.add(id, "resource_111", 111);
		let resource = "";
		cacheTable.exec(id, (r => resource = r));
		expect(resource).toBe("resource_111");
		const cachedResource = cacheTable.get(id);
		expect(cachedResource).toBeDefined();
		expect(cachedResource?.resource).toBe("resource_111");
		expect(cachedResource?.size).toBe(111);
		expect(cachedResource?.reserveFuncs.length).toBe(0);
	});
	it("can reserve to exec function with resoruce", () => {
		const cacheTable = new CacheTable<string>();
		const id = "id_resource_1";
		let callCount = 0;
		const addCallCount = (): void => {
			callCount++;
		};
		cacheTable.register(id);
		cacheTable.exec(id, addCallCount);
		cacheTable.exec(id, addCallCount);
		const cachedResource = cacheTable.get(id);
		expect(cachedResource).toBeDefined();
		expect(cachedResource?.reserveFuncs.length).toBe(2);
		expect(cachedResource?.reserveFuncs[0]).toBe(addCallCount);
		expect(cachedResource?.reserveFuncs[1]).toBe(addCallCount);
		expect(callCount).toBe(0);
		cacheTable.add(id, "resource_1", 100);
		expect(cachedResource?.resource).toBe("resource_1");
		expect(cachedResource?.size).toBe(100);
		expect(cachedResource?.reserveFuncs.length).toBe(0);
		expect(callCount).toBe(2);
	});
	it("delete old cache, when total size is over limit", () => {
		const cacheTable = new CacheTable<string>(1000);
		const id1 = "id_resource_1";
		const id2 = "id_resource_2";
		const id3 = "id_resource_3";
		let resource = "";
		cacheTable.register(id1);
		cacheTable.add(id1, "resource_1", 700);
		cacheTable.register(id2);
		cacheTable.exec(id2, r => resource = r);
		cacheTable.add(id2, "resource_2", 300);
		expect(cacheTable.hasExist(id1)).toBeTruthy();
		expect(cacheTable.hasExist(id2)).toBeTruthy();
		expect(resource).toBe("resource_2");
		cacheTable.exec(id1, r => resource = r);
		expect(resource).toBe("resource_1");
		cacheTable.register(id3);
		cacheTable.add(id1, "resource_3", 300);
		expect(cacheTable.hasExist(id1)).toBeTruthy();
		expect(cacheTable.hasExist(id2)).toBeFalsy();
		expect(cacheTable.hasExist(id3)).toBeTruthy();
	});
});
