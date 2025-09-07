// ====== MAP SCRIPT (your existing code) ======
// Setup the map
const map = L.map('map').setView([37, -100], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let shelters = [];

// Custom marker icons
const blueIcon = new L.Icon({ iconUrl: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] });
const redIcon = new L.Icon({ iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] });
const yellowIcon = new L.Icon({ iconUrl: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] });

// Simple euclidean distance (can switch to haversine for more accuracy)
function findDistance(lat1, lon1, lat2, lon2) {
  const dx = lat2 - lat1;
  const dy = lon2 - lon1;
  return Math.sqrt(dx * dx + dy * dy);
}

// Fetch all FEMA Open Shelters (GeoJSON) via backend
async function fetchFEMAAll() {
  const DATA_URL = "http://localhost:5000/data";
  const res = await fetch(DATA_URL);
  const data = await res.json();

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
}

// Button click
document.getElementById("findBtn").addEventListener("click", async () => {
  if (!navigator.geolocation) {
    alert("GPS not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude, longitude } = pos.coords;

    // Load ALL FEMA shelters
    shelters = await fetchFEMAAll();

    // Remove any with bad coords
    shelters = shelters.filter(s => Number.isFinite(s.lat) && Number.isFinite(s.lng));

    if (shelters.length === 0) {
      alert("No shelters found.");
      return;
    }

    // Sort by distance
    shelters.sort((a, b) =>
      findDistance(latitude, longitude, a.lat, a.lng) -
      findDistance(latitude, longitude, b.lat, b.lng)
    );

    // Clear previous markers (keep tile layer)
    map.eachLayer(layer => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    // User marker
    L.marker([latitude, longitude], { icon: yellowIcon })
      .addTo(map)
      .bindPopup("You are here")
      .openPopup();

    // Nearest shelter
    const nearest = shelters[0];

    // Plot all shelters
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