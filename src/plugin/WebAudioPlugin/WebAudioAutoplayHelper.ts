import * as helper from "./WebAudioHelper";

// chrome66以降などのブラウザに導入されるAutoplay Policyに対応する
// https://developers.google.com/web/updates/2017/09/autoplay-policy-changes

module WebAudioAutoplayHelper {
	export function setupChromeMEIWorkaround(): void {
		const context = helper.getAudioContext();
		if (context && typeof context.resume !== "function") return;
		const gain = helper.createGainNode(context);

		// テスト用の音源を用意する
		const osc = context.createOscillator();
		osc.type = "sawtooth";
		osc.frequency.value = 440; // 何でも良いがドの音
		osc.connect(gain);
		osc.start(0);
		const contextState = context.state;
		osc.disconnect();
		if (contextState !== "running") setUserInteractListener();
	}
}

async function resumeHandler(): Promise<void> {
	const context = helper.getAudioContext();
	clearUserInteractListener();
	await context.resume();
}

function setUserInteractListener(): void {
	document.addEventListener("keydown", resumeHandler, true);
	document.addEventListener("mousedown", resumeHandler, true);
	document.addEventListener("touchend", resumeHandler, true);
}

function clearUserInteractListener(): void {
	document.removeEventListener("keydown", resumeHandler);
	document.removeEventListener("mousedown", resumeHandler);
	document.removeEventListener("touchend", resumeHandler);
}

export = WebAudioAutoplayHelper;
