"use strict";
var RenderingHelper = require("../lib/canvas/RenderingHelper").RenderingHelper;
describe("RenderingHelper", function () {
    it("toPowerOfTwo", function () {
        expect(RenderingHelper.toPowerOfTwo(0)).toEqual(0);
        expect(RenderingHelper.toPowerOfTwo(1)).toEqual(1);
        expect(RenderingHelper.toPowerOfTwo(2)).toEqual(2);
        expect(RenderingHelper.toPowerOfTwo(3)).toEqual(4);
        expect(RenderingHelper.toPowerOfTwo(4)).toEqual(4);
        expect(RenderingHelper.toPowerOfTwo(5)).toEqual(8);
        expect(RenderingHelper.toPowerOfTwo(8)).toEqual(8);
        expect(RenderingHelper.toPowerOfTwo(9)).toEqual(16);
        expect(RenderingHelper.toPowerOfTwo(16)).toEqual(16);
        expect(RenderingHelper.toPowerOfTwo(17)).toEqual(32);
        expect(RenderingHelper.toPowerOfTwo(32)).toEqual(32);
        expect(RenderingHelper.toPowerOfTwo(33)).toEqual(64);
        expect(RenderingHelper.toPowerOfTwo(64)).toEqual(64);
        expect(RenderingHelper.toPowerOfTwo(65)).toEqual(128);
        expect(RenderingHelper.toPowerOfTwo(128)).toEqual(128);
        expect(RenderingHelper.toPowerOfTwo(129)).toEqual(256);
        expect(RenderingHelper.toPowerOfTwo(256)).toEqual(256);
        expect(RenderingHelper.toPowerOfTwo(257)).toEqual(512);
        expect(RenderingHelper.toPowerOfTwo(512)).toEqual(512);
        expect(RenderingHelper.toPowerOfTwo(513)).toEqual(1024);
        expect(RenderingHelper.toPowerOfTwo(1024)).toEqual(1024);
        expect(RenderingHelper.toPowerOfTwo(1025)).toEqual(2048);
        expect(RenderingHelper.toPowerOfTwo(2048)).toEqual(2048);
        expect(RenderingHelper.toPowerOfTwo(2049)).toEqual(4096);
        expect(RenderingHelper.toPowerOfTwo(4096)).toEqual(4096);
    });
    it("clamp", function() {
        expect(RenderingHelper.clamp(-1)).toEqual(0.0);
        expect(RenderingHelper.clamp(0)).toEqual(0.0);
        expect(RenderingHelper.clamp(0.5)).toEqual(0.5);
        expect(RenderingHelper.clamp(1)).toEqual(1.0);
        expect(RenderingHelper.clamp(2)).toEqual(1.0);
    });
});
