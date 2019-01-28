module.exports = function (opts) {
    opts = opts || {};

    var scene = new g.Scene({
        game: g.game,
        storageKeys: [{ region: g.StorageRegion.Values, regionKey: "foo", gameId: "1234" }],
        name: "snapshotTestMainScene",
        storageValuesSerialization: opts.storageData
    });

    scene.count = opts.count || 0;
    scene.update.handle(function() {
        scene.count++;
    });
    return scene;
};
