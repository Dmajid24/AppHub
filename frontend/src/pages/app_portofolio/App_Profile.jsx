import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Boxes,
    User,
    Clock,
    Tag,
    Link2,
    GitBranch,
    Activity,
    ChevronDown,
    Server,
    Database,
    ShieldCheck,
    FileText,
    Mail,
} from 'lucide-react';
import Layout from '../../components/layout';
import DetailStateWrapper from './DetailStateWrapper';
import { fetchApplicationById } from '../../services/applications';
import '../../style/app_portofolio_style/App_Profile_Style.css';

const statusColor = {
    Active: 'badge-active',
    Maintenance: 'badge-maintenance',
    Inactive: 'badge-inactive',
    Pending: 'badge-maintenance',
};

function AppDetailTabs({ id }) {
    const { pathname } = useLocation();
    const tabs = [
        { label: 'Profile', path: `/applications/${id}` },
        { label: 'Architecture', path: `/applications/${id}/architecture` },
        { label: 'Compliance & Security', path: `/applications/${id}/compliance-security` },
        { label: 'Tech Info', path: `/applications/${id}/tech-info` },
        { label: 'App View', path: `/applications/${id}/app-view` },
    ];
    return (
        <div className="profile-tabs" role="tablist" aria-label="Detail aplikasi">
            {tabs.map((tab) => (
                <Link
                    key={tab.path}
                    to={tab.path}
                    className={`profile-tab ${pathname === tab.path ? 'active' : ''}`}
                >
                    {tab.label}
                </Link>
            ))}
        </div>
    );
}

function AppProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showDetails, setShowDetails] = useState(false);

    const [app, setApp] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setIsLoading(true);
            setError(null);
            try {
                const result = await fetchApplicationById(id);
                if (!cancelled) setApp(result);
            } catch (err) {
                if (!cancelled) setError(err.message || 'Gagal memuat data aplikasi.');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [id]);

    return (
        <DetailStateWrapper
            isLoading={isLoading}
            error={error}
            notFound={!isLoading && !error && !app}
            onBack={() => navigate('/applications')}
        >
            {app && (() => {
                const mainInfoItems = [
                    { label: 'Pemilik', value: app.owner, icon: User },
                    { label: 'Kategori', value: app.category, icon: Tag },
                    { label: 'Terakhir Diperbarui', value: app.updated, icon: Clock },
                    { label: 'Versi', value: app.version, icon: GitBranch },
                    { label: 'URL', value: app.url, icon: Link2 },
                    { label: 'Uptime', value: app.uptime, icon: Activity },
                ].filter((item) => item.value && item.value !== '-');

                const detailInfoItems = [
                    { label: 'Pembuat', value: app.creator, icon: User },
                    { label: 'Backup Pemilik', value: app.backupOwner, icon: User },
                    { label: 'Server', value: app.server, icon: Server },
                    { label: 'Database', value: app.database, icon: Database },
                    { label: 'Klasifikasi Data', value: app.dataClassification, icon: ShieldCheck },
                    { label: 'Sumber Data', value: app.dataSource, icon: FileText },
                    { label: 'Retensi Data', value: app.dataRetentionPolicy, icon: FileText },
                    { label: 'Region', value: app.region, icon: Server },
                    { label: 'SLA', value: app.sla, icon: ShieldCheck },
                    { label: 'Dokumentasi', value: app.documentation, icon: FileText },
                    { label: 'Kontak Support', value: app.supportContact, icon: Mail },
                ].filter((item) => item.value && item.value !== '-');

                return (
                    <Layout>
                        <div className="app-profile-content">
                            <button className="profile-back-btn" onClick={() => navigate('/applications')}>
                                <ArrowLeft size={16} strokeWidth={2} />
                                Kembali ke App Portofolio
                            </button>

                            <div className="profile-header-card">
                                <div className="profile-header-top">
                                    <div className="profile-header-icon">
                                        <Boxes size={28} strokeWidth={2} color="#FFFFFF" />
                                    </div>
                                    <span className={`status-badge ${statusColor[app.status]}`}>
                                        {app.status}
                                    </span>
                                </div>

                                <h1 className="profile-app-name">{app.name}</h1>
                                <p className="profile-app-description">{app.description || 'Tidak ada deskripsi.'}</p>
                            </div>

                            <AppDetailTabs id={id} />

                            <div className="profile-info-grid">
                                {mainInfoItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div className="profile-info-card" key={item.label}>
                                            <div className="profile-info-icon">
                                                <Icon size={18} strokeWidth={2} />
                                            </div>
                                            <div className="profile-info-body">
                                                <span className="profile-info-label">{item.label}</span>
                                                <span className="profile-info-value">{item.value}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {detailInfoItems.length > 0 && (
                                <div className="profile-detail-section">
                                    <button
                                        className="profile-detail-toggle"
                                        onClick={() => setShowDetails((prev) => !prev)}
                                    >
                                        <span>{showDetails ? 'Sembunyikan Detail Lengkap' : 'Lihat Detail Lengkap'}</span>
                                        <ChevronDown
                                            size={18}
                                            strokeWidth={2}
                                            className={`profile-detail-chevron ${showDetails ? 'profile-detail-chevron-open' : ''}`}
                                        />
                                    </button>

                                    {showDetails && (
                                        <div className="profile-info-grid profile-detail-grid">
                                            {detailInfoItems.map((item) => {
                                                const Icon = item.icon;
                                                return (
                                                    <div className="profile-info-card" key={item.label}>
                                                        <div className="profile-info-icon">
                                                            <Icon size={18} strokeWidth={2} />
                                                        </div>
                                                        <div className="profile-info-body">
                                                            <span className="profile-info-label">{item.label}</span>
                                                            <span className="profile-info-value">{item.value}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </Layout>
                );
            })()}
        </DetailStateWrapper>
    );
}

export default AppProfile;
