import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Plus, Trash2 } from 'lucide-react';
import Layout from '../../components/layout';
import Table from '../../components/Table';
import { fetchUserAccess, revokeUserAccess } from '../../services/userAccess';
import { formatTanggal } from '../../services/applications';
import '../../style/user_access_style/Main_Style.css';

function UserAccessMain() {
    const navigate = useNavigate();
    const [accessRequests, setAccessRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    // Ambil data user dari localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Gagal parse user dari localStorage:', e);
            }
        } else {
            setLoading(false);
            setError('Silakan login terlebih dahulu.');
        }
    }, []);

    // Fetch data whitelist dari backend
    const loadUserAccessData = async (userId) => {
        try {
            setLoading(true);
            const response = await fetchUserAccess(userId);
            // Respons backend berupa object: { user: {...}, whitelistedApplications: [...] }
            if (response && response.whitelistedApplications) {
                setAccessRequests(response.whitelistedApplications);
            } else {
                setAccessRequests([]);
            }
            setError('');
        } catch (err) {
            console.error('Error fetching user access:', err);
            setError(err.message || 'Gagal memuat data whitelist akses.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser && currentUser.id) {
            loadUserAccessData(currentUser.id);
        }
    }, [currentUser]);

    const handleRevoke = async (applicationId, appName) => {
        if (!currentUser || !currentUser.id) return;
        if (!window.confirm(`Apakah Anda yakin ingin mencabut whitelist untuk aplikasi "${appName}"?`)) {
            return;
        }

        try {
            await revokeUserAccess(currentUser.id, applicationId);
            // Refresh data setelah berhasil dihapus
            loadUserAccessData(currentUser.id);
        } catch (err) {
            console.error('Error revoking user access:', err);
            alert(err.message || 'Gagal mencabut akses aplikasi.');
        }
    };

    const columns = [
        {
            key: 'fullName',
            label: 'Nama Lengkap',
            render: () => currentUser?.nama || currentUser?.username || '-'
        },
        {
            key: 'nik',
            label: 'NIK',
            render: () => currentUser?.nik || '-'
        },
        {
            key: 'application',
            label: 'Aplikasi Whitelisted',
            render: (row) => row.application?.namaAplikasi || 'Tanpa nama'
        },
        {
            key: 'grantedAt',
            label: 'Tanggal Whitelist',
            className: 'table-muted',
            render: (row) => formatTanggal(row.grantedAt)
        },
        {
            key: 'accessLevel',
            label: 'Level Akses',
            render: (row) => (
                <span className={`status-badge status-${row.accessLevel === 'Read And Write' ? 'active' : 'inactive'}`}>
                    {row.accessLevel}
                </span>
            )
        },
        {
            key: 'action',
            label: 'Aksi',
            render: (row) => (
                <button
                    className="action-btn-danger"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRevoke(row.applicationId, row.application?.namaAplikasi || 'Aplikasi');
                    }}
                    title="Cabut Whitelist"
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Trash2 size={16} />
                </button>
            )
        }
    ];

    return (
        <Layout>
            <div className="user-access-content">
                {loading ? (
                    <div className="user-access-empty">
                        <p>Memuat data whitelist akses...</p>
                    </div>
                ) : error ? (
                    <div className="user-access-empty">
                        <div className="user-access-error" style={{ marginBottom: '16px' }}>{error}</div>
                        <button
                            className="user-access-add-btn"
                            onClick={() => navigate('/login')}
                        >
                            Ke Halaman Login
                        </button>
                    </div>
                ) : accessRequests.length === 0 ? (
                    <div className="user-access-empty">
                        <div className="user-access-empty-icon">
                            <UserCheck size={32} strokeWidth={1.8} />
                        </div>
                        <h2 className="user-access-empty-title">Belum ada permintaan akses</h2>
                        <p className="user-access-empty-text">
                            Saat ini tidak ada aplikasi eksternal yang di-whitelist untuk akun Anda.
                            Silakan ajukan permintaan baru untuk mendaftarkan whitelist aplikasi.
                        </p>
                        <button
                            className="user-access-add-btn"
                            onClick={() => navigate('/user-access/register')}
                        >
                            <Plus size={18} strokeWidth={2.2} />
                            Ajukan Permintaan Akses
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                className="user-access-add-btn"
                                onClick={() => navigate('/user-access/register')}
                            >
                                <Plus size={18} strokeWidth={2.2} />
                                Ajukan Permintaan Akses
                            </button>
                        </div>
                        <Table
                            title="Daftar Whitelist Aplikasi Pengguna"
                            columns={columns}
                            data={accessRequests}
                            emptyMessage="Belum ada whitelist aplikasi."
                        />
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default UserAccessMain;