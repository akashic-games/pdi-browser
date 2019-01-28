"use strict";
var AudioPluginManager = require("../lib/plugin/AudioPluginManager").AudioPluginManager;
var SuccessPlugin = require("./fixtures/plugin/SuccessPlugin");
var FailurePlugin = require("./fixtures/plugin/FailurePlugin");
describe("AudioPluginManager", function () {
    describe("#tryInstallPlugin", function () {
        var manager;
        beforeEach(function () {
            manager = new AudioPluginManager();
        });
        describe("サポートしてないプラグインを登録する時", function () {
            it("should return false", function () {
                var result = manager.tryInstallPlugin([FailurePlugin]);
                expect(result).toBeFalsy();
            });
        });
        describe("サポートしているプラグインを登録する時", function () {
            it("should return true", function () {
                var result = manager.tryInstallPlugin([SuccessPlugin]);
                expect(result).toBeTruthy();
            });
            it("アクティブなプラグインとして登録される", function () {
                manager.tryInstallPlugin([SuccessPlugin]);
                var plugin = manager.getActivePlugin();
                expect(plugin).toEqual(jasmine.any(SuccessPlugin));
            });
        });
        describe("非サポート -> サポート とプラグインが登録される時", function () {
            it("should return true", function () {
                var result = manager.tryInstallPlugin([SuccessPlugin]);
                expect(result).toBeTruthy();
            });
            it("SuccessPluginがアクティブなプラグインとして登録される", function () {
                manager.tryInstallPlugin([FailurePlugin, SuccessPlugin]);
                var plugin = manager.getActivePlugin();
                expect(plugin).toEqual(jasmine.any(SuccessPlugin));
            });
        });
    });
});
