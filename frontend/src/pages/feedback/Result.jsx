import { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Check,
    MessageSquareWarning,
    Ticket,
    FolderOpen,
    FolderCheck,
    TrendingUp,
    AlertTriangle,
    MapPin,
    SearchCheck,
} from 'lucide-react';
import Layout from '../../components/layout';
import ProgressBar from '../../components/ProgressBar';
import Table from '../../components/table';
import CheckTicket from './CheckTicket';
import { fetchApplications } from '../../services/applications';
import { createComplaint } from '../../services/complaints';
import '../../style/feedback_style/Main_Style.css';
import '../../style/Dashboard_Style.css';

/* ------------------------------------------------------------------ */
/* DATA — derived from Live Report, Classification Case, Problem      */
/* Management & Repeated Problem tabs (November 2025)                 */
/* ------------------------------------------------------------------ */

const ticketStats = {
    total: 885,
    open: 5,
    closed: 880,
};
const resolutionRate = ((ticketStats.closed / ticketStats.total) * 100).toFixed(1);

// Weekly ticket volume, simplified from the 29-day daily trend so the
// shape of the month is still readable at a glance.
const ticketTrend = [
    { label: 'Week 1', value: 317 },
    { label: 'Week 2', value: 213 },
    { label: 'Week 3', value: 151 },
    { label: 'Week 4', value: 191 },
];
const trendMax = Math.max(...ticketTrend.map((d) => d.value));
const trendMin = Math.min(...ticketTrend.map((d) => d.value));
const trendAvg = Math.round(ticketTrend.reduce((sum, d) => sum + d.value, 0) / ticketTrend.length);

// Top issue categories (full distribution has 17 categories, top 6 shown)
const topCategories = [
    { label: 'Ticketing Handling', value: 150, percent: 16.6 },
    { label: 'RH Visit', value: 147, percent: 16.3 },
    { label: 'KPI', value: 106, percent: 11.7 },
    { label: 'Preventive Maintenance', value: 104, percent: 11.5 },
    { label: 'User Management', value: 100, percent: 11.1 },
    { label: 'SVA', value: 76, percent: 8.4 },
];
const maxCategoryValue = Math.max(...topCategories.map((c) => c.value));
const remainingCategoryCount = 11; // categories not shown in the top list

// Top contributing regions (out of 13 regions, top 6 shown)
const regionData = [
    { label: 'R8 Kalimantan', value: 142, share: 16.5 },
    { label: 'R5 Central Java', value: 117, share: 13.6 },
    { label: 'R6 East Java', value: 100, share: 11.6 },
    { label: 'RI Sumbagut', value: 95, share: 11.1 },
    { label: 'R4 West Java', value: 80, share: 9.3 },
    { label: 'R9 Sulawesi', value: 80, share: 9.3 },
];
const remainingRegionCount = 7;

// Root cause: for each major category, what dominates it and how fast it
// tends to get resolved — this is the most actionable view of the old
// "Problem Management" + "Total Problem per Week" tabs combined.
const problemHotspots = [
    {
        category: 'Ticketing Handling',
        total: 150,
        avgResolution: '29.6 jam',
        topProblem: 'Data Not Synchronize',
        topProblemValue: 55,
    },
    {
        category: 'RH Visit',
        total: 147,
        avgResolution: '29.0 jam',
        topProblem: 'Data Not Synchronize',
        topProblemValue: 86,
    },
    {
        category: 'KPI',
        total: 106,
        avgResolution: '20.9 jam',
        topProblem: 'Data Not Synchronize',
        topProblemValue: 79,
    },
    {
        category: 'Preventive Maintenance',
        total: 104,
        avgResolution: '20.5 jam',
        topProblem: 'Data Not Synchronize',
        topProblemValue: 33,
    },
];

