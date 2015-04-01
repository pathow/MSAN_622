String.prototype.cleanup = function(){
   return this.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "");
}

var qstring = decodeURI(window.location.search);

// var qstring = "Hello World!"
var letters = qstring.cleanup();

var letter_counts = Object();
for(i = 0, length = letters.length; i < length; i++) {
	var l = letters.charAt(i);
	letter_counts[l] = (isNaN(letter_counts[l]) ? 1 : letter_counts[l] + 1);
};


var unique_letters = Object.keys(letter_counts);
var counts = Object.keys(letter_counts).map(function(key){return letter_counts[key]});
var max_value = Math.max.apply(Math, counts);


var margin = {top: 20, right: 20, bottom: 30, left: 40},
    w = 960 - margin.left - margin.right,
    h = 550 - margin.top - margin.bottom;

var svg = d3.select("body")
            .append("svg")
            .attr("width", w + margin.left + margin.right)
            .attr("height", h  + margin.top + margin.bottom)
            .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var num_bars = d3.entries(letter_counts).length;
var dataset = d3.entries(letter_counts);
var barPadding = 5;

var yScale = d3.scale.linear()
				.domain([0, max_value])
				.range([h,0]);

var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
    .ticks(Math.min(max_value, 10));

var xScale = d3.scale.ordinal()
				.domain(unique_letters)
				.rangeBands([0, w-barPadding]);

var xAxis = d3.svg.axis()
			  .scale(xScale)
			  .orient("bottom");

svg.selectAll("rect")
   .data(dataset)
   .enter()
   .append("rect")
   .attr("x", function(d,i) {
	return 20 + i * (w / num_bars);
	})
   .attr("y", function(d) {
    return yScale(d.value);  //Height minus data value
	})
	.attr("height", function(d) {
    return h-yScale(d.value);  //Just the data value
	})
   .attr("width", w/num_bars-barPadding)
   .attr("fill", "teal");

 // svg.selectAll("text")
 //   .data(dataset)
 //   .enter()
 //   .append("text")
 //   .text(function(d) {
 //        return d.value;
 //   })
 //   .attr("text-anchor", "middle")
 //   .attr("x", function(d, i) {
 //        return i * (w /(num_bars)) + (w /num_bars-barPadding) / 2;
 //   })
 //   .attr("y", function(d) {
 //        return h - yScale(d.value) + 24;  // +15
 //   })
 //   .attr("font-family", "sans-serif")
 //   .attr("font-size", "24px")
 //   .attr("fill", "white");


 svg.append("g")
 	.attr("class", "x axis")
 	.attr("transform", "translate(20," + h + ")")
 	.call(xAxis)
 	.selectAll("text")
    .style("text-anchor", "middle");

svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Count");

  d3.select("input").on("change", change);

  var sortTimeout = setTimeout(function() {
    d3.select("input").property("checked", true).each(change);
  }, 2000);

  function change() {
    clearTimeout(sortTimeout);

    // Copy-on-write since tweens are evaluated after a delay.
    var x0 = xScale.domain(dataset.sort(this.checked
        ? function(a, b) { return b.value - a.value; }
        : function(a, b) { return d3.ascending(a.key, b.key); })
        .map(function(d) { return d.key; }))
        .copy();

    svg.selectAll(".rect")
        .sort(function(a, b) { return x0(a.value) - x0(b.value); });

    var transition = svg.transition().duration(750),
        delay = function(d, i) { return i * 50; };

    transition.selectAll(".rect")
        .delay(delay)
        .attr("x", function(d) { return x0(d.key); });

    transition.select(".x.axis")
        .call(xAxis)
      .selectAll("g")
        .delay(delay);
  };

