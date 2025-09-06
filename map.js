// Initialize the map
const map = L.map('map').setView([37, -100], 4);

// Base map tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// FEMA Open Shelters GeoJSON endpoint (all fields)
const DATA_URL = "https://gis.fema.gov/arcgis/rest/services/NSS/OpenShelters/MapServer/0/query?where=1=1&outFields=*&f=geojson";

// Fetch and plot shelters
fetch(DATA_URL)
  .then(res => res.json())
  .then(data => {
    console.log("Full FEMA data:", data); // See all available fields in console

    data.features.forEach(f => {
      const coords = f.geometry.coordinates;
      const p = f.properties; // correct variable

      L.marker([coords[1], coords[0]])
        .addTo(map)
        .bindPopup(`
          <b>${p.shelter_name}</b><br>
          ${p.address}, ${p.city}, ${p.state} ${p.zip}<br>
          Status: ${p.shelter_status || "Unknown"}<br>
          Capacity: ${p.evacuation_capacity || "N/A"}<br>
          Organization: ${p.org_name || "N/A"}
        `);
    });
  })
  .catch(err => console.error("Error loading FEMA data:", err));
