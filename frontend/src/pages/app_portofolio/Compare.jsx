import { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Check, Trash2, Columns3, Grid2x2, X, Highlighter, Loader2, AlertTriangle } from 'lucide-react';
import Layout from '../../components/Layout';
import Table from '../../components/table';
import { fetchApplications } from '../../services/applications';
import '../../style/app_portofolio_style/Main_Style.css';

const compareFields = [
  { key: 'category', label: 'Kategori' },
  { key: 'owner', label: 'Owner' },
  { key: 'status', label: 'Status' },
  { key: 'updated', label: 'Update Terakhir' },
  { key: 'description', label: 'Deskripsi' },
  { key: 'version', label: 'Versi' },
  { key: 'url', label: 'URL' },
  { key: 'uptime', label: 'Uptime' },
  { key: 'server', label: 'Server' },
  { key: 'database', label: 'Database' },
  { key: 'sla', label: 'SLA' },
  { key: 'documentation', label: 'Dokumentasi' },
  { key: 'supportContact', label: 'Support' },
];

const PIVOT_FIELDS = [
  { key: 'category', label: 'Kategori' },
  { key: 'status', label: 'Status' },
  { key: 'owner', label: 'Owner' },
  { key: 'uptime', label: 'Uptime' },
  { key: 'sla', label: 'SLA' },
];

const statusColor = {
  Active: 'badge-active',
  Maintenance: 'badge-maintenance',
  Inactive: 'badge-inactive',
};

