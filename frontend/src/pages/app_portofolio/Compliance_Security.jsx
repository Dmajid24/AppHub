import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Boxes,
    ShieldCheck,
    BadgeCheck,
    CalendarCheck,
    Lock,
    KeyRound,
    AlertTriangle,
    UserCheck,
} from 'lucide-react';
import Layout from '../../components/Layout';
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

function ComplianceSecurity() {
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
                const complianceItems = [
                    { label: 'Klasifikasi Data', value: app.dataClassification, icon: ShieldCheck },
                    { label: 'Audit Keamanan Terakhir', value: app.lastSecurityAudit, icon: CalendarCheck },
                    { label: 'Enkripsi at Rest', value: app.encryptionAtRest, icon: Lock },
                    { label: 'Enkripsi in Transit', value: app.encryptionInTransit, icon: Lock },
                    { label: 'Kontrol Akses', value: app.accessControl, icon: KeyRound },
                    { label: 'Status Kerentanan', value: app.vulnerabilityStatus, icon: AlertTriangle },
                ].filter((item) => item.value);

                const complianceStandards = app.complianceStandards || [];
                const hasAnyContent = complianceItems.length > 0 || complianceStandards.length > 0 || app.piiHandling;

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
                                        <ShieldCheck size={22} strokeWidth={1.6} />
                                        <p>Informasi compliance & keamanan belum dilengkapi untuk aplikasi ini.</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {complianceStandards.length > 0 && (
                                        <div className="section-card">
                                            <div className="section-card-title">
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <BadgeCheck size={16} strokeWidth={2} />
                                                    Standar Compliance
                                                </span>
                                            </div>
                                            <div className="chip-row">
                                                {complianceStandards.map((item) => (
                                                    <span className="chip" key={item}>{item}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {complianceItems.length > 0 && (
                                        <div className="profile-info-grid">
                                            {complianceItems.map((item) => {
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

                                    {app.piiHandling && (
                                        <div className="section-card">
                                            <div className="section-card-title">
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <UserCheck size={16} strokeWidth={2} />
                                                    Penanganan Data Pribadi (PII)
                                                </span>
                                            </div>
                                            <p style={{ fontSize: 13.5, color: '#4A5568', lineHeight: 1.6, margin: 0 }}>
                                                {app.piiHandling}
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

export default ComplianceSecurity;