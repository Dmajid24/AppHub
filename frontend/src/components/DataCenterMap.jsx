import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import L from 'leaflet';
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  ZoomControl,
  useMap,
} from 'react-leaflet';

import {
  fetchDataCenterMap,
  fetchDataCenterServers,
} from '../services/infrastructure';

import 'leaflet/dist/leaflet.css';
import '../style/DataCenterMap.css';

const STORAGE_KEY = 'apphub:dc-map-selection';

const INDONESIA_BOUNDS = [
  [-11.5, 94.5],
  [6.5, 141.5],
];

const STATUS = {
  Healthy: { label: 'Sehat', color: '#199b70' },
  Online: { label: 'Sehat', color: '#199b70' },
  Warning: { label: 'Warning', color: '#e6a126' },
  Critical: { label: 'Kritis', color: '#e34761' },
  Offline: { label: 'Offline', color: '#697586' },
  Maintenance: { label: 'Maintenance', color: '#8580d7' },
  Unknown: { label: 'Belum diketahui', color: '#98a2b3' },
};

const SUMMARY_STATUS = {
  healthy: 'Healthy',
  warning: 'Warning',
  critical: 'Critical',
  offline: 'Offline',
  maintenance: 'Maintenance',
  unknown: 'Unknown',
};

function getStatus(value) {
  return STATUS[value] ?? STATUS.Unknown;
}

