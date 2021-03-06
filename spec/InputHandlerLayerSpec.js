"use strict";
var g = require("../lib/full/index").g;
var MouseHandler = require("../lib/full/handler/MouseHandler").MouseHandler;
var InputHandlerLayer = require("../lib/full/InputHandlerLayer").InputHandlerLayer;
var ResourceFactory = require("../lib/full/ResourceFactory").ResourceFactory;

// pdi-types の PointEventType の模倣。本家は const enum なのでJSでは使えない。
var PdiPointEventType = { Down: 0, Move: 1, Up: 2 };

describe("InputHandlerLayer", function () {
    describe("DownのDOMイベントが発生済みの時", function () {
        var handler;
        var identifier;
        beforeEach(function () {
            handler = new MouseHandler(document.createElement("div"));
            identifier = 1;
            // Down
            handler.pointDown(identifier, {offsetX: 1, offsetY: 1});
        });
        it("MoveのDOMイベント発生するとonPointMoveが呼ばれる", function (done) {
            var offsetPos = {offsetX: 0, offsetY: 0};
            handler.pointTrigger.add(function (object) {
                expect(object.type).toBe(PdiPointEventType.Move);
                expect(object.identifier).toBe(identifier);
                expect(object.offset.x).toBe(offsetPos.offsetX);
                expect(object.offset.y).toBe(offsetPos.offsetY);
                done();
            });
            // Move
            handler.pointMove(identifier, offsetPos);
        });
        it("Up後にMoveのDOMイベントあってもonPointMoveは呼び出されない", function (done) {
            var upOffsetPos = {
                offsetX: 50,
                offsetY: 50
            };
            handler.pointTrigger.add(function (object) {
                expect(object.type).toBe(PdiPointEventType.Up);
                expect(object.identifier).toBe(identifier);
                expect(object.offset.x).toBe(upOffsetPos.offsetX);
                expect(object.offset.y).toBe(upOffsetPos.offsetY);
            });
            // up
            handler.pointUp(identifier, upOffsetPos);
            handler.pointTrigger.add(function () {
                done.fail(new Error("not call!"));
            });
            // Move
            handler.pointMove(identifier, {offsetX: 0, offsetY: 0});
            done();
        });
        it("異なるidentifierの場合はonPointMoveは呼ばれない", function (done) {
            var offsetPos = {offsetX: 0, offsetY: 0};
            handler.pointTrigger.add(function (object) {
                done.fail(new Error("not call!"));
            });
            // Move
            handler.pointMove(42, offsetPos);
            // 意味のないテストだが、テストケース中にexpectによるテストを入れておかないとエラーメッセージが表示されるため追加
            expect(true).toBeTruthy();
            done();
        });
    });
    describe("DownのDOMイベントが起きていない時", function () {
        it("MoveのDOMイベントあってもonPointMoveは呼び出されない", function (done) {
            var handler = new MouseHandler(document.createElement("div"));
            handler.pointMove(1, {offsetX: 0, offsetY: 0});
            handler.pointTrigger.add(function () {
                done.fail(new Error("not call!"));
            });
            // 意味のないテストだが、テストケース中にexpectによるテストを入れておかないとエラーメッセージが表示されるため追加
            expect(true).toBeTruthy();
            done();
        });
    });
});
