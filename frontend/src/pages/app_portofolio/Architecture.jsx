import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Boxes,
    Layers,
    Cloud,
    MapPin,
    GitMerge,
    Share2,
    Link2,
    FileText,
    PenLine,
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

function Architecture() {
    const { id } = useParams();
    const navigate = useNavigate();

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
        return () => {
            cancelled = true;
        };
    }, [id]);

    return (
        <DetailStateWrapper
            isLoading={isLoading}
            error={error}
            notFound={!isLoading && !error && !app}
            onBack={() => navigate('/applications')}
        >
            {app && (() => {
                const architectureItems = [
                    { label: 'Tipe Arsitektur', value: app.architectureType, icon: Layers },
                    { label: 'Hosting Provider', value: app.hostingProvider, icon: Cloud },
                    { label: 'Region', value: app.region, icon: MapPin },
                    { label: 'Model Deployment', value: app.deploymentModel, icon: GitMerge },
                ].filter((item) => item.value);

                const integrations = app.integrations || [];
                const dependencies = app.dependencies || [];
                const hasAnyContent =
                    architectureItems.length > 0 || integrations.length > 0 || dependencies.length > 0 || app.architectureNotes;

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
                                <p className="profile-app-description">{app.description}</p>
                            </div>

                            <AppDetailTabs id={id} />

                            {!hasAnyContent ? (
                                <div className="section-card">
                                    <div className="section-empty">
                                        <Layers size={28} strokeWidth={1.6} />
                                        <p className="section-empty-title">
                                            Informasi arsitektur belum dilengkapi untuk aplikasi ini
                                        </p>
                                        <p className="section-empty-hint">
                                            Data yang biasanya diisi di sini: tipe arsitektur (monolith/microservices),
                                            hosting provider, region deployment, model deployment, integrasi sistem
                                            terkait, dan dependencies teknis.
                                        </p>
                                        <button
                                            type="button"
                                            className="section-empty-cta"
                                            onClick={() => navigate('/request/app-registration')}
                                        >
                                            <PenLine size={14} strokeWidth={2} />
                                            Ajukan Update Data Arsitektur
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {architectureItems.length > 0 && (
                                        <div className="profile-info-grid">
                                            {architectureItems.map((item) => {
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

                                    {integrations.length > 0 && (
                                        <div className="section-card">
                                            <div className="section-card-title">
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <Share2 size={16} strokeWidth={2} />
                                                    Integrasi Sistem
                                                </span>
                                            </div>
                                            <div className="chip-row">
                                                {integrations.map((item) => (
                                                    <span className="chip" key={item}>{item}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {dependencies.length > 0 && (
                                        <div className="section-card">
                                            <div className="section-card-title">
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <Link2 size={16} strokeWidth={2} />
                                                    Dependencies
                                                </span>
                                            </div>
                                            <div className="chip-row">
                                                {dependencies.map((item) => (
                                                    <span className="chip" key={item}>{item}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {app.architectureNotes && (
                                        <div className="section-card">
                                            <div className="section-card-title">
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <FileText size={16} strokeWidth={2} />
                                                    Catatan Arsitektur
                                                </span>
                                            </div>
                                            <p style={{ fontSize: 13.5, color: '#4A5568', lineHeight: 1.6, margin: 0 }}>
                                                {app.architectureNotes}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </Layout>
                );
            })()}
        </DetailStateWrapper>
    );
}

export default Architecture;