// Repeated problem monitor (top 5 by volume, Nov 2025)
const repeatedProblems = [
    { problem: 'Data Not Synchronize', total: 262, repeated: false },
    { problem: 'Other Problems', total: 93, repeated: false },
    { problem: 'SVA → Update Draft Ticket', total: 66, repeated: false },
    { problem: 'Ketidaksesuaian Data Kunjungan', total: 42, repeated: false },
    { problem: 'Change Area User', total: 33, repeated: false },
];

const dataNotSyncShare = ((repeatedProblems[0].total / ticketStats.total) * 100).toFixed(1);

// Seed tickets so "Cek Status Tiket" has something to find on first load.
// Tickets submitted through the complaint form get pushed into this same
// list at runtime, so both features stay in sync.
const initialTickets = [
    {
        id: 'TCK-251103-8842',
        fullName: 'Budi Santoso',
        application: 'SWFM Mobile',
        category: 'Data Not Synchronize',
        regional: 'R6 EAST JAVA',
        status: 'closed',
        submittedDate: '03 Nov 2025',
        updatedDate: '05 Nov 2025',
        description: 'Data kunjungan tidak sinkron setelah update aplikasi ke versi terbaru.',
        timeline: [
            { label: 'Tiket Diterima', date: '03 Nov 2025', done: true },
            { label: 'Sedang Ditinjau', date: '03 Nov 2025', done: true },
            { label: 'Dalam Proses Perbaikan', date: '04 Nov 2025', done: true },
            { label: 'Selesai', date: '05 Nov 2025', done: true },
        ],
    },
    {
        id: 'TCK-251110-1197',
        fullName: 'Sri Wulandari',
        application: 'SWFM Web',
        category: 'RH Visit',
        regional: 'R5 CENTRAL JAVA',
        status: 'in_progress',
        submittedDate: '10 Nov 2025',
        updatedDate: '12 Nov 2025',
        description: 'Ketidaksesuaian data kunjungan pada laporan mingguan.',
        timeline: [
            { label: 'Tiket Diterima', date: '10 Nov 2025', done: true },
            { label: 'Sedang Ditinjau', date: '10 Nov 2025', done: true },
            { label: 'Dalam Proses Perbaikan', date: '12 Nov 2025', done: true },
            { label: 'Selesai', date: '-', done: false },
        ],
    },
    {
        id: 'TCK-251127-0053',
        fullName: 'Andi Prasetyo',
        application: 'SWFM Mobile',
        category: 'Ticketing Handling',
        regional: 'R8 KALIMANTAN',
        status: 'open',
        submittedDate: '27 Nov 2025',
        updatedDate: '27 Nov 2025',
        description: 'Tiket tidak terupdate meskipun sudah diproses oleh tim lapangan.',
        timeline: [
            { label: 'Tiket Diterima', date: '27 Nov 2025', done: true },
            { label: 'Sedang Ditinjau', date: '-', done: false },
            { label: 'Dalam Proses Perbaikan', date: '-', done: false },
            { label: 'Selesai', date: '-', done: false },
        ],
    },
];

function formatDisplayDate(date) {
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
    ];
    const d = String(date.getDate()).padStart(2, '0');
    const m = months[date.getMonth()];
    const y = date.getFullYear();
    return `${d} ${m} ${y}`;
}

const complainSteps = [
    { id: 1, label: 'Personal Information' },
    { id: 2, label: 'Issue' },
    { id: 3, label: 'User Management' },
    { id: 4, label: 'Issue Description' },
];

const initialComplainData = {
    fullName: '',
    email: '',
    phone: '',
    regional: '',
    issueType: '',
    application: '',
    applicationId: '', // Menyimpan GUID ID aplikasi riil
    category: '',
    ldapUsername: '',
    role: '',
    description: '',
};

/* ------------------------------------------------------------------ */
/* TABLE COLUMN DEFINITIONS                                            */
/* ------------------------------------------------------------------ */

const regionColumns = [
    { key: 'label', label: 'Regional' },
    { key: 'value', label: 'Total Kasus', className: 'table-num' },
    {
        key: 'share',
        label: 'Share',
        className: 'table-num',
        render: (row) => `${row.share}%`,
    },
];

