export interface Waiter<T> {
	promise: Promise<T>;
	resolve: ((v: T) => void) | null;
	reject: ((e: Error) => void) | null;
}

export function createWaiter<T> (): Waiter<T>  {
	let resolve: ((v: T) => void) | null = null;
	let reject: ((e: Error) => void) | null = null;
	const promise = new Promise<T>((res: (val: T) => void, rej: (e: Error) => void) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}
