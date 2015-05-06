/*
 *  Bar chart constructor
 */
BarChart = function(_parentElement){
  this.parentElement = _parentElement;
  this.displayData = [{"val": 0, "type": "S"}, {"val": 0, "type": "I"}, {"val": 0, "type": "R"}];

  this.margin = {top: 20, right: 30, bottom: 30, left: 30};
  this.width = 490 - this.margin.left - this.margin.right;
  this.height = 200 - this.margin.top - this.margin.bottom;

  this.domain = ["S", "I", "R"]

  this.initVis();
}


/*
 * Sets up Bar chart visualization
 */
BarChart.prototype.initVis = function(){
  var that = this; 

  // Construct SVG for visualization
  this.svg = this.parentElement.append("svg")
    .attr("width", this.width + this.margin.left + this.margin.right)
    .attr("height", this.height + this.margin.top + this.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

  // Create scales
  this.x = d3.scale.ordinal()
    .domain(that.domain)
    .rangeRoundBands([0, this.width], 0.05);

  this.y = d3.scale.linear()
    .range([this.height, 0]);
    
  // Add title
  this.svg.append("text")
    .attr("class", "text")
    .text("Hover Over Country")
    .attr("x", "20")
    .attr("y", "0")
    .attr("id", "barTitle");

  // Add axis
  this.svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + this.height + ")")

  this.svg.append("g")
    .attr("class", "y axis")
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    
  this.svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".25em")
    .attr("transform", "rotate(-90)")
    .text("Number of People/Country");

  // Add axes visual elements
  this.yAxis = d3.svg.axis()
    .scale(this.y)
    .orient("left")
    .tickFormat(d3.format("s"));

  this.xAxis = d3.svg.axis()
    .scale(this.x)
    .orient("bottom")

  // Need to reselect axis to update it with d3 svg axis
  this.svg.select(".x.axis")
    .call(this.xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .text(function(d, i) {
      return that.domain[i]; 
    })
    
  // Add label
  this.svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".25em")
    .attr("transform", "rotate(-90)")
    .text("Number of People/Country");

  // Add axes visual elements
  this.yAxis = d3.svg.axis()
    .scale(this.y)
    .orient("left")
    .tickFormat(d3.format("s"));

  this.xAxis = d3.svg.axis()
    .scale(this.x)
    .orient("bottom")

  // Need to reselect axis to update it with d3 svg axis
  this.svg.select(".x.axis")
    .call(this.xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .text(function(d, i) {
      return that.domain[i]; 
    })
  
  this.svg.select(".y.axis")
    .call(this.yAxis)

}


/*
 * Used by event handler to update data
 */
BarChart.prototype.updateData = function(data, bar_country){
  d3.select("#barTitle").text(bar_country); // Update title

  // Filter data
  if (data == undefined) {
    data = {"S": 0, "I": 0, "R": 0};
  }
  this.displayData[0].val = data.S;
  this.displayData[1].val = data.I;
  this.displayData[2].val = data.R;
  this.updateVis();
}


/*
 * Change bar chart
 */
BarChart.prototype.updateVis = function(){
  var that = this;
  var max = d3.extent(this.displayData, function(d) {return d.val})[1]
  this.y.domain([0, max]);

  this.svg.select(".y.axis")
      .call(this.yAxis)

  // updates graph
  var bar = this.svg.selectAll("rect")
                    .data(this.displayData, this.key)
  // Create bars
  bar.enter()
      .append("rect")
      .attr("x", function(d, i) {
        return that.x(d.type);
      })
      .attr("width", that.x.rangeBand())
      .attr("y", function(d, i) {
        return that.y(d.val);
      })
      .attr("height", function(d, i) {
        return that.height - that.y(d.val);
      })
      .style("fill", function(d, i) {
        if (i == 0) {
          return "#00ff00"
        }
        if (i == 1) {
          return "#ff0000"
        }

        return "#0000ff"
      })

  // Update existing bars
  bar.transition().duration(50)
      .attr("y", function(d, i) {
        return that.y(d.val);
      })
      .attr("height", function(d, i) {
        return that.height - that.y(d.val);
      })

  bar.exit()
   .remove();
}

// Key for handling data
BarChart.prototype.key = function (d) {
  return d.type
}