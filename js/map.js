d3.select(window).on("resize", throttle);

var zoom = d3.behavior.zoom()
  .scaleExtent([1, 9])
  .on("zoom", move);


var width = document.getElementById('container').offsetWidth;
var height = width / 2;

var topo,projection,path,svg,g;

var graticule = d3.geo.graticule();

var tooltip = d3.select("#container").append("div").attr("class", "tooltip hidden");

setup(width,height);

function setup(width,height){
  projection = d3.geo.mercator()
    .translate([(width/2), (height/2)])
    .scale( width / 2 / Math.PI);

  path = d3.geo.path().projection(projection);

  svg = d3.select("#container").append("svg")
      .attr("width", width)
      .attr("height", height)
      .call(zoom)
      .on("click", click)
      .append("g");

  g = svg.append("g");
}

d3.json("data/world-topo-min.json", function(error, world) {

  var countries = topojson.feature(world, world.objects.countries).features;

  topo = countries;
  draw(topo);

});

function draw(topo) {

  svg.append("path")
     .datum(graticule)
     .attr("class", "graticule")
     .attr("d", path);


  g.append("path")
   .datum({type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
   .attr("class", "equator")
   .attr("d", path);


  var country = g.selectAll(".country").data(topo);

  country.enter().insert("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("id", function(d,i) { return d.id; })
      .attr("title", function(d,i) { return d.properties.name; })
      .style("fill", "green");        //function(d, i) { return d.properties.color; });

  //offsets for tooltips
  var offsetL = document.getElementById('container').offsetLeft+20;
  var offsetT = document.getElementById('container').offsetTop+10;

  //tooltips
  country
    .on("mousemove", function(d,i) {

      var country_name = d.properties.name
      var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );

      tooltip.classed("hidden", false)
             .attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
             .html(country_name);

      })
      .on("mouseout",  function(d,i) {
        tooltip.classed("hidden", true);
      })
      .on("mouseover", function(d, i) {
        h_country = d.properties.name;
        $(MyEventHandler).trigger("hover", 
                  {
                    "counts": country_data[h_country],
                    "country": h_country
                  })
      });
}


function redraw() {
  width = document.getElementById('container').offsetWidth;
  height = width / 2;
  d3.select('svg').remove();
  setup(width,height);
  draw(topo);
}


function move() {

  var t = d3.event.translate;
  var s = d3.event.scale;
  zscale = s;
  var h = height/4;


  t[0] = Math.min(
    (width/height)  * (s - 1),
    Math.max( width * (1 - s), t[0] )
  );

  t[1] = Math.min(
    h * (s - 1) + h * s,
    Math.max(height  * (1 - s) - h * s, t[1])
  );

  zoom.translate(t);
  g.attr("transform", "translate(" + t + ")scale(" + s + ")");

  //adjust the country hover stroke width based on zoom level
  d3.selectAll(".country").style("stroke-width", 0.5 / s)
      .on("mouseover", function(d,i) {
        d3.select(this).style("stroke-width", 1.5 / s)
        })
      .on("mouseout", function(d,i) {
        d3.select(this).style("stroke-width", 0.5 / s)
        })
}

var throttleTimer;
function throttle() {
  window.clearTimeout(throttleTimer);
    throttleTimer = window.setTimeout(function() {
      redraw();
    }, 200);
}


//geo translation on mouse click in map
function click() {
  if (list_of_blocks[0] == undefined) {
    var latlon = projection.invert(d3.mouse(this));
    var country = clickCountry(latlon[1], latlon[0]);
  }
}


//function to add points and text to the map (used in plotting capitals)
function addpoint(lat,lon,text) {
  var gpoint = g.append("g").attr("class", "gpoint");
  var x = projection([lon, lat])[0];
  var y = projection([lon, lat])[1];

  gpoint.append("svg:circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("class","point")
        .attr("r", 10);

  //conditional in case a point has no associated text
  if(text.length>0){

    gpoint.append("text")
          .attr("x", x+2)
          .attr("y", y+2)
          .attr("class","text")
          .text(text);
  }

}

var year = 2013 // Latest density models use densities from 2013
var country_index = 5 // For google reverse geocoding
var airports = {}
var densities = {}
var migrations = {}
var areas = {}

$(function() {
  d3.csv("data/airports.dat", function(csv) {
    for (var i = 0; i < csv.length; i++) {
      if (!(csv[i].country in airports)) {
        airports[csv[i].country] = []
      }

      new_aiport = {
        "lat": csv[i].lat,
        "lng": csv[i].lng,
        "id": csv[i].id
      }

      airports[csv[i].country].push(new_aiport)
    };
  });

  d3.csv("data/densities.csv", function(csv) {
    for (var i = 0; i < csv.length; i++) {
      densities[csv[i]["Country Name"]] = csv[i][year]
    };
  });

  d3.csv("data/migration.csv", function(csv) {
    for (var i = 0; i < csv.length; i++) {
      out_country = csv[i]["Source"]
      migrations[out_country] = {}
      migrations[out_country]["sum"] = 0

      for (var key in csv[i]) {
        migrations[out_country][key] = csv[i][key]
        var num = parseFloat(csv[i][key])
        if (!isNaN(num)) {
          migrations[out_country]["sum"] += num;
        }
      }
    };
  });

  d3.csv("data/area.csv", function(csv) {
    for (var i = 0; i < csv.length; i++) {
      areas[csv[i]["Country Name"]] = csv[i][year]
    };
  });
})

var timeline_data = []
var infected_counts = []
var timeline_country_data = []
var country_data = {}
function processGrid (grid) {
  data = [];
  infected = 0;
  country_data = {}
  for (var i in grid) {
    for (var j in grid[i]) {
      var block = grid[i][j];
      infected += block.I;
      data.push(block);
      if (!(block.country in country_data)) {
        country_data[block.country] = {"S": 0, "I": 0, "R": 0}
      }

      country_data[block.country].S += block.S
      country_data[block.country].I += block.I
      country_data[block.country].R += block.R
    }
  }

  timeline_data.push(data);
  infected_counts.push(infected)
  return data;
}

function colorCircle (d, i) {
  if (d.I > d.R) {
    return "#ff0000"
  }
  return "#0000ff";
}

function mapVis (grid) {
  data = processGrid(grid)
  var circles = g.selectAll("circle")
                  .data(data, key)

  circles.enter()
          .append("circle")
          .attr("cx", function(d, i) {
            return projection([d.lng, d.lat])[0];
          })
          .attr("cy", function(d, i) {
            return projection([d.lng, d.lat])[1];
          })
          .attr("r", 1)
          .attr("fill", function(d, i) {
            return colorCircle(d,i);
          })
          .style("opacity", 0.3)

  circles.transition()
          .duration(5)
          .attr("fill", function(d, i) {
            return colorCircle(d,i);
          })

  $(MyEventHandler).trigger("timeTick", 
                          {
                            "time": infected_counts,
                            "counts": country_data[h_country], 
                            "country": h_country
                          })

}

function key (d) {
  return d.x + "," + d.y;
}