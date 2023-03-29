import { PlatformPointType } from "@akashic/pdi-types";
import { PointerEventHandler } from "../PointerEventHandler";

describe("PointerEventHandler", () => {
	describe("DownのDOMイベントが発生済みの時", () => {
		let handler: PointerEventHandler;
		let identifier: number;
		beforeEach(() => {
			handler = new PointerEventHandler(document.createElement("div"));
			identifier = 1;
			// Down
			handler.pointDown(identifier, {offsetX: 1, offsetY: 1});
		});
		it("MoveのDOMイベント発生するとonPointMoveが呼ばれる", (done) => {
			const offsetPos = {offsetX: 0, offsetY: 0};
			handler.pointTrigger.add((object) => {
				expect(object.type).toBe(PlatformPointType.Move);
				expect(object.identifier).toBe(identifier);
				expect(object.offset.x).toBe(offsetPos.offsetX);
				expect(object.offset.y).toBe(offsetPos.offsetY);
				done();
			});
			// Move
			handler.pointMove(identifier, offsetPos);
		});
		it("Up後にMoveのDOMイベントあってもonPointMoveは呼び出されない", (done) => {
			const upOffsetPos = {
				offsetX: 50,
				offsetY: 50
			};
			handler.pointTrigger.add((object) => {
				expect(object.type).toBe(PlatformPointType.Up);
				expect(object.identifier).toBe(identifier);
				expect(object.offset.x).toBe(upOffsetPos.offsetX);
				expect(object.offset.y).toBe(upOffsetPos.offsetY);
			});
			// up
			handler.pointUp(identifier, upOffsetPos);
			handler.pointTrigger.add(() => {
				done.fail(new Error("not call!"));
			});
			// Move
			handler.pointMove(identifier, {offsetX: 0, offsetY: 0});
			done();
		});
		it("異なるidentifierの場合はonPointMoveは呼ばれない", (done) => {
			const offsetPos = {offsetX: 0, offsetY: 0};
			handler.pointTrigger.add(() => {
				done.fail(new Error("not call!"));
			});
			// Move
			handler.pointMove(42, offsetPos);
			// 意味のないテストだが、テストケース中にexpectによるテストを入れておかないとエラーメッセージが表示されるため追加
			expect(true).toBeTruthy();
			done();
		});
	});
	describe("DownのDOMイベントが起きていない時", () => {
		it("MoveのDOMイベントあってもonPointMoveは呼び出されない", (done) => {
			const handler = new PointerEventHandler(document.createElement("div"));
			handler.pointMove(1, {offsetX: 0, offsetY: 0});
			handler.pointTrigger.add(() => {
				done.fail(new Error("not call!"));
			});
			// 意味のないテストだが、テストケース中にexpectによるテストを入れておかないとエラーメッセージが表示されるため追加
			expect(true).toBeTruthy();
			done();
		});
	});
});
