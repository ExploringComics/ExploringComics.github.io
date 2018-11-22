function getMatrixCommonActors(data, filteredcharacterIds) {
    /**
     * Create matrix of unique common actors among the characterIds
     * This function is a simplified version of https://gist.github.com/eesur/0e9820fb577370a13099#file-mapper-js-L4
     *
     * @param {array} data - array of dicionaries where it contains information of characterId1, characterId2
     * and the number of unique common actors
     *@param {array} filteredcharacterIds - array of characterIds that should be excluded from the visualization
     */

    let mmap = {}, matrix = [], counter = 0;
    let values = _.uniq(_.pluck(data, "characterId1"));
    values = values.filter( function(el) {
        return !filteredcharacterIds.includes(el);
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
                matrix[a.id][b.id] = +recs[0].common_actors
            }
        });
    });
    return matrix;
}


function rowConverterRelationships(d) {
    return {
        characterId1: d.characterId1,
        characterId2: d.characterId2,
        common_actors: parseFloat(d.common_actors)
    }
}
