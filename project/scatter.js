var margin2 = {top: 20, right: 20, bottom: 30, left: 40},
    width2 = 960 - margin2.left - margin2.right,
    height2 = 500 - margin2.top - margin2.bottom;

/* 
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */ 

// setup x 
var xValue = function(d) { return d.military;}, // data -> value
    xScale = d3.scale.linear().range([0, width2]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");

// setup y
var yValue = function(d) { return d.economic;}, // data -> value
    yScale = d3.scale.linear().range([height2, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left");

// // setup fill color
// var cValue = function(d) { return d.Manufacturer;},
//     color = d3.scale.category10();

// add the graph canvas to the body of the webpage
var svg2 = d3.select("#wrapper2").append("svg")
    .attr("width", width2 + margin2.left + margin2.right)
    .attr("height", height2 + margin2.top + margin2.bottom)
  .append("g")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

// add the tooltip area to the webpage
var information = d3.select("#wrapper2").append("div")
    .attr("class", "information")
    .style("opacity", 0);

// load data
d3.csv("combined.csv", function(error, data) {

  // change string (from CSV) into number format
  data.forEach(function(d) {
    d.military = +d.military;
    d.economic = +d.economic;
//    console.log(d);
  });

  // don't want dots overlapping axis, so add in buffer to data domain
  xScale.domain([d3.min(data, xValue)-0.2, d3.max(data, xValue)+0.2]);
  yScale.domain([d3.min(data, yValue)-0.2, d3.max(data, yValue)+0.2]);

  // x-axis
  svg2.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width2)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Average Militarized Disputes (yearly)");

  // y-axis
  svg2.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Average Economic Crises (yearly)");

  // draw dots
  svg2.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .style("fill", "steelblue") 
      .on("mouseover", function(d) {
          information.transition()
               .duration(200)
               .style("opacity", .9);
          information.html(d.country + "<br/> (" + xValue(d).toFixed(2)
	        + ", " + yValue(d).toFixed(2) + ")")
               .style("left", (d3.event.pageX - 25) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          information.transition()
               .duration(500)
               .style("opacity", 0);
      });
});
