/**
 * Audio 要素で再生できる形式を検出する。
 * @returns 再生できる形式の配列
 */
export function detectSupportedFormats(): string[] {
	// Edgeは再生できるファイル形式とcanPlayTypeの結果が一致しないため、固定でAACを利用する
	if (navigator.userAgent.indexOf("Edge/") !== -1) return ["aac"];

	// Audio要素を実際に作って、canPlayTypeで再生できるかを判定する
	const audioElement = document.createElement("audio");
	const formats = ["ogg", "m4a", "aac", "mp4"] as const; // 順番重要: この順で優先的に使うことに注意 (ref. resolveExtName())
	const mimeTable: { [key in typeof formats[number]]?: string } = { "m4a": "audio/x-m4a" };

	const supportedFormats: string[] = [];
	for (let i = 0, len = formats.length; i < len; i++) {
		const format = formats[i];
		const mimeType = mimeTable[format] ?? ("audio/" + format);
		try {
			const canPlay = audioElement.canPlayType(mimeType) as string;
			if (canPlay !== "no" && canPlay !== "") {
				supportedFormats.push(format);
			}
		} catch (_e) {
			// do nothing: just skip
		}
	}
	return supportedFormats;
}

/**
 * 拡張子の配列から、再生可能な形式に合致するものを探す。
 * @param extensions 拡張子の配列または null | undefined (空配列と見なす)
 * @param supportedFormats 再生可能な形式。detectSupportedFormats() の戻り値を期待する
 * @returns 再生可能な形式の拡張子。なければ null
 */
export function resolveExtname(extensions: string[] | undefined | null, supportedFormats: string[]): string | null {
	if (!extensions || !extensions.length) return null;
	for (const fmt of supportedFormats) {
		const ext = "." + fmt;
		if (extensions.indexOf(ext) !== -1)
			return ext;
	}
	return null;
}

/**
 * 与えられたパス文字列に与えられた拡張子を追加する。
 * @param path パス文字列
 * @param ext 追加する拡張子 ("." を含む)
 */
export function addExtname(path: string, ext: string): string {
	const index = path.indexOf("?");
	if (index === -1) {
		return path + ext;
	}
	// hoge?query => hoge.ext?query
	return path.substring(0, index) + ext + path.substring(index, path.length);
}
