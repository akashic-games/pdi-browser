interface CachedResource<T> {
	resource: T | null;
	size: number;
	reserveFuncs: ((data: T) => void)[];
}

// リソースを一時的にキャッシュして管理するクラス
// 同名ファイルの複数ロードを防ぐために用意
export class CacheTable<T> {
	private static DEFAULT_LIMIT_SIZE: number = 100000000; // キャッシュ用マップ保存可能容量のデフォルト値。単位はbyteの想定だが、別の単位も利用可能
	private cachedResourceMap: Map<string, CachedResource<T>>; // リソースキャッシュ用マップ
	private mapLimitSize: number; // キャッシュ用マップに保存できるリソースの容量
	private totalSize: number; // キャッシュ用マップが現在抱えているリソースの合計容量
	private priorities: {[id: string]: number}; // 各リソースの優先度マップ。最近利用されたものほど値(優先度)が高くなる
	private totalUseCount: number; // リソースキャッシュ用マップにアクセスされた回数。この数値を優先度マップで利用

	constructor(mapLimitSize?: number) {
		this.cachedResourceMap = new Map<string, CachedResource<T>>();
		this.mapLimitSize = mapLimitSize ?? CacheTable.DEFAULT_LIMIT_SIZE;
		this.totalSize = 0;
		this.totalUseCount = 0;
		this.priorities = Object.create({});
	}

	hasExist(id: string): boolean {
		return this.cachedResourceMap.has(id);
	}

	get(id: string): CachedResource<T> | undefined {
		return this.cachedResourceMap.get(id);
	}

	// キャッシュ用マップにリソース名を登録する。登録ができればtrue、既に登録済みならfalseを返す
	register(id: string): boolean {
		if (this.hasExist(id)) {
			return false;
		}
		this.updatePriorities(id);

		// ここではリソース名を登録するだけで、リソース自体の登録はできていないことに注意
		// リソースの取得までに時間がかかることがあるので、このような実装になっている
		const cachedResource: CachedResource<T> = {
			resource: null,
			size: 0,
			reserveFuncs: []
		};
		this.cachedResourceMap.set(id, cachedResource);
		return true;
	}

	// 指定されたリソースで指定された関数を実行する
	exec(id: string, func: (data: T) => void): void {
		const cachedResource = this.get(id);
		if (!cachedResource) {
			return;
		}
		this.updatePriorities(id);

		const resource = cachedResource.resource;
		if (resource !== null) {
			func(resource);
		} else {
			// リソースが保存されていない場合、指定された関数はリソース登録時に実行されるように
			cachedResource.reserveFuncs.push(func);
		}
	}

	// リソースをキャッシュ用マップに保存する
	add(id: string, resource: T, size: number): void {
		const cachedResource = this.get(id);
		if (!cachedResource) {
			return;
		}
		cachedResource.resource = resource;
		cachedResource.size = size;
		cachedResource.reserveFuncs.forEach(func => func(resource));
		cachedResource.reserveFuncs = [];

		this.totalSize += size;
		if (this.totalSize <= this.mapLimitSize) {
			return;
		}
		// 保存されている全リソースの容量が保存可能容量を超える場合、保存可能容量を下回るまで、使われていないリソースから順にキャッシュ用マップから削除していく
		const ids = Object.keys(this.priorities).sort((a, b) => this.priorities[a] - this.priorities[b]);
		for (const i of ids) {
			this.delete(i);
			if (this.totalSize <= this.mapLimitSize) {
				break;
			}
		}
	}

	// リソースをキャッシュから削除する
	delete(id: string): void {
		const cachedResource = this.get(id);
		if (!cachedResource) {
			return;
		}
		this.totalSize -= cachedResource.size ?? 0;
		this.cachedResourceMap.delete(id);
		delete this.priorities[id];
	}

	// 優先度マップの更新
	private updatePriorities(id: string): void {
		this.totalUseCount++;
		this.priorities[id] = this.totalUseCount;
	}
}
