var states = [];

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    w = 960 - margin.left - margin.right,
    h = 550 - margin.top - margin.bottom;

var color = d3.scale.category10()

d3.csv("state.x77.csv", function(data) {
    states = data;
    bubbleChart(states);
    scattermatrix(states);
});


function bubbleChart(data) {

	var tip = d3.tip()
	  .attr('class', 'd3-tip')
	  .offset([-10, 0])
	  .html(function(d) {
	    return "<strong>State:</strong><span style='color:#66FFFF'> " + d.name + "</span><br>"+
	    "<strong>Life Expectancy:</strong> <span style='color:#66FFFF'>" + d.life + "</span><br>"+
	    "<strong>Murder Rate:</strong> <span style='color:#66FFFF'>" + d.murder + "</span><br>"+
	    "<strong>Days Below Freezing:</strong> <span style='color:#66FFFF'>" + d.freezing + "</span>";
	  })


	var svg = d3.select("p")
	            .append("svg")
                .attr("width", w + margin.left + margin.right)
                .attr("height", h  + margin.top + margin.bottom);

    var yScale = d3.scale.linear()
				.domain([66.5, 74.5])
				.range([h,0]);

	var yAxis = d3.svg.axis()
	    .scale(yScale)
	    .orient("left");

	var xScale = d3.scale.linear()
				.domain([0, 16])
				.range([20,w]);

	var xAxis = d3.svg.axis()
			  .scale(xScale)
			  .orient("bottom");

	function radius(d) {
		return Math.sqrt(+d.freezing);
	};
	function order(a, b) {
  		return radius(b) - radius(a);
	};

	svg.call(tip);

	svg.selectAll("circle")
	   .data(data)
	   .enter()
	   .append("circle") 
	   .attr("cx", function(d) {
	        return xScale(+d['murder']);
	   })
	   .attr("cy", function(d) {
	        return yScale(+d['life']);
	   })
	   .attr("r", function(d) {
	   	 return (radius(d)+0.5);
	   })
	   .style("opacity", 0.75)
	   .style("fill", function(d) {
	   	 return color(d['subregion'])
	   })
	   .style("stroke", "#000")
	   .sort(order)
	   .on('mouseover', tip.show)
       .on('mouseout', tip.hide);

   svg.append("g")
 	.attr("class", "x axis")
 	.attr("transform", "translate(20," + h + ")")
 	.call(xAxis)
 	.append("text")
 	.attr("x", w-margin.right)
 	.attr("y", -6)
    .style("text-anchor", "end")
    .text("Murder Rate");

  svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(30,0)")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Life Expectancy");
};



