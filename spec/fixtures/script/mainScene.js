var game = g.game;
module.exports = function () {
    var scene = new g.Scene({game: game});
    scene.loaded.handle(function () {
        var hello = new g.FilledRect({scene: scene, cssColor: "#ff0000", width: 32, height: 32});
        scene.append(hello);
        hello.update.handle(function () {
            hello.x += 5;
            hello.modified();
        });
    });
    return scene;
};
