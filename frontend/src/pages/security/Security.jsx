import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Download,
    Plus,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    FileText,
} from 'lucide-react';
import Layout from '../../components/Layout';
import { fetchApplications } from '../../services/applications';
import '../../style/security_style/Main_Style.css';

// ─── Sample Data ────────────────────────────────────────────────────────────
const PHASES = [
    { label: 'Red Teaming Phase X Term 1 - 2025', source: '(Source_data_application)' },
    { label: 'Red Teaming Phase IX Term 2 - 2024', source: '(Source_data_application)' },
];

// TODO: Skor severity (critical/high/medium/low, open/close) masih placeholder
// karena backend belum punya endpoint/model "Security Assessment". Begitu ada
// (mis. GET /api/SecurityAssessments), ganti fungsi ini jadi ambil dari API,
// idealnya per-application (join by app.id) bukan angka sama rata seperti sekarang.
function attachPlaceholderSeverity(apps) {
    return apps.map((app) => ({
        id: app.id,
        name: app.name,
        open: { critical: 0, high: 1, medium: 2, low: 2, total: 5 },
        close: { critical: 0, high: 1, medium: 2, low: 2, total: 4 },
    }));
}

const PAGE_SIZES = [5, 10, 20, 50];

// ─── Component ───────────────────────────────────────────────────────────────
function Security() {
    const navigate = useNavigate();

    // ---------- Load aplikasi asli dari API (bukan lagi hardcoded) ----------
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setIsLoading(true);
            setLoadError(null);
            try {
                const apps = await fetchApplications();
                if (!cancelled) setRows(attachPlaceholderSeverity(apps));
            } catch (err) {
                if (!cancelled) setLoadError(err.message || 'Gagal memuat daftar aplikasi.');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const [search, setSearch] = useState('');
    const [phaseOpen, setPhaseOpen] = useState(false);
    const [selectedPhase, setSelectedPhase] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [showSizeDropdown, setShowSizeDropdown] = useState(false);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return rows.filter((a) => a.name.toLowerCase().includes(q));
    }, [rows, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    function handleSearch(val) {
        setSearch(val);
        setPage(1);
    }

    function handlePageSize(size) {
        setPageSize(size);
        setPage(1);
        setShowSizeDropdown(false);
    }

    function handlePhase(idx) {
        setSelectedPhase(idx);
        setPhaseOpen(false);
        setPage(1);
    }

    // Pagination page numbers
    function getPageNumbers() {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('…');
            for (
                let i = Math.max(2, currentPage - 1);
                i <= Math.min(totalPages - 1, currentPage + 1);
                i++
            ) pages.push(i);
            if (currentPage < totalPages - 2) pages.push('…');
            pages.push(totalPages);
        }
        return pages;
    }

    const phase = PHASES[selectedPhase];
    const startItem = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, filtered.length);

    if (isLoading) {
        return (
            <Layout>
                <div className="sa-page">
                    <div className="sa-empty">Memuat daftar aplikasi...</div>
                </div>
            </Layout>
        );
    }

    if (loadError) {
        return (
            <Layout>
                <div className="sa-page">
                    <div className="sa-empty">{loadError}</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="sa-page">
                {/* ── Header ───────────────────────────────────────── */}
                <div className="sa-header">
                    <div className="sa-header-left">
                        <h1 className="sa-title">Security Assessment</h1>
                    </div>
                    <div className="sa-header-right">
                        <span className="sa-data-date">Data as of 2 Jul 2026 09:00</span>
                        <button className="sa-export-btn">
                            <Download size={14} strokeWidth={2.2} />
                            Export Report
                        </button>
                    </div>
                </div>

                {/* ── Toolbar ──────────────────────────────────────── */}
                <div className="sa-toolbar">
                    <div className="sa-toolbar-left">
                        {/* Search */}
                        <div className="sa-search">
                            <Search size={14} strokeWidth={2} className="sa-search-icon" />
                            <input
                                type="text"
                                placeholder="Search applications by name..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>

                        {/* Phase Filter */}
                        <div className="sa-dropdown-wrap">
                            <button
                                className="sa-phase-btn"
                                onClick={() => setPhaseOpen((v) => !v)}
                            >
                                Phase Filter
                                <ChevronDown size={14} strokeWidth={2.2} />
                            </button>
                            {phaseOpen && (
                                <div className="sa-dropdown-menu">
                                    {PHASES.map((p, i) => (
                                        <button
                                            key={i}
                                            className={`sa-dropdown-item ${selectedPhase === i ? 'active' : ''}`}
                                            onClick={() => handlePhase(i)}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="sa-toolbar-right">
                        {/* Showing count */}
                        <span className="sa-showing">
                            Showing{' '}
                            <strong>
                                {startItem}–{endItem}
                            </strong>{' '}
                            of <strong>{filtered.length}</strong> applications
                        </span>

                        {/* SHOW per-page */}
                        <div className="sa-show-wrap">
                            <span className="sa-show-label">SHOW</span>
                            <div className="sa-dropdown-wrap">
                                <button
                                    className="sa-show-btn"
                                    onClick={() => setShowSizeDropdown((v) => !v)}
                                >
                                    {pageSize}
                                    <ChevronDown size={12} strokeWidth={2.2} />
                                </button>
                                {showSizeDropdown && (
                                    <div className="sa-dropdown-menu sa-dropdown-menu--right">
                                        {PAGE_SIZES.map((s) => (
                                            <button
                                                key={s}
                                                className={`sa-dropdown-item ${pageSize === s ? 'active' : ''}`}
                                                onClick={() => handlePageSize(s)}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Add button */}
                        <button className="sa-add-btn" onClick={() => navigate('/security-assessment/add')}>
                            <Plus size={14} strokeWidth={2.5} />
                            Add Security Assessment
                        </button>
                    </div>
                </div>

                {/* ── Table ────────────────────────────────────────── */}
                <div className="sa-table-wrap">
                    <table className="sa-table">
                        {/* Section header */}
                        <thead>
                            <tr className="sa-section-row">
                                <td colSpan={8}>
                                    <div className="sa-section-inner">
                                        <strong>{phase.label}</strong>
                                        <span>Source Data : {phase.source}</span>
                                    </div>
                                </td>
                            </tr>
                            <tr className="sa-col-header">
                                <th className="sa-th-name">App Name</th>
                                <th>Status</th>
                                <th>Severity Critical</th>
                                <th>Severity High</th>
                                <th>Severity Medium</th>
                                <th>Severity Low</th>
                                <th>Total</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paged.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="sa-empty">
                                        No applications found.
                                    </td>
                                </tr>
                            ) : (
                                paged.map((app) => (
                                    <React.Fragment key={app.id}>
                                        {/* Open row */}
                                        <tr className="sa-tr">
                                            <td className="sa-td-name" rowSpan={2}>
                                                {app.name}
                                            </td>
                                            <td>
                                                <span className="sa-badge sa-badge--open">Open</span>
                                            </td>
                                            <td>
                                                <span className="sa-sev sa-sev--critical">
                                                    {app.open.critical}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="sa-sev sa-sev--high">
                                                    {app.open.high}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="sa-sev sa-sev--medium">
                                                    {app.open.medium}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="sa-sev sa-sev--low">
                                                    {app.open.low}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="sa-total">{app.open.total}</span>
                                            </td>
                                            <td>
                                                <button className="sa-action-btn" title="View report">
                                                    <FileText size={15} strokeWidth={1.8} />
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Close row */}
                                        <tr className="sa-tr sa-tr--close">
                                            <td>
                                                <span className="sa-badge sa-badge--close">Close</span>
                                            </td>
                                            <td>
                                                <span className="sa-sev sa-sev--critical">
                                                    {app.close.critical}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="sa-sev sa-sev--high">
                                                    {app.close.high}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="sa-sev sa-sev--medium">
                                                    {app.close.medium}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="sa-sev sa-sev--low">
                                                    {app.close.low}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="sa-total">{app.close.total}</span>
                                            </td>
                                            <td>
                                                <button className="sa-action-btn" title="View report">
                                                    <FileText size={15} strokeWidth={1.8} />
                                                </button>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Footer / Pagination ──────────────────────────── */}
                <div className="sa-footer">
                    <span className="sa-footer-info">
                        Showing <strong>{startItem}</strong> – <strong>{endItem}</strong> of{' '}
                        <strong>{filtered.length.toLocaleString()}</strong> applications
                    </span>

                    <div className="sa-pagination">
                        <button
                            className="sa-page-btn sa-page-nav"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft size={14} strokeWidth={2.5} />
                        </button>

                        {getPageNumbers().map((p, i) =>
                            p === '…' ? (
                                <span key={`ellipsis-${i}`} className="sa-page-ellipsis">
                                    …
                                </span>
                            ) : (
                                <button
                                    key={p}
                                    className={`sa-page-btn ${currentPage === p ? 'active' : ''}`}
                                    onClick={() => setPage(p)}
                                >
                                    {p}
                                </button>
                            )
                        )}

                        <button
                            className="sa-page-btn sa-page-nav"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight size={14} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default Security;