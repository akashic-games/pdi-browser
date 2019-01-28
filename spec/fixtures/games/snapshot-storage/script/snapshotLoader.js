var createScene = require("scene");

module.exports = function (snapshot) {
    scene = createScene(snapshot);
    g.game.pushScene(scene);
};
