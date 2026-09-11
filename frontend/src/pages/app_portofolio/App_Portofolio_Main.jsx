import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Boxes,
    Clock,
    User,
    LayoutGrid,
    List,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Command,
    Sparkles,
    Loader2,
    AlertTriangle,
} from 'lucide-react';
import Layout from '../../components/Layout';
import Table from '../../components/table';
import { fetchApplications } from '../../services/applications';
import '../../style/app_portofolio_style/Main_Style.css';

const statusColor = {
    Active: 'badge-active',
    Maintenance: 'badge-maintenance',
    Inactive: 'badge-inactive',
    Pending: 'badge-maintenance',
};

const statusDotColor = {
    Active: '#1E8E52',
    Maintenance: '#E8720C',
    Inactive: '#9AA1B4',
    Pending: '#E8720C',
};

const GALAXY_PALETTE = ['#D3324A', '#1F2A44', '#1E8E52', '#E8720C', '#6C5CE7', '#00A8B5', '#B5406A'];
const GOLDEN_ANGLE = 137.508 * (Math.PI / 180);


/**
 * GalaxyView
 * ----------------
 * Alternatif dari List/Grid yang sengaja dibuat "di luar ekspektasi": tiap kategori
 * jadi hub yang besarnya proporsional dengan jumlah aplikasi di dalamnya, dan tiap
 * aplikasi jadi titik kecil yang tersebar mengorbit hub-nya dengan pola phyllotaxis
 * (pola sunflower/bunga matahari) — bukan grid kaku, tapi organik.
 *
 * Twist utamanya: mengetik di search TIDAK menghilangkan titik. Titik yang cocok
 * menyala terang & sedikit membesar, sisanya cuma meredup. Peta ini jadi stabil dari
 * waktu ke waktu, jadi orang lama-lama hafal "di mana" app favoritnya berada—alih-alih
 * layout yang selalu reflow setiap kali mengetik seperti list/grid biasa.
 */
