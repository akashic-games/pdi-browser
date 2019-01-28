import g = require("@akashic/akashic-engine");

// pdi-browserが独自にサポートするAudioPlayerの型定義
export interface AudioPlayer extends g.AudioPlayer {
	// マスター音量の変更の通知を受け取る
	notifyMasterVolumeChanged(): void;
}
