export class MockAudioSystem {
  constructor(param) {
    this.id = param.id;
    this.volume = 1;
    this._muted = false;
  }

  stopAll() {
    throw new Error("stopAll(): not implemented");
  }

  findPlayers() {
    throw new Error("findPlayers(): not implemented");
  }

  createPlayer() {
    throw new Error("createPlayer(): not implemented");
  }

  requestDestroy(_asset) {
    throw new Error("requestDestroy(): not implemented");
  }

  _reset() {
    throw new Error("_reset(): not implemented");
  }

  _setMuted(_value) {
    throw new Error("_setMuted(): not implemented");
  }

  _setPlaybackRate(_value) {
    throw new Error("_setPlaybackRate(): not implemented");
  }
}
