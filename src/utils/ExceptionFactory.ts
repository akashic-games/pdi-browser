import * as pdi from "@akashic/pdi-types";

export module ExceptionFactory {
	export function createAssetLoadError(
		message: string,
		retriable: boolean = true,
		cause?: any
	): pdi.AssetLoadError {
		return {
			name: "AssetLoadError",
			message,
			retriable,
			cause
		};
	}
}
