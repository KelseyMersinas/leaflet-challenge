// Creating the map object
const myMap = L.map("map", {
  center: [36.7378, -119.7871],
  zoom: 6,
});

// Adding a tile layer to the map:
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(myMap);

// Use Fetch to return earthquake data from USGS
fetch(
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
)
  .then((response) => response.json())
  .then((data) => {
    // enter GeoJSON data on the map
    const geoJson = L.geoJSON(data, {
      // Define a style for the markers
      pointToLayer: (feature, latlng) => {
        return L.circleMarker(latlng, {
          // base size of marker on magnitude
          radius: Math.sqrt(feature.properties.mag) * 7,
          // base colors off depth
          fillColor: getColor(feature.geometry.coordinates[2]),
          color: "black",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8,
        });
      },
      // Add tooltips
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          const depth = feature.geometry.coordinates[2];
          const magnitude = feature.properties.mag;
          const location = `Lat: ${feature.geometry.coordinates[1]}, Lon: ${feature.geometry.coordinates[0]}`;
          layer.bindTooltip(
            `
        <div>
          <strong>Depth:</strong> ${depth} km<br>
          <strong>Magnitude:</strong> ${magnitude}<br>
          <strong>Location:</strong> ${location}
        </div>
      `,
            { sticky: true }
          );
        }
      },
    }).addTo(myMap);

    // Set up the legend.
    const legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
      const div = L.DomUtil.create("div", "info legend");
      // add styles to div
      div.style.background = "white";
      div.style.padding = "10px";
      div.style.minWidth = "60px";
      // build legend
      const limits = ["0-20", "21-50", "51-100", "100+"];
      const colors = ["#fee08b", "#fdae61", "#f46d43", "#d73027"];
      const labels = [];

      limits.forEach(function (limit, index) {
        labels.push(
          '<li style="display: flex; align-items: center; gap: 4px;"><span style="display: block; height: 15px; width: 15px; background-color: ' +
            colors[index] +
            '"></span>' +
            limit +
            "</li>"
        );
      });

      div.innerHTML =
        '<ul style="list-style: none; padding: 0;">' +
        labels.join("") +
        "</ul>";
      return div;
    };

    // Adding the legend to the map
    legend.addTo(myMap);
  })
  .catch((error) => console.error("Error fetching earthquake data:", error));

// Function to determine color based on depth
function getColor(depth) {
  return depth > 100
    ? "#d73027"
    : depth > 50
    ? "#f46d43"
    : depth > 20
    ? "#fdae61"
    : "#fee08b";
}
