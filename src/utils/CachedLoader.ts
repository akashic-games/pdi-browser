import { createWaiter } from "./createWaiter";

interface CachedResource<T> {
	value: T;
	size: number;
};

interface CachedLoaderOption {
	limitSize?: number;
}

const DEFAULT_LIMIT_SIZE: number = 100000000; // キャッシュ用マップ保存可能容量のデフォルト値。単位はbyteの想定だが、別の単位も利用可能

export class CachedLoader<K, T> {
	private table: Map<K, Promise<CachedResource<T>>>; // リソースキャッシュ用マップ
	private priorities: Map<K, number>; // 各リソースの優先度マップ。最近利用されたものほど値(優先度)が高くなる
	private totalSize: number; // キャッシュ用マップが現在抱えているリソースの合計容量
	private totalUseCount: number; // リソースキャッシュ用マップにアクセスされた回数。この数値を優先度マップで利用
	private limitSize: number; // キャッシュ用マップに保存できるリソースの容量

	constructor(option: CachedLoaderOption = {}) {
		this.table = new Map<K, Promise<CachedResource<T>>>();
		this.priorities = new Map<K, number>();
		this.totalSize = 0;
		this.totalUseCount = 0;
		this.limitSize = option.limitSize ?? DEFAULT_LIMIT_SIZE;
	}

	async load(key: K, loaderImpl: (key: K) => Promise<CachedResource<T>>): Promise<CachedResource<T>> {
		this._updatePriorities(key);
		const entry = this.table.get(key);
		if (entry) {
			return entry;
		}

		const { resolve, reject, promise } = createWaiter<CachedResource<T>>();
		this.table.set(key, promise);
		try {
			const { value, size } = await loaderImpl(key);
			resolve!({ value, size });
			await this._checkCache(size);
		} catch (err) {
			reject!(err);
			await this._deleteCache(key);
		}
		return promise;
	}

	// キャッシュの整理。指定したサイズを合計サイズに加算して、合計サイズが上限を超えている場合は優先度が低い順に削除される
	private async _checkCache(size: number): Promise<void> {
		this.totalSize += size;
		if (this.totalSize <= this.limitSize) {
			return;
		}
		// 保存されている全リソースの容量が保存可能容量を超える場合、保存可能容量を下回るまで、使われていないリソースから順にキャッシュ用マップから削除していく
		const ids = Array.from(this.priorities.keys()).sort((a, b) => this.priorities.get(a)! - this.priorities.get(b)!);
		for (const i of ids) {
			await this._deleteCache(i);
			if (this.totalSize <= this.limitSize) {
				break;
			}
		}
	}

	private async _deleteCache(key: K): Promise<void> {
		const entry = this.table.get(key);
		if (!entry) {
			return;
		}
		// キャッシュと優先度マップから削除
		this.table.delete(key);
		this.priorities.delete(key);
		// キャッシュの合計容量を再計算
		try {
			this.totalSize -= (await entry).size;
		} catch (_e) {
			// ここへのパスは、ロード失敗の例外がキャッシュされている場合だけなのでエラーを握りつぶす
		}
	}

	// 優先度マップの更新
	private _updatePriorities(key: K): void {
		this.totalUseCount++;
		this.priorities.set(key, this.totalUseCount);
	}
}
