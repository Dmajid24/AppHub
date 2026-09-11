import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import {
  ChevronRight,
  CircleAlert,
  Clock3,
  MapPin,
  RotateCcw,
  Server,
  X,
} from 'lucide-react';
import {
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import serverLocations from '../data/serverHealthData.json';
import '../style/ServerHealthMap_Style.css';

const INDONESIA_VIEW = {
  center: [-2.5, 117],
  zoom: 5,
};

const statusMeta = {
  healthy: {
    label: 'Sehat',
    color: '#1E9E6B',
  },
  warning: {
    label: 'Warning',
    color: '#DB9A2A',
  },
  critical: {
    label: 'Kritis',
    color: '#D3324A',
  },
  offline: {
    label: 'Offline',
    color: '#8992A8',
  },
};

function getServers(city) {
  return city?.dataCenters.flatMap(
    (dataCenter) => dataCenter.servers,
  ) ?? [];
}

function getAggregateStatus(servers) {
  if (!servers.length) {
    return 'offline';
  }

  const hasCriticalServiceImpact = servers.some((server) => {
    const serverProblem = ['critical', 'offline'].includes(
      server.status,
    );

    const primaryCriticalApplication =
      server.applications.some(
        (application) =>
          application.criticality === 'critical' &&
          application.role === 'Primary',
      );

    return serverProblem && primaryCriticalApplication;
  });

  if (hasCriticalServiceImpact) {
    return 'critical';
  }

  const hasProblem = servers.some((server) =>
    ['critical', 'warning', 'offline'].includes(server.status),
  );

  if (hasProblem) {
    return 'warning';
  }

  return 'healthy';
}

function getStatusSummary(servers) {
  return Object.keys(statusMeta).reduce(
    (summary, status) => {
      summary[status] = servers.filter(
        (server) => server.status === status,
      ).length;

      return summary;
    },
    {},
  );
}

function createClusterIcon(status, count, type = 'city') {
  const size = type === 'city' ? 48 : 42;

  return L.divIcon({
    className: 'server-map-marker-shell',
    html: `
      <div class="server-map-cluster marker-${status}">
        <span>${count}</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createServerIcon(status) {
  return L.divIcon({
    className: 'server-map-marker-shell',
    html: `
      <div class="server-map-node marker-${status}">
        <span></span>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function MapViewport({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: 0.8,
    });

    const timer = window.setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => window.clearTimeout(timer);
  }, [center, zoom, map]);

  return null;
}

function StatusBadge({ status }) {
  return (
    <span className={`server-status status-${status}`}>
      {statusMeta[status].label}
    </span>
  );
}

export default function ServerHealthMap() {
  const [selectedCityId, setSelectedCityId] =
    useState(null);

  const [selectedDataCenterId, setSelectedDataCenterId] =
    useState(null);

  const [selectedServerId, setSelectedServerId] =
    useState(null);

  const selectedCity = useMemo(() => {
    return (
      serverLocations.find(
        (city) => city.id === selectedCityId,
      ) ?? null
    );
  }, [selectedCityId]);

  const selectedDataCenter = useMemo(() => {
    return (
      selectedCity?.dataCenters.find(
        (dataCenter) =>
          dataCenter.id === selectedDataCenterId,
      ) ?? null
    );
  }, [selectedCity, selectedDataCenterId]);

  const selectedServer = useMemo(() => {
    return (
      selectedDataCenter?.servers.find(
        (server) => server.id === selectedServerId,
      ) ?? null
    );
  }, [selectedDataCenter, selectedServerId]);

  const mapView = useMemo(() => {
    if (selectedDataCenter) {
      return {
        center: selectedDataCenter.coordinates,
        zoom: 15,
      };
    }

    if (selectedCity) {
      return {
        center: selectedCity.coordinates,
        zoom: 10,
      };
    }

    return INDONESIA_VIEW;
  }, [selectedCity, selectedDataCenter]);

  function selectCity(city) {
    setSelectedCityId(city.id);
    setSelectedDataCenterId(null);
    setSelectedServerId(null);
  }

  function selectDataCenter(dataCenter) {
    setSelectedDataCenterId(dataCenter.id);
    setSelectedServerId(null);
  }

  function resetMap() {
    setSelectedCityId(null);
    setSelectedDataCenterId(null);
    setSelectedServerId(null);
  }

  function backToCity() {
    setSelectedDataCenterId(null);
    setSelectedServerId(null);
  }

  return (
    <section className="server-health-panel">
      <div className="server-health-header">
        <div>
          <div className="server-title-row">
            <h2>Server Health Map</h2>

            <span className="server-demo-badge">
              <i />
              Data demo
            </span>
          </div>

          <p>
            Telusuri lokasi server dan aplikasi yang
            menggunakannya
          </p>
        </div>

        <div className="server-map-legend">
          {Object.entries(statusMeta).map(
            ([status, item]) => (
              <span key={status}>
                <i
                  style={{
                    background: item.color,
                  }}
                />
                {item.label}
              </span>
            ),
          )}
        </div>
      </div>

      <div className="server-map-breadcrumb">
        <button
          type="button"
          className={!selectedCity ? 'current' : ''}
          onClick={resetMap}
        >
          Indonesia
        </button>

        {selectedCity && (
          <>
            <ChevronRight size={13} />

            <button
              type="button"
              className={
                !selectedDataCenter ? 'current' : ''
              }
              onClick={backToCity}
            >
              {selectedCity.name}
            </button>
          </>
        )}

        {selectedDataCenter && (
          <>
            <ChevronRight size={13} />

            <button
              type="button"
              className="current"
              onClick={() => setSelectedServerId(null)}
            >
              {selectedDataCenter.name}
            </button>
          </>
        )}

        <button
          type="button"
          className="server-reset-button"
          onClick={resetMap}
        >
          <RotateCcw size={13} />
          Reset map
        </button>
      </div>

      <div className="server-health-content">
        <div className="server-map-container">
          <MapContainer
            center={INDONESIA_VIEW.center}
            zoom={INDONESIA_VIEW.zoom}
            minZoom={5}
            maxZoom={18}
            scrollWheelZoom
            className="server-leaflet-map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapViewport
              center={mapView.center}
              zoom={mapView.zoom}
            />

            {!selectedCity &&
              serverLocations.map((city) => {
                const servers = getServers(city);
                const status =
                  getAggregateStatus(servers);

                return (
                  <Marker
                    key={city.id}
                    position={city.coordinates}
                    icon={createClusterIcon(
                      status,
                      servers.length,
                    )}
                    eventHandlers={{
                      click: () => selectCity(city),
                    }}
                  >
                    <Tooltip
                      permanent
                      direction="bottom"
                      offset={[0, 25]}
                      className="server-marker-label"
                    >
                      {city.name}
                    </Tooltip>
                  </Marker>
                );
              })}

            {selectedCity &&
              !selectedDataCenter &&
              selectedCity.dataCenters.map(
                (dataCenter) => {
                  const status = getAggregateStatus(
                    dataCenter.servers,
                  );

                  return (
                    <Marker
                      key={dataCenter.id}
                      position={dataCenter.coordinates}
                      icon={createClusterIcon(
                        status,
                        dataCenter.servers.length,
                        'data-center',
                      )}
                      eventHandlers={{
                        click: () =>
                          selectDataCenter(dataCenter),
                      }}
                    >
                      <Tooltip
                        permanent
                        direction="bottom"
                        offset={[0, 22]}
                        className="server-marker-label"
                      >
                        {dataCenter.name}
                      </Tooltip>
                    </Marker>
                  );
                },
              )}

            {selectedDataCenter &&
              selectedDataCenter.servers.map(
                (server) => (
                  <Marker
                    key={server.id}
                    position={server.coordinates}
                    icon={createServerIcon(
                      server.status,
                    )}
                    zIndexOffset={
                      selectedServerId === server.id
                        ? 1000
                        : 0
                    }
                    eventHandlers={{
                      click: () =>
                        setSelectedServerId(
                          server.id,
                        ),
                    }}
                  >
                    <Tooltip
                      permanent
                      direction="bottom"
                      offset={[0, 15]}
                      className="server-marker-label"
                    >
                      {server.id}
                    </Tooltip>
                  </Marker>
                ),
              )}
          </MapContainer>
        </div>

        <aside className="server-map-side-panel">
          {selectedServer ? (
            <ServerDetail
              server={selectedServer}
              onClose={() =>
                setSelectedServerId(null)
              }
            />
          ) : selectedDataCenter ? (
            <ServerList
              dataCenter={selectedDataCenter}
              onSelect={(server) =>
                setSelectedServerId(server.id)
              }
            />
          ) : selectedCity ? (
            <DataCenterList
              city={selectedCity}
              onSelect={selectDataCenter}
            />
          ) : (
            <CityList onSelect={selectCity} />
          )}
        </aside>
      </div>
    </section>
  );
}

function CityList({ onSelect }) {
  return (
    <>
      <div className="server-side-header">
        <div>
          <h3>Lokasi server</h3>
          <p>Pilih kota pada map atau daftar</p>
        </div>

        <MapPin size={18} />
      </div>

      <div className="server-location-list">
        {serverLocations.map((city) => {
          const servers = getServers(city);
          const status =
            getAggregateStatus(servers);
          const summary =
            getStatusSummary(servers);

          return (
            <button
              type="button"
              key={city.id}
              onClick={() => onSelect(city)}
            >
              <i
                className={`server-list-dot status-${status}`}
              />

              <span className="server-list-copy">
                <b>{city.name}</b>
                <small>
                  {summary.healthy} sehat ·{' '}
                  {summary.warning} warning ·{' '}
                  {summary.critical} kritis ·{' '}
                  {summary.offline} offline
                </small>
              </span>

              <strong>{servers.length}</strong>
              <ChevronRight size={15} />
            </button>
          );
        })}
      </div>

      <p className="server-map-helper">
        Warna kota dihitung berdasarkan kondisi server
        dan dampak terhadap aplikasi utama.
      </p>
    </>
  );
}

function DataCenterList({ city, onSelect }) {
  return (
    <>
      <div className="server-side-header">
        <div>
          <h3>Data center di {city.name}</h3>
          <p>
            {getServers(city).length} server pada{' '}
            {city.dataCenters.length} lokasi
          </p>
        </div>

        <MapPin size={18} />
      </div>

      <div className="server-location-list">
        {city.dataCenters.map((dataCenter) => {
          const status = getAggregateStatus(
            dataCenter.servers,
          );

          return (
            <button
              type="button"
              key={dataCenter.id}
              onClick={() => onSelect(dataCenter)}
            >
              <i
                className={`server-list-dot status-${status}`}
              />

              <span className="server-list-copy">
                <b>{dataCenter.name}</b>
                <small>{dataCenter.address}</small>
              </span>

              <strong>
                {dataCenter.servers.length}
              </strong>

              <ChevronRight size={15} />
            </button>
          );
        })}
      </div>
    </>
  );
}

function ServerList({ dataCenter, onSelect }) {
  const summary = getStatusSummary(
    dataCenter.servers,
  );

  return (
    <>
      <div className="server-side-header">
        <div>
          <h3>Server di {dataCenter.name}</h3>
          <p>
            {summary.healthy} sehat ·{' '}
            {summary.warning} warning ·{' '}
            {summary.critical} kritis ·{' '}
            {summary.offline} offline
          </p>
        </div>

        <Server size={18} />
      </div>

      <div className="server-location-list">
        {dataCenter.servers.map((server) => (
          <button
            type="button"
            key={server.id}
            onClick={() => onSelect(server)}
          >
            <i
              className={`server-list-dot status-${server.status}`}
            />

            <span className="server-list-copy">
              <b>{server.id}</b>
              <small>{server.hostname}</small>
            </span>

            <span className="server-app-count">
              {server.applications.length} aplikasi
            </span>

            <ChevronRight size={15} />
          </button>
        ))}
      </div>

      <p className="server-map-helper">
        Klik marker atau nama server untuk melihat
        detail.
      </p>
    </>
  );
}

function ServerDetail({ server, onClose }) {
  return (
    <div>
      <div className="server-side-header">
        <div>
          <div className="server-detail-title">
            <h3>{server.id}</h3>
            <StatusBadge status={server.status} />
          </div>

          <p>
            {server.hostname} · {server.environment}
          </p>
        </div>

        <button
          type="button"
          className="server-detail-close"
          onClick={onClose}
          aria-label="Tutup detail server"
        >
          <X size={17} />
        </button>
      </div>

      <div className="server-identity">
        <span>
          <MapPin size={13} />
          {server.ipAddress}
        </span>

        <span>
          <Server size={13} />
          {server.rack}
        </span>

        <span>
          <Clock3 size={13} />
          {server.lastCheck}
        </span>
      </div>

      <div className="server-metric-grid">
        <Metric
          label="CPU"
          value={`${server.cpu}%`}
          danger={server.cpu >= 90}
        />

        <Metric
          label="RAM"
          value={`${server.memory}%`}
          danger={server.memory >= 85}
        />

        <Metric
          label="Disk"
          value={`${server.disk}%`}
          danger={server.disk >= 85}
        />

        <Metric
          label="Uptime"
          value={`${server.uptime}%`}
        />
      </div>

      <div className="server-detail-section">
        <h4>
          Digunakan oleh {server.applications.length}{' '}
          aplikasi
        </h4>

        <div className="server-application-list">
          {server.applications.map((application) => (
            <div
              key={`${application.name}-${application.role}`}
            >
              <span>{application.name}</span>
              <em>{application.role}</em>
            </div>
          ))}
        </div>
      </div>

      <div className="server-detail-section">
        <h4>Informasi server</h4>

        <div className="server-information-list">
          <div>
            <span>Operating system</span>
            <b>{server.operatingSystem}</b>
          </div>

          <div>
            <span>Response time</span>
            <b>
              {server.responseTime
                ? `${server.responseTime} ms`
                : 'Tidak tersedia'}
            </b>
          </div>
        </div>
      </div>

      {server.alerts.length > 0 && (
        <div className="server-alert-box">
          <CircleAlert size={15} />

          <div>
            <b>Alarm aktif</b>

            {server.alerts.map((alert) => (
              <span key={alert}>{alert}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  danger = false,
}) {
  return (
    <div className={danger ? 'metric-danger' : ''}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}