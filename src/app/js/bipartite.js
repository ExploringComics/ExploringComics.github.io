var data=[['Human', 'Bad Characters', 1346, 1346],
    ['Alien', 'Bad Characters', 360, 360],
    ['Other', 'Bad Characters', 351, 351],
    ['Mutant', 'Bad Characters', 250, 250],
    ['God/Eternal', 'Bad Characters', 249, 249],
    ['Robot', 'Bad Characters', 92, 92],
    ['Animal', 'Bad Characters', 53, 53],
    ['Cyborg', 'Bad Characters', 69, 69],
    ['Radiation', 'Bad Characters', 25, 25],
    ['Infection', 'Bad Characters', 15, 15],
    ['Human', 'Good Characters', 1390, 1390],
    ['Alien', 'Good Characters', 357, 357],
    ['Other', 'Good Characters', 158, 158],
    ['Mutant', 'Good Characters', 152, 152],
    ['God/Eternal', 'Good Characters', 171, 171],
    ['Robot', 'Good Characters', 64, 64],
    ['Animal', 'Good Characters', 73, 73],
    ['Cyborg', 'Good Characters', 17, 17],
    ['Radiation', 'Good Characters', 5, 5],
    ['Infection', 'Good Characters', 7, 7],
    ['Human', 'Neutral Characters', 415, 415],
    ['Alien', 'Neutral Characters', 116, 116],
    ['Other', 'Neutral Characters', 85, 85],
    ['Mutant', 'Neutral Characters', 99, 99],
    ['God/Eternal', 'Neutral Characters', 69, 69],
    ['Robot', 'Neutral Characters', 15, 15],
    ['Animal', 'Neutral Characters', 18, 18],
    ['Cyborg', 'Neutral Characters', 6, 6],
    ['Radiation', 'Neutral Characters', 2, 2],
    ['Human', 'Reformed Criminals', 1, 1]];

var color = {
    'Human': "#DB7093",
    'Alien': "#3CB371",
    'Animal': "#8B4513",
    'Mutant': "#006400",
    'God/Eternal': "#FFD700",
    'Other': "#7e7878",
    'Cyborg':"#2F4F4F",
    'Infection':"#00FFFF",
    'Robot':"#4B0082",
    'Radiation':"#B22222"
};

var svgBp = d3.select("#bipartite").append("svg:svg").attr("width", 960).attr("height", 800);
var g = svgBp.append("g").attr("transform","translate(200,50)");

var bp=viz.bP()
    .data(data)
    .min(12)
    .pad(5)
    .height(600)
    .width(500)
    .barSize(35)
    .fill(d=>color[d.primary]);

g.call(bp);

g.append("text").attr("x",-50).attr("y",-10).style("text-anchor","middle").attr("font-size", 20).text("ORIGIN");
g.append("text").attr("x", 550).attr("y",-10).style("text-anchor","middle").attr("font-size", 20).text("ALIGN");


g.selectAll(".mainBars")
    .on("mouseover",mouseover)
    .on("mouseout",mouseout);

g.selectAll(".mainBars").append("text").attr("class","label")
    .attr("x",d=>(d.part=="primary"? -30: 30))
    .attr("y",d=>+6)
	.attr("font-size", "1.05em")
    .text(d=>d.key)
    .attr("text-anchor",d=>(d.part=="primary"? "end": "start"));

g.selectAll(".mainBars").append("text").attr("class","perc")
    .attr("x",d=>(d.part=="primary"? -130: 150))
    .attr("y",d=>+6)
    .text(function(d){ return d3.format("0.0%")(d.percent)})
    .attr("text-anchor",d=>(d.part=="primary"? "end": "start"));
	

function mouseover(d){
    bp.mouseover(d);
    g.selectAll(".mainBars")
        .select(".perc")
        .text(function(d){ return d3.format("0.0%")(d.percent)})
	/*g.selectAll(".edges")
        .attr("stroke-width", "0.5px")*/
}
function mouseout(d){
    bp.mouseout(d);
    g.selectAll(".mainBars")
        .select(".perc")
        .text(function(d){ return d3.format("0.0%")(d.percent)})
	/*g.selectAll(".edges")
        .attr("stroke-width", "0px")*/
}
d3.select(self.frameElement).style("height", "800px");