import * as helper from "./WebAudioHelper";

// chrome66以降などのブラウザに導入されるAutoplay Policyに対応する
// https://developers.google.com/web/updates/2017/09/autoplay-policy-changes

module WebAudioAutoplayHelper {
	export function setupChromeMEIWorkaround(): void {
		var context = helper.getAudioContext();
		if (context && typeof context.resume !== "function") return;
		var gain = helper.createGainNode(context);

		// テスト用の音源を用意する
		var osc = context.createOscillator();
		osc.type = "sawtooth";
		osc.frequency.value = 440; // 何でも良いがドの音
		osc.connect(gain);
		osc.start(0);
		const contextState = context.state;
		osc.disconnect();
		if (contextState !== "running") setUserInteractListener();
	}
}

function resumeHandler() {
	var context = helper.getAudioContext();
	context.resume();
	clearUserInteractListener();
}

function setUserInteractListener() {
	document.addEventListener("keydown", resumeHandler, true);
	document.addEventListener("mousedown", resumeHandler, true);
	document.addEventListener("touchend", resumeHandler, true);
}

function clearUserInteractListener() {
	document.removeEventListener("keydown", resumeHandler);
	document.removeEventListener("mousedown", resumeHandler);
	document.removeEventListener("touchend", resumeHandler);
}

export = WebAudioAutoplayHelper;
