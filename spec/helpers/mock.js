function MockAudioSystem(param) {
	this.id = param.id;
	this.volume = 1;
	this._muted = false;
}

MockAudioSystem.prototype.stopAll = function () {
	throw new Error("stopAll(): not implemented");
};

MockAudioSystem.prototype.findPlayers = function () {
	throw new Error("findPlayers(): not implemented");
};

MockAudioSystem.prototype.createPlayer = function (_asset) {
	throw new Error("createPlayer(): not implemented");
};

MockAudioSystem.prototype.requestDestroy = function (_asset) {
	throw new Error("requestDestroy(): not implemented");
};

MockAudioSystem.prototype._reset = function () {
	throw new Error("_reset(): not implemented");
};

MockAudioSystem.prototype._setMuted = function (_value) {
	throw new Error("_setMuted(): not implemented");
};

MockAudioSystem.prototype._setPlaybackRate = function (_value) {
	throw new Error("_setPlaybackRate(): not implemented");
};

exports.MockAudioSystem = MockAudioSystem;
