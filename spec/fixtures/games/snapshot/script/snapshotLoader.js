var createScene = require("scene");

module.exports = function (snapshot) {
    scene = createScene({ count: snapshot.count })
    g.game.pushScene(scene);
};