const hotspotColumns = [
    { key: 'category', label: 'Kategori' },
    { key: 'total', label: 'Total Tiket', className: 'table-num' },
    { key: 'avgResolution', label: 'Rata-rata Resolusi', className: 'table-num' },
    {
        key: 'topProblem',
        label: 'Masalah Dominan',
        render: (row) => (
            <span className="table-status-cell">
                <span className="status-dot" style={{ background: 'var(--red)' }} />
                {row.topProblem} ({row.topProblemValue})
            </span>
        ),
    },
];

const repeatedColumns = [
    { key: 'problem', label: 'Problem' },
    { key: 'total', label: 'Total (Nov 2025)', className: 'table-num' },
    {
        key: 'repeated',
        label: 'Status',
        render: (row) => (
            <span className="table-status-cell">
                <span
                    className="status-dot"
                    style={{ background: row.repeated ? 'var(--red)' : 'var(--green)' }}
                />
                {row.repeated ? 'Repeated' : 'Not Repeated'}
            </span>
        ),
    },
];

/* ------------------------------------------------------------------ */
/* SMALL INLINE TREND CHART (no external chart library required)       */
/* ------------------------------------------------------------------ */

function buildTrendPaths(data, width = 600, height = 140, padding = 10) {
    const max = Math.max(...data.map((d) => d.value));
    const min = Math.min(...data.map((d) => d.value));
    const range = max - min || 1;
    const step = (width - padding * 2) / (data.length - 1 || 1);

    const points = data.map((d, i) => {
        const x = padding + i * step;
        const y = padding + (height - padding * 2) * (1 - (d.value - min) / range);
        return [x, y];
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
    const areaPath = `${linePath} L${points[points.length - 1][0]},${height - padding} L${points[0][0]},${height - padding} Z`;

    return { linePath, areaPath, points };
}

function TrendChart({ data }) {
    const width = 600;
    const height = 140;
    const { linePath, areaPath, points } = buildTrendPaths(data, width, height);

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="trend-chart-svg" preserveAspectRatio="none">
            <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--navy)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="var(--navy)" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#trendFill)" />
            <path d={linePath} fill="none" stroke="var(--navy)" strokeWidth="2.5" />
            {points.map((p, i) => (
                <circle key={data[i].label} cx={p[0]} cy={p[1]} r="4" fill="var(--navy)" />
            ))}
        </svg>
    );
}

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT                                                       */
/* ------------------------------------------------------------------ */

function generateTicketId() {
    const now = new Date();
    const y = String(now.getFullYear()).slice(2);
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `TCK-${y}${m}${d}-${rand}`;
}

