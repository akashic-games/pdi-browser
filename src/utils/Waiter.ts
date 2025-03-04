export interface Waiter<T> {
	promise: Promise<T>;
	resolve: ((v: T) => void);
	reject: ((e: Error) => void);
}

export function createWaiter<T> (): Waiter<T>  {
	let resolve: (v: T) => void = (_v: T) => {
		//
	};
	let reject: (e: Error) => void = (_e: Error) => {
		//
	};
	const promise = new Promise<T>((res: (val: T) => void, rej: (e: Error) => void) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}
