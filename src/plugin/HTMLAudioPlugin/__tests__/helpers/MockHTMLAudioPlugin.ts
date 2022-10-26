import type * as pdi from "@akashic/pdi-types";
import { HTMLAudioPlugin } from "../../HTMLAudioPlugin";
import { MockHTMLAudioAsset } from "./MockHTMLAudioAsset";

export class MockHTMLAudioPlugin extends HTMLAudioPlugin {
	createAsset(
		id: string,
		path: string,
		duration: number,
		system: pdi.AudioSystem,
		loop: boolean,
		hint: pdi.AudioAssetHint
	): MockHTMLAudioAsset {
		return new MockHTMLAudioAsset(id, path, duration, system, loop, hint);
	}
}
