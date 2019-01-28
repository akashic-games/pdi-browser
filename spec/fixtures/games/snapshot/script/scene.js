module.exports = function (opts) {
    opts = opts || {};

    var scene = new g.Scene({
        game: g.game,
        name: "snapshotTestMainScene",
    });

    scene.count = opts.count || 0;
    scene.update.handle(function() {
        scene.count++;
    });
    return scene;
};