function Compare() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filter, setFilter] = useState('');
  const [viewMode, setViewMode] = useState('sidebyside');
  const [pivotRowField, setPivotRowField] = useState('category');
  const [pivotColField, setPivotColField] = useState('status');
  const [drilldown, setDrilldown] = useState(null);
  const [highlightDiff, setHighlightDiff] = useState(false);
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const filterInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await fetchApplications();
        if (!cancelled) setApplications(data);
      } catch (err) {
        if (!cancelled) setLoadError(err.message || 'Gagal memuat data aplikasi.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filteredApps = useMemo(() => {
    const q = filter.toLowerCase();
    let list = applications;
    if (showOnlySelected) {
      list = list.filter((app) => selectedIds.includes(app.id));
    }
    return list.filter(
      (app) =>
        app.name.toLowerCase().includes(q) ||
        app.category.toLowerCase().includes(q) ||
        app.owner.toLowerCase().includes(q)
    );
  }, [filter, showOnlySelected, selectedIds]);

  const appsByCategory = useMemo(() => {
    const groups = {};
    filteredApps.forEach((app) => {
      const cat = app.category || 'Others';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(app);
    });
    return groups;
  }, [filteredApps]);

  const toggleCategoryCollapse = (category) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const collapseAllCategories = () => {
    const cats = Object.keys(appsByCategory);
    const newCollapsed = {};
    cats.forEach((cat) => {
      newCollapsed[cat] = true;
    });
    setCollapsedCategories(newCollapsed);
  };

  const expandAllCategories = () => {
    setCollapsedCategories({});
  };

  const selectedApps = useMemo(
    () => applications.filter((app) => selectedIds.includes(app.id)),
    [selectedIds]
  );

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((value) => value !== id);
      }
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  const removeFromCompare = (id) => {
    setSelectedIds((prev) => prev.filter((value) => value !== id));
  };

  const clearSelection = () => setSelectedIds([]);

  const focusSearch = () => filterInputRef.current?.focus();

  // ---------- Diff perbandingan (dipakai untuk highlight & badge ringkasan) ----------
  const fieldDiffs = useMemo(() => {
    if (selectedApps.length < 2) return [];
    return compareFields.map((field) => {
      const values = selectedApps.map((app) => app[field.key] ?? '-');
      return { key: field.key, differs: !values.every((v) => v === values[0]) };
    });
  }, [selectedApps]);

  const diffByKey = useMemo(
    () => Object.fromEntries(fieldDiffs.map((f) => [f.key, f.differs])),
    [fieldDiffs]
  );

  const diffCount = fieldDiffs.filter((f) => f.differs).length;

  // ---------- Pivot table ----------
  const pivotRowLabel = PIVOT_FIELDS.find((f) => f.key === pivotRowField)?.label;
  const pivotColLabel = PIVOT_FIELDS.find((f) => f.key === pivotColField)?.label;

  const pivotRows = useMemo(
    () => [...new Set(applications.map((a) => a[pivotRowField]))].filter(Boolean).sort(),
    [pivotRowField]
  );
  const pivotCols = useMemo(
    () => [...new Set(applications.map((a) => a[pivotColField]))].filter(Boolean).sort(),
    [pivotColField]
  );

  function appsInCell(rowValue, colValue) {
    return applications.filter((a) => a[pivotRowField] === rowValue && a[pivotColField] === colValue);
  }

  function handlePivotRowChange(value) {
    setPivotRowField(value);
    setDrilldown(null);
    if (value === pivotColField) {
      const fallback = PIVOT_FIELDS.find((f) => f.key !== value);
      setPivotColField(fallback.key);
    }
  }

  function handlePivotColChange(value) {
    setPivotColField(value);
    setDrilldown(null);
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="portofolio-content">
          <div className="portofolio-empty">
            <Loader2 size={20} className="spin" strokeWidth={2} />
            <span style={{ marginLeft: 8 }}>Memuat data aplikasi...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (loadError) {
    return (
      <Layout>
        <div className="portofolio-content">
          <div className="portofolio-empty">
            <AlertTriangle size={20} strokeWidth={2} />
            <span style={{ marginLeft: 8 }}>{loadError}</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="portofolio-content">
        <div className="compare-header">
          <button type="button" className="compare-back-btn" onClick={() => navigate('/applications')}>
            <ArrowLeft size={16} />
            Back to Portfolio
          </button>
        </div>

        <div className="compare-meta-row">
          <div className="compare-selection-state">
            <span>{selectedApps.length} aplikasi dipilih</span>
            <span>Minimal 2 aplikasi diperlukan untuk membandingkan.</span>
          </div>

          <div className="compare-meta-actions">
            <div className="view-toggle" role="tablist" aria-label="Mode perbandingan">
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'sidebyside' ? 'active' : ''}`}
                onClick={() => setViewMode('sidebyside')}
              >
                <Columns3 size={14} strokeWidth={2} />
                Side-by-side
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'pivot' ? 'active' : ''}`}
                onClick={() => setViewMode('pivot')}
              >
                <Grid2x2 size={14} strokeWidth={2} />
                Pivot
              </button>
            </div>

            <button type="button" className="compare-clear-btn" onClick={clearSelection}>
              <Trash2 size={14} />
              Clear selection
            </button>
          </div>
        </div>

        {viewMode === 'sidebyside' ? (
          <div className="compare-panel">
            <style>{`
              .compare-category-group {
                margin-bottom: 8px;
                border: 1px solid var(--line, #e2e8f0);
                border-radius: 10px;
                overflow: hidden;
                background: var(--card, #fff);
              }
              .compare-category-header {
                width: 100%;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 14px;
                background: var(--panel-bg, #f8fafc);
                border: none;
                cursor: pointer;
                font-weight: 600;
                font-size: 0.85rem;
                color: var(--ink-main, #1e293b);
                text-align: left;
                transition: background 0.2s ease;
                border-bottom: 1px solid var(--line, #e2e8f0);
              }
              .compare-category-header:hover {
                background: var(--line, #e2e8f0);
              }
              .compare-category-selected-badge {
                background: var(--red, #d32f2f);
                color: white;
                font-size: 0.75rem;
                padding: 2px 8px;
                border-radius: 12px;
                font-weight: 600;
              }
              .compare-category-content {
                padding: 6px;
                display: flex;
                flex-direction: column;
                gap: 4px;
                max-height: 400px;
                overflow-y: auto;
              }
              .compare-toolbar-filters {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 4px;
                font-size: 0.8rem;
                flex-wrap: wrap;
                gap: 8px;
              }
              .compare-toolbar-btn {
                background: none;
                border: none;
                color: var(--red, #d32f2f);
                cursor: pointer;
                font-weight: 600;
                padding: 4px 8px;
                border-radius: 6px;
                transition: background 0.2s;
              }
              .compare-toolbar-btn:hover {
                background: rgba(211, 50, 74, 0.08);
              }
              .compare-checkbox-label {
                display: flex;
                align-items: center;
                gap: 6px;
                cursor: pointer;
                user-select: none;
                color: var(--ink-soft, #64748b);
                font-weight: 500;
              }
              .compare-checkbox-label input {
                cursor: pointer;
              }
            `}</style>

            <div className="compare-panel-column">
              <div className="compare-filter">
                <Search size={18} strokeWidth={2} />
                <input
                  ref={filterInputRef}
                  type="text"
                  placeholder="Cari aplikasi untuk dibandingkan..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>

              <div className="compare-toolbar-filters">
                <label className="compare-checkbox-label">
                  <input
                    type="checkbox"
                    checked={showOnlySelected}
                    onChange={(e) => setShowOnlySelected(e.target.checked)}
                  />
                  Hanya tampilkan terpilih ({selectedIds.length})
                </label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button type="button" className="compare-toolbar-btn" onClick={expandAllCategories}>
                    Expand All
                  </button>
                  <span style={{ color: 'var(--line)' }}>|</span>
                  <button type="button" className="compare-toolbar-btn" onClick={collapseAllCategories}>
                    Collapse All
                  </button>
                </div>
              </div>

              <div className="compare-app-list">
                <div className="compare-app-list-header">
                  <span>Daftar aplikasi ({filteredApps.length})</span>
                  <span>Centang aplikasi untuk dibandingkan</span>
                </div>

                <div className="compare-app-list-body" style={{ display: 'block' }}>
                  {Object.keys(appsByCategory).length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--ink-soft)' }}>
                      Tidak ada aplikasi yang cocok
                    </div>
                  ) : (
                    Object.entries(appsByCategory).map(([category, apps]) => {
                      const isCollapsed = collapsedCategories[category];
                      const selectedInCat = apps.filter((app) => selectedIds.includes(app.id)).length;
                      return (
                        <div key={category} className="compare-category-group">
                          <button
                            type="button"
                            className="compare-category-header"
                            onClick={() => toggleCategoryCollapse(category)}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{isCollapsed ? '▶' : '▼'}</span>
                              <strong>{category}</strong>
                              <span style={{ color: 'var(--ink-soft)', fontWeight: 'normal' }}>({apps.length})</span>
                            </span>
                            {selectedInCat > 0 && (
                              <span className="compare-category-selected-badge">
                                {selectedInCat} terpilih
                              </span>
                            )}
                          </button>

                          {!isCollapsed && (
                            <div className="compare-category-content">
                              {apps.map((app) => (
                                <button
                                  key={app.id}
                                  type="button"
                                  className={`compare-app-row ${selectedIds.includes(app.id) ? 'active' : ''}`}
                                  onClick={() => toggleSelect(app.id)}
                                >
                                  <div>
                                    <strong>{app.name}</strong>
                                    <span>{app.owner} · {app.status}</span>
                                  </div>
                                  <div className="compare-app-row-action">
                                    {selectedIds.includes(app.id) ? <Check size={16} /> : <span>{selectedIds.length < 4 ? 'Select' : 'Max 4'}</span>}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="compare-panel-column">
              {selectedApps.length >= 2 ? (
                <>
                  <div className="compare-table-toolbar">
                    <button
                      type="button"
                      className={`compare-highlight-toggle ${highlightDiff ? 'active' : ''}`}
                      onClick={() => setHighlightDiff((v) => !v)}
                    >
                      <Highlighter size={14} strokeWidth={2} />
                      Highlight perbedaan
                    </button>
                    <span className="compare-diff-badge">
                      {diffCount} dari {compareFields.length} field berbeda
                    </span>
                  </div>

                  <div className="compare-table-wrap">
                    <Table
                      className="compare-table"
                      wrapperClassName=""
                      customHeader={
                        <thead>
                          <tr>
                            <th>Field</th>
                            {selectedApps.map((app) => (
                              <th key={app.id}>
                                <div className="compare-th-app">
                                  <span>{app.name}</span>
                                  <button
                                    type="button"
                                    className="compare-th-remove"
                                    onClick={() => removeFromCompare(app.id)}
                                    aria-label={`Hapus ${app.name} dari perbandingan`}
                                    title="Hapus dari perbandingan"
                                  >
                                    <X size={13} strokeWidth={2.4} />
                                  </button>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                      }
                      customBody={
                        <tbody>
                          {compareFields.map((field) => {
                            const rowDiffers = highlightDiff && diffByKey[field.key];
                            return (
                              <tr key={field.key} className={rowDiffers ? 'diff-row' : ''}>
                                <td>{field.label}</td>
                                {selectedApps.map((app) => (
                                  <td key={app.id} className={rowDiffers ? 'diff-cell' : ''}>
                                    {field.key === 'status' ? (
                                      <span className={`status-badge ${statusColor[app.status]}`}>{app.status}</span>
                                    ) : (
                                      app[field.key] || '-'
                                    )}
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      }
                    />
                  </div>
                </>
              ) : (
                <div className="compare-empty-state">
                  <p>Pilih setidaknya 2 aplikasi untuk melihat perbandingan.</p>
                  <p>Kamu bisa memilih sampai 4 aplikasi sekaligus, dari sini atau dari tab Pivot.</p>
                  <button type="button" className="compare-empty-cta" onClick={focusSearch}>
                    <Search size={14} strokeWidth={2} />
                    Cari aplikasi
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="pivot-panel">
            <div className="pivot-controls">
              <label className="pivot-control">
                Baris
                <select value={pivotRowField} onChange={(e) => handlePivotRowChange(e.target.value)}>
                  {PIVOT_FIELDS.map((f) => (
                    <option key={f.key} value={f.key}>{f.label}</option>
                  ))}
                </select>
              </label>
              <label className="pivot-control">
                Kolom
                <select value={pivotColField} onChange={(e) => handlePivotColChange(e.target.value)}>
                  {PIVOT_FIELDS.filter((f) => f.key !== pivotRowField).map((f) => (
                    <option key={f.key} value={f.key}>{f.label}</option>
                  ))}
                </select>
              </label>
              <p className="pivot-hint">Klik angka di sel untuk melihat & memilih aplikasi di perpotongan itu.</p>
            </div>

            <div className="pivot-table-wrap">
              <Table
                className="pivot-table"
                wrapperClassName=""
                customHeader={
                  <thead>
                    <tr>
                      <th className="pivot-corner">{pivotRowLabel} \ {pivotColLabel}</th>
                      {pivotCols.map((col) => (
                        <th key={col}>{col}</th>
                      ))}
                      <th className="pivot-total-col">Total</th>
                    </tr>
                  </thead>
                }
                customBody={
                  <tbody>
                    {pivotRows.map((row) => {
                      const rowApps = pivotCols.map((col) => appsInCell(row, col));
                      const rowTotal = rowApps.reduce((sum, apps) => sum + apps.length, 0);
                      return (
                        <tr key={row}>
                          <td className="pivot-row-label">{row}</td>
                          {pivotCols.map((col, i) => {
                            const apps = rowApps[i];
                            const isActiveCell = drilldown?.rowValue === row && drilldown?.colValue === col;
                            return (
                              <td key={col}>
                                {apps.length > 0 ? (
                                  <button
                                    type="button"
                                    className={`pivot-cell-btn ${isActiveCell ? 'active' : ''}`}
                                    onClick={() => setDrilldown({ rowValue: row, colValue: col, apps })}
                                  >
                                    {apps.length}
                                  </button>
                                ) : (
                                  <span className="pivot-cell-empty">–</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="pivot-total-cell">{rowTotal}</td>
                        </tr>
                      );
                    })}
                    <tr className="pivot-total-row">
                      <td className="pivot-row-label">Total</td>
                      {pivotCols.map((col) => {
                        const colTotal = pivotRows.reduce((sum, row) => sum + appsInCell(row, col).length, 0);
                        return (
                          <td key={col} className="pivot-total-cell">{colTotal}</td>
                        );
                      })}
                      <td className="pivot-total-cell grand">{applications.length}</td>
                    </tr>
                  </tbody>
                }
              />
            </div>

            {drilldown && (
              <div className="pivot-drilldown">
                <div className="pivot-drilldown-head">
                  <div>
                    <strong>{drilldown.rowValue} × {drilldown.colValue}</strong>
                    <span>{drilldown.apps.length} aplikasi — centang untuk ditambahkan ke perbandingan</span>
                  </div>
                  <button type="button" className="pivot-drilldown-close" onClick={() => setDrilldown(null)} aria-label="Tutup">
                    <X size={16} />
                  </button>
                </div>

                <div className="compare-app-list-body">
                  {drilldown.apps.map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      className={`compare-app-row ${selectedIds.includes(app.id) ? 'active' : ''}`}
                      onClick={() => toggleSelect(app.id)}
                      onDoubleClick={() => navigate(`/applications/${app.id}`)}
                      title="Klik 2 kali untuk melihat detail aplikasi"
                    >
                      <div>
                        <strong>{app.name}</strong>
                        <span>{app.category} · {app.owner}</span>
                      </div>
                      <div className="compare-app-row-action">
                        {selectedIds.includes(app.id) ? <Check size={16} /> : <span>{selectedIds.length < 4 ? 'Select' : 'Max 4'}</span>}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedApps.length >= 2 && (
                  <button type="button" className="pivot-drilldown-compare-btn" onClick={() => setViewMode('sidebyside')}>
                    Lihat perbandingan ({selectedApps.length}) →
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Compare;