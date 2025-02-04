interface LoadingResource<T> {
	resource: T | null;
	size: number;
	reserveFuncs: ((data: T) => void)[];
}

// リソースを一時的にキャッシュして管理するクラス
// 同名ファイルの複数ロードを防ぐために用意
export class CacheTable<T> {
	private static DEFAULT_LIMIT_SIZE: number = 100000000; // キャッシュ用マップ保存可能容量のデフォルト値。単位はbyteの想定だが、別の単位も利用可能
	private loadingResourceMap: Map<string, LoadingResource<T>>; // リソースキャッシュ用マップ
	private mapLimitSize: number; // キャッシュ用マップに保存できるリソースの容量
	private totalSize: number; // キャッシュ用マップが現在抱えているリソースの合計容量
	private priorities: {[id: string]: number}; // 各リソースの優先度マップ。最近利用されたものほど値(優先度)が高くなる
	private totalUseCount: number; // リソースキャッシュ用マップにアクセスされた回数。この数値を優先度マップで利用

	constructor(mapLimitSize?: number) {
		this.loadingResourceMap = new Map<string, LoadingResource<T>>();
		this.mapLimitSize = mapLimitSize ?? CacheTable.DEFAULT_LIMIT_SIZE;
		this.totalSize = 0;
		this.totalUseCount = 0;
		this.priorities = Object.create({});
	}

	isExistLoadingResoruce(id: string): boolean {
		return this.loadingResourceMap.has(id);
	}

	getLoadingResoruce(id: string): LoadingResource<T> | undefined {
		return this.loadingResourceMap.get(id);
	}

	// キャッシュ用マップにリソース名を登録する。登録ができればtrue、既に登録済みならfalseを返す
	registerLoadingResoruce(id: string): boolean {
		if (this.isExistLoadingResoruce(id)) {
			return false;
		}
		this.updatePriorities(id);

		// ここではリソース名を登録するだけで、リソース自体の登録はできていないことに注意
		// リソースの取得までに時間がかかることがあるので、このような実装になっている
		const loadingResource: LoadingResource<T> = {
			resource: null,
			size: 0,
			reserveFuncs: []
		};
		this.loadingResourceMap.set(id, loadingResource);
		return true;
	}

	// 指定されたリソースで指定された関数を実行する
	useResoruce(id: string, func: (data: T) => void): void {
		if (!this.isExistLoadingResoruce(id)) {
			return;
		}
		this.updatePriorities(id);

		const loadingResource = this.loadingResourceMap.get(id);
		const resource = loadingResource!.resource;
		if (resource !== null) {
			func(resource);
		} else {
			// リソースが保存されていない場合、指定された関数はリソース登録時に実行されるように
			loadingResource!.reserveFuncs.push(func);
		}
	}

	// リソースをキャッシュ用マップに保存する
	saveResoruce(id: string, resource: T, size: number): void {
		if (!this.isExistLoadingResoruce(id)) {
			return;
		}
		const loadingResource = this.loadingResourceMap.get(id);
		loadingResource!.resource = resource;
		loadingResource!.size = size;
		loadingResource!.reserveFuncs.forEach(func => func(resource));
		loadingResource!.reserveFuncs = [];

		this.totalSize += size;
		if (this.totalSize <= this.mapLimitSize) {
			return;
		}
		// 保存されている全リソースの容量が保存可能容量を超える場合、保存可能容量を下回るまで、使われていないリソースから順にキャッシュ用マップから削除していく
		const ids = Object.keys(this.priorities).sort((a, b) => this.priorities[a] - this.priorities[b]);
		for (const i of ids) {
			const target = this.loadingResourceMap.get(i);
			this.totalSize -= target?.size ?? 0;
			this.loadingResourceMap.delete(i);
			delete this.priorities[i];
			if (this.totalSize <= this.mapLimitSize) {
				break;
			}
		}
	}

	// 優先度マップの更新
	private updatePriorities(id: string): void {
		this.totalUseCount++;
		this.priorities[id] = this.totalUseCount;
	}
}
