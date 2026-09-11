import {
    Activity,
    AlertCircle,
    AlertTriangle,
    Clock3,
    MapPin,
    Server,
    TrendingUp,
} from 'lucide-react';
import Layout from '../../components/Layout';
import Table from '../../components/table';
import '../../style/infrastructure_style/Main_Style.css';

const summaryCards = [
    {
        title: 'Total Servers',
        value: '215',
        detail: 'Online 198 · 92.1%',
        icon: Server,
        tone: 'good',
    },
    {
        title: 'Active Alerts',
        value: '17',
        detail: 'Critical 3 · Warning 14 · Info 0',
        icon: AlertTriangle,
        tone: 'warning',
    },
    {
        title: 'Availability (Avg)',
        value: '99.98%',
        detail: '30 day average',
        icon: Activity,
        tone: 'good',
    },
    {
        title: 'Avg Response Time',
        value: '124 ms',
        detail: 'API response time',
        icon: Clock3,
        tone: 'neutral',
    },
];

const serverStatusOverview = [
    { label: 'Online', value: '198', detail: '92.1%', tone: 'good' },
    { label: 'Warning', value: '14', detail: '6.5%', tone: 'warning' },
    { label: 'Critical', value: '3', detail: '1.4%', tone: 'danger' },
    { label: 'Offline', value: '0', detail: '0%', tone: 'neutral' },
];

const regionHealth = [
    { region: 'Sumabagut', value: 96 },
    { region: 'Sumagsel', value: 90 },
    { region: 'Sumagteng', value: 85 },
    { region: 'Jabo Inner', value: 78 },
    { region: 'Jabo Outer', value: 70 },
];

const criticalServers = [
    { name: 'cache-server-01', ip: '10.11.2.10', cpu: '95%', memory: '88%', disk: '71%', status: 'Critical', uptime: '12d 6h', response: '203ms' },
    { name: 'auth-server-02', ip: '10.11.2.11', cpu: '92%', memory: '88%', disk: '82%', status: 'Critical', uptime: '6d 3h', response: '245ms' },
    { name: 'db-server-01', ip: '10.11.2.12', cpu: '87%', memory: '78%', disk: '65%', status: 'Warning', uptime: '23d 12h', response: '150ms' },
    { name: 'api-gateway-01', ip: '10.11.2.13', cpu: '82%', memory: '85%', disk: '71%', status: 'Warning', uptime: '8d 4h', response: '112ms' },
    { name: 'mail-server-01', ip: '10.11.3.11', cpu: '78%', memory: '72%', disk: '60%', status: 'Warning', uptime: '31d 2h', response: '168ms' },
    { name: 'web-server-03', ip: '10.11.4.14', cpu: '65%', memory: '60%', disk: '45%', status: 'Online', uptime: '15d 8h', response: '80ms' },
    { name: 'backup-server-01', ip: '10.11.4.13', cpu: '45%', memory: '52%', disk: '35%', status: 'Online', uptime: '26d 18h', response: '76ms' },
    { name: 'monitoring-01', ip: '10.11.4.10', cpu: '32%', memory: '48%', disk: '28%', status: 'Online', uptime: '10d 6h', response: '64ms' },
    { name: 'log-server-01', ip: '10.11.4.09', cpu: '28%', memory: '42%', disk: '25%', status: 'Online', uptime: '12d 3h', response: '55ms' },
    { name: 'cdn-node-01', ip: '10.11.5.00', cpu: '25%', memory: '36%', disk: '20%', status: 'Online', uptime: '20d 5h', response: '48ms' },
];

const infraAlerts = [
    { title: 'High CPU Usage', server: 'cache-server-01', severity: 'Critical' },
    { title: 'Disk Space Low', server: 'backup-server-01', severity: 'Warning' },
    { title: 'Memory Usage High', server: 'db-server-01', severity: 'Warning' },
    { title: 'Service Down', server: 'auth-server-02', severity: 'Critical' },
    { title: 'High Response Time', server: 'api-gateway-01', severity: 'Warning' },
];

