import { RenderingHelper } from "../RenderingHelper";

export module WebGLColor {

	export const colorMap: {[key: string]: number[] } = {
		"ALICEBLUE": [0xF0 / 255.0, 0xF8 / 255.0, 0xFF / 255.0, 1.0],
		"ANTIQUEWHITE": [0xFA / 255.0, 0xEB / 255.0, 0xD7 / 255.0, 1.0],
		"AQUA": [0x00 / 255.0, 0xFF / 255.0, 0xFF / 255.0, 1.0],
		"AQUAMARINE": [0x7F / 255.0, 0xFF / 255.0, 0xD4 / 255.0, 1.0],
		"AZURE": [0xF0 / 255.0, 0xFF / 255.0, 0xFF / 255.0, 1.0],
		"BEIGE": [0xF5 / 255.0, 0xF5 / 255.0, 0xDC / 255.0, 1.0],
		"BISQUE": [0xFF / 255.0, 0xE4 / 255.0, 0xC4 / 255.0, 1.0],
		"BLACK": [0x00 / 255.0, 0x00 / 255.0, 0x00 / 255.0, 1.0],
		"BLANCHEDALMOND": [0xFF / 255.0, 0xEB / 255.0, 0xCD / 255.0, 1.0],
		"BLUE": [0x00 / 255.0, 0x00 / 255.0, 0xFF / 255.0, 1.0],
		"BLUEVIOLET": [0x8A / 255.0, 0x2B / 255.0, 0xE2 / 255.0, 1.0],
		"BROWN": [0xA5 / 255.0, 0x2A / 255.0, 0x2A / 255.0, 1.0],
		"BURLYWOOD": [0xDE / 255.0, 0xB8 / 255.0, 0x87 / 255.0, 1.0],
		"CADETBLUE": [0x5F / 255.0, 0x9E / 255.0, 0xA0 / 255.0, 1.0],
		"CHARTREUSE": [0x7F / 255.0, 0xFF / 255.0, 0x00 / 255.0, 1.0],
		"CHOCOLATE": [0xD2 / 255.0, 0x69 / 255.0, 0x1E / 255.0, 1.0],
		"CORAL": [0xFF / 255.0, 0x7F / 255.0, 0x50 / 255.0, 1.0],
		"CORNFLOWERBLUE": [0x64 / 255.0, 0x95 / 255.0, 0xED / 255.0, 1.0],
		"CORNSILK": [0xFF / 255.0, 0xF8 / 255.0, 0xDC / 255.0, 1.0],
		"CRIMSON": [0xDC / 255.0, 0x14 / 255.0, 0x3C / 255.0, 1.0],
		"CYAN": [0x00 / 255.0, 0xFF / 255.0, 0xFF / 255.0, 1.0],
		"DARKBLUE": [0x00 / 255.0, 0x00 / 255.0, 0x8B / 255.0, 1.0],
		"DARKCYAN": [0x00 / 255.0, 0x8B / 255.0, 0x8B / 255.0, 1.0],
		"DARKGOLDENROD": [0xB8 / 255.0, 0x86 / 255.0, 0x0B / 255.0, 1.0],
		"DARKGRAY": [0xA9 / 255.0, 0xA9 / 255.0, 0xA9 / 255.0, 1.0],
		"DARKGREEN": [0x00 / 255.0, 0x64 / 255.0, 0x00 / 255.0, 1.0],
		"DARKGREY": [0xA9 / 255.0, 0xA9 / 255.0, 0xA9 / 255.0, 1.0],
		"DARKKHAKI": [0xBD / 255.0, 0xB7 / 255.0, 0x6B / 255.0, 1.0],
		"DARKMAGENTA": [0x8B / 255.0, 0x00 / 255.0, 0x8B / 255.0, 1.0],
		"DARKOLIVEGREEN": [0x55 / 255.0, 0x6B / 255.0, 0x2F / 255.0, 1.0],
		"DARKORANGE": [0xFF / 255.0, 0x8C / 255.0, 0x00 / 255.0, 1.0],
		"DARKORCHID": [0x99 / 255.0, 0x32 / 255.0, 0xCC / 255.0, 1.0],
		"DARKRED": [0x8B / 255.0, 0x00 / 255.0, 0x00 / 255.0, 1.0],
		"DARKSALMON": [0xE9 / 255.0, 0x96 / 255.0, 0x7A / 255.0, 1.0],
		"DARKSEAGREEN": [0x8F / 255.0, 0xBC / 255.0, 0x8F / 255.0, 1.0],
		"DARKSLATEBLUE": [0x48 / 255.0, 0x3D / 255.0, 0x8B / 255.0, 1.0],
		"DARKSLATEGRAY": [0x2F / 255.0, 0x4F / 255.0, 0x4F / 255.0, 1.0],
		"DARKSLATEGREY": [0x2F / 255.0, 0x4F / 255.0, 0x4F / 255.0, 1.0],
		"DARKTURQUOISE": [0x00 / 255.0, 0xCE / 255.0, 0xD1 / 255.0, 1.0],
		"DARKVIOLET": [0x94 / 255.0, 0x00 / 255.0, 0xD3 / 255.0, 1.0],
		"DEEPPINK": [0xFF / 255.0, 0x14 / 255.0, 0x93 / 255.0, 1.0],
		"DEEPSKYBLUE": [0x00 / 255.0, 0xBF / 255.0, 0xFF / 255.0, 1.0],
		"DIMGRAY": [0x69 / 255.0, 0x69 / 255.0, 0x69 / 255.0, 1.0],
		"DIMGREY": [0x69 / 255.0, 0x69 / 255.0, 0x69 / 255.0, 1.0],
		"DODGERBLUE": [0x1E / 255.0, 0x90 / 255.0, 0xFF / 255.0, 1.0],
		"FIREBRICK": [0xB2 / 255.0, 0x22 / 255.0, 0x22 / 255.0, 1.0],
		"FLORALWHITE": [0xFF / 255.0, 0xFA / 255.0, 0xF0 / 255.0, 1.0],
		"FORESTGREEN": [0x22 / 255.0, 0x8B / 255.0, 0x22 / 255.0, 1.0],
		"FUCHSIA": [0xFF / 255.0, 0x00 / 255.0, 0xFF / 255.0, 1.0],
		"GAINSBORO": [0xDC / 255.0, 0xDC / 255.0, 0xDC / 255.0, 1.0],
		"GHOSTWHITE": [0xF8 / 255.0, 0xF8 / 255.0, 0xFF / 255.0, 1.0],
		"GOLD": [0xFF / 255.0, 0xD7 / 255.0, 0x00 / 255.0, 1.0],
		"GOLDENROD": [0xDA / 255.0, 0xA5 / 255.0, 0x20 / 255.0, 1.0],
		"GRAY": [0x80 / 255.0, 0x80 / 255.0, 0x80 / 255.0, 1.0],
		"GREEN": [0x00 / 255.0, 0x80 / 255.0, 0x00 / 255.0, 1.0],
		"GREENYELLOW": [0xAD / 255.0, 0xFF / 255.0, 0x2F / 255.0, 1.0],
		"GREY": [0x80 / 255.0, 0x80 / 255.0, 0x80 / 255.0, 1.0],
		"HONEYDEW": [0xF0 / 255.0, 0xFF / 255.0, 0xF0 / 255.0, 1.0],
		"HOTPINK": [0xFF / 255.0, 0x69 / 255.0, 0xB4 / 255.0, 1.0],
		"INDIANRED": [0xCD / 255.0, 0x5C / 255.0, 0x5C / 255.0, 1.0],
		"INDIGO": [0x4B / 255.0, 0x00 / 255.0, 0x82 / 255.0, 1.0],
		"IVORY": [0xFF / 255.0, 0xFF / 255.0, 0xF0 / 255.0, 1.0],
		"KHAKI": [0xF0 / 255.0, 0xE6 / 255.0, 0x8C / 255.0, 1.0],
		"LAVENDER": [0xE6 / 255.0, 0xE6 / 255.0, 0xFA / 255.0, 1.0],
		"LAVENDERBLUSH": [0xFF / 255.0, 0xF0 / 255.0, 0xF5 / 255.0, 1.0],
		"LAWNGREEN": [0x7C / 255.0, 0xFC / 255.0, 0x00 / 255.0, 1.0],
		"LEMONCHIFFON": [0xFF / 255.0, 0xFA / 255.0, 0xCD / 255.0, 1.0],
		"LIGHTBLUE": [0xAD / 255.0, 0xD8 / 255.0, 0xE6 / 255.0, 1.0],
		"LIGHTCORAL": [0xF0 / 255.0, 0x80 / 255.0, 0x80 / 255.0, 1.0],
		"LIGHTCYAN": [0xE0 / 255.0, 0xFF / 255.0, 0xFF / 255.0, 1.0],
		"LIGHTGOLDENRODYELLOW": [0xFA / 255.0, 0xFA / 255.0, 0xD2 / 255.0, 1.0],
		"LIGHTGRAY": [0xD3 / 255.0, 0xD3 / 255.0, 0xD3 / 255.0, 1.0],
		"LIGHTGREEN": [0x90 / 255.0, 0xEE / 255.0, 0x90 / 255.0, 1.0],
		"LIGHTGREY": [0xD3 / 255.0, 0xD3 / 255.0, 0xD3 / 255.0, 1.0],
		"LIGHTPINK": [0xFF / 255.0, 0xB6 / 255.0, 0xC1 / 255.0, 1.0],
		"LIGHTSALMON": [0xFF / 255.0, 0xA0 / 255.0, 0x7A / 255.0, 1.0],
		"LIGHTSEAGREEN": [0x20 / 255.0, 0xB2 / 255.0, 0xAA / 255.0, 1.0],
		"LIGHTSKYBLUE": [0x87 / 255.0, 0xCE / 255.0, 0xFA / 255.0, 1.0],
		"LIGHTSLATEGRAY": [0x77 / 255.0, 0x88 / 255.0, 0x99 / 255.0, 1.0],
		"LIGHTSLATEGREY": [0x77 / 255.0, 0x88 / 255.0, 0x99 / 255.0, 1.0],
		"LIGHTSTEELBLUE": [0xB0 / 255.0, 0xC4 / 255.0, 0xDE / 255.0, 1.0],
		"LIGHTYELLOW": [0xFF / 255.0, 0xFF / 255.0, 0xE0 / 255.0, 1.0],
		"LIME": [0x00 / 255.0, 0xFF / 255.0, 0x00 / 255.0, 1.0],
		"LIMEGREEN": [0x32 / 255.0, 0xCD / 255.0, 0x32 / 255.0, 1.0],
		"LINEN": [0xFA / 255.0, 0xF0 / 255.0, 0xE6 / 255.0, 1.0],
		"MAGENTA": [0xFF / 255.0, 0x00 / 255.0, 0xFF / 255.0, 1.0],
		"MAROON": [0x80 / 255.0, 0x00 / 255.0, 0x00 / 255.0, 1.0],
		"MEDIUMAQUAMARINE": [0x66 / 255.0, 0xCD / 255.0, 0xAA / 255.0, 1.0],
		"MEDIUMBLUE": [0x00 / 255.0, 0x00 / 255.0, 0xCD / 255.0, 1.0],
		"MEDIUMORCHID": [0xBA / 255.0, 0x55 / 255.0, 0xD3 / 255.0, 1.0],
		"MEDIUMPURPLE": [0x93 / 255.0, 0x70 / 255.0, 0xDB / 255.0, 1.0],
		"MEDIUMSEAGREEN": [0x3C / 255.0, 0xB3 / 255.0, 0x71 / 255.0, 1.0],
		"MEDIUMSLATEBLUE": [0x7B / 255.0, 0x68 / 255.0, 0xEE / 255.0, 1.0],
		"MEDIUMSPRINGGREEN": [0x00 / 255.0, 0xFA / 255.0, 0x9A / 255.0, 1.0],
		"MEDIUMTURQUOISE": [0x48 / 255.0, 0xD1 / 255.0, 0xCC / 255.0, 1.0],
		"MEDIUMVIOLETRED": [0xC7 / 255.0, 0x15 / 255.0, 0x85 / 255.0, 1.0],
		"MIDNIGHTBLUE": [0x19 / 255.0, 0x19 / 255.0, 0x70 / 255.0, 1.0],
		"MINTCREAM": [0xF5 / 255.0, 0xFF / 255.0, 0xFA / 255.0, 1.0],
		"MISTYROSE": [0xFF / 255.0, 0xE4 / 255.0, 0xE1 / 255.0, 1.0],
		"MOCCASIN": [0xFF / 255.0, 0xE4 / 255.0, 0xB5 / 255.0, 1.0],
		"NAVAJOWHITE": [0xFF / 255.0, 0xDE / 255.0, 0xAD / 255.0, 1.0],
		"NAVY": [0x00 / 255.0, 0x00 / 255.0, 0x80 / 255.0, 1.0],
		"OLDLACE": [0xFD / 255.0, 0xF5 / 255.0, 0xE6 / 255.0, 1.0],
		"OLIVE": [0x80 / 255.0, 0x80 / 255.0, 0x00 / 255.0, 1.0],
		"OLIVEDRAB": [0x6B / 255.0, 0x8E / 255.0, 0x23 / 255.0, 1.0],
		"ORANGE": [0xFF / 255.0, 0xA5 / 255.0, 0x00 / 255.0, 1.0],
		"ORANGERED": [0xFF / 255.0, 0x45 / 255.0, 0x00 / 255.0, 1.0],
		"ORCHID": [0xDA / 255.0, 0x70 / 255.0, 0xD6 / 255.0, 1.0],
		"PALEGOLDENROD": [0xEE / 255.0, 0xE8 / 255.0, 0xAA / 255.0, 1.0],
		"PALEGREEN": [0x98 / 255.0, 0xFB / 255.0, 0x98 / 255.0, 1.0],
		"PALETURQUOISE": [0xAF / 255.0, 0xEE / 255.0, 0xEE / 255.0, 1.0],
		"PALEVIOLETRED": [0xDB / 255.0, 0x70 / 255.0, 0x93 / 255.0, 1.0],
		"PAPAYAWHIP": [0xFF / 255.0, 0xEF / 255.0, 0xD5 / 255.0, 1.0],
		"PEACHPUFF": [0xFF / 255.0, 0xDA / 255.0, 0xB9 / 255.0, 1.0],
		"PERU": [0xCD / 255.0, 0x85 / 255.0, 0x3F / 255.0, 1.0],
		"PINK": [0xFF / 255.0, 0xC0 / 255.0, 0xCB / 255.0, 1.0],
		"PLUM": [0xDD / 255.0, 0xA0 / 255.0, 0xDD / 255.0, 1.0],
		"POWDERBLUE": [0xB0 / 255.0, 0xE0 / 255.0, 0xE6 / 255.0, 1.0],
		"PURPLE": [0x80 / 255.0, 0x00 / 255.0, 0x80 / 255.0, 1.0],
		"RED": [0xFF / 255.0, 0x00 / 255.0, 0x00 / 255.0, 1.0],
		"ROSYBROWN": [0xBC / 255.0, 0x8F / 255.0, 0x8F / 255.0, 1.0],
		"ROYALBLUE": [0x41 / 255.0, 0x69 / 255.0, 0xE1 / 255.0, 1.0],
		"SADDLEBROWN": [0x8B / 255.0, 0x45 / 255.0, 0x13 / 255.0, 1.0],
		"SALMON": [0xFA / 255.0, 0x80 / 255.0, 0x72 / 255.0, 1.0],
		"SANDYBROWN": [0xF4 / 255.0, 0xA4 / 255.0, 0x60 / 255.0, 1.0],
		"SEAGREEN": [0x2E / 255.0, 0x8B / 255.0, 0x57 / 255.0, 1.0],
		"SEASHELL": [0xFF / 255.0, 0xF5 / 255.0, 0xEE / 255.0, 1.0],
		"SIENNA": [0xA0 / 255.0, 0x52 / 255.0, 0x2D / 255.0, 1.0],
		"SILVER": [0xC0 / 255.0, 0xC0 / 255.0, 0xC0 / 255.0, 1.0],
		"SKYBLUE": [0x87 / 255.0, 0xCE / 255.0, 0xEB / 255.0, 1.0],
		"SLATEBLUE": [0x6A / 255.0, 0x5A / 255.0, 0xCD / 255.0, 1.0],
		"SLATEGRAY": [0x70 / 255.0, 0x80 / 255.0, 0x90 / 255.0, 1.0],
		"SLATEGREY": [0x70 / 255.0, 0x80 / 255.0, 0x90 / 255.0, 1.0],
		"SNOW": [0xFF / 255.0, 0xFA / 255.0, 0xFA / 255.0, 1.0],
		"SPRINGGREEN": [0x00 / 255.0, 0xFF / 255.0, 0x7F / 255.0, 1.0],
		"STEELBLUE": [0x46 / 255.0, 0x82 / 255.0, 0xB4 / 255.0, 1.0],
		"TAN": [0xD2 / 255.0, 0xB4 / 255.0, 0x8C / 255.0, 1.0],
		"TEAL": [0x00 / 255.0, 0x80 / 255.0, 0x80 / 255.0, 1.0],
		"THISTLE": [0xD8 / 255.0, 0xBF / 255.0, 0xD8 / 255.0, 1.0],
		"TOMATO": [0xFF / 255.0, 0x63 / 255.0, 0x47 / 255.0, 1.0],
		"TURQUOISE": [0x40 / 255.0, 0xE0 / 255.0, 0xD0 / 255.0, 1.0],
		"VIOLET": [0xEE / 255.0, 0x82 / 255.0, 0xEE / 255.0, 1.0],
		"WHEAT": [0xF5 / 255.0, 0xDE / 255.0, 0xB3 / 255.0, 1.0],
		"WHITE": [0xFF / 255.0, 0xFF / 255.0, 0xFF / 255.0, 1.0],
		"WHITESMOKE": [0xF5 / 255.0, 0xF5 / 255.0, 0xF5 / 255.0, 1.0],
		"YELLOW": [0xFF / 255.0, 0xFF / 255.0, 0x00 / 255.0, 1.0],
		"YELLOWGREEN": [0x9A / 255.0, 0xCD / 255.0, 0x32 / 255.0, 1.0]
	};

