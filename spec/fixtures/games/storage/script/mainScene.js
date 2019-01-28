module.exports = function () {
    var game = g.game;
    var keys = [
        { region: g.StorageRegion.Values, regionKey: "foo.bar", gameId: "1234", userId: "5678" },
        { region: g.StorageRegion.Values, regionKey: "foo.bar", gameId: "1234", userId: "*" },
        { region: g.StorageRegion.Values, regionKey: "foo.bar", userId: "5678" },
        { region: g.StorageRegion.Values, regionKey: "baz.qux", userId: "5678" }
    ];
    return new g.Scene({ game: game, storageKeys: keys });
};