function scattermatrix(data) {
	// Size parameters.
  var size = 175,
      padding = 16,
      n = 4,
      traits = ["life", "hsgrad", "illiteracy", "murder"];

  // Position scales.
  var x = {}, y = {};
  traits.forEach(function(trait) {
    // Coerce values to numbers.
    data.forEach(function(d) { d[trait] = +d[trait]; });

    var value = function(d) { return d[trait]; },
    	min = d3.min(data, value)
    	max = d3.max(data, value)
    	full = max-min
        domain = [min-full/15, max+full/15],
        range = [padding/2, size - padding/2];
        rangey = [size - padding/2, padding/2];
    x[trait] = d3.scale.linear().domain(domain).range(range);
    y[trait] = d3.scale.linear().domain(domain).range(rangey);
  });

  // Axes.
  var axis = d3.svg.axis()
      .ticks(6)
      .tickSize(2);

  // Brush.
  var brush = d3.svg.brush()
      .on("brushstart", brushstart)
      .on("brush", brush)
      .on("brushend", brushend);

  // Root panel.
  var svg = d3.select("p").append("svg:svg")
      .attr("width", 1280)
      .attr("height", 800)
    .append("svg:g")
      .attr("transform", "translate(359.5,69.5)");
  // 

  // Legend.
  var legend = svg.selectAll("g.legend")
      .data(["South", "West", "Northeast", "North Central"])
    .enter().append("svg:g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(-179," + (i * 20 + 250) + ")"; });

  legend.append("svg:circle")
      .attr("class", String)
      .attr("r", 3)
      .style("fill", function(d) {return color(d)});

  legend.append("svg:text")
      .attr("x", 12)
      .attr("dy", ".31em")
      .text(function(d) { return d; });

  // X-axis.
  svg.selectAll("g.x.axis")
      .data(traits)
    .enter().append("svg:g")
      .attr("class", "scatter x axis")
      .attr("transform", function(d, i) { return "translate(" + i * size + ","+ (size * 4) + ")"; })
      .each(function(d) { d3.select(this).call(axis.scale(x[d]).orient("bottom")); });

  // Y-axis.
  svg.selectAll("g.y.axis")
      .data(traits)
    .enter().append("svg:g")
      .attr("class", "scattter y axis")
      .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
      .each(function(d) { d3.select(this).call(axis.scale(y[d]).orient("left")); });

  // Cell and plot.
  var cell = svg.selectAll("g.cell")
      .data(cross(traits, traits))
    .enter().append("svg:g")
      .attr("class", "cell")
      .attr("transform", function(d) { return "translate(" + d.i * size + "," + d.j * size + ")"; })
      .each(plot);

  // Titles for the diagonal.
  cell.filter(function(d) { return d.i == d.j; }).append("svg:text")
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".71em")
      .text(function(d) { return d.x; });

  function plot(p) {
    var cell = d3.select(this);

    // Plot frame.
    cell.append("svg:rect")
        .attr("class", "frame")
        .attr("x", padding / 2)
        .attr("y", padding / 2)
        .attr("width", size - padding)
        .attr("height", size - padding);

    // Plot dots.
    cell.selectAll("circle")
        .data(states)
      .enter().append("svg:circle")
        .attr("class", function(d) { return d.region; })
        .attr("cx", function(d) { return x[p.x](d[p.x]); })
        .attr("cy", function(d) { return y[p.y](d[p.y]); })
        .attr("r", 3)
        .style("fill", function(d) {return color(d.region)});

    // Plot brush.
    cell.call(brush.x(x[p.x]).y(y[p.y]));
  }

  // Clear the previously-active brush, if any.
  function brushstart(p) {
    if (brush.data !== p) {
      cell.call(brush.clear());
      brush.x(x[p.x]).y(y[p.y]).data = p;
    }
  }

  // Highlight the selected circles.
  function brush(p) {
    var e = brush.extent();
    svg.selectAll(".cell circle").attr("class", function(d) {
      return e[0][0] <= d[p.x] && d[p.x] <= e[1][0]
          && e[0][1] <= d[p.y] && d[p.y] <= e[1][1]
          ? d.region : null;
    });
  }

  // If the brush is empty, select all circles.
  function brushend() {
    if (brush.empty()) svg.selectAll(".cell circle").attr("class", function(d) {
      return d.region;
    });
  }

  function cross(a, b) {
    var c = [], n = a.length, m = b.length, i, j;
    for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
    return c;
  }
};

// function parallel(data){

// 	var tip = d3.tip()
// 	  .attr('class', 'd3-tip')
// 	  .offset([-10, 0])
// 	  .html(function(d) {
// 	    return "<strong>State:</strong><span style='color:#66FFFF'> " + d.state + "</span>";
// 	  })

// 	var region = ["South", "West", "Northeast", "North Central"],
//     traits = ["life", "hsgrad", "illiteracy", "murder"];

// 	var m = [80, 100, 100, 100],
// 	    w = 1280 - m[1] - m[3],
// 	    h = 800 - m[0] - m[2];

// 	var x = d3.scale.ordinal().domain(traits).rangePoints([0, w]),
// 	    y = {};

// 	var line = d3.svg.line(),
// 	    axis = d3.svg.axis().orient("left"),
// 	    foreground;

// 	var svg = d3.select("p").append("svg:svg")
// 	    .attr("width", w + m[1] + m[3])
// 	    .attr("height", h + m[0] + m[2])
// 	  .append("svg:g")
// 	    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");


