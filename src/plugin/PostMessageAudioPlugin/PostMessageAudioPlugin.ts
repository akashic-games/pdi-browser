import * as g from "@akashic/akashic-engine";
import { AudioManager } from "../../AudioManager";
import { AudioPlugin } from "../AudioPlugin";
import { PostMessageAudioAsset } from "./PostMessageAudioAsset";
import { PostMessageAudioPlayer } from "./PostMessageAudioPlayer";
import { PostMessageHandler } from "./PostMessageHandler";

/**
 * オーディオ関連のPostMessageのリクエストメッセージのtype。
 * 本typeは `akashic:クラス名#メソッド名` を満たす文字列でなければならない。
 */
export type PostMessageAudioRequestType =
	"akashic:AudioAsset#_load" | "akashic:AudioAsset#destroy" |
	"akashic:AudioPlayer#new" | "akashic:AudioPlayer#play" | "akashic:AudioPlayer#stop" |
	"akashic:AudioPlayer#changeVolume" | "akashic:AudioPlayer#changePlaybackRate";

/**
 * オーディオ関連のPostMessageのレスポンスメッセージのtype。
 * 本typeは `akashic:クラス名#メソッド名#レスポンス名` を満たす文字列でなければならない。
 */
export type PostMessageAudioResponseType = "akashic:AudioAsset#_load#success" | "akashic:AssetLoadHandler#failure";

export type PostMessageAudioType = PostMessageAudioRequestType | PostMessageAudioResponseType;

export interface PostMessageAudioPluginParameterObject {
	type: PostMessageAudioType;
	parameters?: any;
}

let postMessageHandler: PostMessageHandler<PostMessageAudioPluginParameterObject>;

export class PostMessageAudioPlugin implements AudioPlugin {
	static isSupported(): boolean {
		return typeof window !== "undefined" && !!window.postMessage;
	}

	/**
	 * 本pluginを初期化する。
	 * TODO: デバッグ用に `postMessageHandler` のインスタンスを返している
	 * TODO: このI/Fは将来的に変更される可能性がある
	 */
	static initialize(targetWindow: Window, targetOrigin: string): PostMessageHandler<any> {
		postMessageHandler = new PostMessageHandler(targetWindow, targetOrigin);

		// NOTE: AudioPluginのライフサイクルが未定なのでここで開始
		postMessageHandler.start();
		return postMessageHandler;
	}

	/**
	 * PostMessageを送信する。
	 * `PostMessageAudioPlugin#initialize()` 以降に呼び出さなければならない。
	 */
	static send(type: PostMessageAudioType, parameters: any): void {
		postMessageHandler.send({
			type,
			parameters
		});
	}

	// NOTE: `AudioPlugin` を継承しているため、ここでは仮に undefined を指定しておく
	// `AudioPlugin#supportedFormats` の削除も検討
	supportedFormats: string[] = undefined;
	private _playerIdx: number = 0;

	createAsset(id: string, assetPath: string, duration: number, system: g.AudioSystem, loop: boolean, hint: g.AudioAssetHint): g.AudioAsset {
		return new PostMessageAudioAsset(id, assetPath, duration, system, loop, hint);
	}

	createPlayer(system: g.AudioSystem, manager: AudioManager): g.AudioPlayer {
		return new PostMessageAudioPlayer(system, manager, "" + this._playerIdx++);
	}
}
