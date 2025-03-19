// src/MapComponent.js
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import L from 'leaflet';

const center = [41.1189, 1.2445];

// Custom Start Icon
const startIcon = new L.Icon({
  iconUrl: process.env.PUBLIC_URL + '/icons/start.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const SetViewToUserLocation = () => {
  const map = useMap();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => map.setView([latitude, longitude], 14),
        (error) => console.error('Geolocation error:', error.message)
      );
    }
  }, [map]);

  return null;
};

const getColor = (difficulty) => {
  switch (difficulty) {
    case 'green': return '#22c55e';
    case 'red': return '#dc2626';
    case 'black': return '#111827';
    default: return '#3b82f6';
  }
};

const onEachFeature = (feature, layer) => {
  if (feature.properties) {
    const propertyEntries = Object.entries(feature.properties).map(([key, value]) => (`
      <strong>${key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}:</strong> ${value}<br/>
    `)).join('');

    layer.bindPopup(`
      <div class="font-sans p-2">
        ${propertyEntries}
      </div>
    `);
  }
};

const MapComponent = () => {
  const [geojsonData, setGeojsonData] = useState(null);

  useEffect(() => {
    fetch('/runs.geojson')
      .then(res => res.json())
      .then(data => setGeojsonData(data))
      .catch(err => console.error("GeoJSON loading failed", err));
  }, []);

  const renderMarkers = () => {
    if (!geojsonData) return null;

    return geojsonData.features.map((feature, index) => {
      if (feature.geometry.type === 'LineString') {
        const startCoord = feature.geometry.coordinates[0];

        return (
          <Marker key={`start-${index}`} position={[startCoord[1], startCoord[0]]} icon={startIcon}>
            <Popup><strong>{feature.properties.name} (Start)</strong></Popup>
          </Marker>
        );
      }
      return null;
    });
  };

  return (
    <MapContainer center={center} zoom={14} style={{ height: "100vh" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <SetViewToUserLocation />

      {geojsonData && (
        <GeoJSON
          data={geojsonData}
          style={(feature) => ({
            color: getColor(feature.properties.difficulty),
            weight: 4,
          })}
          onEachFeature={onEachFeature}
        />
      )}

      {renderMarkers()}
    </MapContainer>
  );
};

export default MapComponent;
