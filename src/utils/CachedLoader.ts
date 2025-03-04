import { createWaiter } from "./Waiter";

interface CachedResource<T> {
	value: T;
	size: number;
};

interface CachedLoaderOption {
	limitSize: number;
}

export class CachedLoader<K, T> {
	private table: Map<K, { size: number, promise: Promise<CachedResource<T>> }>; // リソースキャッシュ用マップ
	private priorities: Map<K, number>; // 各リソースの優先度マップ。最近利用されたものほど値(優先度)が高くなる
	private totalSize: number; // キャッシュ用マップが現在抱えているリソースの合計容量
	private totalUseCount: number; // リソースキャッシュ用マップにアクセスされた回数。この数値を優先度マップで利用
	private limitSize: number; // キャッシュ用マップに保存できるリソースの容量

	constructor(option: CachedLoaderOption) {
		this.table = new Map<K, { size: number, promise: Promise<CachedResource<T>> }>();
		this.priorities = new Map<K, number>();
		this.totalSize = 0;
		this.totalUseCount = 0;
		this.limitSize = option.limitSize;
	}

	load(key: K, loaderImpl: (key: K) => Promise<CachedResource<T>>): Promise<CachedResource<T>> {
		this._updatePriorities(key);
		const entry = this.table.get(key);
		if (entry) {
			return entry.promise;
		}

		const { resolve, reject, promise } = createWaiter<CachedResource<T>>();
		this.table.set(key, { size: 0, promise });
		loaderImpl(key).then(({ value, size }) => {
			this.table.set(key, { size, promise });
			this._checkCache(size);
			resolve({ value, size });
		}).catch(e => {
			this._deleteCache(key);
			reject(e);
		});
		return promise;
	}

	// キャッシュの整理。指定したサイズを合計サイズに加算して、合計サイズが上限を超えている場合は優先度が低い順に削除される
	private _checkCache(size: number): void {
		this.totalSize += size;
		if (this.totalSize <= this.limitSize) {
			return;
		}
		// 保存されている全リソースの容量が保存可能容量を超える場合、保存可能容量を下回るまで、使われていないリソースから順にキャッシュ用マップから削除していく
		const ids = Array.from(this.priorities.keys()).sort((a, b) => this.priorities.get(a)! - this.priorities.get(b)!);
		for (const i of ids) {
			this._deleteCache(i);
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