const performanceTrends = [
    { title: 'CPU Usage', value: '28.4%', detail: 'Average', tone: 'good' },
    { title: 'Memory Usage', value: '62.7%', detail: 'Average', tone: 'warning' },
    { title: 'Disk Usage', value: '41.2%', detail: 'Average', tone: 'neutral' },
    { title: 'Network Traffic', value: '2.45 Tbps', detail: 'Average', tone: 'good' },
];

const recentIncidents = [
    { title: 'Database Connection Timeout', status: 'Resolved' },
    { title: 'High Memory Usage', status: 'Resolved' },
    { title: 'API Gateway Error Rate High', status: 'Warning' },
    { title: 'Backup Job Failed', status: 'Critical' },
    { title: 'Disk Latency High', status: 'Resolved' },
];

const maintenanceSchedule = [
    { title: 'Database Cluster Upgrade', schedule: 'Jul 3, 2025 · 02:00 WIB', status: 'Scheduled' },
    { title: 'Network Maintenance', schedule: 'Jul 4, 2025 · 03:00 WIB', status: 'Scheduled' },
    { title: 'Storage System Update', schedule: 'Jul 5, 2025 · 02:30 WIB', status: 'Scheduled' },
    { title: 'Security Patch Deployment', schedule: 'Jul 6, 2025 · 01:00 WIB', status: 'Scheduled' },
    { title: 'Backup System Maintenance', schedule: 'Jul 7, 2025 · 02:30 WIB', status: 'Scheduled' },
];

