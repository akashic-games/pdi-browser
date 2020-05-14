import * as g from "@akashic/akashic-engine";

export module ExceptionFactory {
	export function createAssetLoadError(
		message: string,
		retriable: boolean = true,
		cause?: any
	): g.AssetLoadError {
		return {
			name: "AssetLoadError",
			message,
			retriable,
			cause
		};
	}
}
