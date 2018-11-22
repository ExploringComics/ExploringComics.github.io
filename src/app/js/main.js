let characterIdsDataFile = 'data/characterIds.csv';
let relationshipsDataFile = 'data/relationships.csv';

const colorConnection = "#E0E0E0";

let filteredCharacterIds = [];
let firstCall = 1;

let svg;
let metricsBox;
let lastLayout; //store layout between updates

// size of the visualization
const wChord = 900,
    hChord = 900,
    rInner = hChord / 2.6,
    rOut = rInner - 30,
    paddingChord = 0.02;

// position of the visualization
const marginChord = {top: 50, right: 20, bottom: 50, left: 20},
    widthChord = wChord - marginChord.left - marginChord.right,
    heightChord = hChord - marginChord.top - marginChord.bottom;

// Colors based on the groups
const lookupColorCharacterId = {
    'multi': "#31a354",
    'oob': "#756bb1",
    'scripted': "#238443",
    'procedural': "#b10026",
    'imperative': "#386cb0",
    'undefined': "#40f3ff",
    'functional': "#f03b20",
    'declarative': "#fa9fb5"
};

// button 1 initial value
let applyLog = 1;

// button 2 initial value
let sortingMethod = 'characterOrigin';

function applyLogarithm(value){
    applyLog = value;
    loadChords();
}
function setSortingMethod(method){
    sortingMethod = method;
    loadChords();
}

