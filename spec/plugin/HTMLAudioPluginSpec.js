"use strict";
var MockAudioSystem = require("../helpers/mock").MockAudioSystem;
var HTMLAudioPlugin = require("../../lib/full/plugin/HTMLAudioPlugin/HTMLAudioPlugin").HTMLAudioPlugin;
var HTMLAudioAsset = require("../../lib/full/plugin/HTMLAudioPlugin/HTMLAudioAsset").HTMLAudioAsset;
var AudioManager = require("../../lib/full/AudioManager").AudioManager;
describe("HTMLAudioPlugin", function () {
    if (!HTMLAudioPlugin.isSupported()) {
        // HTMLAudioをサポートしてない環境ではSkipする
        return;
    }
    var audioAssetPath = "/spec/fixtures/audio/bgm";
    it("サポートしてる実行環境ではtrueを返す", function () {
        expect(HTMLAudioPlugin.isSupported()).toBeTruthy();
    });
    describe("#createAsset", function () {
        it("should HTMLAudioAsset", function () {
            var plugin = new HTMLAudioPlugin();
            var system = new MockAudioSystem({id: "voice"});
            var asset = plugin.createAsset("id", audioAssetPath, system, false, {});
            expect(asset).toEqual(jasmine.any(HTMLAudioAsset));
        });
    });
    describe("HTMLAudioAsset", function () {
        it("#loadするとaudio dataが取得できる", function (done) {
            var plugin = new HTMLAudioPlugin();
            var system = new MockAudioSystem({id: "voice"});
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
        it("オーディオアセットの拡張子がファイル名の末尾につく", function (done) {
            var plugin = new HTMLAudioPlugin();
            var system = new MockAudioSystem({id: "voice"});
            var query = "rev=1234";
            var asset = plugin.createAsset("id", audioAssetPath + "?" + query, system, false, {});
            var loader = {
                _onAssetLoad: function (asset) {
                    expect(asset.path).toBe(audioAssetPath + ".ogg?" + query);
                    done();
                },
                _onAssetError: function (asset, error) {
                    done.fail(error);
                }
            };
            asset._load(loader);
        });
        it("存在しないファイルを#loadするとonAssetErrorが呼ばれる", function (done) {
            var plugin = new HTMLAudioPlugin();
            var system = new MockAudioSystem({id: "voice"});
            var asset = plugin.createAsset("id", "not_found_audio", system, false, {});
            var loader = {
                _onAssetLoad: function (asset) {
                    done.fail();
                },
                _onAssetError: function (asset, error) {
                    expect(asset.data).not.toBeUndefined();
                    expect(error.name).toEqual("AssetLoadError");
                    expect(typeof error.message).toEqual("string");
                    done();
                }
            };
            asset._load(loader);
        });
        it("サポートされているファイルの種類でロードが行われる", function (done) {
            var supportedFormat = "ogg";
            var plugin = new HTMLAudioPlugin();
            // aacとoggがサポート対象にあるが、このテストではどちらか一方のみサポートしてると限定して行う
            plugin.supportedFormats = plugin.supportedFormats.length >= 2 ? [supportedFormat] : plugin.supportedFormats;
            var system = new MockAudioSystem({id: "voice"});
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
        it("aacファイルが存在しない場合mp4ファイルが読み込まれる", function (done) {
            var plugin = new HTMLAudioPlugin();
            plugin.supportedFormats = ["aac", "mp4"];
            var system = new MockAudioSystem({id: "voice"});
            var audioAsset2Path = "/spec/fixtures/audio/bgm2"
            var query = "rev=4321";
            var asset = plugin.createAsset("id", audioAsset2Path + "?" + query, system, false, {});
            var loader = {
                _onAssetLoad: function (asset) {
                    expect(asset.path).toBe(audioAsset2Path + ".mp4?" + query);
                    done();
                },
                _onAssetError: function (asset, error) {
                    done.fail(error);
                }
            };
            asset._load(loader);
        });
    });
    describe("HTMLAudioPlayer", function () {
        var seAssetPath = "/spec/fixtures/audio/se";
        // 音の再生検知はtestemでサポートされていないので無効にしておく
        xit("#playすると音を再生できる", function (done) {
            var manager = new AudioManager();
            var plugin = new HTMLAudioPlugin();
            var system = new MockAudioSystem({id: "voice"});
            var asset = plugin.createAsset("id", seAssetPath, system, false, {});
            var player = plugin.createPlayer(system, manager);
            player.changeVolume(0.1);
            var loader = {
                _onAssetLoad: function (asset) {
                    expect(asset).not.toBeUndefined();
                    player._endedEventHandler = function () {
                        // play ended
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
