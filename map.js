// Setup the map
// Set maximum bounds (FEMA only covers the US)
const map = L.map('map', {
  minZoom: 3,
  maxZoom: 18,
  zoomControl: true
}).setView([37, -100], 4);

map.setMaxBounds([
  [15, -180],
  [70, -50]
]);

// Add tile layer with fallback
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1hcCBUaWxlPC90ZXh0Pjwvc3ZnPg=='
}).addTo(map);

let shelters = [];

// Custom marker icons (using local files for offline support)
const blueIcon = new L.Icon({ iconUrl: 'icons/blue-dot.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] });
const redIcon = new L.Icon({ iconUrl: 'icons/red-dot.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] });
const yellowIcon = new L.Icon({ iconUrl: 'icons/yellow-dot.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] });

// Simple euclidean distance (can switch to haversine for more accuracy)
function findDistance(lat1, lon1, lat2, lon2) {
  const dx = lat2 - lat1;
  const dy = lon2 - lon1;
  return Math.sqrt(dx * dx + dy * dy);
}

// Load shelter data - same experience online/offline, just updates data first when online
async function fetchFEMAAll() {
  // Update GeoJSON if online
  if (navigator.onLine) {
    try {
      const DATA_URL = "http://localhost:5000/data";
      const res = await fetch(DATA_URL);
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('shelterData', JSON.stringify(data));
        console.log("Data updated from server");
      }
    } catch (error) {
      console.log("Could not update from server:", error.message);
    }
  }
  
  // Load data from GeoJSON
  try {
    const response = await fetch('./Open_Shelters.geojson');
    const data = await response.json();
    
    console.log(`Loaded ${data.features.length} shelters from local file`);
    
    return data.features.map(f => {
      const coords = f.geometry.coordinates;
      const p = f.properties;
      return {
        name: p.shelter_name || "Unnamed Shelter",
        address: p.address || "",
        city: p.city || "",
        state: p.state || "",
        zip: p.zip || "",
        status: p.shelter_status || "Unknown",
        capacity: p.evacuation_capacity || "N/A",
        organization: p.org_name || "N/A",
        lat: coords[1],
        lng: coords[0]
      };
    });
  } catch (error) {
    console.error("Failed to load local GeoJSON:", error);
    throw new Error("Could not load shelter data from local file");
  }
}

// Button click
document.getElementById("findBtn").addEventListener("click", async () => {
  if (!navigator.geolocation) {
    alert("GPS not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude, longitude } = pos.coords;

    // Load shelters
    shelters = await fetchFEMAAll();
    console.log(`Found ${shelters.length} shelters`);

    // Filter valid coordinates
    shelters = shelters.filter(s => Number.isFinite(s.lat) && Number.isFinite(s.lng));
    console.log(`After filtering: ${shelters.length} shelters`);

    if (shelters.length === 0) {
      alert("No shelters found.");
      return;
    }

    // Sort by distance
    shelters.sort((a, b) =>
      findDistance(latitude, longitude, a.lat, a.lng) -
      findDistance(latitude, longitude, b.lat, b.lng)
    );

    // Clear previous markers
    map.eachLayer(layer => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    // Add user marker
    L.marker([latitude, longitude], { icon: yellowIcon })
      .addTo(map)
      .bindPopup("You are here")
      .openPopup();

    // Add shelter markers
    const nearest = shelters[0];
    shelters.forEach(s => {
      const dist = findDistance(latitude, longitude, s.lat, s.lng);
      const icon = (s === nearest) ? redIcon : blueIcon;
      L.marker([s.lat, s.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <b>${s.name}</b><br>
          ${s.address}, ${s.city}, ${s.state} ${s.zip}<br>
          Status: ${s.status}<br>
          Capacity: ${s.capacity}<br>
          Organization: ${s.organization}<br>
          Distance: ${dist.toFixed(4)} units
        `);
    });

    // Fit map bounds
    const bounds = L.latLngBounds([
      [latitude, longitude],
      ...shelters.map(s => [s.lat, s.lng])
    ]);
    map.fitBounds(bounds, { padding: [50, 50] });
    
    console.log("Markers added successfully");
  });
});

// Dropdown toggle
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.dropdown-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const dropdown = btn.parentElement;
      dropdown.classList.toggle('active');
    });
  });
});