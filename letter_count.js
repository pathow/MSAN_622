function reload_page(){
      var userInput = document.getElementById('user-field-input');
      var fullString = userInput.value;
      // localStorage.setItem("userSearchInput", fullString);

      location.href = "http://pathow.github.io/MSAN_622/homework1.html?" + fullString;
  }


String.prototype.cleanup = function(){
   return this.toLowerCase().replace(/[^a-zA-Z]+/g, "");
}

var qstring = decodeURI(window.location.search);

// var qstring = "Hello World!"
var letters = qstring.cleanup();

var letter_counts = Object();
for(i = 0, length = letters.length; i < length; i++) {
	var l = letters.charAt(i);
	letter_counts[l] = (isNaN(letter_counts[l]) ? 1 : letter_counts[l] + 1);
};

// This block is what sorts the data by count values descending
var sortable = [];
for (var letter in letter_counts)
      sortable.push([letter, letter_counts[letter]])
sortable.sort(function(a, b) {return a[1] - b[1]});

var unique_letters = Object.keys(letter_counts);
var counts = Object.keys(letter_counts).map(function(key){return letter_counts[key]});
var max_value = Math.max.apply(Math, counts);
var min_value = Math.min.apply(Math, counts);


var color = d3.scale.ordinal()
    .domain(sortable)
    .range(d3.range(sortable.length).map(d3.scale.linear()
      .domain([0, sortable.length-1])
      .range(["blue", "yellow"])
      .interpolate(d3.interpolateLab)));



var margin = {top: 20, right: 20, bottom: 30, left: 40},
    w = 960 - margin.left - margin.right,
    h = 550 - margin.top - margin.bottom;

var svg = d3.select("p")
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
				.domain(sortable.reverse().map(function(d){
          return d[0];
        }))
				.rangeBands([0, w],0.05);

var xAxis = d3.svg.axis()
			  .scale(xScale)
			  .orient("bottom");

svg.selectAll("rect")
   .data(sortable)
   .enter()
   .append("rect")
   .attr("x", function(d,i) {
	return 20 + i * (w / num_bars);
	})
   .attr("y", h)
	 .attr("height", 0)
   .attr("width", xScale.rangeBand())
   .attr("fill", "blue")
   .attr("opacity", function(d) {return 0.2 + 0.8*(d[1]/max_value);})
   .on("mouseover", function() {
            d3.select(this)
              .attr("fill", "orange")
            })      
   .on("mouseout", function(d) {
           d3.select(this)
              .transition()
              .duration(400)
            .attr("fill", "blue")
            .attr("opacity", function(d) {return 0.2 + 0.8*(d[1]/max_value);});
         })
   .append("title")
   .text(function(d) {
    if (d[1] == 1){
         return "Letter " + d[0] + " appeared 1 time.";
       }
    else {return "Letter " + d[0] + " appeared " + d[1] + " times.";}
   });

svg.selectAll("rect").transition()
      .delay(function(d, i) { return i * 100; })
      .duration(1000)
      .attr('y', function(d) { return yScale(d[1]); })
      .attr('height', function(d) { return h - yScale(d[1]); });


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






 

