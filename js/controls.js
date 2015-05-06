/*
 * This class defines the control box and its functionality
 */

// Define global constants
var c_width = 200;
var c_height = 275;
var margin = 40;
var pos1 = 6;
var pos2 = 2.35;
var pos3 = 1.45;
var pos4 = 6;

// The parameters can have values between 0 and 1
var x = d3.scale.linear()
    .domain([0, 1])
    .range([10, c_width-margin])
    .clamp(true);

// Defines the value for steps of the animation
var step_x = d3.scale.linear()
    .domain([20, 100])
    .range([10, c_width-margin])
    .clamp(true);

// Defines interaction for beta parameter
var brush_beta = d3.svg.brush()
    .x(x)
    .extent([0, 0])
    .on("brush", brushed_beta);

// Add control box
var control_svg = d3.select("#controls").append("svg")
    .attr("width", c_width)
    .attr("height", c_height);

// Add slider group
control_svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + c_height / pos1 + ")")
    .call(d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(function(d) { return d; })
    .tickSize(0)
    .tickPadding(12))
    .select(".domain")
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "halo");

// Add beta slider and functionality
var slider_beta = control_svg.append("g")
    .attr("class", "slider")
    .call(brush_beta);

var text_beta = control_svg.append("text")
    .attr("class", "text")
    .text("Define Beta: ")
    .attr("x", "0")
    .attr("y", "25");

slider_beta.selectAll(".extent,.resize")
    .remove();

var handle_beta = slider_beta.append("circle")
    .attr("class", "handle")
    .attr("transform", "translate(0," + c_height / pos1 + ")")
    .attr("r", 9);

slider_beta
    .call(brush_beta.event);

function brushed_beta() {
  var value_beta = brush_beta.extent()[0];

  if (d3.event.sourceEvent) { // not a programmatic event
    value_beta = x.invert(d3.mouse(this)[0]);
    brush_beta.extent([value_beta, value_beta]);
  }

  handle_beta.attr("cx", x(value_beta));
    
  beta = value_beta;
}

// Set up kill slider in the same way
var brush_kill = d3.svg.brush()
    .x(x)
    .extent([0, 0])
    .on("brush", brushed_kill);

control_svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + c_height / pos2 + ")")
    .call(d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(function(d) { return d; })
    .tickSize(0)
    .tickPadding(12))
    .select(".domain")
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "halo");

var slider_kill = control_svg.append("g")
    .attr("class", "slider")
    .call(brush_kill);

var text_kill = control_svg.append("text")
    .attr("class", "text")
    .text("Define the kill rate: ")
    .attr("x", "0")
    .attr("y", "100");

slider_kill.selectAll(".extent,.resize")
    .remove();

var handle_kill = slider_kill.append("circle")
    .attr("class", "handle")
    .attr("transform", "translate(0," + c_height / pos2 + ")")
    .attr("r", 9);

slider_kill
    .call(brush_kill.event);

function brushed_kill() {
  var value_kill = brush_kill.extent()[0];

  if (d3.event.sourceEvent) { // not a programmatic event
    value_kill = x.invert(d3.mouse(this)[0]);
    brush_kill.extent([value_kill, value_kill]);
  }

  handle_kill.attr("cx", x(value_kill));
    
  kill = value_kill;
}

// Step slider is set up similarly but with a different scale
var brush_steps = d3.svg.brush()
    .x(step_x)
    .extent([0, 0])
    .on("brush", brushed_steps);

control_svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + c_height / pos3 + ")")
    .call(d3.svg.axis()
    .scale(step_x)
    .orient("bottom")
    .tickFormat(function(d) { return d; })
    .tickSize(0)
    .tickPadding(12))
    .select(".domain")
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "halo");

var slider_steps = control_svg.append("g")
    .attr("class", "slider")
    .call(brush_steps);

var text_steps = control_svg.append("text")
    .attr("class", "text")
    .text("Define number of steps: ")
    .attr("x", "0")
    .attr("y", "175");


slider_steps.selectAll(".extent,.resize")
    .remove();

var handle_steps = slider_steps.append("circle")
    .attr("class", "handle")
    .attr("transform", "translate(0," + c_height / pos3 + ")")
    .attr("r", 9);

slider_steps
    .call(brush_steps.event);

function brushed_steps() {
  var value_steps = brush_steps.extent()[0];

  if (d3.event.sourceEvent) { // not a programmatic event
    value_steps = step_x.invert(d3.mouse(this)[0]);
    brush_steps.extent([value_steps, value_steps]);
  }

  handle_steps.attr("cx", step_x(value_steps));
    
  stepLimit = Math.max(value_steps, 20);
}

// Add text box for point of origin
var originText = control_svg.append("text")
    .attr("class", "text")
    .text("Point of Origin: ")
    .attr("x", "0")
    .attr("y", "242");

// This text box will have actual coordinates
var text_latlong = control_svg.append("text")
    .attr("class", "text")
    .text("Select a point")
    .attr("x", "0")
    .attr("y", "266")
    .attr("id", "originBox");

// Add start button
$("#controls").append($("<input>")
              .attr("type","submit")
              .attr("value","Start")
              .attr("id","start"));

// Set functionality of start button
var playing = false;
$("#start").prop("disabled", true);
$("#start").click(function(){
  if (!playing) {
    play();
  } else {
    pause();
  }
});

function play () {
  runAnimation();
}

function pause () {
  clearInterval(animation_interval)
  playing = false;
  $("#start").prop("value", "Play");
}
