import type { CreateAudioPlayerParameterObject, LoadAudioAssetParameterObject, ProxyAudioHandlerSet } from "../../ProxyAudioHandlerSet";

export class MockProxyAudioHandlerSet implements ProxyAudioHandlerSet {
	unloadAudioAsset: (assetId: string) => void = jest.fn();
	createAudioPlayer: (parameters: CreateAudioPlayerParameterObject) => void = jest.fn();
	destroyAudioPlayer: (audioPlayerId: string) => void = jest.fn();
	playAudioPlayer: (audioPlayerId: string) => void = jest.fn();
	stopAudioPlayer: (audioPlayerId: string) => void = jest.fn();
	changeAudioVolume: (audioPlayerId: string, volume: number) => void = jest.fn();
	changeAudioPlaybackRate: (audioPlayerId: string, rate: number) => void = jest.fn();

	loadAudioAsset: (parameters: LoadAudioAssetParameterObject, handler: (err?: any) => void) => void = jest.fn(
		(parameters: LoadAudioAssetParameterObject, handler: (err?: any) => void) => {
			setTimeout(() => {
				if (parameters.assetPath === "throw-error") {
					handler(new Error("Invalid Asset"));
				} else {
					handler();
				}
			}, 500);
		}
	);
}
