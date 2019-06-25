// Storing API endpoint into queryURL
var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Get data
d3.json(earthquakeURL, function(data) {
    createFeatures(data.features);
});

// Define function to run on each feature 
function createFeatures(earthquakeData) {
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h3>Magnitude: " + feature.properties.mag +"</h3><h3>Location: "+ feature.properties.place +
              "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
          },

          pointToLayer: function (feature, latlng) {
            return new L.circle(latlng,
              {radius: getRadius(feature.properties.mag),
              fillColor: getColor(feature.properties.mag),
              fillOpacity: .6,
              color: "#000",
              stroke: true,
              weight: .8
          })
        }
        });

    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Define map layers
    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiZGlteTEzIiwiYSI6ImNqbXNocG42ODAzZXgza28yZDh1OWtndGEifQ." +
    "-MYwn1UYQcumCt22eErCsw");
  
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiZGlteTEzIiwiYSI6ImNqbXNocG42ODAzZXgza28yZDh1OWtndGEifQ." +
    "-MYwn1UYQcumCt22eErCsw");

    var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiZGlteTEzIiwiYSI6ImNqbXNocG42ODAzZXgza28yZDh1OWtndGEifQ." +
    "-MYwn1UYQcumCt22eErCsw");
    
      // Define base maps
    var baseMaps = {
        "Outdoors": outdoors,
        "Light Map": lightMap,        
        "Satellite": satellite
    };

    // Create tectonic layer
    var tectonicPlates = new L.LayerGroup();

    // Create overlay object to hold overlay layer
    var overlayMaps = {
        "Earthquakes": earthquakes,
        "Tectonic Plates": tectonicPlates
    };

    // Create our map
    var myMap = L.map("map", {
        center: [30.06263, 31.24967],
        zoom: 1.5,
        layers: [outdoors, earthquakes, tectonicPlates]
        });

    // Add tectonic plates data
    d3.json(tectonicPlatesURL, function(tectonicData) {
        L.geoJson(tectonicData, {
            color: "yellow",
            weight: 2
        })
        .addTo(tectonicPlates);
    });

    //Add layer control to map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);


    // Set-up legend
    var legend = L.control({position: "bottomright"});

    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        grades = [0, 1, 2, 3, 4, 5];
        labels = [];

    // Add min & Max
    var legendInfo = "<h1>Earthquake<br></br> Magnitude</h1>"+   
        "<div class=\"labels\">" +
        "</div>";
    
    div.innerHTML = legendInfo;

    
    for (var i = 0; i < grades.length; i++) {
    // grades.forEach(function(limit, index)
        div.innerHTML +=
        '<i style="background: ' + getColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+') +
        "<ul>" + labels.join("") + "</ul>"
        ;
    };

    
    return div;
    };

    legend.addTo(myMap);
}

// Create color function
function getColor(magnitude) {
    if (magnitude > 5) {
        return 'red'
    } else if (magnitude > 4) {
        return 'orange'
    } else if (magnitude > 3) {
        return 'yellow'
    } else if (magnitude > 2) {
        return 'lightgreen'
    } else if (magnitude > 1) {
        return 'green'
    } else {
        return '#58C9CB'
    }
};

//Create radius function
function getRadius(magnitude) {
    return magnitude * 25000;
};