function GalaxyView({ allApps, categories, isMatch, navigate }) {
    const [hoveredApp, setHoveredApp] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    const width = 960;
    const height = 560;
    const center = { x: width / 2, y: height / 2 };

    const groups = useMemo(() => {
        return categories.map((category) => ({
            category,
            apps: allApps.filter((app) => app.category === category),
        }));
    }, [allApps, categories]);

    const maxCount = Math.max(1, ...groups.map((g) => g.apps.length));
    const outerRadius = Math.min(230, 110 + groups.length * 16);
    const minHubR = 30;
    const maxHubR = 92;

    function hubRadiusFor(count) {
        const t = Math.sqrt(count / maxCount);
        return minHubR + t * (maxHubR - minHubR);
    }

    function handleDotEnter(app, e) {
        setHoveredApp(app);
        setTooltipPos({ x: e.clientX, y: e.clientY });
    }

    function handleDotMove(e) {
        setTooltipPos({ x: e.clientX, y: e.clientY });
    }

    return (
        <div className="galaxy-frame">
            <svg viewBox={`0 0 ${width} ${height}`} className="galaxy-svg" role="img" aria-label="Peta orbit aplikasi per kategori">
                {groups.map((group, gi) => {
                    const angle = (2 * Math.PI * gi) / groups.length - Math.PI / 2;
                    const hubX = center.x + outerRadius * Math.cos(angle);
                    const hubY = center.y + outerRadius * Math.sin(angle);
                    const hubR = hubRadiusFor(group.apps.length);
                    const color = GALAXY_PALETTE[gi % GALAXY_PALETTE.length];

                    return (
                        <g key={group.category}>
                            <circle
                                cx={hubX}
                                cy={hubY}
                                r={hubR}
                                fill={color}
                                fillOpacity={0.08}
                                stroke={color}
                                strokeOpacity={0.35}
                                strokeWidth={1.5}
                            />
                            <text
                                x={hubX}
                                y={hubY - hubR - 10}
                                textAnchor="middle"
                                fontFamily="Space Grotesk, sans-serif"
                                fontWeight="700"
                                fontSize="13"
                                fill={color}
                            >
                                {group.category}
                            </text>
                            <text
                                x={hubX}
                                y={hubY - hubR + 4}
                                textAnchor="middle"
                                fontFamily="Inter, sans-serif"
                                fontSize="10.5"
                                fill="var(--ink-soft)"
                            >
                                {group.apps.length} app
                            </text>

                            {group.apps.map((app, ai) => {
                                const t = (ai + 0.5) / group.apps.length;
                                const r = hubR * 0.82 * Math.sqrt(t);
                                const theta = ai * GOLDEN_ANGLE;
                                const dx = hubX + r * Math.cos(theta);
                                const dy = hubY + r * Math.sin(theta);
                                const matched = isMatch(app);

                                return (
                                    <circle
                                        key={app.id}
                                        cx={dx}
                                        cy={dy}
                                        r={matched ? 5.5 : 4}
                                        fill={statusDotColor[app.status] || '#9AA1B4'}
                                        opacity={matched ? 1 : 0.2}
                                        stroke={matched ? '#fff' : 'none'}
                                        strokeWidth={matched ? 1.5 : 0}
                                        style={{ cursor: 'pointer', transition: 'opacity 0.2s ease, r 0.2s ease' }}
                                        onMouseEnter={(e) => handleDotEnter(app, e)}
                                        onMouseMove={handleDotMove}
                                        onMouseLeave={() => setHoveredApp(null)}
                                        onClick={() => navigate(`/applications/${app.id}`)}
                                    />
                                );
                            })}
                        </g>
                    );
                })}
            </svg>

            <div className="galaxy-legend">
                {Object.entries(statusDotColor).map(([status, color]) => (
                    <div className="galaxy-legend-item" key={status}>
                        <span className="galaxy-legend-dot" style={{ background: color }} />
                        {status}
                    </div>
                ))}
                <div className="galaxy-legend-note">Ukuran hub = jumlah aplikasi · titik terang = cocok dengan pencarian</div>
            </div>

            {hoveredApp && (
                <div
                    className="galaxy-tooltip"
                    style={{ left: tooltipPos.x + 16, top: tooltipPos.y + 16 }}
                >
                    <div className="galaxy-tooltip-name">{hoveredApp.name}</div>
                    <div className="galaxy-tooltip-meta">{hoveredApp.category} · {hoveredApp.owner}</div>
                    <div className="galaxy-tooltip-row">
                        <span className={`status-badge ${statusColor[hoveredApp.status]}`}>{hoveredApp.status}</span>
                        <span className="galaxy-tooltip-updated">{hoveredApp.updated}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

const PAGE_SIZE = 24;

function AppPortofolioMain() {
    // ---------- Data dari backend ----------
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [viewMode, setViewMode] = useState('list'); // 'list' (default, efektif untuk banyak data) | 'grid'
    const [page, setPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'updated', dir: 'desc' });

    // Command palette (⌘K quick jump)
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [paletteQuery, setPaletteQuery] = useState('');
    const [paletteIndex, setPaletteIndex] = useState(0);
    const paletteInputRef = useRef(null);

    const navigate = useNavigate();

    // ---------- Ambil data aplikasi dari GET /api/Applications ----------
    useEffect(() => {
        let isCancelled = false;

        async function loadData() {
            setIsLoading(true);
            setLoadError(null);
            try {
                const data = await fetchApplications();
                if (!isCancelled) {
                    setApplications(data);
                }
            } catch (err) {
                if (!isCancelled) {
                    setLoadError(err.message || 'Gagal memuat data aplikasi.');
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        }

        loadData();

        return () => {
            isCancelled = true;
        };
    }, []);

    const categories = useMemo(
        () => ['All', ...new Set(applications.map((app) => app.category))],
        [applications]
    );

    const filteredApps = useMemo(() => {
        return applications.filter((app) => {
            const matchesSearch =
                app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.category.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = activeCategory === 'All' || app.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [applications, searchTerm, activeCategory]);

    // Dipakai khusus oleh Galaxy view: predikat yang sama dengan filteredApps,
    // tapi tidak menghapus item dari render—cuma menentukan mana yang "menyala".
    const isMatch = (app) => {
        const matchesSearch =
            app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'All' || app.category === activeCategory;
        return matchesSearch && matchesCategory;
    };

    const sortedApps = useMemo(() => {
        const dir = sortConfig.dir === 'asc' ? 1 : -1;
        return [...filteredApps].sort((a, b) => {
            const aVal = a[sortConfig.key] ?? '';
            const bVal = b[sortConfig.key] ?? '';
            return String(aVal).localeCompare(String(bVal)) * dir;
        });
    }, [filteredApps, sortConfig]);

    const totalPages = Math.max(1, Math.ceil(sortedApps.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const pagedApps = sortedApps.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    // ---------- Handler perubahan pencarian/filter/sort/view ----------
    function handleSearchChange(value) {
        setSearchTerm(value);
        setPage(1);
    }

    function handleCategoryChange(category) {
        setActiveCategory(category);
        setPage(1);
    }

    function toggleSort(key) {
        setSortConfig((prev) => ({
            key,
            dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc',
        }));
        setPage(1);
    }

    function handleViewModeChange(mode) {
        setViewMode(mode);
        setPage(1);
    }

    const sortableColumns = [
        { key: 'name', label: 'Aplikasi' },
        { key: 'category', label: 'Kategori' },
        { key: 'owner', label: 'Owner' },
        { key: 'status', label: 'Status' },
        { key: 'updated', label: 'Update Terakhir' },
    ];

    // ---------- Command palette: hasil pencarian fuzzy sederhana ----------
    const paletteResults = useMemo(() => {
        if (!paletteQuery.trim()) return applications.slice(0, 8);
        const q = paletteQuery.toLowerCase();
        return applications
            .filter(
                (app) =>
                    app.name.toLowerCase().includes(q) ||
                    app.category.toLowerCase().includes(q) ||
                    app.owner.toLowerCase().includes(q)
            )
            .slice(0, 8);
    }, [paletteQuery, applications]);

    function handlePaletteQueryChange(value) {
        setPaletteQuery(value);
        setPaletteIndex(0);
    }

    function openPalette() {
        setPaletteOpen(true);
        setPaletteQuery('');
        setPaletteIndex(0);
    }

    function closePalette() {
        setPaletteOpen(false);
        setPaletteQuery('');
        setPaletteIndex(0);
    }

    function selectPaletteApp(app) {
        closePalette();
        navigate(`/applications/${app.id}`);
    }

    useEffect(() => {
        function handleGlobalKeyDown(e) {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                openPalette();
            } else if (e.key === 'Escape') {
                closePalette();
            }
        }
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (paletteOpen) {
            const raf = requestAnimationFrame(() => paletteInputRef.current?.focus());
            return () => cancelAnimationFrame(raf);
        }
    }, [paletteOpen]);

    function handlePaletteKeyDown(e) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setPaletteIndex((i) => Math.min(i + 1, paletteResults.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setPaletteIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const target = paletteResults[paletteIndex];
            if (target) selectPaletteApp(target);
        }
    }

    return (
        <Layout>
            <div className="portofolio-content">

                <div className="portofolio-toolbar">
                    <div className="portofolio-search">
                        <Search size={18} strokeWidth={2} />
                        <input
                            type="text"
                            placeholder="Cari aplikasi, kategori, owner..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                        <button type="button" className="search-cmdk-badge" onClick={openPalette} title="Buka pencarian cepat">
                            <Command size={12} strokeWidth={2} />
                            <span>⌘/CTRL + K</span>
                        </button>
                    </div>
                    <button type="button" className="portofolio-compare-btn" title="Bandingkan aplikasi terpilih" onClick={() => navigate('/applications/compare')}>
                        Compare Apps
                    </button>
                </div>

                <div className="portofolio-filters">
                    {categories.map((category) => (
                        <button
                            key={category}
                            className={`filter-chip ${activeCategory === category ? 'active' : ''}`}
                            onClick={() => handleCategoryChange(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <div className="portofolio-view-row">
                    <p className="portofolio-count">
                        {isLoading
                            ? 'Memuat data...'
                            : viewMode === 'galaxy'
                            ? `Menyorot ${filteredApps.length} dari ${applications.length} aplikasi`
                            : `${filteredApps.length} aplikasi ditemukan`}
                    </p>
                    <div className="view-toggle" role="tablist" aria-label="Mode tampilan">
                        <button
                            type="button"
                            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => handleViewModeChange('list')}
                        >
                            <List size={14} strokeWidth={2} />
                            List
                        </button>
                        <button
                            type="button"
                            className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => handleViewModeChange('grid')}
                        >
                            <LayoutGrid size={14} strokeWidth={2} />
                            Grid
                        </button>
                        <button
                            type="button"
                            className={`view-toggle-btn view-toggle-btn-galaxy ${viewMode === 'galaxy' ? 'active' : ''}`}
                            onClick={() => handleViewModeChange('galaxy')}
                        >
                            <Sparkles size={14} strokeWidth={2} />
                            Galaxy
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="portofolio-empty">
                        <Loader2 size={20} className="spin" strokeWidth={2} />
                        <span style={{ marginLeft: 8 }}>Memuat data aplikasi...</span>
                    </div>
                ) : loadError ? (
                    <div className="portofolio-empty">
                        <AlertTriangle size={20} strokeWidth={2} />
                        <span style={{ marginLeft: 8 }}>{loadError}</span>
                    </div>
                ) : viewMode === 'galaxy' ? (
                    <GalaxyView
                        allApps={applications}
                        categories={categories.filter((c) => c !== 'All')}
                        isMatch={isMatch}
                        navigate={navigate}
                    />
                ) : filteredApps.length === 0 ? (
                    <div className="portofolio-empty">
                        Tidak ada aplikasi yang cocok dengan pencarian atau filter.
                    </div>
                ) : viewMode === 'list' ? (
                    <Table
                        columns={sortableColumns.map((col) => ({
                            key: col.key,
                            label: col.label,
                            ariaSort: sortConfig.key === col.key ? (sortConfig.dir === 'asc' ? 'ascending' : 'descending') : 'none',
                            onClick: () => toggleSort(col.key),
                            headerRender: () => (
                                <span>
                                    {col.label}
                                    <ArrowUpDown
                                        size={12}
                                        className={sortConfig.key === col.key ? 'sort-icon active' : 'sort-icon'}
                                    />
                                </span>
                            ),
                            render: (app) => {
                                if (col.key === 'name') {
                                    return (
                                        <div className="app-table-name-cell">
                                            <span className="app-table-icon">
                                                <Boxes size={14} strokeWidth={2} color="#FFFFFF" />
                                            </span>
                                            {app.name}
                                        </div>
                                    );
                                }
                                if (col.key === 'status') {
                                    return (
                                        <span className={`status-badge ${statusColor[app.status]}`}>
                                            {app.status}
                                        </span>
                                    );
                                }
                                return app[col.key];
                            }
                        }))}
                        data={pagedApps}
                        onRowClick={(app) => navigate(`/applications/${app.id}`)}
                    />
                ) : (
                    <div className="app-card-grid">
                        {pagedApps.map((app) => (
                            <div
                                className="app-card"
                                key={app.id}
                                onClick={() => navigate(`/applications/${app.id}`)}
                                role="button"
                                tabIndex={0}
                            >
                                <div className="app-card-top">
                                    <div className="app-card-icon">
                                        <Boxes size={22} strokeWidth={2} color="#FFFFFF" />
                                    </div>
                                    <span className={`status-badge ${statusColor[app.status]}`}>
                                        {app.status}
                                    </span>
                                </div>

                                <h3 className="app-card-name">{app.name}</h3>
                                <span className="app-card-category">{app.category}</span>

                                <div className="app-card-footer">
                                    <div className="app-card-meta">
                                        <User size={14} strokeWidth={2} />
                                        <span>{app.owner}</span>
                                    </div>
                                    <div className="app-card-meta">
                                        <Clock size={14} strokeWidth={2} />
                                        <span>{app.updated}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {viewMode !== 'galaxy' && filteredApps.length > PAGE_SIZE && (
                    <div className="pagination">
                        <button
                            type="button"
                            className="page-btn"
                            disabled={currentPage === 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            <ChevronLeft size={14} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((n) => n === 1 || n === totalPages || Math.abs(n - currentPage) <= 1)
                            .map((n, i, arr) => (
                                <span key={n} style={{ display: 'contents' }}>
                                    {i > 0 && arr[i - 1] !== n - 1 && <span style={{ padding: '0 4px', color: 'var(--ink-soft)' }}>…</span>}
                                    <button
                                        type="button"
                                        className={`page-btn ${n === currentPage ? 'active' : ''}`}
                                        onClick={() => setPage(n)}
                                    >
                                        {n}
                                    </button>
                                </span>
                            ))}
                        <button
                            type="button"
                            className="page-btn"
                            disabled={currentPage === totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                )}
            </div>

            {paletteOpen && (
                <div className="cmdk-backdrop" onClick={closePalette}>
                    <div className="cmdk-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="cmdk-input-row">
                            <Search size={18} strokeWidth={2} />
                            <input
                                ref={paletteInputRef}
                                type="text"
                                placeholder="Ketik nama aplikasi, kategori, atau owner..."
                                value={paletteQuery}
                                onChange={(e) => handlePaletteQueryChange(e.target.value)}
                                onKeyDown={handlePaletteKeyDown}
                            />
                        </div>
                        <div className="cmdk-results">
                            {paletteResults.length === 0 ? (
                                <div className="cmdk-empty">Tidak ada aplikasi yang cocok.</div>
                            ) : (
                                paletteResults.map((app, i) => (
                                    <div
                                        key={app.id}
                                        className={`cmdk-result-item ${i === paletteIndex ? 'active' : ''}`}
                                        onMouseEnter={() => setPaletteIndex(i)}
                                        onClick={() => selectPaletteApp(app)}
                                    >
                                        <div className="cmdk-result-icon">
                                            <Boxes size={15} strokeWidth={2} color="#FFFFFF" />
                                        </div>
                                        <div className="cmdk-result-body">
                                            <span className="cmdk-result-name">{app.name}</span>
                                            <span className="cmdk-result-meta">{app.category} · {app.owner}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="cmdk-footer">
                            <div className="cmdk-footer-hints">
                                <span><span className="cmdk-kbd">↑</span><span className="cmdk-kbd">↓</span> navigasi</span>
                                <span><span className="cmdk-kbd">↵</span> buka</span>
                            </div>
                            <span><span className="cmdk-kbd">esc</span> tutup</span>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}

export default AppPortofolioMain;