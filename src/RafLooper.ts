"use strict";
import { Looper } from "@akashic/pdi-types";

export class RafLooper implements Looper {
	_fun: (deltaTime: number) => number;
	_timerId: number | null = null;
	_prev: number;

	constructor(fun: (deltaTime: number) => number) {
		this._fun = fun;
		this._prev = 0;
	}

	start(): void {
		var onAnimationFrame = (deltaTime: number) => {
			if (this._timerId == null) {
				// NOTE: Firefox Quantum 57.0.2の不具合(？)(cancelAnimationFrame()が機能しないことがある)暫定対策
				return;
			}
			this._timerId = requestAnimationFrame(onAnimationFrame);
			this._fun(deltaTime - this._prev);
			this._prev = deltaTime;
		};
		var onFirstFrame = (deltaTime: number) => {
			this._timerId = requestAnimationFrame(onAnimationFrame);
			this._fun(0);
			this._prev = deltaTime;
		};
		this._timerId = requestAnimationFrame(onFirstFrame);
	}

	stop(): void {
		if (this._timerId) cancelAnimationFrame(this._timerId);
		this._timerId = null;
		this._prev = 0;
	}
}
