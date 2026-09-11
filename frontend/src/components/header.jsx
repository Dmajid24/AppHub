import { useEffect, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, X, Bell, Bot, ChevronRight } from 'lucide-react';
import { fetchApplicationById } from '../services/applications';
import Profile from '../pages/profile/Profile';
import '../style/Header_Style.css';
import { fetchServerDetail } from '../services/infrastructure';

// [GAR] Routing label digunakan pada header untuk navigasi ke halaman tertentu
const ROUTE_LABELS = {
  dashboard: 'Executive Summary',
  settings: 'Settings',
  infrastructure: 'Infrastructure Visibility',
  applications: 'App Portofolio',
  compare: 'Compare',
  architecture: 'Architecture',
  'compliance-security': 'Compliance & Security',
  'tech-info': 'Tech Info',
  'app-view': 'App View',
  'user-access': 'User Access',
  register: 'Register',
  request: 'Request',
  'app-registration': 'Application Registration',
  'use-case': 'Use Case Request',
  feedback: 'Feedback',
  result: 'Result',
  'bot-registration': 'Bot Registration',
  'security-assessment': 'Security Assessment',
  'tsa-information': 'TSA Information Management',
  'oss-data': 'OSS Data Integration',
  profile: 'Profile',
  servers: 'Server',
};

function formatFallbackLabel(segment) {
  return segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// [GAR] Hook untuk fetch nama aplikasi dari API berdasarkan ID di URL
function useAppNameForBreadcrumb(appId) {
  const [appName, setAppName] = useState(null);

  useEffect(() => {
    if (!appId) {
      setAppName(null);
      return;
    }
    let cancelled = false;
    fetchApplicationById(appId)
      .then((app) => { if (!cancelled && app) setAppName(app.name); })
      .catch(() => { /* biarkan fallback ke ID jika error */ });
    return () => { cancelled = true; };
  }, [appId]);

  return appName;
}
function useServerNameForBreadcrumb(serverId) {
  const [result, setResult] = useState({
    id: null,
    name: null,
  });

  useEffect(() => {
    if (!serverId) return;

    let cancelled = false;

    async function loadName() {
      try {
        const server = await fetchServerDetail(serverId);

        if (!cancelled) {
          setResult({
            id: serverId,
            name: server.hostname || server.serverName || 'Detail server',
          });
        }
      } catch {
        if (!cancelled) {
          setResult({
            id: serverId,
            name: 'Detail server',
          });
        }
      }
    }

    loadName();

    return () => {
      cancelled = true;
    };
  }, [serverId]);

  // Hindari menampilkan nama server sebelumnya saat ID berubah.
  return serverId && result.id === serverId ? result.name : null;
}
// [GAR] Digunakan saat routing dipanggil akan masuk ke breadcrumb dan membuat fungsi seperti navigasi
function useBreadcrumb() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  const appIdIndex = segments.findIndex(
    (segment, index) =>
      segments[index - 1] === 'applications' &&
      segment !== 'compare'
  );

  const serverIdIndex = segments.findIndex(
    (segment, index) =>
      segments[index - 1] === 'servers' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        segment
      )
  );

  const appId = appIdIndex !== -1 ? segments[appIdIndex] : null;
  const serverId = serverIdIndex !== -1 ? segments[serverIdIndex] : null;

  const fetchedAppName = useAppNameForBreadcrumb(appId);
  const fetchedServerName = useServerNameForBreadcrumb(serverId);

  return segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join('/')}`;

    let label = ROUTE_LABELS[segment] || formatFallbackLabel(segment);

    if (index === appIdIndex) {
      label = fetchedAppName || formatFallbackLabel(segment);
    }

    if (index === serverIdIndex) {
      label = fetchedServerName || 'Detail server';
    }

    return {
      label,
      path,
      isLast: index === segments.length - 1,
      // Belum ada halaman daftar pada route /servers.
      isLink: !(segment === 'servers' && index === 0),
    };
  });
}

export default function Header({
  user,
  hasAlert = true,
  notifCount,
  onOpenChat,
  onOpenNotifications,
  onSearchChange,
  onSearchSubmit,
  showSearch = false,
}) {
  const [searchValue, setSearchValue] = useState('');
  const searchInputRef = useRef(null);
  const breadcrumb = useBreadcrumb();

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat pagi' : hour < 18 ? 'Selamat siang' : 'Selamat sore';
  const firstName = user?.nama || 'Pengguna';

  useEffect(() => {
    if (!showSearch) return;

    function handleKeyDown(e) {
      const activeTag = document.activeElement?.tagName;
      if (e.key === '/' && activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSearch]);

  function handleSearchChange(e) {
    const value = e.target.value;
    setSearchValue(value);
    onSearchChange?.(value);
  }

  function handleSearchKeyDown(e) {
    if (e.key === 'Enter') {
      onSearchSubmit?.(searchValue);
    } else if (e.key === 'Escape') {
      clearSearch();
      searchInputRef.current?.blur();
    }
  }

  function clearSearch() {
    setSearchValue('');
    onSearchChange?.('');
  }

  const showNotifCount = typeof notifCount === 'number' && notifCount > 0;

  // [GAR] Header
  return (
    <div className="topbar">
      <div className="topbar-copy">

        {breadcrumb.length > 0 && (
          <nav className="breadcrumb" aria-label="Breadcrumb">
            {breadcrumb.map((item) => (
              <span className="breadcrumb-item" key={item.path}>
                {item.isLast ? (
                  <span className="breadcrumb-current" aria-current="page">
                    {item.label}
                  </span>
                ) : item.isLink === false ? (
                  <span className="breadcrumb-link">{item.label}</span>
                ) : (
                  <Link to={item.path} className="breadcrumb-link">
                    {item.label}
                  </Link>
                )}
                {!item.isLast && <ChevronRight size={12} className="breadcrumb-sep" />}
              </span>
            ))}
          </nav>
        )}

        <div className="greet-eyebrow">{today}</div>
        <div className="greet-title">
          {greeting}, {firstName} <span className="accent">👋</span>
        </div>
      </div>

      <div className="topbar-actions">
        {showSearch && (
          <div className="search">
            <Search size={15} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Cari aplikasi, request, atau status…"
              aria-label="Cari aplikasi"
              value={searchValue}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
            />
            {searchValue ? (
              <button
                type="button"
                className="search-clear"
                onClick={clearSearch}
                aria-label="Hapus pencarian"
              >
                <X size={13} />
              </button>
            ) : (
              <span className="search-kbd" aria-hidden="true">/</span>
            )}
          </div>
        )}

        <button
          type="button"
          className="icon-btn icon-btn-cta"
          onClick={() => onOpenChat?.()}
          title="Tanya AI"
        >
          <Bot size={17} />
          <span>Tanya AI</span>
        </button>

        <button
          type="button"
          className="icon-btn"
          aria-label={showNotifCount ? `Notifikasi, ${notifCount} belum dibaca` : 'Notifikasi'}
          title="Notifikasi"
          onClick={() => onOpenNotifications?.()}
        >
          <Bell size={17} />
          {showNotifCount ? (
            <span className="count-badge">{notifCount > 9 ? '9+' : notifCount}</span>
          ) : (
            hasAlert && <span className="dot-badge" />
          )}
        </button>

        <Profile user={user} />
      </div>
    </div>
  );
}