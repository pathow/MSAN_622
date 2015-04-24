      var margin3 = {top: 20, right: 55, bottom: 30, left: 40},
          width3  = 1000 - margin3.left - margin3.right,
          height3 = 500  - margin3.top  - margin3.bottom;

      var x3 = d3.scale.ordinal()
          .rangeRoundBands([0, width3], .1);

      var y = d3.scale.linear()
          .rangeRound([height3, 0]);

      var xAxis3 = d3.svg.axis()
          .scale(x3)
          .tickValues(x3.domain())
          .orient("bottom");

      var yAxis2 = d3.svg.axis()
          .scale(y)
          .orient("left");

      var stack = d3.layout.stack()
          .offset("zero")
          .values(function (d) { return d.values; })
          .x(function (d) { return x3(d.label); })
          .y(function (d) { return d.value; });

      var area3 = d3.svg.area()
          .interpolate("cardinal")
          .x(function (d) { return x3(d.label); })
          .y0(function (d) { return y(d.y0); })
          .y1(function (d) { return y(d.y0 + d.y); });

      var color = d3.scale.ordinal()
          .range(["#0266CA","#02C7CA","#02CA66"]);


      d3.csv("ukdeaths.csv", function (error, data) {

        var svg2 = d3.select("p").append("svg")
          .attr("width",  width3  + margin3.left + margin3.right)
          .attr("height", height3 + margin3.top  + margin3.bottom)
        .append("g")
          .attr("transform", "translate(" + margin3.left + "," + margin3.top + ")");
          var labelVar = 'time';
          var varNames = d3.keys(data[0])
              .filter(function (key) { return key !== labelVar;});
          //console.log(varNames)

          color.domain(varNames);

          var seriesArr = [], series = {};
          varNames.forEach(function (name) {
            series[name] = {name: name, values:[]};
            seriesArr.push(series[name]);
          });

          console.log(seriesArr);  

          data.forEach(function (d) {
            varNames.map(function (name) {
              series[name].values.push({label: d[labelVar], value: +d[name], group: name});
            });
          });

          x3.domain(data.map(function (d) { return d.time; }));

          stack(seriesArr);

          y.domain([0, d3.max(seriesArr, function (c) { 
              return d3.max(c.values, function (d) { return d.y0 + d.y; });
            })]);

          svg2.append("g")
              .attr("class", "x axis2")
              .attr("transform", "translate(0," + height3 + ")")
              .call(xAxis3);

          svg2.append("g")
              .attr("class", "y axis2")
              .call(yAxis2)
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Number of Deaths");

            var selection = svg2.selectAll(".series")
              .data(seriesArr)
              .enter().append("g")
                .attr("class", "series");

            selection.append("path")
              .attr("class", "streamPath")
              .attr("d", function (d) { return area3(d.values); })
              .style("fill", function (d) { return color(d.name); })
              .style("stroke", "grey");

        var points = svg2.selectAll(".seriesPoints")
          .data(seriesArr)
          .enter().append("g")
            .attr("class", "seriesPoints");

        points.selectAll(".point")
          .data(function (d) { return d.values; })
          .enter().append("circle")
           .attr("class", "point")
           .attr("cx", function (d) { return x3(d.label) + x3.rangeBand() / 2; })
           .attr("cy", function (d) { return y(d.y0 + d.y); })
           .attr("r", "10px")
           .style("fill",function (d) { return color(d.name); })
           .on("mouseover", function (d) { showPopover.call(this, d); })
           .on("mouseout",  function (d) { removePopovers(); })

        var legend = svg2.selectAll(".legend")
            .data(varNames.slice().reverse())
          .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) { return "translate(55," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", width3 - 10)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", color)
            .style("stroke", "grey");

        legend.append("text")
            .attr("x", width3 - 12)
            .attr("y", 6)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function (d) { return d; });

        function removePopovers () {
          $('.popover').each(function() {
            $(this).remove();
          }); 
        }

        function showPopover (d) {
          $(this).popover({
            title: d.group,
            placement: 'auto top',
            container: 'body',
            trigger: 'manual',
            html : true,
            content: function() { 
              return "Month: " + d.label + 
                     "<br/>Deaths: " + d3.format(",")(d.value ? d.value: d.y1 - d.y0); }
          });
          $(this).popover('show')
        }
      });