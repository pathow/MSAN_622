 //globals
var width2, height2, projection2, path2, graticule2, svg2, datayear2=1816, attributeArray2 = [], currentAttribute2 = 0;




function init() {

  setMap();

}

function setMap() {

  

  width2 = 960, height2 = 580;  // map width2 and height2, matches 

  projection2 = d3.geo.eckert5()   // define our projection with parameters
    .scale(170)
    .translate([width2 / 2, height2 / 2])
    .precision(.1);

  path2 = d3.geo.path()  // create path generator function
      .projection(projection2);  // add our define projection to it

  graticule2 = d3.geo.graticule(); // create a graticule

  

  svg2 = d3.select("#map2").append("svg")   // append a svg to our html div to hold our map
      .attr("width", width2)
      .attr("height", height2);

  svg2.append("defs").append("path")   // prepare some svg for outer container of svg elements
      .datum({type: "Sphere"})
      .attr("id", "sphere")
      .attr("d", path2);

  svg2.append("use")   // use that svg to style with css
      .attr("class", "stroke")
      .attr("xlink:href", "#sphere");

  svg2.append("path")    // use path generator to draw a graticule
      .datum(graticule2)
      .attr("class", "graticule")
      .attr("d", path2);
  

  loadData();  // let's load our data next

}

function loadData() {

  queue()   // queue function loads all external data files asynchronously 
    .defer(d3.json, "countries.topo.json")  // our geometries
    .defer(d3.csv, "ts_econ.csv")  // and associated data in csv file
    .defer(d3.json, "econ_breakdown.json")
    .await(processData);   // once all files are loaded, call the processData function passing
                           // the loaded objects as arguments
}

function processData(error,world,countryData,crisisData) {
  // function accepts any errors from the queue function as first argument, then
  // each data object in the order of chained defer() methods above

  var countries2 = world.objects.countries.geometries;  // store the path in variable for ease
  for (var i in countries2) {    // for each geometry object
    for (var j in countryData) {  // for each row in the CSV
      //console.log(countryData[j].country)
      if(countries2[i].properties.name == countryData[j].country) {   // if they match
        for(var k in countryData[i]) {   // for each column in the a row within the CSV
          if(k != 'name' && k != 'country') {  // let's not add the name or id as props since we already have them
            if(attributeArray2.indexOf(k) == -1) { 
               attributeArray2.push(k);  // add new column headings to our array for later
            }
            countries2[i].properties[k] = Number(countryData[j][k])  // add each CSV column key/value to geometry object
          } 
        }
        break;  // stop looking through the CSV since we made our match
      }
    }
  }
  
  d3.select('#dumbslider2').call(d3.slider().axis(true).min(1816).max(2001).step(1).value(datayear2).on("slide", function(evt, value2) {
      var datayear2 = value2;
      d3.select('#clock2').html(datayear2);
      drawMap2(world, datayear2, crisisData[datayear2]); 
        }));
  d3.select('#clock2').html(datayear2);
      drawMap2(world, datayear2, crisisData[datayear2]); 
    // populate the clock initially with the current year
   // let's mug the map now with our newly populated data object
}



function drawMap2(world, datayear, crisisyear) {


    var div = d3.select("#map2").append("div")   
      .attr("class", "tooltip")               
      .style("opacity", 0);

    svg2.selectAll(".country2")   // select country objects (which don't exist yet)
      .data(topojson.feature(world, world.objects.countries).features)  // bind data to these non-existent objects
      .enter().append("path") // prepare data to be appended to paths
      .attr("class", "country2") // give them a class for styling and access later
      .attr("id", function(d) { return "code_" + d.properties.id; }, true)  // give each a unique id for access later
      .attr("d", path2); // create them using the svg path generator defined above
        

    var dataRange = [0,60]; // get the min/max values from the current year's range of data values
    d3.selectAll('.country2')  // select all the countries
    .attr("fill", function(d) { return (d.properties[datayear] > 0 ? "green" : "#9A2EFE"); })
    .attr('fill-opacity', function(d) {
        return getColor(d.properties[datayear], dataRange);  // give them an opacity value based on their current value
    })
    // //Adding mouseevents
    //   .on("mouseover", function(d) {
    //     if(d.properties[datayear]>=0 & typeof crisisyear[d.properties.name].banking != 'undefined'){
    //         d3.select(this).transition().duration(300).style("opacity", 1);
    //         div.transition().duration(300)
    //         .style("opacity", 1)
    //         div.html(d.properties.name + " -- " + datayear + " Crises<br>Banking: "+ crisisyear[d.properties.name].banking +
    //                                                                        "<br>Inflation: "+ crisisyear[d.properties.name].inflation +
    //                                                                        "<br>Domestic Debt: "+ crisisyear[d.properties.name].domdebt +
    //                                                                        "<br>External Debt: "+ crisisyear[d.properties.name].extdebt +
    //                                                                        "<br>Currency: "+ crisisyear[d.properties.name].currency +
    //                                                                        "<br>Stock Market: "+ crisisyear[d.properties.name].stockmarket)
    //         .style("left", (d3.event.pageX-125) + "px")
    //         .style("top", (d3.event.pageY-125) + "px")};
    //       })
    //   .on("mouseout", function() {
    //     d3.select(this)
    //     .transition().duration(300)
    //     .style("opacity", 0.8);
    //     div.transition().duration(300)
    //     .style("opacity", 0);
    //   });

}

// function sequenceMap() {
  
//     var dataRange = [0,7]; // get the min/max values from the current year's range of data values
//     d3.selectAll('.country').transition()  //select all the countries and prepare for a transition to new values
//       .duration(250)  // give it a smooth time period for the transition
//       .attr("fill", function(d) { return (d.properties[datayear] > 0 ? "red" : "#9A2EFE"); })
//       .attr('fill-opacity', function(d) {
//         return getColor(d.properties[datayear], dataRange);  // the end color value
//       })

// }

function getColor(valueIn, valuesIn) {

  var color = d3.scale.linear() // create a linear scale
    .domain([valuesIn[0],valuesIn[1]])  // input uses min and max values
    .range([.25,1]);   // output for opacity between .3 and 1 %

  if(valueIn >= 0){
  return color(valueIn);
  } else {
    return 0.05
  }  // return that number to the caller
}

// function getDataRange() {
//   // function loops through all the data values from the current data attribute
//   // and returns the min and max values

//   var min = Infinity, max = -Infinity;  
//   d3.selectAll('.country')
//     .each(function(d,i) {
//       var currentValue = d.properties[datayear];
//       if(currentValue <= min && currentValue != -99 && currentValue != -1) {
//         min = currentValue;
//       }
//       if(currentValue >= max && currentValue != -99 && currentValue != -1) {
//         max = currentValue;
//       }
//   });
//   return [min,max];  //boomsauce
// }




window.onload = init();  // magic starts here

    
  