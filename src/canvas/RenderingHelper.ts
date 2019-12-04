import * as g from "@akashic/akashic-engine";
import { Platform } from "../Platform";
import { CanvasSurface } from "./CanvasSurface";
import { SurfaceFactory } from "./SurfaceFactory";

export module RenderingHelper {
	export function toTextFromCompositeOperation(operation: g.CompositeOperation): string {
		var operationText: string;
		switch (operation) {
		case g.CompositeOperation.SourceAtop:
			operationText = "source-atop";
			break;
		case g.CompositeOperation.Lighter:
			operationText = "lighter";
			break;
		case g.CompositeOperation.Copy:
			operationText = "copy";
			break;
		default:
			operationText = "source-over";
			break;
		}
		return operationText;
	}

	export function toCompositeOperationFromText(operationText: string): g.CompositeOperation {
		var operation: g.CompositeOperation;
		switch (operationText) {
		case "source-atop":
			operation = g.CompositeOperation.SourceAtop;
			break;
		case "lighter":
			operation = g.CompositeOperation.Lighter;
			break;
		case "copy":
			operation = g.CompositeOperation.Copy;
			break;
		default:
			operation = g.CompositeOperation.SourceOver;
			break;
		}
		return operation;
	}

	export function drawSystemTextByContext2D(context: CanvasRenderingContext2D, text: string,
	                                          x: number, y: number, maxWidth: number, fontSize: number, textAlign: g.TextAlign,
	                                          textBaseline: g.TextBaseline, textColor: string, fontFamily: g.FontFamily,
	                                          strokeWidth: number, strokeColor: string, strokeOnly: boolean): void {
		var fontFamilyValue: string;
		var textAlignValue: CanvasTextAlign;
		var textBaselineValue: CanvasTextBaseline;
		context.save();
		switch (fontFamily) {
			case g.FontFamily.Monospace:
				fontFamilyValue = "monospace";
				break;
			case g.FontFamily.Serif:
				fontFamilyValue = "serif";
				break;
			default:
				fontFamilyValue = "sans-serif";
				break;
		}
		context.font = fontSize + "px " + fontFamilyValue;
		switch (textAlign) {
			case g.TextAlign.Right:
				textAlignValue = "right";
				break;
			case g.TextAlign.Center:
				textAlignValue = "center";
				break;
			default:
				textAlignValue = "left";
				break;
		}
		context.textAlign = textAlignValue;
		switch (textBaseline) {
			case g.TextBaseline.Top:
				textBaselineValue = "top";
				break;
			case g.TextBaseline.Middle:
				textBaselineValue = "middle";
				break;
			case g.TextBaseline.Bottom:
				textBaselineValue = "bottom";
				break;
			default:
				textBaselineValue = "alphabetic";
				break;
		}
		context.textBaseline = textBaselineValue;
		context.lineJoin = "bevel";
		if (strokeWidth > 0) {
			context.lineWidth = strokeWidth;
			context.strokeStyle = strokeColor;
			if (typeof maxWidth === "undefined") {
				context.strokeText(text, x, y);
			} else {
				context.strokeText(text, x, y, maxWidth);
			}
		}
		if (!strokeOnly) {
			context.fillStyle = textColor;
			if (typeof maxWidth === "undefined") {
				context.fillText(text, x, y);
			} else {
				context.fillText(text, x, y, maxWidth);
			}
		}
		context.restore();
	}

	export function createPrimarySurface(width: number, height: number, rendererCandidates?: string[]): CanvasSurface {
		return SurfaceFactory.createPrimarySurface(width, height, rendererCandidates);
	}

	export function createBackSurface(width: number, height: number, platform: Platform, rendererCandidates?: string[]): g.Surface {
		return SurfaceFactory.createBackSurface(width, height, platform, rendererCandidates);
	}
}
