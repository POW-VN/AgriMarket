import React, { useState, useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapPicker.css";

// Fix default leaflet marker icon issue in Vite/Webpack
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Helper component to center map when props coordinates change
function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

// Helper component to capture click events on map
function MapClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export const MapPicker = ({ latitude, longitude, onChange, defaultAddress }) => {
  const defaultCenter = [10.8231, 106.6297]; // HCMC coordinates as default
  const [position, setPosition] = useState(null);
  const markerRef = useRef(null);
  const hasAutoGeocodedRef = useRef(false);

  // Initialize position from props
  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const mapCenter = useMemo(() => {
    if (position) return position;
    return defaultCenter;
  }, [position]);

  // Handle marker drag-end event
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          onChange(latLng.lat, latLng.lng);
        }
      },
    }),
    [onChange]
  );

  const handleMapClick = (lat, lng) => {
    onChange(lat, lng);
  };

  // Robust geocoding helper that falls back by stripping specific fields if search yields no results
  const geocodeAddressText = React.useCallback(async (addressToGeocode = defaultAddress) => {
    if (!addressToGeocode || addressToGeocode.trim() === "" || addressToGeocode.includes("Not updated") || addressToGeocode.includes("Chưa có địa chỉ")) {
      return;
    }

    const parts = addressToGeocode.split(",").map(p => p.trim()).filter(Boolean);
    const queries = [];

    if (parts.length === 4) {
      const [street, ward, district, province] = parts;
      queries.push(`${street}, ${ward}, ${district}, ${province}`); // 1. Full address
      queries.push(`${street}, ${district}, ${province}`);         // 2. Street in District (skip Ward boundary mismatch)
      queries.push(`${ward}, ${district}, ${province}`);           // 3. Ward in District (skip Street if unrecognized)
      queries.push(`${district}, ${province}`);                   // 4. District only
      queries.push(province);                                     // 5. Province only
    } else if (parts.length === 3) {
      const [ward, district, province] = parts;
      queries.push(`${ward}, ${district}, ${province}`);
      queries.push(`${district}, ${province}`);
      queries.push(province);
    } else if (parts.length === 2) {
      const [district, province] = parts;
      queries.push(`${district}, ${province}`);
      queries.push(province);
    } else if (parts.length === 1) {
      queries.push(parts[0]);
    }

    const fallbackQueries = [...new Set(queries)].filter(Boolean);
    let success = false;
    let rateLimited = false;

    for (const queryText of fallbackQueries) {
      try {
        const query = encodeURIComponent(queryText);
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
          headers: {
            "User-Agent": "AgriMarket-Application/1.0",
          },
        });
        if (res.status === 429) {
          rateLimited = true;
          break;
        }
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            onChange(lat, lon, true);
            success = true;
            return; // Successful geocoding, exit loop
          }
        }
      } catch (err) {
        console.error(`Geocoding query "${queryText}" failed: `, err);
        // Note: Nominatim blocks CORS on 429 errors, which triggers a fetch TypeError (Failed to fetch).
        // If we catch a fetch failure, we set rateLimited = true to suggest the user click directly.
        rateLimited = true;
      }
    }

    if (!success) {
      if (rateLimited) {
        alert("Định vị thất bại do máy chủ bản đồ giới hạn số lượng yêu cầu (Rate Limit/CORS). Vui lòng ghim trực tiếp trên bản đồ bằng cách nhấp chuột hoặc thử lại sau 1-2 phút.");
      } else {
        alert("Không thể tìm thấy tọa độ khớp với địa chỉ đã nhập. Vui lòng nhấp trực tiếp vào bản đồ để chọn vị trí chính xác.");
      }
    }
  }, [defaultAddress, onChange]);

  // Auto-geocode address ONCE on mount if coordinates are empty/null and defaultAddress is present
  useEffect(() => {
    if (latitude && longitude) return;
    if (hasAutoGeocodedRef.current) return;

    if (!defaultAddress || defaultAddress.trim() === "" || defaultAddress.includes("Not updated") || defaultAddress.includes("Chưa có địa chỉ")) {
      return;
    }

    hasAutoGeocodedRef.current = true;
    const timer = setTimeout(() => {
      geocodeAddressText(defaultAddress);
    }, 1200);

    return () => clearTimeout(timer);
  }, [defaultAddress, latitude, longitude, geocodeAddressText]);

  return (
    <div className="map-picker-container">
      <div className="map-picker-header">
        <span className="map-picker-title">📍 Định vị vị trí chính xác trên bản đồ</span>
        {defaultAddress && !latitude && (
          <button
            type="button"
            className="map-geocode-btn"
            onClick={() => geocodeAddressText(defaultAddress)}
            title="Định vị nhanh dựa vào địa chỉ chữ đã nhập"
          >
            Định vị theo địa chỉ đã nhập
          </button>
        )}
      </div>

      <div className="map-wrapper-element">
        <MapContainer
          center={mapCenter}
          zoom={15}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ChangeMapView center={mapCenter} />
          <MapClickHandler onClick={handleMapClick} />
          {position && (
            <Marker
              draggable={true}
              eventHandlers={eventHandlers}
              position={position}
              ref={markerRef}
            />
          )}
        </MapContainer>
      </div>
      <p className="map-picker-hint">
        {position 
          ? `Tọa độ hiện tại: ${position[0].toFixed(6)}, ${position[1].toFixed(6)} (Bạn có thể nhấp chuột hoặc kéo thả ghim đỏ để chọn vị trí chính xác).`
          : "Chưa chọn vị trí trên bản đồ. Vui lòng nhấp vào bản đồ hoặc click nút 'Định vị theo địa chỉ đã nhập' để chọn."}
      </p>
    </div>
  );
};

export default MapPicker;
