var createScene = require("scene");

module.exports = function () {
    var main = createScene();

    g.game.snapshotRequest.handle(function() {
        g.game.saveSnapshot({
            count: main.count,
            storageData: main.serializeStorageValues()
        });
    });

    return main;
};
