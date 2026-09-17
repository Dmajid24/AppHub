import { AlertTriangle, ClipboardList, Database, HeartPulse, Layers, Search } from 'lucide-react';
import Layout from '../../components/layout';
import '../../style/oss_style/Main_Style.css';

const summaryCards = [
  {
    label: 'Total Aplikasi Terdaftar',
    value: '128',
    note: '109 Live · 12 On Review · 7 Draft',
    icon: Database,
    progress: 75,
  },
  {
    label: 'Alarm Kritis Aktif',
    value: '3',
    note: 'Perlu ditindaklanjuti hari ini',
    icon: AlertTriangle,
    delta: '+4.2%',
    deltaTone: 'positive',
  },
  {
    label: 'Kesehatan Rata-rata',
    value: '92.6%',
    note: '15 dari 128 butuh perhatian',
    icon: HeartPulse,
    delta: '+1.8%',
    deltaTone: 'positive',
  },
  {
    label: 'Kelengkapan Data',
    value: '86%',
    note: '18 aplikasi belum lengkap',
    icon: ClipboardList,
  },
];

const networkDomains = [
  {
    name: 'RAN',
    apps: 33,
    health: 'Stable',
    tone: 'good',
    description: 'Highest OSS density with proactive TSA coverage.',
    vendors: [
      { name: 'HUAWEI', value: 10, percent: '30%' },
      { name: 'ERICSON', value: 8, percent: '24%' },
      { name: 'ZTE', value: 7, percent: '21%' },
      { name: 'NOKIA', value: 8, percent: '25%' },
    ],
  },
  {
    name: 'CORE',
    apps: 27,
    health: 'Monitoring',
    tone: 'warning',
    description: 'Core assets require attention for TSA renewals.',
    vendors: [
      { name: 'HUAWEI', value: 9, percent: '33%' },
      { name: 'NOKIA', value: 8, percent: '30%' },
      { name: 'ERICSON', value: 6, percent: '22%' },
      { name: 'ZTE', value: 4, percent: '15%' },
    ],
  },
  {
    name: 'TRANSPORT',
    apps: 22,
    health: 'At risk',
    tone: 'danger',
    description: 'Transport assets are the most vulnerable to TSA lapses.',
    vendors: [
      { name: 'NOKIA', value: 8, percent: '36%' },
      { name: 'HUAWEI', value: 6, percent: '27%' },
      { name: 'ERICSON', value: 5, percent: '23%' },
      { name: 'ZTE', value: 3, percent: '14%' },
    ],
  },
  {
    name: 'DATACOM',
    apps: 18,
    health: 'Stable',
    tone: 'neutral',
    description: 'Datacom systems are healthy but should remain monitored.',
    vendors: [
      { name: 'NOKIA', value: 7, percent: '39%' },
      { name: 'HUAWEI', value: 4, percent: '22%' },
      { name: 'ERICSON', value: 4, percent: '22%' },
      { name: 'ZTE', value: 3, percent: '17%' },
    ],
  },
];

const domainDetails = [
  { title: '16 OSS', detail: 'Need TSA attention across all domains', tone: 'danger' },
  { title: '12', detail: 'Expiring < 3 months', tone: 'warning' },
  { title: '4', detail: 'No TSA at all', tone: 'neutral' },
  { title: '116', detail: 'Valid > 3 months', tone: 'good' },
];

const regionServers = [
  { region: 'Sumatera', value: 245 },
  { region: 'Jawa', value: 382 },
  { region: 'Kalimantan', value: 178 },
  { region: 'Sulawesi', value: 156 },
  { region: 'Bali & Nusa', value: 98 },
  { region: 'Papua', value: 87 },
  { region: 'Maluku', value: 64 },
];

const applicationInventory = [
  {
    name: 'Nokia NC10',
    asset: 'NCO-2025-001245',
    vendor: 'Nokia',
    tsaStatus: 'Valid until Dec 2027',
    operatingSystem: 'RHEL 8.9',
    location: 'TTC Bauran',
    score: '92%',
  },
  {
    name: 'Nokia 7250 IXR',
    asset: 'NEA-2024-003187',
    vendor: 'Nokia',
    tsaStatus: 'Valid until Mar 2028',
    operatingSystem: 'CentOS 7.9',
    location: 'TTC Jatinegara',
    score: '88%',
  },
  {
    name: 'Nokia 7750 SR-s',
    asset: 'ERB-2025-006021',
    vendor: 'Nokia',
    tsaStatus: 'Valid until Jun 2026',
    operatingSystem: 'Ubuntu 22.04 LTS',
    location: 'TTC Gambir',
    score: '79%',
  },
  {
    name: 'Nokia FP5',
    asset: 'H3R9-2024-002790',
    vendor: 'Nokia',
    tsaStatus: 'Valid until Sep 2027',
    operatingSystem: 'Cisco IOS XR 7.9',
    location: 'TTC Cibin',
    score: '72%',
  },
  {
    name: 'Nokia 7220 IXR-D3',
    asset: 'ZX5-2025-007834',
    vendor: 'Nokia',
    tsaStatus: 'Valid until Jan 2029',
    operatingSystem: 'RHEL 9.2',
    location: 'TTC Mengkarai',
    score: '76%',
  },
  {
    name: 'Nokia SR Linux',
    asset: 'NDB-2024-001956',
    vendor: 'Nokia',
    tsaStatus: 'Valid until Aug 2026',
    operatingSystem: 'NOS 23.8.1',
    location: 'TTC Kramat',
    score: '91%',
  },
  {
    name: 'Nokia 7750 SR',
    asset: 'SR7-2025-004312',
    vendor: 'Nokia',
    tsaStatus: 'Valid until Nov 2027',
    operatingSystem: 'RHEL 8.6',
    location: 'TTC Senen',
    score: '84%',
  },
  {
    name: 'Nokia AirScale',
    asset: 'GSG-2024-006798',
    vendor: 'Nokia',
    tsaStatus: 'Valid until Feb 2028',
    operatingSystem: 'Ubuntu 20.04 LTS',
    location: 'TTC Kemayoran',
    score: '87%',
  },
];

