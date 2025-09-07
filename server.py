from flask import Flask, jsonify, send_file, send_from_directory
from flask_cors import CORS
import requests
import json
import os

app = Flask(__name__, static_folder='.')
CORS(app)  # Enable CORS for all routes
LOCAL_FILE = "Open_Shelters.geojson"
FEMA_URL = "https://gis.fema.gov/arcgis/rest/services/NSS/OpenShelters/MapServer/0/query?where=1=1&outFields=*&f=geojson"

# Route to serve the main HTML page
@app.route("/")
def index():
    return send_file("index.html")

# Route to serve static files (CSS, JS, etc.)
@app.route("/<path:filename>")
def serve_static(filename):
    return send_from_directory('.', filename)

# Route to fetch data
@app.route("/data")
def get_data():
    try:
        r = requests.get(FEMA_URL)
        r.raise_for_status()
        data = r.json()
        # Save local backup
        with open(LOCAL_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("Updated local backup.")
        return jsonify(data)
    except Exception as e:
        print("Error fetching online data:", e)
        # Serve local backup if online fails
        if os.path.exists(LOCAL_FILE):
            return send_file(LOCAL_FILE)
        else:
            return jsonify({"error": "No data available"}), 500

if __name__ == "__main__":
    app.run(debug=True)