function Result() {
    const [view, setView] = useState('dashboard'); // 'dashboard' | 'complain' | 'checkTicket'
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(initialComplainData);
    const [submitted, setSubmitted] = useState(false);
    const [generatedTicketId, setGeneratedTicketId] = useState('');
    const [tickets, setTickets] = useState(initialTickets);
    const [applications, setApplications] = useState([]);
    const [error, setError] = useState('');

    // Load daftar aplikasi dan isi otomatis user dari localStorage
    useEffect(() => {
        // Load data user
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setFormData((prev) => ({
                    ...prev,
                    fullName: user.nama || user.username || '',
                    email: user.email || '',
                    phone: user.telp || '',
                    ldapUsername: user.username || '',
                    role: user.levelAccess || '',
                }));
            } catch (e) {
                console.error(e);
            }
        }

        // Load aplikasi
        fetchApplications()
            .then((data) => setApplications(data))
            .catch((err) => console.error('Gagal mengambil aplikasi:', err));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'application') {
            const selectedApp = applications.find((app) => app.name === value);
            setFormData((prev) => ({
                ...prev,
                application: value,
                applicationId: selectedApp ? selectedApp.id : '',
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleNext = () => {
        setError('');

        if (currentStep === 1) {
            if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.regional.trim() || !formData.issueType.trim()) {
                setError('Mohon lengkapi seluruh field wajib di Step 1 (Full Name, Email, No Handphone, Regional, Issue Type).');
                return;
            }
        }

        if (currentStep === 2) {
            if (!formData.application.trim() || !formData.category.trim()) {
                setError('Mohon lengkapi seluruh field wajib di Step 2 (Application, Category).');
                return;
            }
        }

        if (currentStep === 3) {
            if (!formData.ldapUsername.trim() || !formData.role.trim()) {
                setError('Mohon lengkapi seluruh field wajib di Step 3 (Username LDAP, Role/Jabatan).');
                return;
            }
        }

        if (currentStep < complainSteps.length) setCurrentStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setError('');
        if (currentStep > 1) setCurrentStep((prev) => prev - 1);
    };

    const handleSubmit = async () => {
        setError('');

        // Validasi Step 4
        if (!formData.description.trim()) {
            setError('Mohon isi deskripsi keluhan Anda di Step 4.');
            return;
        }

        // Validasi kumulatif secara menyeluruh sebelum submit
        if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.regional.trim() || !formData.issueType.trim()) {
            setError('Data pada Step 1 belum lengkap.');
            setCurrentStep(1);
            return;
        }

        if (!formData.application.trim() || !formData.category.trim()) {
            setError('Data pada Step 2 belum lengkap.');
            setCurrentStep(2);
            return;
        }

        if (!formData.ldapUsername.trim() || !formData.role.trim()) {
            setError('Data pada Step 3 belum lengkap.');
            setCurrentStep(3);
            return;
        }

        if (!formData.applicationId) {
            setError('Aplikasi yang Anda pilih tidak valid atau tidak terdaftar di sistem. Mohon pilih dari dropdown di Step 2.');
            setCurrentStep(2);
            return;
        }

        try {
            const payload = {
                regional: formData.regional,
                issueType: formData.issueType,
                applicationId: formData.applicationId,
                categoryMasalah: formData.category,
                usernameLDAP: formData.ldapUsername,
                role: formData.role,
                description: formData.description,
            };

            const response = await createComplaint(payload);

            const newTicketId = generateTicketId();
            const today = formatDisplayDate(new Date());

            const newTicket = {
                id: newTicketId,
                fullName: formData.fullName,
                application: formData.application,
                category: formData.category,
                regional: formData.regional,
                status: 'open',
                submittedDate: today,
                updatedDate: today,
                description: formData.description,
                timeline: [
                    { label: 'Tiket Diterima', date: today, done: true },
                    { label: 'Sedang Ditinjau', date: '-', done: false },
                    { label: 'Dalam Proses Perbaikan', date: '-', done: false },
                    { label: 'Selesai', date: '-', done: false },
                ],
            };

            setTickets((prev) => [...prev, newTicket]);
            setGeneratedTicketId(newTicketId);
            setSubmitted(true);
        } catch (err) {
            console.error('Error saat membuat komplain:', err);
            setError(err.message || 'Gagal mengirimkan keluhan ke database.');
        }
    };

    const backToDashboard = () => {
        setView('dashboard');
        setCurrentStep(1);

        // Reset form tetapi pertahankan identitas user yang login
        const storedUser = localStorage.getItem('user');
        let parsedUser = {};
        if (storedUser) {
            try { parsedUser = JSON.parse(storedUser); } catch(e) {}
        }
        setFormData({
            ...initialComplainData,
            fullName: parsedUser.nama || parsedUser.username || '',
            email: parsedUser.email || '',
            phone: parsedUser.telp || '',
            ldapUsername: parsedUser.username || '',
            role: parsedUser.levelAccess || '',
        });

        setSubmitted(false);
        setGeneratedTicketId('');
        setError('');
    };

    if (view === 'checkTicket') {
        return <CheckTicket onBack={backToDashboard} tickets={tickets} />;
    }

    if (view === 'complain') {
        if (submitted) {
            return (
                <Layout>
                    <div className="feedback-content">
                        <div className="feedback-success">
                            <div className="feedback-success-icon">
                                <Check size={32} strokeWidth={2.5} color="#FFFFFF" />
                            </div>
                            <h2>Keluhan Berhasil Diajukan</h2>
                            <p>
                                Terima kasih, {formData.fullName || 'Pengguna'}. Keluhan kamu terkait{' '}
                                <strong>{formData.application || 'aplikasi terkait'}</strong> sudah
                                diterima dan akan segera ditindaklanjuti.
                            </p>
                            <p className="form-hint">Simpan nomor tiket ini untuk mengecek statusnya nanti:</p>
                            <div className="ticket-id-badge">{generatedTicketId}</div>
                            <div className="feedback-form-actions-right" style={{ marginTop: 8 }}>
                                <button className="feedback-btn-secondary" onClick={() => setView('checkTicket')}>
                                    Cek Status Tiket
                                </button>
                                <button className="feedback-btn-primary" onClick={backToDashboard}>
                                    Kembali ke Result Feedback
                                </button>
                            </div>
                        </div>
                    </div>
                </Layout>
            );
        }

        return (
            <Layout>
                <div className="feedback-content">
                    <button className="feedback-back-btn" onClick={backToDashboard}>
                        <ArrowLeft size={16} strokeWidth={2} />
                        Kembali ke Result Feedback
                    </button>

                    <div className="feedback-stepper">
                        {complainSteps.map((step, index) => (
                            <div className="feedback-stepper-item" key={step.id}>
                                <div className="feedback-stepper-node">
                                    <div
                                        className={`feedback-stepper-circle ${currentStep === step.id
                                            ? 'active'
                                            : currentStep > step.id
                                                ? 'completed'
                                                : ''
                                            }`}
                                    >
                                        {currentStep > step.id ? <Check size={14} strokeWidth={3} /> : step.id}
                                    </div>
                                    <span
                                        className={`feedback-stepper-label ${currentStep === step.id ? 'active' : ''
                                            }`}
                                    >
                                        {step.label}
                                    </span>
                                </div>
                                {index < complainSteps.length - 1 && <div className="feedback-stepper-line" />}
                            </div>
                        ))}
                    </div>

                    <div className="feedback-form-card">
                        {error && (
                            <div className="feedback-error-banner" style={{
                                padding: '12px',
                                background: '#fee2e2',
                                color: '#991b1b',
                                borderRadius: '6px',
                                marginBottom: '16px',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}>
                                {error}
                            </div>
                        )}
                        {currentStep === 1 && (
                            <>
                                <span className="feedback-form-badge">Please Inform Who You Are</span>
                                <div className="feedback-form-grid">
                                    <div className="form-group">
                                        <label htmlFor="fullName">Full Name *</label>
                                        <input
                                            id="fullName"
                                            name="fullName"
                                            type="text"
                                            placeholder="Type here..."
                                            value={formData.fullName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email">Email Address *</label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="Type here..."
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="phone">No Handphone (Whatsapp) *</label>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            placeholder="08xxxxxxxxxx"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="regional">Regional *</label>
                                        <select
                                            id="regional"
                                            name="regional"
                                            value={formData.regional}
                                            onChange={handleChange}
                                        >
                                            <option value="">Pilih regional...</option>
                                            <option value="HQ">HQ</option>
                                            <option value="RI SUMBAGUT">RI SUMBAGUT</option>
                                            <option value="R4 WEST JAVA">R4 WEST JAVA</option>
                                            <option value="R6 EAST JAVA">R6 EAST JAVA</option>
                                        </select>
                                    </div>
                                    <div className="form-group feedback-form-full">
                                        <label htmlFor="issueType">I Have an Issue *</label>
                                        <select
                                            id="issueType"
                                            name="issueType"
                                            value={formData.issueType}
                                            onChange={handleChange}
                                        >
                                            <option value="">Pilih jenis isu...</option>
                                            <option value="Aplication Error">Aplication Error</option>
                                            <option value="Data Not Synchronize">Data Not Synchronize</option>
                                            <option value="Performance">Performance</option>
                                            <option value="User Management">User Management</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}

                        {currentStep === 2 && (
                            <>
                                <span className="feedback-form-badge">Issue Detail</span>
                                <div className="feedback-form-grid">
                                    <div className="form-group">
                                        <label htmlFor="application">Application *</label>
                                        <select
                                            id="application"
                                            name="application"
                                            value={formData.application}
                                            onChange={handleChange}
                                        >
                                            <option value="">Pilih aplikasi...</option>
                                            {applications.map((app) => (
                                                <option key={app.id} value={app.name}>
                                                    {app.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="category">Category</label>
                                        <input
                                            id="category"
                                            name="category"
                                            type="text"
                                            placeholder="contoh: Ticketing Handling"
                                            value={formData.category}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {currentStep === 3 && (
                            <>
                                <span className="feedback-form-badge">User Management</span>
                                <div className="feedback-form-grid">
                                    <div className="form-group">
                                        <label htmlFor="ldapUsername">Username LDAP</label>
                                        <input
                                            id="ldapUsername"
                                            name="ldapUsername"
                                            type="text"
                                            placeholder="Type here..."
                                            value={formData.ldapUsername}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="role">Role / Jabatan</label>
                                        <input
                                            id="role"
                                            name="role"
                                            type="text"
                                            placeholder="Type here..."
                                            value={formData.role}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {currentStep === 4 && (
                            <>
                                <span className="feedback-form-badge">Issue Description</span>
                                <div className="form-group">
                                    <label htmlFor="description">Jelaskan Masalah Kamu</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={5}
                                        placeholder="Ceritakan detail masalah yang kamu alami..."
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                </div>
                            </>
                        )}

                        <div className="feedback-form-actions">
                            {currentStep > 1 ? (
                                <button className="feedback-btn-secondary" onClick={handleBack}>
                                    Back
                                </button>
                            ) : (
                                <div />
                            )}
                            <div className="feedback-form-actions-right">
                                {currentStep < complainSteps.length ? (
                                    <button className="feedback-btn-primary" onClick={handleNext}>
                                        Next
                                    </button>
                                ) : (
                                    <button className="feedback-btn-primary" onClick={handleSubmit}>
                                        Submit
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="feedback-content">
                {/* Action buttons toolbar */}
                <div className="feedback-hero-actions" style={{ alignSelf: 'flex-end' }}>
                    <button className="feedback-hero-secondary-btn" onClick={() => setView('checkTicket')}>
                        <SearchCheck size={18} strokeWidth={2.2} />
                        Cek Status Tiket
                    </button>
                    <button className="feedback-complain-btn" onClick={() => setView('complain')}>
                        <MessageSquareWarning size={18} strokeWidth={2.2} />
                        I Want to Complain
                    </button>
                </div>

                {/* KPI stats row — kpi-unified style (same as Dashboard) */}
                <div className="kpi-unified">
                    <div className="kpi-segment">
                        <div className="kpi-segment-top">
                            <div className="kpi-segment-icon">
                                <Ticket size={19} color="#fff" />
                            </div>
                        </div>
                        <div>
                            <div className="kpi-segment-num">{ticketStats.total}</div>
                            <div className="kpi-segment-label">Total Ticket</div>
                        </div>
                        <div className="kpi-segment-sub">November 2025</div>
                    </div>
                    <div className="kpi-segment">
                        <div className="kpi-segment-top">
                            <div className="kpi-segment-icon">
                                <FolderOpen size={19} color="#FF8FA3" />
                            </div>
                        </div>
                        <div>
                            <div className="kpi-segment-num" style={{ color: '#FF8FA3' }}>{ticketStats.open}</div>
                            <div className="kpi-segment-label">Open Ticket</div>
                        </div>
                        <div className="kpi-segment-sub">Perlu ditindaklanjuti</div>
                    </div>
                    <div className="kpi-segment">
                        <div className="kpi-segment-top">
                            <div className="kpi-segment-icon">
                                <FolderCheck size={19} color="#7ce0b4" />
                            </div>
                        </div>
                        <div>
                            <div className="kpi-segment-num">{ticketStats.closed}</div>
                            <div className="kpi-segment-label">Closed Ticket</div>
                        </div>
                        <div className="kpi-segment-sub">Sudah terselesaikan</div>
                    </div>
                    <div className="kpi-segment">
                        <div className="kpi-segment-top">
                            <div className="kpi-segment-icon">
                                <TrendingUp size={19} color="#7ce0b4" />
                            </div>
                            <div className="kpi-segment-trend">▲ {resolutionRate}%</div>
                        </div>
                        <div>
                            <div className="kpi-segment-num">{resolutionRate}%</div>
                            <div className="kpi-segment-label">Resolution Rate</div>
                        </div>
                        <div className="kpi-segment-sub">Dari total tiket masuk</div>
                    </div>
                </div>

                {/* Insight banner: the single most useful takeaway from the data */}
                <div className="insight-banner">
                    <div className="insight-banner-icon">
                        <AlertTriangle size={18} strokeWidth={2.2} color="#fff" />
                    </div>
                    <div className="insight-banner-text">
                        <strong>Data Not Synchronize</strong> adalah akar masalah dominan di hampir semua
                        kategori tiket (Ticketing Handling, RH Visit, KPI, Preventive Maintenance) — total{' '}
                        <strong>{repeatedProblems[0].total} kasus</strong> bulan ini, atau sekitar{' '}
                        <strong>{dataNotSyncShare}%</strong> dari seluruh tiket. Belum ada masalah yang
                        ditandai "repeated", tapi volume masalah ini jauh di atas yang lain — layak jadi
                        prioritas perbaikan sistem, bukan sekadar penanganan tiket satu-satu.
                    </div>
                </div>

                {/* Weekly ticket volume trend */}
                <div className="panel">
                    <div className="panel-head">
                        <div>
                            <div className="panel-title">Tren Volume Tiket Mingguan</div>
                            <div className="panel-note">November 2025, disederhanakan per minggu</div>
                        </div>
                    </div>
                    <div className="trend-chart-wrap">
                        <TrendChart data={ticketTrend} />
                    </div>
                    <div className="trend-chart-footer">
                        <span>Terendah: {trendMin}</span>
                        <span>Rata-rata: {trendAvg}</span>
                        <span>Tertinggi: {trendMax}</span>
                    </div>
                </div>

                {/* Top categories + regional hotspots */}
                <div className="feedback-split">
                    <div className="panel">
                        <div className="panel-head">
                            <div>
                                <div className="panel-title">Top Kategori Masalah</div>
                                <div className="panel-note">Share dari total kasus per jenis isu</div>
                            </div>
                        </div>
                        <div className="category-list">
                            {topCategories.map((cat) => (
                                <div className="category-row" key={cat.label}>
                                    <div className="category-row-top">
                                        <span>{cat.label}</span>
                                        <span className="category-value">
                                            {cat.value} ({cat.percent}%)
                                        </span>
                                    </div>
                                    <ProgressBar
                                        value={(cat.value / maxCategoryValue) * 100}
                                        color="var(--red)"
                                        height={7}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="category-list-more">+{remainingCategoryCount} kategori lainnya</div>
                    </div>

                    <Table
                        title="Case by Region — Top Kontributor"
                        columns={regionColumns}
                        data={regionData}
                        emptyMessage="Belum ada data regional."
                    />
                </div>

                {/* Root cause per top category */}
                <Table
                    title="Root Cause per Kategori Utama"
                    columns={hotspotColumns}
                    data={problemHotspots}
                    emptyMessage="Belum ada data problem management."
                />

                {/* Repeated problem monitor */}
                <Table
                    title="Repeated Problem Monitor"
                    columns={repeatedColumns}
                    data={repeatedProblems}
                    emptyMessage="Belum ada data repeated problem."
                />
            </div>
        </Layout>
    );
}

export default Result;