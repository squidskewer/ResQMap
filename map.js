// Default map setup
const map = L.map('map').setView([37, -100], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Custom marker icons (using local files for offline support)
const blueIcon = new L.Icon({ iconUrl: 'icons/blue-dot.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] });
const redIcon = new L.Icon({ iconUrl: 'icons/red-dot.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] });
const yellowIcon = new L.Icon({ iconUrl: 'icons/yellow-dot.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] });

// Simple distance function
function findDistance(lat1, lon1, lat2, lon2) {
  const dx = lat2 - lat1;
  const dy = lon2 - lon1;
  return Math.sqrt(dx * dx + dy * dy);
}

// Fetch all FEMA shelters
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
        status: p.shelter_status || "Unknown", // FEMA status
        capacity: p.evacuation_capacity || "N/A",
        organization: p.org_name || "N/A",
        lat: coords ? coords[1] : null,
        lng: coords ? coords[0] : null,
        userStatus: "N/A" // default user status
      };
    });
  } catch (error) {
    console.error("Failed to load local GeoJSON:", error);
    throw new Error("Could not load shelter data from local file");
  }
}

let allShelters = [];
let shelterMarkers = [];

// Load shelters on page load
(async function loadAllShelters() {
  try {
    allShelters = await fetchFEMAAll();

    // Plot shelters on map
    allShelters.forEach(s => {
      if (Number.isFinite(s.lat) && Number.isFinite(s.lng)) {
        const marker = L.marker([s.lat, s.lng], { icon: blueIcon })
          .addTo(map)
          .bindPopup(`
            <b>${s.name}</b><br>
            ${s.address}, ${s.city}, ${s.state} ${s.zip}<br>
            FEMA Status: ${s.status}<br>
            User Status: ${s.userStatus}<br>
            Capacity: ${s.capacity}<br>
            Organization: ${s.organization}
          `);
        shelterMarkers.push({ marker, data: s });
      }
    });

    // Populate dropdown and table
    populateShelterDropdown();

  } catch (err) {
    console.error("Error loading shelters:", err);
  }
})();

// Populate shelter dropdown and table
function populateShelterDropdown() {
  const shelterSelect = document.getElementById("shelterSelect");
  const statusTableBody = document.querySelector("#statusTable tbody");

  shelterSelect.innerHTML = "";
  statusTableBody.innerHTML = "";

  allShelters.forEach(shelter => {
    // Dropdown option
    const opt = document.createElement("option");
    opt.value = shelter.name;
    opt.textContent = shelter.name;
    shelterSelect.appendChild(opt);

    // Table row
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${shelter.name}</td>
      <td class="status-cell">${shelter.userStatus}</td>
    `;
    statusTableBody.appendChild(row);
  });
}

// Update status table on button click
document.getElementById("updateStatusBtn").addEventListener("click", () => {
  const selectedShelter = document.getElementById("shelterSelect").value;
  const selectedStatus = document.getElementById("statusSelect").value;

  // Update table
  const rows = document.querySelectorAll("#statusTable tbody tr");
  rows.forEach(row => {
    if (row.cells[0].textContent === selectedShelter) {
      row.cells[1].textContent = selectedStatus;
    }
  });

  // Update marker popup and stored userStatus
  shelterMarkers.forEach(sm => {
    if (sm.data.name === selectedShelter) {
      sm.data.userStatus = selectedStatus; // store new user status
      sm.marker.setPopupContent(`
        <b>${sm.data.name}</b><br>
        ${sm.data.address}, ${sm.data.city}, ${sm.data.state} ${sm.data.zip}<br>
        FEMA Status: ${sm.data.status}<br>
        User Status: ${sm.data.userStatus}<br>
        Capacity: ${sm.data.capacity}<br>
        Organization: ${sm.data.organization}
      `);
    }
  });
});

// Find nearest shelter button logic
document.getElementById("findBtn").addEventListener("click", () => {
  const btn = document.getElementById("findBtn");
  btn.textContent = "Locating...";

  if (!navigator.geolocation) {
    alert("GPS not supported");
    btn.textContent = "Find Nearest Shelter";
    return;
  }

  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;

    try {
      // Remove old user marker
      if (window.userMarker) {
        map.removeLayer(window.userMarker);
      }

      // Add user marker
      window.userMarker = L.marker([latitude, longitude], { icon: yellowIcon })
        .addTo(map)
        .bindPopup("You are here")
        .openPopup();

      if (allShelters.length > 0) {
        // Find nearest with valid coords
        const validShelters = allShelters.filter(s => Number.isFinite(s.lat) && Number.isFinite(s.lng));
        const nearest = [...validShelters].sort((a, b) => // Sort by distance
          findDistance(latitude, longitude, a.lat, a.lng) -
          findDistance(latitude, longitude, b.lat, b.lng)
        )[0];

        // Find the existing marker object and change its icon to red
        const nearestMarkerObj = shelterMarkers.find(sm => sm.data.name === nearest.name);
        if (nearestMarkerObj) {
          nearestMarkerObj.marker.setIcon(redIcon);
          nearestMarkerObj.marker.openPopup();
          map.fitBounds([
            [latitude, longitude],
            [nearest.lat, nearest.lng]
          ], { padding: [50, 50] });
        }
      }

    } catch (err) {
      console.error("Error locating nearest shelter:", err);
      alert("Something went wrong while locating shelters.");
    }

    btn.textContent = "Find Nearest Shelter";
  }, () => {
    alert("Unable to retrieve your location.");
    btn.textContent = "Find Nearest Shelter";
  });
});

// Dropdown toggle logic
document.querySelectorAll('.dropdown-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const dropdown = btn.parentElement;
    dropdown.classList.toggle('active');
  });
});