export interface AudioAssetHintParameterObject {
	streaming?: boolean;
}

export interface LoadAudioAssetParameterObject {
	id: string;
	assetPath: string;
	duration: number;
	loop: boolean;
	hint: AudioAssetHintParameterObject;
}

export interface ProxyAudioHandlerSet {
	loadAudioAsset: (parameters: LoadAudioAssetParameterObject, handler: (err?: any) => void) => void;
	unloadAudioAsset: (assetId: string) => void;
	createAudioPlayer: (assetId: string) => string;
	destroyAudioPlayer: (audioAssetId: string) => void;
	playAudioPlayer: (audioPlayerId: string) => void;
	stopAudioPlayer: (audioPlayerId: string) => void;
	changeAudioVolume: (audioPlayerId: string, volume: number) => void;
	changeAudioPlaybackRate: (audioPlayerId: string, rate: number) => void;
}
