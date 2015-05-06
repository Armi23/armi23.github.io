// Contains the code for density based SIR model 

// Global data storage
var infected_blocks = []
var not_surrounded = []
var list_of_blocks = {}
var dim = 20.0
var origin = 0;

// Global access parameters
beta = 0.0;
kill = 0.0;
stepLimit = 100;

// Passed to geocode to filter important info and create blocks
function infectBlockCallback (geocode, lat, lng, options) {
  var country = getCountry(geocode);
  infectBlockCountry(lat, lng, country, options[0], options[1]);
}

// Creates the blocks for simulated infection
function infectBlockCountry (lat, lng, country, x_index, y_index) {
  var people_density = densities[country];
  var block = {"S": people_density * dim * dim - 1, 
      "I": 1.0, 
      "R": 0.0, 
      "lat": lat, 
      "lng": lng, 
      "x": x_index, 
      "y": y_index,
      "country": country
  }

  if (!(x_index in list_of_blocks)) {
    list_of_blocks[x_index] = {};
  }

  infected_blocks.push([x_index, y_index, country])
  not_surrounded.push([x_index, y_index, country])
  list_of_blocks[x_index][y_index] = block;
}

// Infections a new block in the direction of dir from fromBlock. 
function infectBlock(fromBlock, dir, options) {
  lat1 = fromBlock.lat
  lng1 = fromBlock.lng
  new_lat_lng = newLatLng(lat1, lng1, dir);
  requestGeocode(new_lat_lng[0], new_lat_lng[1], infectBlockCallback, options)
};

// Runs one step of the SIR model on the block j
function SIR (j) {
  coord = infected_blocks[j]
  block = list_of_blocks[coord[0]][coord[1]]

  S = block.S;
  I = block.I;
  R = block.R;
  N = S + I + R;

  block.S -= beta * S * I;
  block.I += (beta - kill) * S * I;
  block.R += kill * S * I;

  block.S = Math.max(0, block.S);
  block.I = Math.max(0, block.I);
  block.R = Math.max(0, block.R);

  if (block.I <= 0) {
    infected_blocks.splice(j, 1);
  }
}

// Filters out country from geocode information
function getCountry (geocode) {
  // Iterate through properties of result to find country
  var comp = "address_components"; // Key to parse out country names
  var country = null;
  for (var i = 0; i < geocode[comp].length; i++) {
      if (geocode[comp][i].types[0] == "country") {
          country = geocode[comp][i]["long_name"];
      }
  };

  if (country == null) {
      alert("Could not find country");
  }

  return country;
}

// Start the infection from this point
function launchModel (geocode, lat, lng) {

  // Click location is site of first Zombie
  var country = getCountry(geocode)
  var starter_block = infectBlockCountry(lat, lng, country, origin, origin)
  origin += 100;
  d3.select("#originBox").text(lat.toFixed(2) + ", " + lng.toFixed(2));

  // Enable start button
  $("#start").prop("disabled", false);
}

// Runs simulation
var animation_interval;
function runAnimation () {
  var timesRun = 0
  playing = true;
  $("#start").prop("value", "Pause");
  animation_interval = window.setInterval(function() {
    for (var j = 0; j < infected_blocks.length; j++) {
      SIR(j)
    };
    spread();
    mapVis(list_of_blocks);

    timesRun += 1
    console.log("Times run: " + timesRun);
    if (timesRun >= stepLimit) {
      clearInterval(animation_interval);
    }

  }, 5000)
}

// Find all the locations around this block that are not infected
function vulnerable_neighbors (x, y) {
  vulnerable = [];
  list = calculate_Neighbors(x, y);

  for (var dir in list) {
    item = list[dir]
    i = item[0]
    j = item[1]
    if (list_of_blocks[i] == undefined || (list_of_blocks[i][j] == null)) {
      vulnerable.push(item)
    }
  }

  return vulnerable;
}

// Stochastically have a zombie spread into new places
function spread () {

  // Select number of zombies that will spread. Limited by Google Maps API
  spreading_zombies = Math.floor(Math.random() * 3);
  for (var i = 0; i < spreading_zombies; i++) {

    // Select a block to spread from
    var point_index = Math.floor(Math.random() * not_surrounded.length);
    var point = not_surrounded[point_index];

    // Get a list of uninfected neighbors and select one of them randomly
    var vulnerable_list = vulnerable_neighbors(point[0], point[1]);
    var targetIndex = Math.floor(Math.random() * vulnerable_list.length);
    var target = vulnerable_list[targetIndex];

    // If this block is surrounded by infected, remove it. 
    if (vulnerable_list.length == 1) {
      not_surrounded.splice(point_index, 1);
    } else if (vulnerable_list.length == 0) {
      not_surrounded.splice(point_index, 1);
      continue;
    }

    // Infect targeted block
    infectBlock(list_of_blocks[point[0]][point[1]], target[2], [target[0], target[1]])
  };

  flying_zombies = Math.floor(Math.random() * 4);
  for (var i = 0; i < flying_zombies; i++) {
    // Select a block to spread from
    var point_index = Math.floor(Math.random() * not_surrounded.length);
    var point = not_surrounded[point_index];
    var country = point[2];

    // Get migration patterns for countries
    var export_vals = migrations[country];

    // get random number r in range 0 to sum
    var r = Math.floor(Math.random() * export_vals["sum"])

    var new_country;
    for (var key in export_vals) {
      if (key == "sum" ) {
        continue;
      }

      r -= export_vals[key];
      new_country = key;

      if (r <= 0) {
        break;
      } 
    }

    if (airports[new_country] == undefined || airports[new_country].length < 1) {
      continue;
    }

    var airport_index = Math.floor(Math.random() * airports[new_country].length);
    var airport = airports[new_country][airport_index];
    infectBlockCountry(airport.lat, airport.lng, new_country, origin, origin);
    origin += 100;
  };
}

// Get the lat/long of a block in the given direction
function newLatLng (lat1, lng1, brng) {
  var lat2 = lat1
  var lng2 = lng2

  if (brng[0] == "N") {
    lat2 = lat1 + dim / 110.574 
  } else if (brng[0] == "S") {
    lat2 = lat1 - dim / 110.574 
  }

  if (brng[0] == "E" || brng[1] == "E") {
    lng2 = lng1 + dim / (111.320 * Math.cos(lat1)) 
  } else if (brng[0] == "W" || brng[1] == "W") {
    lng2 = lng1 - dim / (111.320 * Math.cos(lat1))
  }

  return [lat2, lng2]
}

// Get list of neighbors around a block
function calculate_Neighbors (x_index, y_index) {
  return [
    [x_index - 1, y_index + 1, "NW"],
    [x_index, y_index + 1, "N"],
    [x_index + 1, y_index + 1, "NE"],
    [x_index - 1, y_index, "W"],
    [x_index + 1, y_index, "E"],
    [x_index - 1, y_index - 1, "SW"],
    [x_index, y_index - 1, "S"],
    [x_index + 1, y_index - 1, "SE"],
  ]
}