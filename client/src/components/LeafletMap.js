import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Add custom popup styles
const popupStyles = `
  .custom-popup-dark .leaflet-popup-content-wrapper {
    background: #ffffff;
    color: #1f2937;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  }
  .custom-popup-dark .leaflet-popup-content {
    margin: 0;
    padding: 0;
  }
  .custom-popup-dark .leaflet-popup-tip {
    background: #ffffff;
  }
  
  .custom-popup-light .leaflet-popup-content-wrapper {
    background: #1f2937;
    color: white;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  }
  .custom-popup-light .leaflet-popup-content {
    margin: 0;
    padding: 0;
  }
  .custom-popup-light .leaflet-popup-tip {
    background: #1f2937;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = popupStyles;
  document.head.appendChild(styleSheet);
}

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const LeafletMap = ({ 
  center = [15.8497, 74.4977], 
  zoom = 12, 
  markers = [],
  height = "h-64"
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef([]);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (!mapRef.current) return;


    // Create map instance
    const map = L.map(mapRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false, // We'll add custom controls
      attributionControl: false
    });


    // Dark theme tile layer
    const darkTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '©OpenStreetMap, ©CartoDB',
      subdomains: 'abcd',
      maxZoom: 19
    });

    // Light theme tile layer
    const lightTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '©OpenStreetMap contributors',
      maxZoom: 19
    });

    // Add initial dark tile layer
    darkTileLayer.addTo(map);
    tileLayerRef.current = darkTileLayer;

    // Markers will be added in a separate useEffect

    // Custom zoom control with dark theme
    const zoomControl = L.control.zoom({
      position: 'bottomright',
      zoomInTitle: 'Zoom in',
      zoomOutTitle: 'Zoom out'
    });

    zoomControl.addTo(map);

    // Custom attribution with dark theme
    const attribution = L.control.attribution({
      position: 'bottomleft',
      prefix: '<span style="color: #fbbf24; font-size: 12px;">© OpenStreetMap contributors</span>'
    });

    attribution.addTo(map);


    // Store map instance
    mapInstanceRef.current = map;

    // Cleanup function
    return () => {
      // Clear markers
      markersRef.current.forEach(marker => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.removeLayer(marker);
        }
      });
      markersRef.current = [];
      
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [center, zoom]); // Only recreate map when center or zoom changes

  // Separate useEffect for markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markers.length) return;


    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(marker);
      }
    });
    markersRef.current = [];

    // Create custom marker icon with yellow/orange theme
    const customIcon = L.divIcon({
      html: `
        <div style="
          background: linear-gradient(135deg, #fbbf24, #f97316);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: bold;
          color: black;
        ">🎓</div>
      `,
      className: 'custom-div-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    // Add new markers
    markers.forEach((marker, index) => {
      const leafletMarker = L.marker(marker.position, { icon: customIcon })
        .addTo(mapInstanceRef.current);
      
      if (marker.title) {
        // Create theme-aware popup content
        const popupContent = isDarkMode 
          ? marker.title.replace(/text-gray-800/g, 'text-gray-800').replace(/text-gray-600/g, 'text-gray-600').replace(/text-gray-500/g, 'text-gray-500')
          : marker.title.replace(/text-gray-800/g, 'text-gray-200').replace(/text-gray-600/g, 'text-gray-300').replace(/text-gray-500/g, 'text-gray-400');
        
        leafletMarker.bindPopup(popupContent, {
          maxWidth: 300,
          className: isDarkMode ? 'custom-popup-dark' : 'custom-popup-light'
        });
      }
      
      markersRef.current.push(leafletMarker);
    });
  }, [markers, isDarkMode]);

  const toggleMapMode = () => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    const map = mapInstanceRef.current;
    const mapContainer = mapRef.current;
    
    // Remove current tile layer
    map.removeLayer(tileLayerRef.current);

    if (isDarkMode) {
      // Switch to light mode
      const lightTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '©OpenStreetMap contributors',
        maxZoom: 19
      });
      lightTileLayer.addTo(map);
      tileLayerRef.current = lightTileLayer;
      
      // Add light mode class
      if (mapContainer) {
        mapContainer.classList.add('light-mode');
      }
    } else {
      // Switch to dark mode
      const darkTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '©OpenStreetMap, ©CartoDB',
        subdomains: 'abcd',
        maxZoom: 19
      });
      darkTileLayer.addTo(map);
      tileLayerRef.current = darkTileLayer;
      
      // Remove light mode class
      if (mapContainer) {
        mapContainer.classList.remove('light-mode');
      }
    }

    setIsDarkMode(!isDarkMode);
  };

  return (
    <div 
      className="relative w-full"
      style={{ height: height === "100%" ? "100%" : undefined }}
    >
      <div 
        ref={mapRef} 
        className="h-full w-full rounded-2xl"
        style={{ 
          backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
          borderRadius: '16px',
          height: '100%',
          minHeight: '400px' // Ensure minimum height
        }}
      />
      
      
      {/* Custom map controls overlay */}
      <div className="absolute top-4 right-4 flex space-x-2 z-[1000]">
        {/* Dark/Light Mode Toggle */}
        <button 
          className="bg-gray-800/80 backdrop-blur-sm border border-yellow-400/20 text-yellow-400 p-2 rounded-lg hover:bg-yellow-400/10 transition-all"
          onClick={toggleMapMode}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Location Button */}
        <button 
          className="bg-gray-800/80 backdrop-blur-sm border border-yellow-400/20 text-yellow-400 p-2 rounded-lg hover:bg-yellow-400/10 transition-all"
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView(center, zoom);
            }
          }}
          title="Reset to Center"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Zoom In Button */}
        <button 
          className="bg-gray-800/80 backdrop-blur-sm border border-yellow-400/20 text-yellow-400 p-2 rounded-lg hover:bg-yellow-400/10 transition-all"
          onClick={() => {
            if (mapInstanceRef.current) {
              const currentZoom = mapInstanceRef.current.getZoom();
              mapInstanceRef.current.setZoom(currentZoom + 1);
            }
          }}
          title="Zoom In"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </button>
      </div>

    </div>
  );
};

export default LeafletMap;
