"use strict";
var XHRLoader = require("../lib/full/utils/XHRLoader").XHRLoader;
describe("XHRLoader", function () {
    it("has default timeout", function () {
        var loader = new XHRLoader();
        expect(loader.timeout).not.toBeUndefined();
    });
});
