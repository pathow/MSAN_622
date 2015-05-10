 //globals
var width, height, projection, path, graticule, svg, datayear=1816, attributeArray = [], currentAttribute = 0, 
attributeArray2 = [], currentAttribute2 = 0;

//document.querySelector('.onoffswitch-checkbox:checked').value


function init() {

  setMap();

}

function setMap() {

  

  width = 900, height = 480;  // map width and height, matches 

  projection = d3.geo.eckert5()   // define our projection with parameters
    .scale(160)
    .translate([width / 2, height / 2])
    .precision(.1);

  path = d3.geo.path()  // create path generator function
      .projection(projection);  // add our define projection to it

  graticule = d3.geo.graticule(); // create a graticule

  

  svg = d3.select("#map").append("svg")   // append a svg to our html div to hold our map
      .attr("width", width)
      .attr("height", height);

  svg.append("defs").append("path")   // prepare some svg for outer container of svg elements
      .datum({type: "Sphere"})
      .attr("id", "sphere")
      .attr("d", path);

  svg.append("use")   // use that svg to style with css
      .attr("class", "stroke")
      .attr("xlink:href", "#sphere");

  svg.append("path")    // use path generator to draw a graticule
      .datum(graticule)
      .attr("class", "graticule")
      .attr("d", path);
  

  loadData();  // let's load our data next

}

function loadData() {

  queue()   // queue function loads all external data files asynchronously 
    .defer(d3.json, "countries.topo.json")  // our geometries
    .defer(d3.json, "countries.topo.json") 
    .defer(d3.csv, "ts_econ.csv")  // and associated data in csv file
    .defer(d3.csv, "ts_mil.csv")
    .defer(d3.json, "econ_breakdown.json")
    .await(processData);   // once all files are loaded, call the processData function passing
                           // the loaded objects as arguments
}

function processData(error, world, world2, econData, milData, crisisData) {
  // function accepts any errors from the queue function as first argument, then
  // each data object in the order of chained defer() methods above

  var countries = world.objects.countries.geometries;
  var countries2 = world2.objects.countries.geometries;  // store the path in variable for ease
  for (var i in countries) {    // for each geometry object
    for (var j in econData) {  // for each row in the CSV
      //console.log(countryData[j].country)
      if(countries[i].properties.name == econData[j].country) {   // if they match
        for(var k in econData[i]) {   // for each column in the a row within the CSV
          if(k != 'name' && k != 'country') {  // let's not add the name or id as props since we already have them
            if(attributeArray.indexOf(k) == -1) { 
               attributeArray.push(k);  // add new column headings to our array for later
            }
            countries[i].properties[k] = Number(econData[j][k])  // add each CSV column key/value to geometry object
          } 
        }
        break;  // stop looking through the CSV since we made our match
      }
    }
  }

  for (var i in countries2) { 
    // Doing militarized data now
    for (var j in milData) {  // for each row in the CSV
      //console.log(milData[j].country)
      if(countries2[i].properties.name == milData[j].country) {   // if they match
        for(var k in milData[i]) {   // for each column in the a row within the CSV
          if(k != 'name' && k != 'country') {  // let's not add the name or id as props since we already have them
            if(attributeArray2.indexOf(k) == -1) { 
               attributeArray2.push(k);  // add new column headings to our array for later
            }
            countries2[i].properties[k] = Number(milData[j][k])  // add each CSV column key/value to geometry object
          } 
        }
        break;  // stop looking through the CSV since we made our match
      }
    }
  }

  console.log(econData)
  console.log(milData)

  var display = document.querySelector('.onoffswitch-checkbox:checked').value
  d3.select('#dumbslider').call(d3.slider().axis(true).min(1816).max(2001).step(1).value(datayear).on("slide", function(evt, value) {
      datayear = value;

      d3.select('#clock').html(datayear);
        if(display == "none"){
          drawMap2(world2, datayear, crisisData[datayear])
        } else {
          drawMap(world, datayear, crisisData[datayear])
        }

    d3.select('.onoffswitch-checkbox:checked').on("change", function(){
    display = this.checked ? "inline" : "none";
    console.log(datayear)
    
    if(display == "none"){
          drawMap2(world2, datayear, crisisData[datayear]);
        } else {
          drawMap(world, datayear, crisisData[datayear]);
        }});
      }));

  d3.select('.onoffswitch-checkbox:checked').on("change", function(){
    display = this.checked ? "inline" : "none";

    if(display == "none"){
          drawMap2(world2, datayear, crisisData[datayear]);
        } else {
          drawMap(world, datayear, crisisData[datayear]);
        }});

  d3.select('#clock').html(datayear);
      drawMap(world, datayear, crisisData[datayear]); 
    // populate the clock initially with the current year
   // let's mug the map now with our newly populated data object
}



