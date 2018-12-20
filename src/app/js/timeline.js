/**
 * Timeline visualization - Historical background, Timeline box, Character information
 */
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

timelineData.forEach(function(character) {
    character.time = new Date(character.first_appearance_date);
    character.first_appearance_str = monthNames[character.time.getMonth()] +", " + character.time.getFullYear();
});

// create character info box
let characterTimelineBox = d3.select("#timelineCharacter")
    .append("div")
    .attr("class", "character-info-box")
    .attr("id", 'character-timeline-box')
    .style("margin", "5% -25%")
    .style("height", "550px")
    .style("visibility", "hidden");

function getCharacterTimelineBoxHtml(d) {
    d = d['data'];

    const characterTitleHtml =  "<p class=\"title-character-info-box\">" +
        "<h3>"+d.name+"</h3></p>";

    const characterDetailsHtml = "<div><div class=\"row\">" +
        "<div class=\"col-lg-12 col-md-12 col-sm-12\" style='font-size: 9pt'>" +
        "<p><b>Real Name: </b>" + d.real_name + "</p>" +
        "<p><b>First Appearance: </b>" + d.first_appearance_str + "</p>" +
        "</div>"+
        "<div class=\"col-lg-6 col-md-6 col-sm-6\" style='font-size: 9pt'>" +
        "<p><b>Gender: </b>" + d.gender + "</p>" +
        "<p><b>Publisher: </b>" + d.publisher + "</p>" +
        "</div>"+
        "<div class=\"col-lg-6 col-md-6 col-sm-6\">" +
        "<img src=\"" + d.image + "\" alt=\"Superhero\" style=\"width:110px;height:110px;\">" +
        "</div></div><br/>";

    const characterDescriptionTextHtml ="<p class=\"title-character-info-box\">" +
        "<div>" + d.character_background + "</div>" +
        "<br/>More info on link: " +
        "<a target=\"_blank\" rel=\"noopener noreferrer\" href='"+d.site_detail_url+"'> click here</a></p>";

    return characterTitleHtml + characterDetailsHtml + characterDescriptionTextHtml;
}

function getHtmlHistory(element, d) {
    d = d['data'];

    return "<h3>"+d.decades+"</h3>" + d.decade_background;
}

function showCharacterHistoryInfo(d) {

    characterTimelineBox
        .html(getCharacterTimelineBoxHtml(d))
        .style("visibility", "visible");

    // show historical facts
    d3.select("#timelineHistory")
        .append("text")
        .html(getHtmlHistory(d3v3.select(this), d))
}

function hideCharacterHistoryInfo () {
    // hide tooltip
    characterTimelineBox
        .style("visibility", "hidden");

    // remove text
    d3.select("#timelineHistory")
        .select("text").remove();
}

const timeline = new d3KitTimeline('#timelineBar', {
    direction: 'right',
    // initialWidth: timelineWidth/2,
    initialHeight: 500,
    textFn: function(d){
        return d.time.getFullYear() + ' - ' + d.name;
    },
    labelBgColor: function (d) {
        return d.publisher === "Marvel" ? '#cc0000' :  '#3385ff';
    }
}).data(timelineData).visualize().resizeToFit();

timeline
    .on('labelMouseover', showCharacterHistoryInfo)
    .on('labelMouseout', hideCharacterHistoryInfo);
