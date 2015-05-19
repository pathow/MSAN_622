var margin1 = {top: 20, right: 80, bottom: 30, left: 50},
    width1 = 960 - margin1.left - margin1.right,
    height1 = 500 - margin1.top - margin1.bottom;

var parseDate1 = d3.time.format("%Y").parse;

var x1 = d3.time.scale()
    .range([0, width1]);

var y1 = d3.scale.linear()
    .range([height1, 0]);

var color1 = d3.scale.category10();

var xAxis1 = d3.svg.axis()
    .scale(x1)
    .orient("bottom");

var yAxis1 = d3.svg.axis()
    .scale(y1)
    .orient("left");

var line1 = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x1(d.year); })
    .y(function(d) { return y1(d.totals); });

var svg1 = d3.select("#wrapper1").append("svg")
    .attr("width", width1 + margin1.left + margin1.right)
    .attr("height", height1 + margin1.top + margin1.bottom)
  .append("g")
    .attr("transform", "translate(" + margin1.left + "," + margin1.top + ")");

d3.csv("totals_time_series.csv", function(error, data) {
  color1.domain(d3.keys(data[0]).filter(function(key) { return key !== "year"; }));

  data.forEach(function(d) {
    d.year = parseDate1(d.year);
  });

  var crises = color1.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {year: d.year, totals: +d[name]};
      })
    };
  });
  console.log(crises);

  x1.domain(d3.extent(data, function(d) { return d.year; }));

  y1.domain([
    d3.min(crises, function(c) { return d3.min(c.values, function(v) { return v.totals; }); }),
    d3.max(crises, function(c) { return d3.max(c.values, function(v) { return v.totals; }); })
  ]);

  svg1.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height1 + ")")
      .call(xAxis1);

  svg1.append("g")
      .attr("class", "y axis")
      .call(yAxis1)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Global Total");

  var crisis = svg1.selectAll(".crisis")
      .data(crises)
    .enter().append("g")
      .attr("class", "crisis");

  crisis.append("path")
      .attr("class", "tsline")
      .attr("d", function(d) { return line1(d.values); })
      .style("stroke", function(d) { return color1(d.name); });

  console.log(color1);

  crisis.append("text")
      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x1(d.value.year) + "," + y1(d.value.totals) + ")"; })
      .attr("x", 3)
      .attr("dy", ".35em")
      .text(function(d) { return d.name; });
});