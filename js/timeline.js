TimeVis = function(_parentElement, _eventHandler){
  this.parentElement = _parentElement;
  this.eventHandler = _eventHandler;

  // Define constants
  this.margin = {top: 20, right: 30, bottom: 30, left: 30};
  this.width = 500 - this.margin.left - this.margin.right;
  this.height = 200 - this.margin.top - this.margin.bottom;

  this.initVis();
}


/**
 * Method that sets up the SVG and the variables
 */
TimeVis.prototype.initVis = function(){
  var that = this;
  this.svg = this.parentElement.append("svg")
    .attr("width", this.width + this.margin.left + this.margin.right)
    .attr("height", this.height + this.margin.top + this.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")

  // creates axis and scales
  this.x = d3.scale.linear()
    .range([0, this.width]);

  this.y = d3.scale.linear()
    .range([this.height, 0]);

  this.area = d3.svg.area()
    .interpolate("monotone")
    .x(function(d, i) { return that.x(i); })
    .y0(this.height)
    .y1(function(d, i) { return that.y(d); });

  // Add axes visual elements
  this.svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + this.height + ")")

  this.svg.append("g")
    .attr("class", "y-axis")
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")

  this.xAxis = d3.svg.axis()
    .scale(that.x)
    .orient("bottom");

  this.yAxis = d3.svg.axis()
    .scale(that.y)
    .orient("left");

  // updates axis
  this.svg.select(".x-axis")
    .call(that.xAxis);

  this.svg.select(".y-axis")
    .call(that.yAxis)

}

/**
 * Method to wrangle the data. In this case it takes an options object
  */
TimeVis.prototype.updateData = function(data){
  this.displayData = data;
  this.updateVis();
}

/**
 * the drawing function - should use the D3 selection, enter, exit
 * @param _options -- only needed if different kinds of updates are needed
 */
TimeVis.prototype.updateVis = function(){
	var that = this;
  this.x.domain([0, that.displayData.length]);
  this.y.domain([0 , d3.extent(that.displayData)[1]]);

  // updates axis
  this.svg.select(".x-axis")
    .call(that.xAxis);

  this.svg.select(".y-axis")
    .call(that.yAxis)

  // updates graph
  var path = this.svg.selectAll(".area")
    .data([this.displayData])

  path.enter()
    .append("path")
    .attr("class", "area");

  path
    .transition().duration(0)
    .attr("d", this.area);

  path.exit()
    .remove();

}