# ResQMap 🗺️

**Emergency Shelter Mapping and Status Tracking System**

A web-based application designed to help people locate and track the status of emergency shelters during natural disasters and crisis situations. Built for the EMP Hackathon "CrisisHack" (September 6-7, 2025).

## 🌟 Features

### Interactive Map
- **Real-time Shelter Locations**: Displays FEMA emergency shelters across the United States
- **GPS Integration**: Find your current location and locate the nearest shelter
- **Visual Status Indicators**: 
  - 🔵 Blue markers: Available shelters
  - 🔴 Red markers: Nearest shelter to your location
  - 🟡 Yellow markers: Your current location
- **Interactive Popups**: Click on any shelter marker to view detailed information

### Status Management
- **Real-time Status Updates**: Update shelter status with various conditions:
  - Open, Full, Closed
  - Flooded, Destroyed, Damaged
  - Under Maintenance, Evacuation in Progress
  - Power Outage, Medical Emergency
- **Status Tracking Table**: View all shelters and their current status in an organized table
- **User-friendly Interface**: Simple dropdown selections for easy status updates

### Emergency Preparedness
- **Comprehensive Disaster Guide**: Built-in information for various natural disasters:
  - Earthquakes, Tsunamis, Tornadoes
  - Hurricanes, Wildfires, Floods
  - Blizzards, House Fires, Chemical Spills
- **Safety Instructions**: Step-by-step guidance for each disaster type

## 🚀 Getting Started

### Prerequisites
- Python 3.7 or higher
- Modern web browser with JavaScript enabled
- Internet connection (for initial data fetch)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ResQMap
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the server**
   ```bash
   python server.py
   ```

4. **Open your browser**
   Navigate to `http://localhost:5000`

### Offline Usage
The application is designed to work offline after the initial data load:
- All map tiles and shelter data are cached locally
- Leaflet library files are included locally
- Last known location is stored in browser localStorage

## 🏗️ Architecture

### Frontend
- **HTML5**: Semantic structure with responsive design
- **CSS3**: Modern styling with dropdown animations and mobile-friendly layout
- **JavaScript**: Interactive map functionality and status management
- **Leaflet.js**: Open-source mapping library for interactive maps

### Backend
- **Flask**: Lightweight Python web framework
- **CORS**: Cross-origin resource sharing enabled
- **FEMA API Integration**: Real-time shelter data from FEMA's OpenShelters service

### Data Sources
- **FEMA OpenShelters API**: Official emergency shelter data
- **OpenStreetMap**: Map tiles and geographic data
- **Local GeoJSON**: Backup shelter data for offline functionality

## 📁 Project Structure

```
ResQMap/
├── index.html              # Main application page
├── map.js                  # Interactive map and status logic
├── style.css               # Application styling
├── server.py               # Flask backend server
├── requirements.txt        # Python dependencies
├── Open_Shelters.geojson   # Local shelter data backup
├── leaflet.css            # Leaflet map styling
├── leaflet.js             # Leaflet map library
├── icons/                 # Custom map markers
│   ├── blue-dot.png       # Available shelter marker
│   ├── red-dot.png        # Nearest shelter marker
│   └── yellow-dot.png     # User location marker
└── README.md              # This file
```

## 🎯 Usage Guide

### Finding Shelters
1. **Open the Map**: The application loads with shelters marked as blue dots
2. **Find Nearest Shelter**: Click "Find Nearest Shelter" to use GPS and locate the closest shelter
3. **View Details**: Click any shelter marker to see detailed information

### Updating Status
1. **Select Shelter**: Choose a shelter from the dropdown menu
2. **Select Status**: Choose the appropriate status from the status dropdown
3. **Update**: Click "Update Status" to apply changes
4. **View Changes**: See updated status in the table and on map popups

### Emergency Information
- **Map Usage**: Instructions for navigating the interactive map
- **Natural Disasters**: Comprehensive safety guides for various emergency situations

## 🔧 Technical Details

### Data Flow
1. **Server Startup**: Flask server fetches latest shelter data from FEMA API
2. **Data Caching**: Shelter data is cached locally in GeoJSON format
3. **Client Loading**: Browser loads cached data and displays on map
4. **Real-time Updates**: Status changes are reflected immediately in the UI

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Performance Features
- **Offline Support**: Works without internet after initial load
- **Responsive Design**: Optimized for desktop and mobile devices
- **Efficient Rendering**: Only renders visible map markers
- **Local Storage**: Caches user location and preferences

## 🤝 Contributing

This project was developed for the EMP Hackathon "CrisisHack". Contributions are welcome for:
- Additional disaster preparedness information
- Enhanced mapping features
- Mobile app development
- Accessibility improvements
- Performance optimizations

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Emergency Resources

**Important**: This application is for informational purposes only. In case of emergency:
- Call 911 for immediate assistance
- Follow official evacuation orders
- Monitor local emergency services and weather alerts
- Use official FEMA resources: [fema.gov](https://www.fema.gov)

## 📞 Support

For technical issues or questions about this application, please refer to the project documentation or contact the development team.

---

**Built with ❤️ for emergency preparedness and community safety**