import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, AlertTriangle, Clock3, MapPin, RefreshCw, Server } from 'lucide-react';
import Layout from '../../components/layout';
import Table from '../../components/table';
import DataCenterMap from '../../components/DataCenterMap';
import { fetchInfrastructureSnapshot } from '../../services/infrastructure';
import { averageMetric, filterServers, SERVER_STATUSES, summarizeStatuses } from '../../services/infrastructureSummary';
import '../../style/infrastructure_style/Main_Style.css';

const PAGE_SIZE = 15;
const priority = { Offline: 0, Critical: 1, Warning: 2, Unknown: 3, Maintenance: 4, Online: 5 };
const number = (value, unit = '') => value == null ? '—' : `${value.toLocaleString('id-ID', { maximumFractionDigits: 2 })}${unit}`;
function checkedTime(value) {
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.getTime()) && date.getUTCFullYear() > 1
    ? date.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB' : 'Belum diketahui';
}
function Badge({ status }) {
  return <span className={`infra-pill ${status.toLowerCase()}`}>{status}</span>;
}

export default function Infra() {
  const location = useLocation();
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [selection, setSelection] = useState({ cityKey: null, dcId: null });
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const onSelectionChange = useCallback(next => {
    setSelection(next);
    setPage(1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchInfrastructureSnapshot();
        if (!cancelled) setSnapshot(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Gagal memuat infrastruktur.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [reloadKey]);

  const servers = snapshot?.servers ?? [];
  const counts = summarizeStatuses(servers);
  const problemCount = counts.Critical + counts.Warning + counts.Offline;
  const scoped = filterServers(servers, selection);
  const filtered = filterServers(servers, { ...selection, status, search })
    .sort((a, b) => priority[a.status] - priority[b.status] || a.hostname.localeCompare(b.hostname));
  const alerts = scoped.filter(s => ['Critical', 'Warning', 'Offline'].includes(s.status))
    .sort((a, b) => priority[a.status] - priority[b.status]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const returnTo = location.pathname + location.search;
  const detailLink = server => <Link to={`/servers/${server.serverId}`} state={{ returnTo }}>{server.hostname || server.serverName}</Link>;
  const cards = [
    { title: 'Total Server', value: servers.length, detail: `${counts.Online} Online`, icon: Server },
    { title: 'Perlu Perhatian', value: problemCount, detail: `${counts.Critical} Critical · ${counts.Warning} Warning · ${counts.Offline} Offline`, icon: AlertTriangle },
    { title: 'Data Center', value: snapshot?.locations.length ?? 0, detail: 'Termasuk DC tanpa server', icon: MapPin },
    { title: 'Availability Rata-rata', value: number(averageMetric(servers, 'availability', 100), '%'), detail: 'Rata-rata nilai tersimpan', icon: Activity },
    { title: 'Response Time Rata-rata', value: number(averageMetric(servers, 'responseTimeMs'), ' ms'), detail: 'Rata-rata nilai tersimpan', icon: Clock3 },
  ];
  const validTimes = servers.map(s => Date.parse(s.lastChecked)).filter(t => Number.isFinite(t) && t > 0);
  const scopeName = selection.dcId ? snapshot?.locations.find(dc => dc.id === selection.dcId)?.name
    : selection.cityKey || 'Semua lokasi';

  return (
    <Layout>
      <div className="infra-page">
        <div className="infra-toolbar">
          <div><h1>Infrastructure Visibility</h1><p>Lokasi, kondisi, dan kapasitas server berdasarkan data tersimpan.</p></div>
          <button type="button" className="infra-control" disabled={loading} onClick={() => setReloadKey(key => key + 1)}><RefreshCw size={16} />{loading ? 'Memuat…' : 'Muat ulang data'}</button>
        </div>
        {loading ? <div className="infra-card" role="status">Memuat data infrastruktur…</div>
          : error ? <div className="infra-card" role="alert"><h2>Data belum dapat dimuat</h2><p>{error}</p><p>Halaman ini memerlukan akun Admin.</p><button type="button" className="infra-control" onClick={() => setReloadKey(key => key + 1)}>Coba lagi</button></div>
          : snapshot && <>
            <div className="infra-summary-grid">{cards.map(card => {
              const Icon = card.icon;
              return <div className="infra-summary-card" key={card.title}><div className="infra-summary-icon"><Icon size={18} /></div><div><p className="infra-summary-title">{card.title}</p><h3>{card.value}</h3><span>{card.detail}</span></div></div>;
            })}</div>
            <p className="infra-note">Ringkasan atas mencakup semua lokasi. Data diambil: {checkedTime(snapshot.retrievedAt)}.<br />
              Waktu pemeriksaan server: {validTimes.length ? `${checkedTime(Math.min(...validTimes))} — ${checkedTime(Math.max(...validTimes))}` : 'Belum diketahui'}.
              {' '}Nilai ini bukan pemeriksaan langsung atau tren 30 hari; gunakan waktu pemeriksaan untuk menilai kebaruan data.</p>
            {!servers.length && <div className="infra-card" role="status">Belum ada server tersimpan. Ringkasan akan terisi setelah data server tersedia.</div>}
            <DataCenterMap snapshot={snapshot} onSelectionChange={onSelectionChange} />
            <section className="infra-card">
              <div className="infra-card-header"><div><p className="infra-card-label">Status semua server</p><h2>Distribusi status</h2></div></div>
              <div className="infra-status-overview">{SERVER_STATUSES.map(item => <div className="infra-status-block" key={item}><div><p className="infra-status-label">{item}</p><strong>{counts[item]}</strong></div><span>{servers.length ? number(counts[item] / servers.length * 100, '%') : '—'}</span></div>)}</div>
            </section>
            <section className="infra-card">
              <div className="infra-card-header"><div><p className="infra-card-label">Inventaris server</p><h2>{scopeName}</h2></div><span>{filtered.length} server</span></div>
              <p className="infra-note">Pilihan kota atau DC pada map memfilter tabel, kondisi server, dan pemakaian resource di bawah.</p>
              <div className="infra-filters">
                <label>Cari server atau aplikasi<input value={search} placeholder="Hostname, IP, atau nama aplikasi" onChange={event => { setSearch(event.target.value); setPage(1); }} /></label>
                <label>Status<select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">Semua status</option>{SERVER_STATUSES.map(item => <option key={item}>{item}</option>)}</select></label>
              </div>
              <Table className="infra-table" wrapperClassName="infra-table-wrapper" rowKey="serverId"
                data={filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)}
                emptyMessage="Tidak ada server yang sesuai filter."
                columns={[
                  { key: 'hostname', label: 'Server', render: detailLink },
                  { key: 'deviceIpAddress', label: 'IP Address' },
                  { key: 'dataCenterName', label: 'Data Center' },
                  { key: 'status', label: 'Status', render: s => <Badge status={s.status} /> },
                  { key: 'cpuUsage', label: 'CPU', render: s => number(s.cpuUsage, '%') },
                  { key: 'memoryUsage', label: 'RAM', render: s => number(s.memoryUsage, '%') },
                  { key: 'diskUsage', label: 'Disk', render: s => number(s.diskUsage, '%') },
                  { key: 'applications', label: 'Aplikasi', render: s => s.applications.length },
                  { key: 'lastChecked', label: 'Terakhir diperiksa', render: s => checkedTime(s.lastChecked) },
                ]} />
              <div className="infra-pagination"><button className="infra-control" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Sebelumnya</button><span>Halaman {currentPage} / {totalPages}</span><button className="infra-control" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>Berikutnya</button></div>
            </section>
            <div className="infra-grid">
              <section className="infra-card"><div className="infra-card-header"><div><p className="infra-card-label">Kondisi tersimpan · {scopeName}</p><h2>Server perlu perhatian ({alerts.length})</h2></div></div>
                <div className="infra-alert-list">{alerts.length ? alerts.slice(0, 10).map(server => <div className="infra-alert-item" key={server.serverId}><div><h3>{detailLink(server)}</h3><p>{server.dataCenterName} · {checkedTime(server.lastChecked)}</p></div><Badge status={server.status} /></div>) : <p>Tidak ada status Critical, Warning, atau Offline di lokasi ini.</p>}</div>
                {alerts.length > 10 && <p className="infra-note">Menampilkan 10 prioritas tertinggi. Gunakan filter status pada tabel untuk melihat lainnya.</p>}
              </section>
              <section className="infra-card"><div className="infra-card-header"><div><p className="infra-card-label">Resource · {scopeName}</p><h2>Pemakaian tersimpan</h2></div></div>
                <div className="infra-trend-grid">{[['CPU', 'cpuUsage'], ['RAM', 'memoryUsage'], ['Disk', 'diskUsage']].map(([label, field]) => <div className="infra-mini-card" key={field}><div><p>{label}</p><h3>{number(averageMetric(scoped, field, 100), '%')}</h3><span>Rata-rata per server</span></div></div>)}</div>
                <p className="infra-note">Rata-rata persentase per server, bukan utilisasi gabungan berbobot kapasitas. Traffic jaringan belum tersedia.</p>
              </section>
            </div>
            <div className="infra-grid">
              <section className="infra-card"><h2>Histori insiden dan tren</h2><p className="infra-note">Belum tersedia. Data saat ini hanya menyimpan kondisi terakhir server.</p></section>
              <section className="infra-card"><h2>Jadwal maintenance</h2><p className="infra-note">Belum ada data jadwal. Status Maintenance hanya menunjukkan kondisi server yang tercatat.</p></section>
            </div>
          </>}
      </div>
    </Layout>
  );
}
