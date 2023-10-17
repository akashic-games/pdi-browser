"use strict";
import type { AMFlow } from "@akashic/amflow";
import type * as pdi from "@akashic/pdi-types";
import { XHRTextAsset } from "./asset/XHRTextAsset";
import { AudioManager } from "./AudioManager";
import { ContainerController } from "./ContainerController";
import { AudioPluginManager } from "./plugin/AudioPluginManager";
import { AudioPluginRegistry } from "./plugin/AudioPluginRegistry";
import type { AudioPluginStatic } from "./plugin/AudioPluginStatic";
import { RafLooper } from "./RafLooper";
import { ResourceFactory } from "./ResourceFactory";

export interface PlatformParameterObject {
	/**
	 * このPlatformが使うAMFlowクライアント。
	 * Platform#amflowに設定される。
	 */
	amflow: AMFlow;

	/**
	 * ビューのルートとなるHTMLElement。
	 */
	containerView: HTMLElement;

	/**
	 * 型の後方互換生のために残されている値。
	 *
	 * 元々は、真を指定するとビュー上の MouseEvent/TouchEvent が preventDefault() されなくなるオプションだった。
	 * 現在はこの値にかかわらず、(PointerEvent が利用できない環境で使われる) touchstart だけが preventDefault() される。
	 */
	disablePreventDefault?: boolean;

	/**
	 * オーディオプラグイン。
	 * resourceFactory を指定した場合、無視される。
	 */
	audioPlugins?: AudioPluginStatic[];

	/**
	 * このPlatformが使うResourceFactory。
	 * getResourceFactory()の戻り値として利用される。
	 * 指定されなかった場合、デフォルトの実装が生成される。指定された場合、audioPlugins は無視される。
	 */
	resourceFactory?: ResourceFactory;
}

export class Platform implements pdi.Platform {
	containerView: HTMLElement;
	containerController: ContainerController;
	audioPluginManager: AudioPluginManager;
	amflow: AMFlow;

	/**
	 * DOM に対するタッチイベントの捕捉方法として pointer-events を利用しているかどうか。
	 * 現バージョンにおいては常に true となる。
	 * この値は MouseEvent および TouchEvent を利用していた旧バージョンとの識別のために存在し、もしこの値が undefined の場合は旧バージョンであるとみなす。
	 */
	readonly usingPointerEvents: boolean = true;

	_platformEventHandler: pdi.PlatformEventHandler | null;
	_resourceFactory: ResourceFactory;
	_rendererReq: pdi.RendererRequirement | null;
	_disablePreventDefault: boolean;
	_audioManager: AudioManager;

	constructor(param: PlatformParameterObject) {
		this.containerView = param.containerView;
		this.audioPluginManager = new AudioPluginManager();
		if (param.audioPlugins) {
			this.audioPluginManager.tryInstallPlugin(param.audioPlugins);
		}
		// TODO: make it deprecated
		this.audioPluginManager.tryInstallPlugin(AudioPluginRegistry.getRegisteredAudioPlugins());
		this._audioManager = new AudioManager();
		this.amflow = param.amflow;
		this._platformEventHandler = null;
		this._resourceFactory = param.resourceFactory || new ResourceFactory({
			audioPluginManager: this.audioPluginManager,
			platform: this,
			audioManager: this._audioManager
		});
		this.containerController = new ContainerController(this._resourceFactory);
		this._rendererReq = null;
		this._disablePreventDefault = !!param.disablePreventDefault;
	}

	setPlatformEventHandler(handler: pdi.PlatformEventHandler): void {
		if (this.containerController) {
			this.containerController.pointEventTrigger.removeAll({owner: this._platformEventHandler});
			this.containerController.pointEventTrigger.add(handler.onPointEvent, handler);
		}
		this._platformEventHandler = handler;
	}

	loadGameConfiguration(url: string, callback: (err: any, configuration: any) => void): void {
		const a = new XHRTextAsset("(game.json)", url);
		a._load({
			_onAssetLoad: _asset => {
				callback(null, JSON.parse(a.data));
			},
			_onAssetError: (_asset, error) => {
				callback(error, null);
			}
		});
	}

	getResourceFactory(): ResourceFactory {
		return this._resourceFactory;
	}

	setRendererRequirement(requirement?: pdi.RendererRequirement): void {
		if (!requirement) {
			if (this.containerController)
				this.containerController.unloadView();
			return;
		}

		this._rendererReq = requirement;
		this._resourceFactory._rendererCandidates = this._rendererReq.rendererCandidates ?? [];

		// Note: this.containerController.inputHandlerLayer の存在により this.containerController が初期化されているかを判定
		if (this.containerController && ! this.containerController.inputHandlerLayer) {
			this.containerController.initialize({
				rendererRequirement: requirement,
				disablePreventDefault: this._disablePreventDefault
			});
			this.containerController.setRootView(this.containerView);
			if (this._platformEventHandler) {
				this.containerController.pointEventTrigger.add(this._platformEventHandler.onPointEvent, this._platformEventHandler);
			}
		} else {
			this.containerController.resetView(requirement);
		}
	}

	getPrimarySurface(): pdi.Surface {
		return this.containerController.surface;
	}

	getOperationPluginViewInfo(): pdi.OperationPluginViewInfo {
		return <any>{
			type: "pdi-browser", // note: scale情報を付加したため null ではないものを返している。
			view: this.containerController.inputHandlerLayer.view,
			getScale: () => this.containerController.inputHandlerLayer._inputHandler.getScale()
		};
	}

	createLooper(fun: (deltaTime: number) => number): pdi.Looper {
		return new RafLooper(fun);
	}

	sendToExternal(_playId: string, _data: any): void {
		// Nothing to do.
	}

	registerAudioPlugins(plugins: AudioPluginStatic[]): boolean {
		return this.audioPluginManager.tryInstallPlugin(plugins);
	}

	setScale(xScale: number, yScale: number): void {
		this.containerController.changeScale(xScale, yScale);
	}

	notifyViewMoved(): void {
		// 既に役割のないメソッド(呼び出さなくても正しく動作する)。公開APIのため後方互換性のために残している。
	}

	/**
	 * 最終的に出力されるマスター音量を変更する
	 *
	 * @param volume マスター音量
	 */
	setMasterVolume(volume: number): void {
		this._audioManager.setMasterVolume(volume);
	}

	/**
	 * 最終的に出力されるマスター音量を取得する
	 */
	getMasterVolume(): number {
		return this._audioManager.getMasterVolume();
	}

	setTabindex(tabindex: string): void {
		this.containerController.setTabindex(tabindex);
	}

	destroy(): void {
		this.setRendererRequirement(undefined);
		this.setMasterVolume(0);
	}
}