function OSSData() {
  return (
    <Layout>
      <div className="oss-page">
        <section className="oss-hero">
          <div className="oss-hero-card-grid">
            {summaryCards.map((card) => (
              <div className="oss-hero-card" key={card.label}>
                <div className="oss-hero-card-head">
                  <div className="oss-hero-card-icon"><card.icon size={18} strokeWidth={2} /></div>
                  {card.delta && <span className={`oss-hero-delta ${card.deltaTone}`}>{card.delta}</span>}
                </div>
                <h2>{card.value}</h2>
                <p className="oss-hero-card-label">{card.label}</p>
                <p className="oss-hero-card-note">{card.note}</p>
                {card.progress !== undefined && (
                  <div className="oss-progress-bar">
                    <div className="oss-progress-fill" style={{ width: `${card.progress}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="oss-summary-grid">
          {networkDomains.map((domain) => (
            <div className={`oss-summary-card ${domain.tone}`} key={domain.name}>
              <div className="oss-summary-icon">
                <Layers size={18} strokeWidth={2} />
              </div>
              <div className="oss-summary-body">
                <div className="oss-summary-header">
                  <p className="oss-summary-title">{domain.name}</p>
                  <span className={`oss-badge ${domain.tone}`}>{domain.health}</span>
                </div>
                <h3>{domain.apps} apps</h3>
                <p className="oss-summary-subtext">{domain.description}</p>
                <div className="oss-domain-legend">
                  {domain.vendors.map((vendor) => (
                    <div className="oss-domain-legend-item" key={vendor.name}>
                      <span>{vendor.name}</span>
                      <div className="oss-domain-bar">
                        <div className="oss-domain-fill" style={{ width: vendor.percent }} />
                      </div>
                      <small>{vendor.percent}</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <section className="oss-card oss-detail-card">
          <div className="oss-card-header">
            <div>
              <p className="oss-card-label">Network domain detail</p>
              <h2>OSS coverage & TSA status</h2>
            </div>
          </div>
          <div className="oss-detail-row">
            {domainDetails.map((detail) => (
              <div className={`oss-detail-item ${detail.tone}`} key={detail.title}>
                <h3>{detail.title}</h3>
                <p>{detail.detail}</p>
              </div>
            ))}
          </div>
          <div className="oss-detail-footer">
            <p>Fokuskan tindakan pada 12 asset dengan TSA yang hampir habis dan 4 perangkat tanpa TSA.</p>
            <button className="oss-button">Lihat Semua OSS</button>
          </div>
        </section>

        <div className="oss-grid">
          <section className="oss-card">
            <div className="oss-card-header">
              <div>
                <p className="oss-card-label">Total Server Region of RAN</p>
                <h2>Server region distribution</h2>
              </div>
            </div>
            <div className="oss-region-list">
              {regionServers.map((region) => (
                <div className="oss-region-item" key={region.region}>
                  <div className="oss-region-header">
                    <p>{region.region}</p>
                    <span>{region.value}</span>
                  </div>
                  <div className="oss-region-bar">
                    <div className="oss-region-fill" style={{ width: `${Math.min((region.value / 382) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="oss-card">
            <div className="oss-card-header oss-inventory-header">
              <div>
                <p className="oss-card-label">Application inventory of RAN</p>
                <h2>OSS appliance list</h2>
              </div>
              <div className="oss-inventory-actions">
                <div className="oss-search-input">
                  <Search size={16} strokeWidth={2} />
                  <input type="text" placeholder="Search vendor / application..." />
                </div>
                <button onClick={() => (window.location.href = '/oss-data/add')} className="oss-button oss-button-secondary">Add OSS</button>
              </div>
            </div>
            <div className="oss-inventory-grid">
              {applicationInventory.map((app) => (
                <div className="oss-app-card" key={app.name}>
                  <div className="oss-app-card-header">
                    <div>
                      <h3>{app.name}</h3>
                      <span>{app.asset}</span>
                    </div>
                    <div className="oss-score-badge">{app.score}</div>
                  </div>
                  <div className="oss-app-row">
                    <strong>Vendor</strong>
                    <span>{app.vendor}</span>
                  </div>
                  <div className="oss-app-row">
                    <strong>TSA Status</strong>
                    <span>{app.tsaStatus}</span>
                  </div>
                  <div className="oss-app-row">
                    <strong>Operating System</strong>
                    <span>{app.operatingSystem}</span>
                  </div>
                  <div className="oss-app-row">
                    <strong>Server Location</strong>
                    <span>{app.location}</span>
                  </div>
                  <button className="oss-link-button">View Detail</button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default OSSData;
