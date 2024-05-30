import { PlatformPointType, PlatformButtonType } from "@akashic/pdi-types";
import { InputEventHandler } from "../InputEventHandler";

// テスト用に abstract メソッドを補っただけの InputEventHandler
class TestInputEventHandler extends InputEventHandler {
	start(): void {
		// do nothing
	}
	stop(): void {
		// do nothing
	}
}

describe("InputEventHandler", () => {
	const canvasWidth = 640;
	const canvasHeight = 320;
	let divElement: HTMLDivElement;
	beforeAll(() => {
		divElement = document.createElement("div");
		const canvas: HTMLCanvasElement = document.createElement("canvas");
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;
		divElement.append(canvas);
	});
	describe("DownのDOMイベントが発生済みの時", () => {
		let handler: InputEventHandler;
		let identifier: number;
		beforeEach(() => {
			handler = new TestInputEventHandler(divElement);
			identifier = 1;
			handler.pointDown(identifier, {offsetX: 1, offsetY: 1}, PlatformButtonType.Primary);
		});
		it("MoveのDOMイベント発生するとonPointMoveが呼ばれる", (done) => {
			const offsetPos = {offsetX: 0, offsetY: 0};
			handler.pointTrigger.add((object) => {
				expect(object.type).toBe(PlatformPointType.Move);
				expect(object.identifier).toBe(identifier);
				expect(object.offset.x).toBe(offsetPos.offsetX);
				expect(object.offset.y).toBe(offsetPos.offsetY);
				expect(object.button).toBe(PlatformButtonType.Primary);
				done();
			});
			// Move
			handler.pointMove(identifier, offsetPos, PlatformButtonType.Primary);
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
				expect(object.button).toBe(PlatformButtonType.Primary);
			});
			// up
			handler.pointUp(identifier, upOffsetPos, PlatformButtonType.Primary);
			handler.pointTrigger.add(() => {
				done.fail(new Error("not call!"));
			});
			// Move
			handler.pointMove(identifier, {offsetX: 0, offsetY: 0}, PlatformButtonType.Primary);
			done();
		});
		it("異なるidentifierの場合はonPointMoveは呼ばれない", (done) => {
			const offsetPos = {offsetX: 0, offsetY: 0};
			handler.pointTrigger.add(() => {
				done.fail(new Error("not call!"));
			});
			// Move
			handler.pointMove(42, offsetPos, PlatformButtonType.Primary);
			// 意味のないテストだが、テストケース中にexpectによるテストを入れておかないとエラーメッセージが表示されるため追加
			expect(true).toBeTruthy();
			done();
		});
	});
	describe("DownのDOMイベントが起きていない時", () => {
		it("DownのDOMイベントがあればonPointDownが呼ばれる", (done) => {
			const handler = new TestInputEventHandler(divElement);
			handler.pointTrigger.add((object) => {
				expect(object.type).toBe(PlatformPointType.Down);
				expect(object.identifier).toBe(1);
				expect(object.offset.x).toBe(10);
				expect(object.offset.y).toBe(10);
				// PRIMARY以外のボタンも取得できるか検証
				expect(object.button).toBe(PlatformButtonType.Secondary);
				done();
			});
			// Down
			handler.pointDown(1, {offsetX: 10, offsetY: 10}, PlatformButtonType.Secondary);
		});
		it("MoveのDOMイベントあってもonPointMoveは呼び出されない", (done) => {
			const handler = new TestInputEventHandler(divElement);
			handler.pointMove(1, {offsetX: 0, offsetY: 0}, PlatformButtonType.Primary);
			handler.pointTrigger.add(() => {
				done.fail(new Error("not call!"));
			});
			// 意味のないテストだが、テストケース中にexpectによるテストを入れておかないとエラーメッセージが表示されるため追加
			expect(true).toBeTruthy();
			done();
		});
		it("view 外の座標の場合 pointDown は呼ばれない", (done) => {
			const handler = new TestInputEventHandler(divElement);
			let callCount = 0;
			handler.pointTrigger.add((_object) => {
				callCount++;
				done.fail();
			});

			handler.pointDown(1, {offsetX: -0.1, offsetY: 10}, PlatformButtonType.Primary);
			handler.pointDown(1, {offsetX: 10, offsetY: -0.01}, PlatformButtonType.Primary);
			handler.pointDown(1, {offsetX: 640.1, offsetY: 10}, PlatformButtonType.Primary);
			handler.pointDown(1, {offsetX: 10, offsetY: 320.01}, PlatformButtonType.Primary);
			expect(callCount).toBe(0);
			done();
		});
	});
});
