// LICENSE : MIT
"use strict";
/**
 * spyとなる関数を返し、そのspy関数が呼び出された回数に応じした処理を行うモック
 * @param {number} count countの数だけ関数が呼び出されるとfinishCallbackを呼ぶ
 * @param {Function} finishCallback count分予備された時に呼ぶコールバック関数う
 * @param {Function?} progressCallback 関数を呼び指す毎に呼ばれるコールバック関数
 * @returns {Function} spy関数を帰る
 */
function createCallSpy(count, finishCallback, progressCallback) {
    var expectedCount = count;
    var calledCount = 0;
    return function callSpy(timeStamp, deltaTime) {
        calledCount++;
        if (typeof progressCallback === "function") {
            progressCallback(timeStamp, deltaTime, calledCount);
        }
        if (calledCount === expectedCount) {
            if (typeof finishCallback === "function") {
                finishCallback(timeStamp, deltaTime);
            }
        }
    };
}

module.exports = {
    createCallSpy: createCallSpy
};