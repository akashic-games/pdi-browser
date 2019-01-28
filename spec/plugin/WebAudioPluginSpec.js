"use strict";
var g = require("../../lib/full/index").g;
var WebAudioPlugin = require("../../lib/full/plugin/WebAudioPlugin/WebAudioPlugin").WebAudioPlugin;
var WebAudioAsset = require("../../lib/full/plugin/WebAudioPlugin/WebAudioAsset").WebAudioAsset;
var AudioManager = require("../../lib/full/AudioManager").AudioManager;
describe("WebAudioPlugin", function () {
    if (!WebAudioPlugin.isSupported()) {
        // WebAudioをサポートしてない環境ではSkipする
        return;
    }
    var audioAssetPath = "/spec/fixtures/audio/bgm";
    var game;
    beforeEach(function () {
        game = new g.Game({ width: 100, height: 300, fps: 10 });
    });
    it("サポートしてる実行環境ではtrueを返す", function () {
        expect(WebAudioPlugin.isSupported()).toBeTruthy();
    });
    describe("#createAsset", function () {
        it("should WebAudioAsset", function () {
            var plugin = new WebAudioPlugin();
            var system = new g.SoundAudioSystem("voice", game);
            var asset = plugin.createAsset("id", audioAssetPath, system, false, {});
            expect(asset).toEqual(jasmine.any(WebAudioAsset));
        });
    });
    describe("WebAudioAsset", function () {
        it("#loadするとaudio dataが取得できる", function (done) {
            var plugin = new WebAudioPlugin();
            var system = new g.SoundAudioSystem("voice", game);
            var asset = plugin.createAsset("id", audioAssetPath, system, false, {});
            var loader = {
                _onAssetLoad: function (asset) {
                    expect(asset.data).not.toBeUndefined();
                    expect(asset.path).toContain(audioAssetPath);
                    done();
                },
                _onAssetError: function (asset, error) {
                    done.fail(error);
                }
            };
            asset._load(loader);
        });
        it("存在しないファイルを#loadするとonAssetErrorが呼ばれる", function (done) {
            var plugin = new WebAudioPlugin();
            var system = new g.SoundAudioSystem("voice", game);
            var asset = plugin.createAsset("id", "not_found_audio", system, false, {});
            var loader = {
                _onAssetLoad: function (asset) {
                    done.fail();
                },
                _onAssetError: function (asset, error) {
                    expect(error).toEqual(jasmine.any(Error));
                    done();
                }
            };
            asset._load(loader);
        });
        it("サポートされているファイルの種類でロードが行われる", function (done) {
            var supportedFormat = "ogg";
            var plugin = new WebAudioPlugin();
            // aacとoggがサポート対象にあるが、このテストではどちらか一方のみサポートしてると限定して行う
            plugin.supportedFormats = plugin.supportedFormats.length >= 2 ? [supportedFormat] : plugin.supportedFormats;
            var system = new g.SoundAudioSystem("voice", game);
            var asset = plugin.createAsset("id", audioAssetPath, system, false, {});
            var loader = {
                _onAssetLoad: function (asset) {
                    expect(asset.path).toContain(audioAssetPath + "." + plugin.supportedFormats[0]);
                    done();
                },
                _onAssetError: function (asset, error) {
                    done.fail();
                }
            };
            asset._load(loader);
        });
    });
    describe("WebAudioPlayer", function () {
        var seAssetPath = "/spec/fixtures/audio/se";
        it("#playすると音を再生できる", function (done) {
            var manager = new AudioManager();
            var plugin = new WebAudioPlugin();
            var system = new g.SoundAudioSystem("voice", game);
            var asset = plugin.createAsset("id", seAssetPath, system, false, {});
            var player = plugin.createPlayer(system, manager);
            player.changeVolume(0.1);
            var loader = {
                _onAssetLoad: function (asset) {
                    expect(asset).not.toBeUndefined();
                    player._endedEventHandler = function () {
                        done();
                    };
                    player.play(asset);
                },
                _onAssetError: function (asset, error) {
                    done.fail(new Error("not found audio asset"));
                }
            };
            asset._load(loader);
        });
    });
});