function Infra() {
    return (
        <Layout>
            <div className="infra-page">
                <div className="infra-summary-grid">
                    {summaryCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div className={`infra-summary-card ${card.tone}`} key={card.title}>
                                <div className="infra-summary-icon">
                                    <Icon size={18} strokeWidth={2} />
                                </div>
                                <div>
                                    <p className="infra-summary-title">{card.title}</p>
                                    <h3>{card.value}</h3>
                                    <span>{card.detail}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="infra-grid">
                    <section className="infra-card">
                        <div className="infra-card-header">
                            <div>
                                <p className="infra-card-label">Infrastructure Overview</p>
                                <h2>Server status & health regions</h2>
                            </div>
                        </div>

                        <div className="infra-overview-panel">
                            <div className="infra-status-overview">
                                {serverStatusOverview.map((item) => (
                                    <div className="infra-status-block" key={item.label}>
                                        <div>
                                            <p className="infra-status-label">{item.label}</p>
                                            <h3>{item.value}</h3>
                                        </div>
                                        <span className={`infra-pill ${item.tone}`}>{item.detail}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="infra-region-panel">
                                <div className="infra-region-list">
                                    <div className="infra-region-list-header">
                                        <p className="infra-card-label">Health by region</p>
                                        <h2>Infrastructure health map</h2>
                                    </div>
                                    {regionHealth.map((region) => (
                                        <div className="infra-region-item" key={region.region}>
                                            <div>
                                                <p>{region.region}</p>
                                                <span>{region.value}%</span>
                                            </div>
                                            <div className="infra-region-bar">
                                                <div className="infra-region-fill" style={{ width: `${region.value}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="infra-map-card">
                                    <div className="infra-map-title">
                                        <MapPin size={18} strokeWidth={2} />
                                        <span>Region fokus</span>
                                    </div>
                                    <p>Distribusi infrastruktur dan kesehatan wilayah ditampilkan di sini.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="infra-card">
                        <div className="infra-card-header">
                            <div>
                                <p className="infra-card-label">Top 10 Critical Servers</p>
                                <h2>Server prioritas</h2>
                            </div>
                        </div>

                        <Table
                            className="infra-table"
                            wrapperClassName=""
                            columns={[
                                { key: 'name', label: 'Server Name' },
                                { key: 'ip', label: 'IP Address' },
                                { key: 'cpu', label: 'CPU' },
                                { key: 'memory', label: 'Memory' },
                                { key: 'disk', label: 'Disk' },
                                {
                                    key: 'status',
                                    label: 'Status',
                                    render: (row) => (
                                        <span className={`infra-pill ${row.status.toLowerCase()}`}>
                                            {row.status}
                                        </span>
                                    )
                                }
                            ]}
                            data={criticalServers}
                            rowKey="name"
                        />
                    </section>
                </div>

                <div className="infra-grid">
                    <section className="infra-card">
                        <div className="infra-card-header">
                            <div>
                                <p className="infra-card-label">Active Alerts</p>
                                <h2>Peringatan terkini</h2>
                            </div>
                        </div>
                        <div className="infra-alert-list">
                            {infraAlerts.map((alert) => (
                                <div className="infra-alert-item" key={alert.title}>
                                    <div className="infra-alert-icon">
                                        <AlertCircle size={18} strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h3>{alert.title}</h3>
                                        <p>{alert.server}</p>
                                    </div>
                                    <span className={`infra-pill ${alert.severity.toLowerCase()}`}>{alert.severity}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="infra-card">
                        <div className="infra-card-header">
                            <div>
                                <p className="infra-card-label">Performance Trend</p>
                                <h2>Data pemakaian terakhir</h2>
                            </div>
                        </div>
                        <div className="infra-trend-grid">
                            {performanceTrends.map((trend) => (
                                <div className="infra-mini-card" key={trend.title}>
                                    <div className="infra-mini-card-icon">
                                        <TrendingUp size={18} strokeWidth={2} />
                                    </div>
                                    <div>
                                        <p>{trend.title}</p>
                                        <h3>{trend.value}</h3>
                                        <span>{trend.detail}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="infra-grid infra-grid-3">
                    <section className="infra-card">
                        <div className="infra-card-header">
                            <div>
                                <p className="infra-card-label">Recent Incidents</p>
                                <h2>Kejadian terakhir</h2>
                            </div>
                        </div>
                        <div className="infra-incident-list">
                            {recentIncidents.map((incident) => (
                                <div className="infra-incident-item" key={incident.title}>
                                    <div>
                                        <h3>{incident.title}</h3>
                                    </div>
                                    <span className={`infra-pill ${incident.status.toLowerCase()}`}>
                                        {incident.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="infra-card infra-map-summary">
                        <div className="infra-card-header">
                            <div>
                                <p className="infra-card-label">Infrastructure Map</p>
                                <h2>Topologi layanan</h2>
                            </div>
                        </div>
                        <div className="infra-map-placeholder">
                            <div className="infra-map-title">
                                <MapPin size={18} strokeWidth={2} />
                                <span>Internet</span>
                            </div>
                            <div className="infra-map-nodes">
                                <div className="infra-map-node">Web Tier</div>
                                <div className="infra-map-node">App Tier</div>
                                <div className="infra-map-node critical">DB Cluster</div>
                                <div className="infra-map-node">Cache Tier</div>
                                <div className="infra-map-node">Storage</div>
                                <div className="infra-map-node">Backup</div>
                            </div>
                        </div>
                    </section>

                    <section className="infra-card">
                        <div className="infra-card-header">
                            <div>
                                <p className="infra-card-label">Maintenance Schedule</p>
                                <h2>Jadwal pemeliharaan</h2>
                            </div>
                        </div>
                        <div className="infra-schedule-list">
                            {maintenanceSchedule.map((item) => (
                                <div className="infra-schedule-item" key={item.title}>
                                    <div>
                                        <h3>{item.title}</h3>
                                        <p>{item.schedule}</p>
                                    </div>
                                    <span className="infra-pill scheduled">{item.status}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </Layout>
    );
}

export default Infra;
