import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';
import Layout from '../../components/layout';
import { fetchApplications } from '../../services/applications';
import { grantUserAccess } from '../../services/userAccess';
import '../../style/user_access_style/Main_Style.css';

const accessLevels = ['Read Only', 'Read & Write'];

function UserAccessRegis() {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        ldapUsername: '',
        nik: '',
        fullName: '',
        email: '',
        phone: '',
        department: '',
        applicationRequested: '', // nama aplikasi
        applicationId: '',        // ID GUID aplikasi
        accessLevel: '',
        reason: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Load user aktif dari localStorage dan isi form secara default
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setCurrentUser(user);
                setFormData((prev) => ({
                    ...prev,
                    ldapUsername: user.username || '',
                    nik: user.nik || '',
                    fullName: user.nama || '',
                    email: user.email || '',
                    phone: user.telp || '',
                    department: user.department || '',
                }));
            } catch (e) {
                console.error('Gagal parse user dari localStorage:', e);
            }
        }
    }, []);

    // Load daftar aplikasi dari database backend
    useEffect(() => {
        let cancelled = false;
        fetchApplications()
            .then((data) => {
                if (!cancelled) setApplications(data);
            })
            .catch((err) => {
                console.error('Gagal memuat daftar aplikasi:', err);
            });
        return () => { cancelled = true; };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'applicationRequested') {
            // Temukan id aplikasi berdasarkan nama
            const selectedApp = applications.find(app => app.name === value);
            setFormData((prev) => ({
                ...prev,
                applicationRequested: value,
                applicationId: selectedApp ? selectedApp.id : ''
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const requiredFields = [
            'ldapUsername',
            'nik',
            'fullName',
            'email',
            'department',
            'applicationId',
            'accessLevel',
        ];
        const isIncomplete = requiredFields.some((field) => !formData[field]);

        if (isIncomplete) {
            setError('Mohon lengkapi semua field yang wajib diisi.');
            return;
        }

        if (!currentUser || !currentUser.id) {
            setError('User tidak terdeteksi. Silakan login kembali.');
            return;
        }

        try {
            await grantUserAccess(currentUser.id, formData.applicationId, formData.accessLevel);
            setSuccess(true);
        } catch (err) {
            console.error('Error submitting access request:', err);
            setError(err.message || 'Gagal mengirimkan pengajuan akses aplikasi.');
        }
    };

    if (success) {
        return (
            <Layout>
                <div className="user-access-content">
                    <div className="user-access-success">
                        <div className="user-access-success-icon">
                            <UserPlus size={32} strokeWidth={1.8} />
                        </div>
                        <h2>Permintaan Berhasil Diajukan</h2>
                        <p>
                            Permintaan akses kamu untuk aplikasi{' '}
                            <strong>{formData.applicationRequested}</strong> sudah dikirim dan
                            berhasil di-whitelist secara langsung oleh sistem.
                        </p>
                        <button
                            className="user-access-add-btn"
                            onClick={() => navigate('/user-access')}
                        >
                            Kembali ke User Access
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="user-access-content">
                <button className="user-access-back-btn" onClick={() => navigate('/user-access')}>
                    <ArrowLeft size={16} strokeWidth={2} />
                    Kembali ke User Access
                </button>

                <div className="user-access-form-card">
                    <h1 className="user-access-title">Formulir Pendaftaran Akses</h1>
                    <p className="user-access-subtitle">
                        Lengkapi data berikut untuk mengajukan whitelisting akses ke aplikasi tertentu.
                    </p>

                    {error && <div className="user-access-error" style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '16px' }}>{error}</div>}

                    <form onSubmit={handleSubmit} className="user-access-form">
                        <div className="user-access-form-section">
                            <h3 className="user-access-section-title">Data Pribadi (Otomatis terisi dari Akun Anda)</h3>

                            <div className="user-access-form-grid">
                                <div className="form-group">
                                    <label htmlFor="ldapUsername">Username LDAP</label>
                                    <input
                                        id="ldapUsername"
                                        name="ldapUsername"
                                        type="text"
                                        placeholder="contoh: raka.adi"
                                        value={formData.ldapUsername}
                                        disabled
                                        style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="nik">NIK</label>
                                    <input
                                        id="nik"
                                        name="nik"
                                        type="text"
                                        placeholder="Nomor Induk Karyawan"
                                        value={formData.nik}
                                        disabled
                                        style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="fullName">Nama Lengkap</label>
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        placeholder="Nama sesuai identitas"
                                        value={formData.fullName}
                                        disabled
                                        style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="nama@telkomsel.internal"
                                        value={formData.email}
                                        disabled
                                        style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">Nomor Telepon</label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="08xxxxxxxxxx"
                                        value={formData.phone}
                                        disabled
                                        style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="department">Divisi / Departemen</label>
                                    <input
                                        id="department"
                                        name="department"
                                        type="text"
                                        placeholder="contoh: IT Infrastructure"
                                        value={formData.department}
                                        disabled
                                        style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="user-access-form-section">
                            <h3 className="user-access-section-title">Informasi Akses yang Diminta</h3>

                            <div className="user-access-form-grid">
                                <div className="form-group">
                                    <label htmlFor="applicationRequested">Aplikasi yang Diminta</label>
                                    <select
                                        id="applicationRequested"
                                        name="applicationRequested"
                                        value={formData.applicationRequested}
                                        onChange={handleChange}
                                    >
                                        <option value="">Pilih aplikasi</option>
                                        {applications.map((app) => (
                                            <option key={app.id} value={app.name}>
                                                {app.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="accessLevel">Level Akses</label>
                                    <select
                                        id="accessLevel"
                                        name="accessLevel"
                                        value={formData.accessLevel}
                                        onChange={handleChange}
                                    >
                                        <option value="">Pilih level akses</option>
                                        {accessLevels.map((level) => (
                                            <option key={level} value={level}>
                                                {level}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="reason">Alasan Pengajuan</label>
                                <textarea
                                    id="reason"
                                    name="reason"
                                    rows={4}
                                    placeholder="Jelaskan alasan kamu membutuhkan akses ini..."
                                    value={formData.reason}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="user-access-submit-btn">
                            Ajukan Permintaan
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
}

export default UserAccessRegis;