	export function get(color: string|number[]): number[] {
		let rgba = (typeof color === "string") ? WebGLColor._toColor(<string> color) : [color[0], color[1], color[2], color[3]];
		rgba[3] = RenderingHelper.clamp(rgba[3]);
		rgba[0] = RenderingHelper.clamp(rgba[0]) * rgba[3];
		rgba[1] = RenderingHelper.clamp(rgba[1]) * rgba[3];
		rgba[2] = RenderingHelper.clamp(rgba[2]) * rgba[3];
		return rgba;
	}

	export function _hsl2rgb(hsl: number[]): number[] {
		const h =  hsl[0] % 360;
		const s =  hsl[1];
		const l = (hsl[2] > 50) ? 100 - hsl[2] : hsl[2];
		const a =  hsl[3];
		const max = l + l * s;
		const min = l - l * s;

		if (h < 60) {
			return [max, (h / 60.0) * (max - min) + min, min, a];
		} else if (h < 120) {
			return [((120 - h) / 60.0) * (max - min) + min, max, min, a];
		} else if (h < 180) {
			return [min, max, ((h - 120) / 60.0) * (max - min) + min, a];
		} else if (h < 240) {
			return [min, ((240 - h) / 60.0) * (max - min) + min, max, a];
		} else if (h < 300) {
			return [((h - 240) / 60.0) * (max - min) + min, min, max, a];
		} else {
			return [max, min, ((360 - h) / 60.0) * (max - min) + min, a];
		}
	}

