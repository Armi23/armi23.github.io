// This is where we will edit the parameters of the disease. We will have some presets for different diseases but we will also allow users to change these manually


var c_width = 200;
var c_height = 240;
var margin = 40;

var x = d3.scale.linear()
    .domain([0, 1])
    .range([10, c_width-margin])
    .clamp(true);

var brush_s = d3.svg.brush()
    .x(x)
    .extent([0, 0])
    .on("brush", brushed_s);

var control_svg = d3.select("#controls").append("svg")
    .attr("width", c_width)
    .attr("height", c_height);

control_svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + c_height / 5 + ")")
    .call(d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickFormat(function(d) { return d; })
      .tickSize(0)
      .tickPadding(12))
  .select(".domain")
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "halo");



var slider_s = control_svg.append("g")
    .attr("class", "slider")
    .call(brush_s);

var text_s = control_svg.append("text")
    .attr("class", "text")
    .text("Define Beta: ")
    .attr("x", "0")
    .attr("y", "25");

slider_s.selectAll(".extent,.resize")
    .remove();

//slider.select(".background")
//    .attr("height", height);

var handle_s = slider_s.append("circle")
    .attr("class", "handle")
    .attr("transform", "translate(0," + c_height / 5 + ")")
    .attr("r", 9);

slider_s
    .call(brush_s.event);
//  .transition() // gratuitous intro!
//    .duration(750)
//    .call(brush.extent([70, 70]))
//    .call(brush.event);

function brushed_s() {
  var value_s = brush_s.extent()[0];

  if (d3.event.sourceEvent) { // not a programmatic event
    value_s = x.invert(d3.mouse(this)[0]);
    brush_s.extent([value_s, value_s]);
  }

  handle_s.attr("cx", x(value_s));
//  d3.select("body").style("background-color", d3.hsl(value, .8, .8));
    
    beta = value_s;
}



// i slider

var brush_i = d3.svg.brush()
    .x(x)
    .extent([0, 0])
    .on("brush", brushed_i);

control_svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + c_height / 2 + ")")
    .call(d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickFormat(function(d) { return d; })
      .tickSize(0)
      .tickPadding(12))
  .select(".domain")
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "halo");

var slider_i = control_svg.append("g")
    .attr("class", "slider")
    .call(brush_i);

var text_i = control_svg.append("text")
    .attr("class", "text")
    .text("Define the kill rate: ")
    .attr("x", "0")
    .attr("y", "100");

slider_i.selectAll(".extent,.resize")
    .remove();

//slider.select(".background")
//    .attr("height", height);

var handle_i = slider_i.append("circle")
    .attr("class", "handle")
    .attr("transform", "translate(0," + c_height / 2 + ")")
    .attr("r", 9);

slider_i
    .call(brush_i.event);
//  .transition() // gratuitous intro!
//    .duration(750)
//    .call(brush.extent([70, 70]))
//    .call(brush.event);

function brushed_i() {
  var value_i = brush_i.extent()[0];

  if (d3.event.sourceEvent) { // not a programmatic event
    value_i = x.invert(d3.mouse(this)[0]);
    brush_i.extent([value_i, value_i]);
  }

  handle_i.attr("cx", x(value_i));
//  d3.select("body").style("background-color", d3.hsl(value, .8, .8));
    
    console.log("Sliding I: ", value_i);
    kill = value_i;
}


// Time slider

var brush_r = d3.svg.brush()
    .x(x)
    .extent([0, 0])
    .on("brush", brushed_r);

control_svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + c_height / 1.2 + ")")
    .call(d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickFormat(function(d) { return d; })
      .tickSize(0)
      .tickPadding(12))
  .select(".domain")
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "halo");

var slider_r = control_svg.append("g")
    .attr("class", "slider")
    .call(brush_r);

var text_r = control_svg.append("text")
    .attr("class", "text")
    .text("Define number of steps: ")
    .attr("x", "0")
    .attr("y", "175");


slider_r.selectAll(".extent,.resize")
    .remove();

//slider.select(".background")
//    .attr("height", height);

var handle_r = slider_r.append("circle")
    .attr("class", "handle")
    .attr("transform", "translate(0," + c_height / 1.2 + ")")
    .attr("r", 9);

slider_r
    .call(brush_r.event);
//  .transition() // gratuitous intro!
//    .duration(750)
//    .call(brush.extent([70, 70]))
//    .call(brush.event);

function brushed_r() {
  var value_r = brush_r.extent()[0];

  if (d3.event.sourceEvent) { // not a programmatic event
    value_r = x.invert(d3.mouse(this)[0]);
    brush_r.extent([value_r, value_r]);
  }

  handle_r.attr("cx", x(value_r));
//  d3.select("body").style("background-color", d3.hsl(value, .8, .8));
    
    console.log("Sliding R: ", value_r);
    stepLimit = value_r * 1000;
}

$("#controls").append($("<input>").attr("type","submit").attr("value","Start").attr("id","start"));

var playing = false;
$("#start").click(function(){
  if (!playing) {
    runAnimation();
  } else {
    clearInterval(animation_interval)
    playing = false;
    $("#start").prop("value", "Play");
  }
})