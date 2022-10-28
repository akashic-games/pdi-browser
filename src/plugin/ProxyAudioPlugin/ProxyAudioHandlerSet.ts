export interface AudioAssetHintParameterObject {
	streaming?: boolean;
}

export interface LoadAudioAssetParameterObject {
	id: string;
	assetPath: string;
	duration: number;
	loop: boolean;
	hint: AudioAssetHintParameterObject;
	offset: number;
}

export interface CreateAudioPlayerParameterObject {
	assetId: string;
	audioPlayerId: string;
	isPlaying: boolean;
	volume: number;
	playbackRate: number;
}

export interface ProxyAudioHandlerSet {
	loadAudioAsset: (parameters: LoadAudioAssetParameterObject, handler: (err?: any) => void) => void;
	unloadAudioAsset: (assetId: string) => void;
	createAudioPlayer: (parameters: CreateAudioPlayerParameterObject) => void;
	destroyAudioPlayer: (audioPlayerId: string) => void;
	playAudioPlayer: (audioPlayerId: string) => void;
	stopAudioPlayer: (audioPlayerId: string) => void;
	changeAudioVolume: (audioPlayerId: string, volume: number) => void;
	changeAudioPlaybackRate: (audioPlayerId: string, rate: number) => void;
}