function drawChord(matrix, labels) { // try to improve those callings and refactor
    /**
     * Draw chord diagram where the connections are the the log of the number of common actors of two characterIds
     *
     * @param {2d array} matrix - i,j element is the lof of number of common actor between 2 characterIds
     * @param {array} labels - array containing characterIds' names
     */

    d3.selectAll().remove();

    labels = labels.filter( function(el) {
        return !filteredCharacterIds.includes(el['characterId']);
    } );
    let chord;
    switch (sortingMethod) {
        case 'characterOrigin': chord = d3.chord().padAngle(paddingChord); break;
        case 'ascending': chord = d3.chord().padAngle(paddingChord).sortGroups(d3.ascending).sortChords(d3.ascending); break;
        case 'descending': chord = d3.chord().padAngle(paddingChord).sortGroups(d3.descending).sortChords(d3.descending); break;
    }

    if(firstCall){
        metricsBox = d3.select("#chord")
            .append("div")
            .attr("class", "general-metrics-box")
            .attr("id", "general-metrics-box")
            .style("visibility", "hidden");

        svg = d3.select("#chord")
            .append("svg:svg")
            .attr("width", widthChord)
            .attr("height", heightChord)
            .append("svg:g")
            .attr("transform", "translate(" + widthChord / 2 + "," + heightChord / 2 + ")");

        firstCall = 0;
    }
    let groupG = svg.selectAll("g.group")
        .data(chord(matrix).groups);

    let newGroups = groupG.enter().append("g")
        .attr("class", "group");

    groupG.exit()
        .transition()
        .duration(3000)
        .attr("opacity", 0)
        .remove();

    svg.selectAll("g.chord").remove();
    let chordPaths =  svg.append("svg:g")
        .attr("class", "chord")
        .selectAll("path")
        .data(chord(matrix), chordKey);

    let newChords = chordPaths.enter()
        .append("svg:path")
        .filter(function (d) {
            return d.source.index !== d.target.index;
        });

    chordPaths.exit().transition()
        .duration(500)
        .attr("opacity", 0)
        .remove();
    newChords.transition()
        .duration(1500)
        .style("fill", colorConnection)
        .attr("opacity", 1) //optional, just to observe the transition
        .attrTween("d", chordTween(lastLayout))
        .transition()
        .duration(500)
        .attr("d", d3.ribbon().radius(rOut))
        .style("opacity", 1); //reset opacity


    let wrapper = svg.append("g").attr("class", "chordWrapper");

    let g = wrapper.selectAll("g.group")
        .data(chord(matrix).groups)
        .enter().append("g")
        .attr("class", "group");

    let paths = g.append("path")
        .style("stroke", function (d) {
            return lookupColorCharacterId[labels[d.index]['characterOrigin']];
        })
        .style("fill", function (d) {
            return lookupColorCharacterId[labels[d.index]['characterOrigin']];
        })
        .style("stroke", "black")
        .style("opacity", 0.7)
        .attr("d", d3.arc().innerRadius(rOut).outerRadius(rInner))
        .on("mouseover", fade(0.00, "visible"))
        .on("mousemove", fade(0.00, "visible"))
        .on("mouseout", fade(1, "hidden"));


    let pathLabels = g.append("text")
        .each(function (d) {
            d.angle = (d.startAngle + d.endAngle) / 2;
        })
        .attr("class", "labels")
        .attr("dy", ".35em")
        .attr("transform", function (d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                + "translate(" + (rInner + 5) + ")"
                + (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .style("text-anchor", function (d) {
            return d.angle > Math.PI ? "end" : null;
        })
        .text(function (d, i) {
            return labels[i]['characterId'];
        });

    paths.transition()
        .duration(1500)
        .attr("opacity", 0)
        .remove()
        .attrTween("d", arcTween(lastLayout))
        .transition().duration(100).attr("opacity", 1);

    pathLabels.transition()
        .duration(1500)
        .attr("opacity", 0)
        .remove()
        .transition().duration(100).attr("opacity", 1);

    function fade(opacity, showInfos) {
        /**
         * Show information of the selected characterId when the mouse is on and hide other characterIds
         *
         * @param {number} opacity - degree of visibility of other characterIds not related with the select one
         * @param {boolean} showInfos - true to show informations about PR's, # actors and characterId characterOrigin
         */

        return function (g, i) {
            svg.selectAll("g.chord path")
                .filter(function (d) {
                    return d.source.index !== i && d.target.index !== i;
                })
                .transition()
                .style("opacity", opacity);

            // Popup box when element is clicked
            if (showInfos === "visible") {
                let characterId = labels[i]['characterId'];
                let characterOrigin = labels[i]['characterOrigin'];

                var list = document.getElementById("general-metrics-box");
                if (list.hasChildNodes()) {
                    while (list.hasChildNodes()) {
                        list.removeChild(list.firstChild);
                    }
                }

                var p = document.createElement('p');
                p.className = "title-general-metrics-box";
                p.innerHTML = characterId;
                p.style.color = lookupColorCharacterId[characterOrigin];
                document.getElementById('general-metrics-box').appendChild(p);

                var p = document.createElement('div');
                p.className = "title-general-metrics-box";

                // TODO: here add some info
                p.innerHTML = "Avg PRs/month: " + //+ generalMetrics['meanPrs'] +
                    "<br/>Avg Actors/month: " + // generalMetrics['meanActors'] +
                    "<br/>Avg PRs/Actor: "; //math.round(generalMetrics['meanPrs'] / generalMetrics['meanActors'])  ;
                document.getElementById('general-metrics-box').appendChild(p);
            }
            metricsBox
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 50) + "px")
                .style("visibility", showInfos);
        }
    }

    lastLayout = chord(matrix);
}

function loadChords(){
    d3.queue()
        .defer(d3.csv, characterIdsDataFile)
        .defer(d3.csv, relationshipsDataFile)
        .await(function (error, characterIds, relationships) {
            /***
             * Function treats and reads the data, call functions to build the relationships matrix and draw the Chord diagram
             */
            relationships = relationships.map(rowConverterRelationships);

            let matrix = getMatrixCommonActors(relationships, filteredCharacterIds);
            if (applyLog){
                matrix = matrix.map(row => row.map(x => x > 30 ? Math.log(x) : 0));
            }
            drawChord(matrix, characterIds);
        });
}


function chordTween(oldLayout) {
    //this function will be called once per update cycle

    //Create a key:value version of the old layout's chords array
    //so we can easily find the matching chord
    //(which may not have a matching index)

    let oldChords = {};

    if (oldLayout) {
        oldLayout.forEach( function(chordData) {
            oldChords[ chordKey(chordData) ] = chordData;
        });
    }

    return function (d, i) {
        //this function will be called for each active chord
        let tween;
        let old = oldChords[ chordKey(d) ];
        if (old) {
            if (d.source.index !== old.source.index ){
                old = {
                    source: old.target,
                    target: old.source
                };
            }

            tween = d3.interpolate(old, d);
        }
        else {
            //create a zero-width chord object
            let emptyChord = {
                source: {
                    startAngle: d.source.startAngle,
                    endAngle: d.source.startAngle
                },
                target: {
                    startAngle: d.target.startAngle,
                    endAngle: d.target.startAngle
                }
            };
            tween = d3.interpolate( emptyChord, d );
        }
        return function (t) {
            //this function calculates the intermediary shapes
            let path = d3.ribbon().radius(rOut);
            return path(tween(t));
        };
    };
}

function chordKey(data) {
    return (data.source.index < data.target.index) ?
        data.source.index  + "-" + data.target.index:
        data.target.index  + "-" + data.source.index;
}

function arcTween(oldLayout) {
    //this function will be called once per update cycle
    let arc = d3.arc()
        .innerRadius(rOut)
        .outerRadius(rInner);
    let oldGroups = {};
    if (oldLayout) {
        oldLayout.groups.forEach( function(groupData) {
            oldGroups[ groupData.index ] = groupData;
        });
    }

    return function (d, i) {
        let tween;
        let old = oldGroups[d.index];
        if (old) { //there's a matching old group
            tween = d3.interpolate(old, d);
        }
        else {
            //create a zero-width arc object
            let emptyArc = {
                startAngle:d.startAngle,
                endAngle:d.startAngle
            };
            tween = d3.interpolate(emptyArc, d);
        }

        return function (t) {
            return arc( tween(t) );
        };
    };
}

function returnCharacterId(characterId, i){
    let index = filteredCharacterIds.indexOf(characterId);
    filteredCharacterIds.splice(index, 1);
    d3.select('#'+characterId.replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\-\#]', 'g'), '\\$&')).remove();
    updateFilters();
    loadChords();
}

function updateFilters(){
    if (filteredCharacterIds.length > 0){
        d3.select("#clear_button").style("opacity", 1);
    }else{
        d3.select("#clear_button").style("opacity", 0);
    }
    let filters = d3.select('#filtered_characterIds')
        .selectAll('li')
        .data(filteredCharacterIds);
    // Enter
    filters.enter()
        .append('li')
        .attr('class', 'list-group-item')
        .attr("id", function(d,i) { return d; })
        .on("click", function(d, i){
            returnCharacterId(d);
        })
        .text(function(d) { return d; });
    // Exit
    filters.exit().remove();
}

function returnAllCharacterIds(){
    filteredCharacterIds = [];
    d3.select('#filtered_characterIds')
        .selectAll('li')
        .remove();
    d3.select("#clear_button").style("opacity", 0);
    loadChords();
}

function onBtnOrderClick1(_, index, parent) {
    let id = parent[index].id;
    d3.select('#dropdownMenuButton1').html(parent[index].innerHTML);

    for (let child of parent) {
        d3.select(child).classed('active', child.id === id);
    }

    let num = ((id === "logarithm") ? 1 : 0);

    applyLogarithm(num);
}

function onBtnOrderClick2(_, index, parent) {
    let id = parent[index].id;
    d3.select('#dropdownMenuButton2').html(parent[index].innerHTML);

    for (let child of parent) {
        d3.select(child).classed('active', child.id === id);
    }

    setSortingMethod(id);
}


loadChords();

d3.select("#clear_button")
    .style("opacity", 0)
    .on("click", returnAllCharacterIds);

d3.selectAll("#btn-order1 .dropdown-menu a")
    .on('click', onBtnOrderClick1);

d3.selectAll("#btn-order2 .dropdown-menu a")
    .on('click', onBtnOrderClick2);
