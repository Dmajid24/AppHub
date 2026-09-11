import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, IdCard, Phone, Building2, LogOut } from 'lucide-react';
import Layout from '../../components/Layout';
import '../../style/Profile_Style.css';

function ProfilePage() {
    const navigate = useNavigate();

    const [user] = useState(() => {
        try {
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    const displayName = user?.nama || user?.name || user?.fullName || user?.username || 'Guest';
    const department = user?.department || user?.role || 'User';

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (!user) {
        return (
            <Layout>
                <div className="profile-page-empty">
                    <p>Kamu belum login.</p>
                    <button className="profile-page-btn" onClick={() => navigate('/login')}>
                        Ke halaman Login
                    </button>
                </div>
            </Layout>
        );
    }

    const initials = displayName.slice(0, 2).toUpperCase();

    const infoItems = [
        { label: 'Username', value: user?.username, icon: User },
        { label: 'Email', value: user?.email, icon: Mail },
        { label: 'NIK', value: user?.nik, icon: IdCard },
        { label: 'No. Telepon', value: user?.telp, icon: Phone },
        { label: 'Department', value: user?.department, icon: Building2 },
    ].filter((item) => item.value);

    return (
        <Layout>
            <div className="profile-page-content">
                <div className="profile-page-header-card">
                    <span className="profile-avatar profile-avatar-xl">{initials}</span>
                    <div>
                        <h1 className="profile-page-name">{displayName}</h1>
                        <p className="profile-page-email">{user?.email || 'Tidak ada email'}</p>
                        {department && (
                            <span className="profile-page-department-badge">{department}</span>
                        )}
                    </div>
                </div>

                <div className="profile-page-info-grid">
                    {infoItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div className="profile-page-info-card" key={item.label}>
                                <div className="profile-page-info-icon">
                                    <Icon size={18} strokeWidth={2} />
                                </div>
                                <div>
                                    <span className="profile-page-info-label">{item.label}</span>
                                    <span className="profile-page-info-value">{item.value}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button className="profile-page-logout-btn" onClick={handleLogout}>
                    <LogOut size={16} strokeWidth={2} />
                    Logout
                </button>
            </div>
        </Layout>
    );
}

export default ProfilePage;