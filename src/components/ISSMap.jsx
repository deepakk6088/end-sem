import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const issIcon = L.divIcon({
  className: 'iss-marker',
  html: '<div class="iss-marker-ring"><span class="iss-marker-core"></span></div>',
  iconSize: [38, 38],
  iconAnchor: [19, 19],
})

function MapUpdater({ center }) {
  const map = useMap()

  useEffect(() => {
    if (!center) return
    map.setView(center, map.getZoom(), { animate: true, duration: 0.9 })
  }, [center, map])

  return null
}

export default function ISSMap({ positions }) {
  const current = positions[0]
  const center = current ? [current.lat, current.lng] : [10, 0]
  const path = positions.slice(0, 15).map((position) => [position.lat, position.lng])

  return (
    <div className="map-panel card inset-card">
      <div className="map-card-header">
        <div>
          <p className="panel-label">Live orbit map</p>
          <h2>ISS flight path</h2>
        </div>
        <span className="mini-chip">Last 15 positions</span>
      </div>
      <div className="map-wrapper">
        <MapContainer center={center} zoom={2} scrollWheelZoom={true} style={{ height: '460px' }}>
          <MapUpdater center={center} />
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {path.length > 1 && <Polyline positions={path} pathOptions={{ color: '#e75d48', weight: 4, opacity: 0.9 }} />}
          {current && (
            <Marker position={[current.lat, current.lng]} icon={issIcon}>
              <Popup>
                <div className="popup-body">
                  <strong>ISS Current Position</strong>
                  <p>{current.lat.toFixed(3)}, {current.lng.toFixed(3)}</p>
                  <p>{current.place}</p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  )
}
