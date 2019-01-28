"use strict";
function FailurePlugin() {
}
FailurePlugin.isSupported = function () {
    return false;
};
module.exports = FailurePlugin;