	export function _toColor(cssColor: string): number[] {
		// 大文字化して空白を削除 (ncc: normalized css color)
		const ncc: string = cssColor.toUpperCase().replace(/\s+/g, "");

		const rgba = WebGLColor.colorMap[ncc];
		if (rgba) {
			return rgba;
		}

		if (ncc.match(/^#([\dA-F])([\dA-F])([\dA-F])$/)) {
			return [
				parseInt(RegExp.$1, 16) / 15.0,
				parseInt(RegExp.$2, 16) / 15.0,
				parseInt(RegExp.$3, 16) / 15.0, 1.0
			];
		} else if (ncc.match(/^#([\dA-F]{2})([\dA-F]{2})([\dA-F]{2})$/)) {
			return [
				parseInt(RegExp.$1, 16) / 255.0,
				parseInt(RegExp.$2, 16) / 255.0,
				parseInt(RegExp.$3, 16) / 255.0, 1.0
			];
		} else if (ncc.match(/^RGB\((\d{1,3}),(\d{1,3}),(\d{1,3})\)$/)) {
			return [
				parseInt(RegExp.$1, 10) / 255.0,
				parseInt(RegExp.$2, 10) / 255.0,
				parseInt(RegExp.$3, 10) / 255.0, 1.0
			];
		} else if (ncc.match(/^RGBA\((\d{1,3}),(\d{1,3}),(\d{1,3}),(\d(\.\d*)?)\)$/)) {
			return [
				parseInt(RegExp.$1, 10) / 255.0,
				parseInt(RegExp.$2, 10) / 255.0,
				parseInt(RegExp.$3, 10) / 255.0,
				parseFloat(RegExp.$4)
			];
		} else if (ncc.match(/^HSL\((\d{1,3}),(\d{1,3})%,(\d{1,3})%\)$/)) {
			return WebGLColor._hsl2rgb([
				parseInt(RegExp.$1, 10),
				RenderingHelper.clamp(parseInt(RegExp.$2, 10) / 100.0),
				RenderingHelper.clamp(parseInt(RegExp.$3, 10) / 100.0), 1.0
			]);
		} else if (ncc.match(/^HSLA\((\d{1,3}),(\d{1,3})%,(\d{1,3})%,(\d(\.\d*)?)\)$/)) {
			return WebGLColor._hsl2rgb([
				parseInt(RegExp.$1, 10),
				RenderingHelper.clamp(parseInt(RegExp.$2, 10) / 100.0),
				RenderingHelper.clamp(parseInt(RegExp.$3, 10) / 100.0),
				parseFloat(RegExp.$4)
			]);
		} else {
			throw Error("illigal cssColor format: " + ncc);
		}
	}
}
