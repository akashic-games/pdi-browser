import { CachedLoader } from "../CachedLoader";

interface TestResource {
	value: string;
	size: number;
}

const testResoruceMap: { [key: string]: TestResource } = {
	"id1": {
		value: "id1",
		size: 300
	},
	"id2": {
		value: "id2",
		size: 400
	},
	"id3": {
		value: "id3",
		size: 500
	}
};

const DEFAULT_LOAD_TIME = 500;

const loaderImpl = (key: string): Promise<{ value: string; size: number }> => {
	return new Promise((resolve, reject) => {
		const target = testResoruceMap[key];
		if (!target) {
			return reject(`${key} is not found`);
		}
		setTimeout(() => {
			resolve({ value: target.value, size: target.size });
		}, DEFAULT_LOAD_TIME);
	});
};

describe("CachedLoader", () => {
	it("リソース・キャッシュを取得できる", async () => {
		const loader = new CachedLoader<string, string>();

		// リソースをロードして取得できるか確認
		const resource = await loader.load("id1", loaderImpl);
		expect(resource.value).toBe("id1");
		expect(resource.size).toBe(300);

		// 一度ロードしたリソースを再ロードせずキャッシュから取得できているかの確認
		const timer = setTimeout(() => {
			fail();
		}, DEFAULT_LOAD_TIME);
		const resource2 = await loader.load("id1", loaderImpl);
		clearTimeout(timer);
		expect(resource2.value).toBe("id1");
		expect(resource2.size).toBe(300);
	});
	it("リソース取得失敗後も正常にリソースを取得できる", (done) => {
		let count = 0;
		const loaderImpl = (key: string): Promise<{ value: string; size: number }> => {
			count++;
			return new Promise((resolve, reject) => {
				// 呼び出し1回目は失敗するように
				if (count < 2) {
					reject(`failed to load ${key}`);
				} else {
					resolve({ value: "success", size: 10 });
				}
			});
		};
		const loader = new CachedLoader<string, string>();
		const key = "key";

		loader.load(key, loaderImpl).then(() => {
			done.fail();
		}).catch(_e => {
			loader.load(key, loaderImpl).then((resource) => {
				expect(resource.value).toBe("success");
				expect(resource.size).toBe(10);
				done();
			});
		});
	});
	it("キャッシュの上限を超えた場合、最も利用日時が古いリソースからキャッシュから削除される", async () => {
		const loader = new CachedLoader<string, string>({ limitSize: 1000 });

		await loader.load("id1", loaderImpl);
		await loader.load("id2", loaderImpl);
		await loader.load("id1", loaderImpl);
		await loader.load("id3", loaderImpl);
		// id1はキャッシュから取得
		let beforeTime = Date.now();
		const resource1 = await loader.load("id1", loaderImpl);
		expect(resource1.value).toBe("id1");
		expect(resource1.size).toBe(300);
		expect(Date.now() - beforeTime).toBeLessThan(DEFAULT_LOAD_TIME);
		// id２はキャッシュから削除されているため再ロード
		beforeTime = Date.now();
		const resource2 = await loader.load("id2", loaderImpl);
		expect(resource2.value).toBe("id2");
		expect(resource2.size).toBe(400);
		expect(Date.now() - beforeTime).toBeGreaterThanOrEqual(DEFAULT_LOAD_TIME);
	});
});
