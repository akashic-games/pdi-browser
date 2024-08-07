"use strict";
import type * as pdi from "@akashic/pdi-types";
import { Trigger } from "@akashic/trigger";
import type { CanvasSurface } from "./canvas/CanvasSurface";
import { InputHandlerLayer } from "./InputHandlerLayer";
import type { ResourceFactory } from "./ResourceFactory";

export interface ContainerControllerInitializeParameterObject {
	rendererRequirement: pdi.RendererRequirement;
	/**
	 * NOTE: このオプションは後方互換性のために残している。現在のバージョンではこの値は無視される。
	 */
	disablePreventDefault?: boolean;
}

/*
 HTML要素のContainerを管理するクラス。
 CanvasやInputHandlerの実態となる要素の順番や追加済みなのかを管理する。
 ContainerはInput、Canvasを1つのセットとして扱う。

 以下のようなDOM構造を持つ

 ContainerController.rootView
 └── InputHandlerLayer
     └── CanvasSurface
 */
export class ContainerController {
	resourceFactory: ResourceFactory;

	container: DocumentFragment = undefined!;
	surface: CanvasSurface = undefined!;
	inputHandlerLayer: InputHandlerLayer = undefined!;
	rootView: HTMLElement = undefined!;
	// Canvas 要素のサイズ変更に追従するための Observer
	observer: MutationObserver = undefined!;

	/**
	 * ゲームコンテンツのCanvas拡大・縮小時に内部のコンテキスト領域のリサイズを行うかどうか。初期値はfalse。
	 * Note: この機能は実験的なものです。特定の環境や実行状態によっては正常な描画が期待できない場合もあります。
	 * 現バージョン(0.7.5) ではfalseにしておくことを推奨しています。
	 */
	useResizeForScaling: boolean = false;

	pointEventTrigger: Trigger<pdi.PlatformPointEvent> = new Trigger<pdi.PlatformPointEvent>();

	private _rendererReq: pdi.RendererRequirement = undefined!;

	constructor(resourceFactory: ResourceFactory) {
		this.resourceFactory = resourceFactory;
	}

	initialize(param: ContainerControllerInitializeParameterObject): void {
		this._rendererReq = param.rendererRequirement;
		this._loadView();
	}

	setRootView(rootView: HTMLElement): void {
		if (rootView === this.rootView) {
			return;
		}
		// 一つのContainerは一つのrootしか持たないのでloadし直す
		if (this.rootView) {
			this.unloadView();
			this._loadView();
		}
		this.rootView = rootView;
		this._appendToRootView(rootView);
	}

	resetView(rendererReq: pdi.RendererRequirement): void {
		this.unloadView();
		this._rendererReq = rendererReq;
		this._loadView();
		this._appendToRootView(this.rootView);
	}

	getRenderer(): pdi.Renderer {
		if (!this.surface) {
			throw new Error("this container has no surface");
		}
		// TODO: should be cached?
		return this.surface.renderer();
	}

	changeScale(xScale: number, yScale: number): void {
		if (this.useResizeForScaling) {
			this.surface.changePhysicalScale(xScale, yScale);
		} else {
			this.surface.changeVisualScale(xScale, yScale);
		}
		this.inputHandlerLayer._inputHandler.setScale(xScale, yScale);
	}

	unloadView(): void {
		// イベントを片付けてから、rootViewに所属するElementを開放する
		this.inputHandlerLayer.disablePointerEvent();
		if (this.rootView) {
			while (this.rootView.firstChild) {
				this.rootView.removeChild(this.rootView.firstChild);
			}
		}
	}

	setTabIndex(tabIndex: string): void {
		this.inputHandlerLayer.setViewTabIndex(tabIndex);
	}

	private _loadView(): void {
		const { primarySurfaceWidth: width, primarySurfaceHeight: height } = this._rendererReq;
		// DocumentFragmentはinsertした時点で開放されているため毎回作る
		// https://dom.spec.whatwg.org/#concept-node-insert
		this.container = document.createDocumentFragment();
		// 入力受け付けレイヤー - DOM Eventの管理
		if (! this.inputHandlerLayer) {
			this.inputHandlerLayer = new InputHandlerLayer({ width, height });
		} else {
			// Note: 操作プラグインに与えた view 情報を削除しないため、 inputHandlerLayer を使いまわしている
			this.inputHandlerLayer.setViewSize({ width, height });
			this.inputHandlerLayer.pointEventTrigger.removeAll();
			if (this.surface && ! this.surface.destroyed()) {
				this.inputHandlerLayer.view.removeChild(this.surface.canvas);
				this.surface.destroy();
				// メモリリーク防止のため、過去の Canvas に対する Observer を削除しておく
				this.observer.disconnect();
			}
		}

		// 入力受け付けレイヤー > 描画レイヤー
		this.surface = this.resourceFactory.createPrimarySurface(width, height);
		const surfaceElement = this.surface.getHTMLElement();
		// Canvasの親要素のwidthとheightは範囲外判定で使用するため、Canvasに追従できるようにする必要がある
		this.observer = new MutationObserver(() => {
			this.inputHandlerLayer.view.style.width = surfaceElement.offsetWidth + "px";
			this.inputHandlerLayer.view.style.height = surfaceElement.offsetHeight + "px";
		});
		this.observer.observe(surfaceElement, { attributeFilter: ["width", "height", "style"] });
		this.inputHandlerLayer.view.appendChild(surfaceElement);
		// containerController -> input -> canvas
		this.container.appendChild(this.inputHandlerLayer.view);
	}

	private _appendToRootView(rootView: HTMLElement): void {
		rootView.appendChild(this.container);
		this.inputHandlerLayer.enablePointerEvent(); // Viewが追加されてから設定する
		this.inputHandlerLayer.pointEventTrigger.add(this.pointEventTrigger.fire, this.pointEventTrigger);
	}
}
