interface CachedResource<T> {
	value: T;
	size: number;
};

interface CachedLoaderOption {
	limitSize: number;
}

export class CachedLoader<K, T> {
	private loaderImpl: (key: K) => Promise<CachedResource<T>>;
	private table: Map<K, { size: number; promise: Promise<CachedResource<T>> }>; // リソースキャッシュ用マップ
	private priorities: Map<K, number>; // 各リソースの優先度マップ。最近利用されたものほど値(優先度)が高くなる
	private totalSize: number; // キャッシュ用マップが現在抱えているリソースの合計容量
	private totalUseCount: number; // リソースキャッシュ用マップにアクセスされた回数。この数値を優先度マップで利用
	private limitSize: number; // キャッシュ用マップに保存できるリソースの容量

	constructor(loaderImpl: (key: K) => Promise<CachedResource<T>>, option: CachedLoaderOption) {
		this.loaderImpl = loaderImpl;
		this.table = new Map<K, { size: number; promise: Promise<CachedResource<T>> }>();
		this.priorities = new Map<K, number>();
		this.totalSize = 0;
		this.totalUseCount = 0;
		this.limitSize = option.limitSize;
	}

	load(key: K): Promise<CachedResource<T>> {
		this._updatePriorities(key);
		const entry = this.table.get(key);
		if (entry) {
			return entry.promise;
		}

		const promise = new Promise<CachedResource<T>>((resolve, reject) => {
			this.loaderImpl(key).then(({ value, size }) => {
				this.table.set(key, { size, promise });
				this._checkCache(size);
				resolve({ value, size });
			}).catch(e => {
				this._deleteCache(key);
				reject(e);
			});
		});
		this.table.set(key, { size: 0, promise });
		return promise;
	}

	reset(): void {
		this.table.clear();
		this.priorities.clear();
		this.totalSize = 0;
		this.totalUseCount = 0;
	}

	// キャッシュの整理。指定したサイズを合計サイズに加算して、合計サイズが上限を超えている場合は優先度が低い順に削除される
	private _checkCache(size: number): void {
		this.totalSize += size;
		if (this.totalSize <= this.limitSize) {
			return;
		}
		// 保存されている全リソースの容量が保存可能容量を超える場合、保存可能容量を下回るまで、使われていないリソースから順にキャッシュ用マップから削除していく
		const entries = Array.from(this.priorities).sort((a, b) => a[1] - b[1]);
		for (const entry of entries) {
			this._deleteCache(entry[0]);
			if (this.totalSize <= this.limitSize) {
				break;
			}
		}
	}

	private _deleteCache(key: K): void {
		const entry = this.table.get(key);
		if (!entry) {
			return;
		}
		// キャッシュの合計容量を再計算
		this.totalSize -= entry.size;
		// キャッシュと優先度マップから削除
		this.table.delete(key);
		this.priorities.delete(key);
	}

	// 優先度マップの更新
	private _updatePriorities(key: K): void {
		this.totalUseCount++;
		this.priorities.set(key, this.totalUseCount);
	}
}
