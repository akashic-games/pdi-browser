"use strict";
var ContainerController = require("../lib/full/ContainerController").ContainerController;
var ResourceFactory = require("../lib/full/ResourceFactory").ResourceFactory;
var AudioPluginManager = require("../lib/full/plugin/AudioPluginManager").AudioPluginManager;
var resource = new ResourceFactory({ audioPluginManager: new AudioPluginManager() });

describe("ContainerController", function () {
    describe("#setRootView", function () {
        it("設定済みrootは、新しいrootに置き換わる際に破棄される", function () {
            var config = require("./fixtures/game.json");
            var controller = new ContainerController(resource);
            var prevDiv = document.createElement("div");
            controller.initialize({
                rendererRequirement: {
                    primarySurfaceWidth: 100,
                    primarySurfaceHeight: 100
                }
            });
            controller.setRootView(prevDiv);
            expect(controller.rootView).toBe(prevDiv);
            // 新しいrootに置き換える
            var newDiv = document.createElement("div");
            controller.setRootView(newDiv);
            // prevDivがどこにも所属してないことを確認する
            expect(controller.rootView).toBe(newDiv);
            expect(controller.rootView).not.toBe(prevDiv);
            expect(prevDiv.parentNode).toBeNull();
        });
    });
});