function drawMap(world, datayear, crisisyear) {

    var div = d3.select("#map").append("div")   
      .attr("class", "tooltip")               
      .style("opacity", 0);

    svg.selectAll(".country")   // select country objects (which don't exist yet)
      .data(topojson.feature(world, world.objects.countries).features)  // bind data to these non-existent objects
      .enter().append("path") // prepare data to be appended to paths
      .attr("class", "country") // give them a class for styling and access later
      .attr("id", function(d) { return "code_" + d.properties.id; }, true)  // give each a unique id for access later
      .attr("d", path); // create them using the svg path generator defined above
        

    var dataRange = [0,7]; // get the min/max values from the current year's range of data values
    d3.selectAll('.country')  // select all the countries
    .attr("fill", function(d) { return (d.properties[datayear] > 0 ? "red" : "#9A2EFE"); })
    .attr('fill-opacity', function(d) {
        return getColor(d.properties[datayear], dataRange);  // give them an opacity value based on their current value
    })
    //Adding mouseevents
      .on("mouseover", function(d) {
        if(d.properties[datayear]>=0 & typeof crisisyear[d.properties.name].banking != 'undefined'){
            d3.select(this).transition().duration(300).style("opacity", 1);
            div.transition().duration(300)
            .style("opacity", 1)
            div.html(d.properties.name + " -- " + datayear + " Crises<br>Banking: "+ crisisyear[d.properties.name].banking +
                                                                           "<br>Inflation: "+ crisisyear[d.properties.name].inflation +
                                                                           "<br>Domestic Debt: "+ crisisyear[d.properties.name].domdebt +
                                                                           "<br>External Debt: "+ crisisyear[d.properties.name].extdebt +
                                                                           "<br>Currency: "+ crisisyear[d.properties.name].currency +
                                                                           "<br>Stock Market: "+ crisisyear[d.properties.name].stockmarket)
            .style("left", (d3.event.pageX-125) + "px")
            .style("top", (d3.event.pageY-125) + "px")};
          })
      .on("mouseout", function() {
        d3.select(this)
        .transition().duration(300)
        .style("opacity", 0.8);
        div.transition().duration(300)
        .style("opacity", 0);
      });

}


function getColor(valueIn, valuesIn) {

  var color = d3.scale.linear() // create a linear scale
    .domain([valuesIn[0],valuesIn[1]])  // input uses min and max values
    .range([.3,1]);   // output for opacity between .3 and 1 %

  if(valueIn >= 0){
  return color(valueIn);
  } else {
    return 0.15
  }  // return that number to the caller
}


function getColor2(valueIn, valuesIn) {

  var color = d3.scale.linear() // create a linear scale
    .domain([valuesIn[0],valuesIn[1]])  // input uses min and max values
    .range([.3,1]);   // output for opacity between .3 and 1 %

  if(valueIn >= 0){
  return color(valueIn);
  } else {
    return 0.15
  }  // return that number to the caller
}

function drawMap2(world, datayear, crisisyear) {


    var div = d3.select("#map").append("div")   
      .attr("class", "tooltip2")               
      .style("opacity", 0);

    svg.selectAll(".country")   // select country objects (which don't exist yet)
      .data(topojson.feature(world, world.objects.countries).features)  // bind data to these non-existent objects
      .enter().append("path") // prepare data to be appended to paths
      .attr("class", "country") // give them a class for styling and access later
      .attr("id", function(d) { return "code_" + d.properties.id; }, true)  // give each a unique id for access later
      .attr("d", path); // create them using the svg path generator defined above
        

    var dataRange2 = [0,10]; // get the min/max values from the current year's range of data values
    d3.selectAll('.country')  // select all the countries
    .attr("fill", function(d) { return (d.properties[datayear] > 0 ? "green" : "#9A2EFE"); })
    .attr('fill-opacity', function(d) {
        return getColor2(d.properties[datayear], dataRange2);  // give them an opacity value based on their current value
    })
    //Adding mouseevents
      .on("mouseover", function(d) {
        if(d.properties[datayear]>=0){
            d3.select(this).transition().duration(300).style("opacity", 1);
            div.transition().duration(300)
            .style("opacity", 1)
            div.html(d.properties.name + " -- " + datayear + "<br>Militarized Disputes: "+ d.properties[datayear])
            .style("left", (d3.event.pageX-125) + "px")
            .style("top", (d3.event.pageY-125) + "px")};
          })
      .on("mouseout", function() {
        d3.select(this)
        .transition().duration(300)
        .style("opacity", 0.8);
        div.transition().duration(300)
        .style("opacity", 0);
      });

}


window.onload = init();  // magic starts here

    
  