function normalizeCity(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

function aggregateStatus(summary) {
  const total = Object.values(summary).reduce((sum, value) => sum + value, 0);

  if (!total) return 'Unknown';
  if (summary.critical || summary.offline) return 'Critical';
  if (summary.warning) return 'Warning';
  if (summary.unknown) return 'Unknown';
  if (summary.maintenance) return 'Maintenance';
  return 'Healthy';
}

function createLocationIcon(status, totalServers, isCity, selected) {
  const meta = getStatus(status);
  const count = Number(totalServers);
  const safeCount = Number.isFinite(count) ? Math.max(0, count) : 0;
  const size = isCity ? 68 : 58;

  return L.divIcon({
    className: 'dc-location-icon',
    html: `
      <div
        class="dc-location-pin ${isCity ? 'is-city' : 'is-dc'} ${
          selected ? 'is-selected' : ''
        }"
        style="--marker-color: ${meta.color}"
      >
        <div class="dc-location-core">
          <span class="dc-location-number">${safeCount}</span>
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    tooltipAnchor: [0, size / 2 - 6],
  });
}

function StatusBadge({ status }) {
  const meta = getStatus(status);

  return (
    <span
      className="dc-status-badge"
      style={{ '--status-color': meta.color }}
    >
      {meta.label}
    </span>
  );
}

function HealthSummary({ summary }) {
  const entries = Object.entries(SUMMARY_STATUS).map(([key, status]) => ({
    key,
    count: Number(summary?.[key] ?? 0),
    ...getStatus(status),
  }));

  const total = entries.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="dc-health-summary">
      <div className="dc-composition-bar" aria-hidden="true">
        {entries.filter((item) => item.count > 0).map((item) => (
          <span
            key={item.key}
            style={{
              width: `${(item.count / total) * 100}%`,
              backgroundColor: item.color,
            }}
          />
        ))}
      </div>

      <div className="dc-composition-label">
        {total === 0
          ? 'Belum ada server'
          : entries
              .filter((item) => item.count > 0)
              .map((item) => `${item.count} ${item.label.toLowerCase()}`)
              .join(' · ')}
      </div>
    </div>
  );
}

// Padding kanan memberi ruang untuk panel mengambang.
// Marker tetap berada pada area peta yang terlihat.
function MapViewport({ city, dataCenter }) {
  const map = useMap();

  useEffect(() => {
    let frame;

    function fitView(animate) {
      map.invalidateSize({ pan: false });

      const wide = map.getContainer().clientWidth >= 900;
      const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      const bounds = dataCenter
        ? [
            [dataCenter.latitude, dataCenter.longitude],
            [dataCenter.latitude, dataCenter.longitude],
          ]
        : city
          ? city.dataCenters.map((dc) => [dc.latitude, dc.longitude])
          : INDONESIA_BOUNDS;

      map.fitBounds(bounds, {
        paddingTopLeft: [45, 55],
        paddingBottomRight: [wide ? 440 : 45, 90],
        maxZoom: dataCenter ? 14 : city ? 11 : 6,
        animate: animate && !reducedMotion,
        duration: 0.6,
      });
    }

    fitView(true);

    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => fitView(false));
    });

    observer.observe(map.getContainer());

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [map, city, dataCenter]);

  return null;
}

function LocationRow({ name, description, status, selected, onClick }) {
  const meta = getStatus(status);

  return (
    <button
      type="button"
      className={`dc-location-row ${selected ? 'is-active' : ''}`}
      style={{ '--row-color': meta.color }}
      onClick={onClick}
      aria-pressed={selected}
      title={`${name} · ${meta.label}`}
    >
      <i className="dc-row-dot" />
      <span className="dc-row-copy">
        <strong>{name}</strong>
        <small>{description}</small>
      </span>
      <span className="dc-row-arrow" aria-hidden="true">›</span>
    </button>
  );
}

function ServerPreview({ server, returnTo }) {
  const metrics = [
    ['CPU', server.cpuUsage],
    ['RAM', server.memoryUsage],
    ['Disk', server.diskUsage],
  ];

  return (
    <div className="dc-server-preview" key={server.serverId}>
      <div className="dc-server-title">
        <h4>{server.hostname}</h4>
        <StatusBadge status={server.status} />
      </div>

      <p className="dc-server-ip">{server.deviceIpAddress}</p>

      <div className="dc-mini-metrics">
        {metrics.map(([label, value]) => {
          const available =
            value != null && Number.isFinite(Number(value));
          const percentage = available
            ? Math.max(0, Math.min(100, Number(value)))
            : 0;

          return (
            <div key={label}>
              <span>{label}</span>
              <strong>{available ? `${value}%` : '-'}</strong>
              <div className="dc-mini-track" aria-hidden="true">
                <i style={{ width: `${percentage}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <p className="dc-server-app-count">
        Digunakan oleh <strong>{server.applications.length} aplikasi</strong>
      </p>

      <Link
        className="dc-map-server-detail-link"
        to={`/servers/${server.serverId}`}
        state={{ returnTo }}
      >
        Lihat detail server
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

export default function DataCenterMap() {
  const location = useLocation();

  const [savedSelection] = useState(() => {
    try {
      const value = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');

      return {
        cityKey: typeof value?.cityKey === 'string' ? value.cityKey : null,
        dcId: typeof value?.dcId === 'string' ? value.dcId : null,
        serverId: typeof value?.serverId === 'string' ? value.serverId : null,
      };
    } catch {
      return { cityKey: null, dcId: null, serverId: null };
    }
  });

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [selectedCityKey, setSelectedCityKey] = useState(savedSelection.cityKey);
  const [selectedDcId, setSelectedDcId] = useState(savedSelection.dcId);
  const [selectedServerId, setSelectedServerId] = useState(savedSelection.serverId);

  const [serverReloadKey, setServerReloadKey] = useState(0);
  const [serverSearch, setServerSearch] = useState('');
  const [serverState, setServerState] = useState({
    dcId: null,
    loading: false,
    error: '',
    servers: [],
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          cityKey: selectedCityKey,
          dcId: selectedDcId,
          serverId: selectedServerId,
        })
      );
    } catch {
      // Navigasi tetap berjalan jika storage browser tidak tersedia.
    }
  }, [selectedCityKey, selectedDcId, selectedServerId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const data = await fetchDataCenterMap();
        if (!cancelled) setLocations(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Gagal memuat data center.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const cities = useMemo(() => {
    const groups = new Map();

    for (const dc of locations) {
      const name = normalizeCity(dc.city);
      const key = name.toLowerCase();

      if (!groups.has(key)) {
        groups.set(key, { key, name, dataCenters: [] });
      }

      groups.get(key).dataCenters.push(dc);
    }

    return Array.from(groups.values()).map((city) => {
      const summary = {
        healthy: 0,
        warning: 0,
        critical: 0,
        offline: 0,
        maintenance: 0,
        unknown: 0,
      };

      for (const dc of city.dataCenters) {
        for (const key of Object.keys(summary)) {
          summary[key] += Number(dc.summary?.[key] ?? 0);
        }
      }

      return {
        ...city,
        latitude:
          city.dataCenters.reduce((sum, dc) => sum + dc.latitude, 0) /
          city.dataCenters.length,
        longitude:
          city.dataCenters.reduce((sum, dc) => sum + dc.longitude, 0) /
          city.dataCenters.length,
        totalServers: city.dataCenters.reduce(
          (sum, dc) => sum + dc.totalServers, 0
        ),
        summary,
        status: aggregateStatus(summary),
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [locations]);

  const selectedCity =
    cities.find((city) => city.key === selectedCityKey) ?? null;

  const selectedDc =
    selectedCity?.dataCenters.find((dc) => dc.id === selectedDcId) ?? null;

  const activeDcId = selectedDc?.id ?? null;

  useEffect(() => {
    if (!activeDcId) return;

    let cancelled = false;

    setServerState({
      dcId: activeDcId,
      loading: true,
      error: '',
      servers: [],
    });

    async function load() {
      try {
        const result = await fetchDataCenterServers(activeDcId);

        if (!cancelled) {
          setServerState({
            dcId: activeDcId,
            loading: false,
            error: '',
            servers: result.servers,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setServerState({
            dcId: activeDcId,
            loading: false,
            error: err.message || 'Gagal memuat server.',
            servers: [],
          });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [activeDcId, serverReloadKey]);

  const currentServers =
    activeDcId && serverState.dcId === activeDcId
      ? serverState.servers
      : [];

  const serversLoading =
    Boolean(activeDcId) &&
    (serverState.dcId !== activeDcId || serverState.loading);

  const serversError =
    serverState.dcId === activeDcId ? serverState.error : '';

  const selectedServer =
    currentServers.find((server) => server.serverId === selectedServerId) ?? null;

  const keyword = serverSearch.trim().toLowerCase();
  const filteredServers = currentServers.filter((server) =>
    `${server.hostname} ${server.deviceIpAddress}`.toLowerCase().includes(keyword)
  );

  function resetMap() {
    setSelectedCityKey(null);
    setSelectedDcId(null);
    setSelectedServerId(null);
    setServerSearch('');
  }

  function selectCity(city) {
    setSelectedCityKey(city.key);
    setSelectedDcId(null);
    setSelectedServerId(null);
    setServerSearch('');
  }

  function selectDc(dc) {
    setSelectedDcId(dc.id);
    setSelectedServerId(null);
    setServerSearch('');
  }

  function backToCity() {
    setSelectedDcId(null);
    setSelectedServerId(null);
    setServerSearch('');
  }

  const markers = selectedDc
    ? [selectedDc]
    : selectedCity
      ? selectedCity.dataCenters
      : cities;

  const totalServers = locations.reduce(
    (sum, dc) => sum + dc.totalServers, 0
  );

  return (
    <section className="dc-map-card" aria-labelledby="dc-map-title">
      <header className="dc-map-heading">
        <div>
          <div className="dc-heading-title">
            <h2 id="dc-map-title">Server Health Map</h2>
            <span className="dc-demo-label">Snapshot demo</span>
          </div>
          <p>Lokasi infrastruktur dan kondisi server</p>
        </div>

        <button
          type="button"
          className="dc-reset-button"
          onClick={resetMap}
          title="Kembali ke seluruh Indonesia"
        >
          <svg
            width="17" height="17" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 11a9 9 0 1 1 2.6 7" />
            <path d="M3 4v7h7" />
          </svg>
          Reset map
        </button>
      </header>

      <nav className="dc-map-breadcrumb" aria-label="Lokasi peta">
        <button type="button" onClick={resetMap}>Indonesia</button>

        {selectedCity && (
          <>
            <span aria-hidden="true">›</span>
            <button type="button" onClick={backToCity}>
              {selectedCity.name}
            </button>
          </>
        )}

        {selectedDc && (
          <>
            <span aria-hidden="true">›</span>
            <button type="button" onClick={() => setSelectedServerId(null)}>
              {selectedDc.name}
            </button>
          </>
        )}

        {selectedServer && (
          <>
            <span aria-hidden="true">›</span>
            <span aria-current="location">{selectedServer.hostname}</span>
          </>
        )}
      </nav>

      {loading ? (
        <div className="dc-map-state" role="status">Memuat data center...</div>
      ) : error ? (
        <div className="dc-map-state" role="alert">
          <p>{error}</p>
          <button
            type="button"
            className="dc-map-button"
            onClick={() => setReloadKey((value) => value + 1)}
          >
            Coba lagi
          </button>
        </div>
      ) : (
        <div className="dc-map-content">
          <div className="dc-map-canvas">
            <MapContainer
              bounds={INDONESIA_BOUNDS}
              minZoom={3}
              maxZoom={18}
              zoomControl={false}
              scrollWheelZoom={false}
              className="dc-map-leaflet"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <ZoomControl position="bottomleft" />
              <MapViewport city={selectedCity} dataCenter={selectedDc} />

              {markers.map((item) => {
                const isCity = !selectedCity;
                const status = getStatus(item.status);

                return (
                  <Marker
                    key={`${isCity ? 'city' : 'dc'}-${item.key ?? item.id}`}
                    position={[item.latitude, item.longitude]}
                    icon={createLocationIcon(
                      item.status,
                      item.totalServers,
                      isCity,
                      Boolean(selectedDc && selectedDc.id === item.id)
                    )}
                    title={`${item.name}: ${item.totalServers} server, ${status.label}`}
                    alt={item.name}
                    eventHandlers={{
                      click: () => {
                        if (isCity) selectCity(item);
                        else selectDc(item);
                      },
                    }}
                  >
                    <Tooltip
                      permanent
                      direction="bottom"
                      className="dc-location-caption"
                    >
                      <strong>{item.name}</strong>
                      <span>
                        {isCity ? `${item.dataCenters.length} DC · ` : ''}
                        {item.totalServers} server
                      </span>
                    </Tooltip>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          <aside className="dc-map-sidebar">
            {!selectedCity ? (
              <>
                <h3>Lokasi server</h3>
                <p className="dc-panel-subtitle">
                  {cities.length} kota · {locations.length} DC · {totalServers} server
                </p>

                <div className="dc-location-list">
                  {cities.map((city) => (
                    <LocationRow
                      key={city.key}
                      name={city.name}
                      description={`${city.dataCenters.length} DC · ${city.totalServers} server · ${getStatus(city.status).label}`}
                      status={city.status}
                      onClick={() => selectCity(city)}
                    />
                  ))}
                </div>

                {!cities.length && <p>Belum ada data center.</p>}
              </>
            ) : !selectedDc ? (
              <>
                <h3>Data center di {selectedCity.name}</h3>
                <p className="dc-panel-subtitle">
                  {selectedCity.dataCenters.length} DC · {selectedCity.totalServers} server
                </p>

                <HealthSummary summary={selectedCity.summary} />

                <div className="dc-location-list">
                  {selectedCity.dataCenters.map((dc) => (
                    <LocationRow
                      key={dc.id}
                      name={dc.name}
                      description={`${dc.totalServers} server · ${getStatus(dc.status).label}`}
                      status={dc.status}
                      onClick={() => selectDc(dc)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <h3>{selectedDc.name}</h3>
                <p className="dc-panel-subtitle">
                  {selectedDc.city} · {selectedDc.totalServers} server
                </p>

                <HealthSummary summary={selectedDc.summary} />

                <h4 className="dc-list-title">Server di lokasi ini</h4>

                {serversLoading ? (
                  <p role="status">Memuat server...</p>
                ) : serversError ? (
                  <div role="alert">
                    <p>{serversError}</p>
                    <button
                      type="button"
                      className="dc-map-button"
                      onClick={() => setServerReloadKey((value) => value + 1)}
                    >
                      Coba lagi
                    </button>
                  </div>
                ) : (
                  <>
                    {currentServers.length > 5 && (
                      <input
                        className="dc-server-search"
                        type="search"
                        aria-label="Cari server berdasarkan hostname atau IP"
                        placeholder="Cari hostname atau IP..."
                        value={serverSearch}
                        onChange={(event) => setServerSearch(event.target.value)}
                      />
                    )}

                    <div className="dc-location-list dc-server-list">
                      {filteredServers.map((server) => (
                        <LocationRow
                          key={server.serverId}
                          name={server.hostname}
                          description={`${server.deviceIpAddress} · ${getStatus(server.status).label}`}
                          status={server.status}
                          selected={server.serverId === selectedServerId}
                          onClick={() => setSelectedServerId(server.serverId)}
                        />
                      ))}
                    </div>

                    {!filteredServers.length && (
                      <p>
                        {currentServers.length
                          ? 'Server tidak ditemukan.'
                          : 'Belum ada server di DC ini.'}
                      </p>
                    )}

                    {selectedServer ? (
                      <ServerPreview
                        server={selectedServer}
                        returnTo={`${location.pathname}${location.search}`}
                      />
                    ) : currentServers.length > 0 ? (
                      <p className="dc-select-hint">
                        Pilih server untuk melihat ringkasan kondisi.
                      </p>
                    ) : null}
                  </>
                )}
              </>
            )}
          </aside>

          <div className="dc-map-legend" aria-label="Legenda status">
            {[
              'Healthy', 'Warning', 'Critical',
              'Offline', 'Maintenance', 'Unknown',
            ].map((key) => (
              <span key={key}>
                <i style={{ backgroundColor: STATUS[key].color }} />
                {STATUS[key].label}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="dc-map-note">
        Warna kota/DC menunjukkan adanya server yang perlu diperhatikan,
        bukan berarti seluruh server mengalami gangguan.
      </p>
    </section>
  );
}