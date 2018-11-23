function getMatrixCommonActors(data, filteredCharacterIds) {
    data = data.map((d) => ( {
        characterId1: d.characterId1,
        characterId2: d.characterId2
    } ));

    let mmap = {}, matrix = [], counter = 0;
    let values = _.uniq(_.pluck(data, "characterId1"));
    values = values.filter( function(el) {
        return !filteredCharacterIds.includes(el);
    } );
    values.map(function (v) {
        if (!mmap[v]) {
            mmap[v] = {name: v, id: counter++, data: data}
        }
    });

    _.each(mmap, function (a) {
        if (!matrix[a.id]) matrix[a.id] = [];
        _.each(mmap, function (b) {
            let recs = _.filter(data, function (row) {
                return (row.characterId1 === a.name && row.characterId2 === b.name);
            });

            if (!recs[0]) {
                matrix[a.id][b.id] = 0
            }
            else {
                matrix[a.id][b.id] = + 500 // TODO; change this size if needed!!! Depends on quantity of nodes
            }
        });
    });
    return matrix;
}
