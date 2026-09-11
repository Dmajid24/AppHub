import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import '../../style/Profile_Style.css';

function Profile({ user }) {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        // Hapus token JUGA, bukan cuma user -- kalau tidak, token lama masih
        // nyangkut di localStorage walau sudah "logout".
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Nama tampilan: dukung beberapa kemungkinan field user hasil login/backend
    const displayName = user?.nama || user?.name || user?.fullName || user?.username || 'Guest';
    const roleLabel = user?.department || user?.role || 'User';

    const initials = displayName !== 'Guest'
        ? displayName.slice(0, 2).toUpperCase()
        : 'GU';

    if (!user) return null;

    return (
        <div className="profile-wrapper" ref={menuRef}>
            <button type="button" className="profile-trigger" onClick={() => setOpen((prev) => !prev)}>
                <span className="profile-avatar">{initials}</span>
                <span className="profile-name">{displayName}</span>
                <ChevronDown
                    size={16}
                    strokeWidth={2}
                    className={`profile-chevron ${open ? 'profile-chevron-open' : ''}`}
                />
            </button>

            {open && (
                <div className="profile-dropdown">
                    <div className="profile-dropdown-header">
                        <span className="profile-avatar profile-avatar-lg">{initials}</span>
                        <div className="profile-dropdown-info">
                            <span className="profile-dropdown-name">{displayName}</span>
                            <span className="profile-dropdown-email">
                                {user?.email || 'guest@appcatalog.com'}
                            </span>
                            {roleLabel && (
                                <span className="profile-dropdown-role">{roleLabel}</span>
                            )}
                        </div>
                    </div>

                    <div className="profile-dropdown-menu">
                        <button type="button" className="profile-menu-item" onClick={() => navigate('/profile')}>
                            <User size={16} strokeWidth={2} />
                            <span>Lihat Profil</span>
                        </button>
                        <button type="button" className="profile-menu-item" onClick={() => navigate('/settings')}>
                            <Settings size={16} strokeWidth={2} />
                            <span>Pengaturan</span>
                        </button>
                        <button type="button" className="profile-menu-item profile-menu-logout" onClick={handleLogout}>
                            <LogOut size={16} strokeWidth={2} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;