// 	  // Create a scale and brush for each trait.
// 	  traits.forEach(function(d) {
// 	    // Coerce values to numbers.
// 	    data.forEach(function(p) { p[d] = +p[d]; });

// 	    y[d] = d3.scale.linear()
// 	        .domain(d3.extent(data, function(p) { return p[d]; }))
// 	        .range([h, 0]);

// 	    y[d].brush = d3.svg.brush()
// 	        .y(y[d])
// 	        .on("brush", brush);
// 	 });

// 	  // // Add a legend.
// 	  // var legend = svg.selectAll("g.legend")
// 	  //     .data(region)
// 	  //   .enter().append("svg:g")
// 	  //     .attr("class", "legend")
// 	  //     .attr("transform", function(d, i) { return "translate(0," + (i * 20 + 584) + ")"; });

// 	  // legend.append("svg:line")
// 	  //     .attr("class", String)
// 	  //     .attr("x2", 8);

// 	  // legend.append("svg:text")
// 	  //     .attr("x", 12)
// 	  //     .attr("dy", ".31em")
// 	  //     .text(function(d) { return d; });

// 	  svg.append('g')
// 	  	 .attr('class', 'background')
// 	  	.selectAll("path")
// 	  	 .data(data)
// 	  	 .enter().append('path')
// 	  	 	.attr("d", path)

// 	  svg.call(tip);

// 	  // Add foreground lines.
// 	  foreground = svg.append("svg:g")
// 	      .attr("class", "foreground")
// 	    .selectAll("path")
// 	      .data(data)
// 	    .enter().append("svg:path")
// 	      .attr("d", path)
// 	      .attr("class", function(d) { return d.region; })
// 	      .attr("stroke", function(d) {return color(d.region)});

// 	  // Add a group element for each trait.
// 	  var g = svg.selectAll(".trait")
// 	      .data(traits)
// 	    .enter().append("svg:g")
// 	      .attr("class", "trait")
// 	      .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
// 	      .call(d3.behavior.drag()
// 	      .origin(function(d) { return {x: x(d)}; })
// 	      .on("dragstart", dragstart)
// 	      .on("drag", drag)
// 	      .on("dragend", dragend));

// 	  // Add an axis and title.
// 	  g.append("svg:g")
// 	      .attr("class", "axis")
// 	      .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
// 	    .append("svg:text")
// 	      .attr("text-anchor", "middle")
// 	      .attr("y", -9)
// 	      .text(String);

// 	  // Add a brush for each axis.
// 	  g.append("svg:g")
// 	      .attr("class", "brush")
// 	      .each(function(d) { d3.select(this).call(y[d].brush); })
// 	    .selectAll("rect")
// 	      .attr("x", -8)
// 	      .attr("width", 16);

// 	  function dragstart(d) {
// 	    i = traits.indexOf(d);
// 	  }

// 	  function drag(d) {
// 	    x.range()[i] = d3.event.x;
// 	    traits.sort(function(a, b) { return x(a) - x(b); });
// 	    g.attr("transform", function(d) { return "translate(" + x(d) + ")"; });
// 	    foreground.attr("d", path);
// 	  }

// 	  function dragend(d) {
// 	    x.domain(traits).rangePoints([0, w]);
// 	    var t = d3.transition().duration(500);
// 	    t.selectAll(".trait").attr("transform", function(d) { return "translate(" + x(d) + ")"; });
// 	    t.selectAll(".foreground path").attr("d", path);
// 	  };

// 	// Returns the path for a given data point.
// 	function path(d) {
// 	  return line(traits.map(function(p) { return [x(p), y[p](d[p])]; }));
// 	}

// 	// Handles a brush event, toggling the display of foreground lines.
// 	function brush() {
// 	  var actives = traits.filter(function(p) { return !y[p].brush.empty(); }),
// 	      extents = actives.map(function(p) { return y[p].brush.extent(); });
// 	  foreground.classed("fade", function(d) {
// 	    return !actives.every(function(p, i) {
// 	      return extents[i][0] <= d[p] && d[p] <= extents[i][1];
// 	    });
// 	  });
// 	}
// };

