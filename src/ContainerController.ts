"use strict";
import * as g from "@akashic/akashic-engine";
import * as pdi from "@akashic/akashic-pdi";
import { CanvasSurface } from "./canvas/CanvasSurface";
import { InputHandlerLayer } from "./InputHandlerLayer";
import { ResourceFactory } from "./ResourceFactory";

export interface ContainerControllerInitializeParameterObject {
	rendererRequirement: pdi.RendererRequirement;
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
	container: DocumentFragment;
	surface: CanvasSurface;
	inputHandlerLayer: InputHandlerLayer;
	rootView: HTMLElement;
	/**
	 * ゲームコンテンツのCanvas拡大・縮小時に内部のコンテキスト領域のリサイズを行うかどうか。初期値はfalse。
	 * Note: この機能は実験的なものです。特定の環境や実行状態によっては正常な描画が期待できない場合もあります。
	 * 現バージョン(0.7.5) ではfalseにしておくことを推奨しています。
	 */
	useResizeForScaling: boolean;

	pointEventTrigger: g.Trigger<g.PlatformPointEvent>;

	private _rendererReq: pdi.RendererRequirement;
	private _disablePreventDefault: boolean;

	constructor(resourceFactory: ResourceFactory) {
		this.container = null;
		this.surface = null;
		this.inputHandlerLayer = null;
		this.rootView = null;
		this.useResizeForScaling = false;
		this.pointEventTrigger = new g.Trigger<g.PlatformPointEvent>();
		this._rendererReq = null;
		this._disablePreventDefault = false;
		this.resourceFactory = resourceFactory;
	}

	initialize(param: ContainerControllerInitializeParameterObject): void {
		this._rendererReq = param.rendererRequirement;
		this._disablePreventDefault = !!param.disablePreventDefault;
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

	getRenderer(): g.Renderer {
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

	private _loadView(): void {
		const { primarySurfaceWidth: width, primarySurfaceHeight: height } = this._rendererReq;
		const disablePreventDefault = this._disablePreventDefault;
		// DocumentFragmentはinsertした時点で開放されているため毎回作る
		// https://dom.spec.whatwg.org/#concept-node-insert
		this.container = document.createDocumentFragment();
		// 入力受け付けレイヤー - DOM Eventの管理
		if (! this.inputHandlerLayer) {
			this.inputHandlerLayer = new InputHandlerLayer({ width, height, disablePreventDefault });
		} else {
			// Note: 操作プラグインに与えた view 情報を削除しないため、 inputHandlerLayer を使いまわしている
			this.inputHandlerLayer.setViewSize({ width, height });
			this.inputHandlerLayer.pointEventTrigger.removeAll();
			if (this.surface && ! this.surface.destroyed()) {
					this.inputHandlerLayer.view.removeChild(this.surface.canvas);
					this.surface.destroy();
				}
		}

		// 入力受け付けレイヤー > 描画レイヤー
		this.surface = this.resourceFactory.createPrimarySurface(width, height);
		this.inputHandlerLayer.view.appendChild(this.surface.getHTMLElement());
		// containerController -> input -> canvas
		this.container.appendChild(this.inputHandlerLayer.view);
	}

	private _appendToRootView(rootView: HTMLElement): void {
		rootView.appendChild(this.container);
		this.inputHandlerLayer.enablePointerEvent(); // Viewが追加されてから設定する
		this.inputHandlerLayer.pointEventTrigger.add(this.pointEventTrigger.fire, this.pointEventTrigger);
	}
}
