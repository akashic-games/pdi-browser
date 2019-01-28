"use strict";
var ResourceFactory = require("../lib/full/ResourceFactory").ResourceFactory;
var config = require("./fixtures/game.json");
var fixtureDirPath = __dirname + "/fixtures/";
var AudioPluginManager = require("../lib/full/plugin/AudioPluginManager").AudioPluginManager;
var resource = new ResourceFactory({ audioPluginManager: new AudioPluginManager() });
var registry = require("../lib/full/plugin/AudioPluginRegistry");
var SuccessPlugin = require("./fixtures/plugin/SuccessPlugin");
var FailurePlugin = require("./fixtures/plugin/FailurePlugin");
describe("AudioPluginRegistrySpec", function () {
    afterEach(function () {
        registry.AudioPluginRegistry.clear();
    });
    describe("#addPlugin", function () {
        it("プラグインを登録予約リストへ追加する", function () {
            expect(registry.AudioPluginRegistry.getRegisteredAudioPlugins().length).toBe(0);
            registry.AudioPluginRegistry.addPlugin(SuccessPlugin);
            registry.AudioPluginRegistry.addPlugin(FailurePlugin);
            expect(registry.AudioPluginRegistry.getRegisteredAudioPlugins().length).toBe(2);
            expect(registry.AudioPluginRegistry.getRegisteredAudioPlugins()).toContain(SuccessPlugin);
            expect(registry.AudioPluginRegistry.getRegisteredAudioPlugins()).toContain(FailurePlugin);
        });
        it("同じプラグインは二重に追加されない", function () {
            expect(registry.AudioPluginRegistry.getRegisteredAudioPlugins().length).toBe(0);
            registry.AudioPluginRegistry.addPlugin(SuccessPlugin);
            registry.AudioPluginRegistry.addPlugin(SuccessPlugin);
            expect(registry.AudioPluginRegistry.getRegisteredAudioPlugins().length).toBe(1);
        });
    });
});
