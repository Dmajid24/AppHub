import { useMemo, useState } from 'react';
import {
    Users,
    TrendingUp,
    DollarSign,
    BarChart2,
    Lightbulb,
    CalendarDays,
} from 'lucide-react';
import Layout from '../../components/Layout';
import '../../style/log_user_style/Main_Style.css';
import '../../style/Dashboard_Style.css';

/* ------------------------------------------------------------------ */
/* PERIODS                                                              */
/* ------------------------------------------------------------------ */

const PERIODS = [
    { key: 'daily',   label: 'Harian' },
    { key: 'weekly',  label: 'Mingguan' },
    { key: 'monthly', label: 'Bulanan' },
    { key: 'yearly',  label: 'Tahunan' },
];

/* ------------------------------------------------------------------ */
/* APPLICATION DATA                                                     */
/* Users = unique active sessions for the selected period.             */
/* serverCost (IDR/period) = estimated infra running cost.             */
/* ------------------------------------------------------------------ */

const appData = [
    {
        id: 'garasibmw-portal',
        name: 'GarasiBMW Portal',
        category: 'Budgeting & Finance',
        status: 'active',
        users:  { daily: 38,  weekly: 210,  monthly: 870,  yearly: 10440 },
        serverCost: { daily: 95000, weekly: 665000, monthly: 2850000, yearly: 34200000 },
    },
    {
        id: 'app-catalog-sso',
        name: 'App Catalog SSO',
        category: 'Operation',
        status: 'active',
        users:  { daily: 124, weekly: 620,  monthly: 2480, yearly: 29760 },
        serverCost: { daily: 180000, weekly: 1260000, monthly: 5400000, yearly: 64800000 },
    },
    {
        id: 'hris-system',
        name: 'HRIS System',
        category: 'People',
        status: 'active',
        users:  { daily: 76,  weekly: 420,  monthly: 1680, yearly: 20160 },
        serverCost: { daily: 140000, weekly: 980000, monthly: 4200000, yearly: 50400000 },
    },
    {
        id: 'inventory-system',
        name: 'Inventory System',
        category: 'Others',
        status: 'inactive',
        users:  { daily: 0,   weekly: 0,    monthly: 0,    yearly: 0 },
        serverCost: { daily: 60000, weekly: 420000, monthly: 1800000, yearly: 21600000 },
    },
    {
        id: 'crm-suite',
        name: 'CRM Suite',
        category: 'Sales',
        status: 'active',
        users:  { daily: 55,  weekly: 310,  monthly: 1240, yearly: 14880 },
        serverCost: { daily: 120000, weekly: 840000, monthly: 3600000, yearly: 43200000 },
    },
    {
        id: 'payment-gateway-api',
        name: 'Payment Gateway API',
        category: 'Finance',
        status: 'active',
        users:  { daily: 192, weekly: 1050, monthly: 4200, yearly: 50400 },
        serverCost: { daily: 320000, weekly: 2240000, monthly: 9600000, yearly: 115200000 },
    },
    {
        id: 'document-vault',
        name: 'Document Vault',
        category: 'Compliance',
        status: 'active',
        users:  { daily: 44,  weekly: 250,  monthly: 980,  yearly: 11760 },
        serverCost: { daily: 85000, weekly: 595000, monthly: 2550000, yearly: 30600000 },
    },
];

/* ------------------------------------------------------------------ */
/* TREND DATA (per period key, 6 data points)                          */
/* ------------------------------------------------------------------ */

const trendData = {
    daily: [
        { label: 'Sen', value: 520 },
        { label: 'Sel', value: 480 },
        { label: 'Rab', value: 610 },
        { label: 'Kam', value: 590 },
        { label: 'Jum', value: 540 },
        { label: 'Sab', value: 290 },
        { label: 'Min', value: 188 },
    ],
    weekly: [
        { label: 'W1', value: 2850 },
        { label: 'W2', value: 3120 },
        { label: 'W3', value: 2980 },
        { label: 'W4', value: 3340 },
    ],
    monthly: [
        { label: 'Jan', value: 9200 },
        { label: 'Feb', value: 8750 },
        { label: 'Mar', value: 9800 },
        { label: 'Apr', value: 10200 },
        { label: 'Mei', value: 10800 },
        { label: 'Jun', value: 11470 },
    ],
    yearly: [
        { label: '2021', value: 78000 },
        { label: '2022', value: 95000 },
        { label: '2023', value: 112000 },
        { label: '2024', value: 130000 },
        { label: '2025', value: 137220 },
    ],
};

/* ------------------------------------------------------------------ */
/* HELPERS                                                              */
/* ------------------------------------------------------------------ */

