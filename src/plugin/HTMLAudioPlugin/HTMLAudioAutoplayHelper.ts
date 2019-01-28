/// chrome66以降などのブラウザに導入されるAutoplay Policyに対応する
// https://developers.google.com/web/updates/2017/09/autoplay-policy-changes

const enum PlayableState {
	Unknown,
	WaitingInteraction,
	Ready
}

var state = PlayableState.Unknown;
var suspendedAudioElements: HTMLAudioElement[] = [];

module HTMLAudioAutoplayHelper {
	export function setupChromeMEIWorkaround(audio: HTMLAudioElement): void {
		function playHandler() {
			switch (state) {
				case PlayableState.Unknown:
				case PlayableState.WaitingInteraction: // 通常のケースではここには到達しないが、何らかの外因によって音を鳴らすことができた場合
					playSuspendedAudioElements();
					break;
				case PlayableState.Ready:
					break;
				default:
					// do nothing
			}
			state = PlayableState.Ready;
			clearTimeout(timer);
		}

		function suspendedHandler() {
			audio.removeEventListener("play", playHandler);
			switch (state) {
				case PlayableState.Unknown:
					suspendedAudioElements.push(audio);
					state = PlayableState.WaitingInteraction;
					setUserInteractListener();
					break;
				case PlayableState.WaitingInteraction:
					suspendedAudioElements.push(audio);
					break;
				case PlayableState.Ready:
					audio.play(); // suspendedHandler が呼ばれるまでに音が鳴らせるようになった場合
					break;
				default:
					// do nothing;
			}
		}

		switch (state) {
			case PlayableState.Unknown:
				audio.addEventListener("play", playHandler, true);
				var timer = setTimeout(suspendedHandler, 100); // 明確な根拠はないが100msec待ってもplayされなければ再生できないと判断する
				break;
			case PlayableState.WaitingInteraction:
				suspendedAudioElements.push(audio);
				break;
			case PlayableState.Ready:
				break;
			default:
				// do nothing
		}
	}
}

function resumeHandler() {
	playSuspendedAudioElements();
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

function playSuspendedAudioElements() {
	state = PlayableState.Ready;
	suspendedAudioElements.forEach((audio) => audio.play());
	suspendedAudioElements = [];
}

export = HTMLAudioAutoplayHelper;