function formatIDR(value) {
    if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
    if (value >= 1_000_000)     return `Rp ${(value / 1_000_000).toFixed(1)}Jt`;
    if (value >= 1_000)         return `Rp ${(value / 1_000).toFixed(0)}rb`;
    return `Rp ${value}`;
}

function formatNum(n) {
    return n.toLocaleString('id-ID');
}

/* ------------------------------------------------------------------ */
/* SVG BAR CHART                                                        */
/* ------------------------------------------------------------------ */

function BarChart({ data }) {
    const W = 600;
    const H = 180;
    const PAD_X = 36;
    const PAD_Y = 16;
    const chartW = W - PAD_X * 2;
    const chartH = H - PAD_Y * 2;
    const max = Math.max(...data.map((d) => d.value)) || 1;
    const barW = Math.max(8, chartW / data.length - 10);

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="lu-chart-svg" preserveAspectRatio="none">
            <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--navy)" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#2a5298" stopOpacity="0.6" />
                </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                <line
                    key={t}
                    x1={PAD_X}
                    x2={W - PAD_X}
                    y1={PAD_Y + chartH * (1 - t)}
                    y2={PAD_Y + chartH * (1 - t)}
                    stroke="var(--line)"
                    strokeWidth="1"
                />
            ))}

            {data.map((d, i) => {
                const barH = (d.value / max) * chartH;
                const x = PAD_X + (chartW / data.length) * i + (chartW / data.length - barW) / 2;
                const y = PAD_Y + chartH - barH;
                const cx = x + barW / 2;

                return (
                    <g key={d.label}>
                        <rect
                            x={x}
                            y={y}
                            width={barW}
                            height={barH}
                            rx={4}
                            fill="url(#barGrad)"
                        />
                        <text
                            x={cx}
                            y={H - 2}
                            textAnchor="middle"
                            fontSize="10"
                            fill="var(--ink-soft)"
                            fontFamily="Inter, sans-serif"
                        >
                            {d.label}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT                                                        */
/* ------------------------------------------------------------------ */

export default function LogUserMain() {
    const [period, setPeriod] = useState('monthly');

    const rows = useMemo(() => {
        return appData.map((app) => {
            const users = app.users[period];
            const cost  = app.serverCost[period];
            const cpu   = users > 0 ? cost / users : null;
            return { ...app, _users: users, _cost: cost, _cpu: cpu };
        });
    }, [period]);

    const totUsers    = rows.reduce((s, r) => s + r._users, 0);
    const totCost     = rows.reduce((s, r) => s + r._cost, 0);
    const avgCpu      = totUsers > 0 ? totCost / totUsers : 0;
    const activeApps  = rows.filter((r) => r.status === 'active').length;

    const trend       = trendData[period];
    const trendMax    = Math.max(...trend.map((d) => d.value));
    const trendMin    = Math.min(...trend.map((d) => d.value));
    const trendAvg    = Math.round(trend.reduce((s, d) => s + d.value, 0) / trend.length);

    const maxUsers    = Math.max(...rows.map((r) => r._users), 1);

    const periodLabel = PERIODS.find((p) => p.key === period)?.label ?? '';

    return (
        <Layout>
            <div className="lu-page">

                {/* -------- PERIOD FILTER -------- */}
                <div className="lu-period-bar">
                    <span className="lu-period-label">Tampilkan per:</span>
                    {PERIODS.map((p) => (
                        <button
                            key={p.key}
                            className={`lu-period-btn ${period === p.key ? 'active' : ''}`}
                            onClick={() => setPeriod(p.key)}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* -------- KPI STATS (kpi-unified) -------- */}
                <div className="kpi-unified">
                    <div className="kpi-segment">
                        <div className="kpi-segment-top">
                            <div className="kpi-segment-icon">
                                <Users size={19} color="#fff" />
                            </div>
                        </div>
                        <div>
                            <div className="kpi-segment-num">{formatNum(totUsers)}</div>
                            <div className="kpi-segment-label">Total Pengguna</div>
                        </div>
                        <div className="kpi-segment-sub">{periodLabel} · semua aplikasi</div>
                    </div>

                    <div className="kpi-segment">
                        <div className="kpi-segment-top">
                            <div className="kpi-segment-icon">
                                <DollarSign size={19} color="#fbbf24" />
                            </div>
                        </div>
                        <div>
                            <div className="kpi-segment-num" style={{ color: '#fbbf24' }}>
                                {formatIDR(totCost)}
                            </div>
                            <div className="kpi-segment-label">Total Server Cost</div>
                        </div>
                        <div className="kpi-segment-sub">{periodLabel} · estimasi infra</div>
                    </div>

                    <div className="kpi-segment">
                        <div className="kpi-segment-top">
                            <div className="kpi-segment-icon">
                                <TrendingUp size={19} color="#7ce0b4" />
                            </div>
                            <div className="kpi-segment-trend">avg</div>
                        </div>
                        <div>
                            <div className="kpi-segment-num">{formatIDR(Math.round(avgCpu))}</div>
                            <div className="kpi-segment-label">Cost per User (rata-rata)</div>
                        </div>
                        <div className="kpi-segment-sub">Total cost ÷ total user</div>
                    </div>

                    <div className="kpi-segment">
                        <div className="kpi-segment-top">
                            <div className="kpi-segment-icon">
                                <BarChart2 size={19} color="#fff" />
                            </div>
                        </div>
                        <div>
                            <div className="kpi-segment-num">{activeApps}</div>
                            <div className="kpi-segment-label">Aplikasi Aktif</div>
                        </div>
                        <div className="kpi-segment-sub">dari {appData.length} terdaftar</div>
                    </div>
                </div>

                {/* -------- INSIGHT CALLOUT -------- */}
                <div className="lu-insight">
                    <div className="lu-insight-icon">
                        <Lightbulb size={18} color="#fff" />
                    </div>
                    <div className="lu-insight-body">
                        Periode <strong>{periodLabel}</strong>: total <strong>{formatNum(totUsers)}</strong> pengguna
                        aktif dengan estimasi biaya infrastruktur <strong>{formatIDR(totCost)}</strong>.
                        Rata-rata <em>cost per user</em> seluruh aplikasi adalah{' '}
                        <strong>{formatIDR(Math.round(avgCpu))}/user</strong> — aplikasi dengan jumlah
                        pengguna banyak cenderung memiliki cost per user yang lebih efisien.
                    </div>
                </div>

                {/* -------- TREND CHART -------- */}
                <div className="lu-panel">
                    <div className="lu-panel-head">
                        <div>
                            <div className="lu-panel-title">Tren Pengguna</div>
                            <div className="lu-panel-note">
                                <CalendarDays size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                Tampilan {periodLabel.toLowerCase()}
                            </div>
                        </div>
                    </div>
                    <div className="lu-chart-wrap">
                        <BarChart data={trend} />
                    </div>
                    <div className="lu-chart-footer">
                        <span>Terendah: {formatNum(trendMin)}</span>
                        <span>Rata-rata: {formatNum(trendAvg)}</span>
                        <span>Tertinggi: {formatNum(trendMax)}</span>
                    </div>
                </div>

                {/* -------- APP TABLE -------- */}
                <div className="lu-panel">
                    <div className="lu-panel-head">
                        <div>
                            <div className="lu-panel-title">Detail per Aplikasi</div>
                            <div className="lu-panel-note">
                                Cost per user dihitung otomatis: Server Cost ÷ Total User ({periodLabel})
                            </div>
                        </div>
                    </div>
                    <div className="lu-table-wrap">
                        <table className="lu-table">
                            <thead>
                                <tr>
                                    <th>Aplikasi</th>
                                    <th>Status</th>
                                    <th className="num">Total User</th>
                                    <th style={{ minWidth: 140 }}>Distribusi User</th>
                                    <th className="num">Server Cost</th>
                                    <th className="num">Cost / User</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr key={row.id}>
                                        {/* App name */}
                                        <td>
                                            <div className="lu-app-name">{row.name}</div>
                                            <div className="lu-app-cat">{row.category}</div>
                                        </td>

                                        {/* Status */}
                                        <td>
                                            <span className={`lu-status-badge ${row.status}`}>
                                                <span
                                                    className="lu-status-dot"
                                                    style={{
                                                        background:
                                                            row.status === 'active'
                                                                ? 'var(--green)'
                                                                : '#C7CCDA',
                                                    }}
                                                />
                                                {row.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>

                                        {/* Total user */}
                                        <td className="num">{formatNum(row._users)}</td>

                                        {/* Mini bar */}
                                        <td>
                                            <div className="lu-mini-bar-wrap">
                                                <div className="lu-mini-bar-bg">
                                                    <div
                                                        className="lu-mini-bar-fill"
                                                        style={{
                                                            width: `${maxUsers > 0 ? (row._users / maxUsers) * 100 : 0}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="lu-mini-bar-pct">
                                                    {maxUsers > 0
                                                        ? `${((row._users / maxUsers) * 100).toFixed(0)}%`
                                                        : '—'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Server cost */}
                                        <td className="num">{formatIDR(row._cost)}</td>

                                        {/* Cost per user */}
                                        <td className="num">
                                            {row._cpu !== null ? (
                                                <span className="lu-cost">
                                                    {formatIDR(Math.round(row._cpu))}
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--ink-soft)', fontSize: 12 }}>
                                                    — (tidak ada user)
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </Layout>
    );
}
