import { useState } from 'react';
import { User, Bell, Lock, Palette, Save, Check } from 'lucide-react';
import Layout from '../../components/Layout';
import '../../style/Settings_Style.css';

function getStoredUser() {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

const tabs = [
  { key: 'account', label: 'Akun', icon: User },
  { key: 'notifications', label: 'Notifikasi', icon: Bell },
  { key: 'security', label: 'Keamanan', icon: Lock },
  { key: 'appearance', label: 'Tampilan', icon: Palette },
];

/** Toggle switch kecil dipakai di tab Notifikasi & Tampilan */
function Switch({ checked, onChange }) {
  return (
    <button
      type="button"
      className={`switch ${checked ? 'switch-on' : ''}`}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
    >
      <span className="switch-knob" />
    </button>
  );
}

export default function Settings() {
  const storedUser = getStoredUser();

  const [activeTab, setActiveTab] = useState('account');
  const [saved, setSaved] = useState(false);

  const [account, setAccount] = useState({
    username: storedUser?.username || '',
    email: storedUser?.email || '',
    role: storedUser?.role || 'System Admin',
  });

  const [notifications, setNotifications] = useState({
    criticalAlarm: true,
    weeklySummary: true,
    ticketingUpdate: false,
    dataCompletenessReminder: true,
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [appearance, setAppearance] = useState({
    compactTable: false,
    accentColor: 'red',
  });

  const handleAccountChange = (field, value) => {
    setAccount((prev) => ({ ...prev, [field]: value }));
  };

  const handleSecurityChange = (field, value) => {
    setSecurity((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const updatedUser = { ...storedUser, ...account };
    localStorage.setItem('user', JSON.stringify(updatedUser));

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <Layout>
      <div className="settings-page">
        <div className="settings-head">
          <div>
            <div className="settings-eyebrow">Pengaturan</div>
            <div className="settings-title">Kelola akun & preferensi kamu</div>
          </div>
          {saved && (
            <div className="save-toast">
              <Check size={14} /> Perubahan disimpan
            </div>
          )}
        </div>

        <div className="settings-layout">
          {/* Tab nav */}
          <nav className="settings-tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  className={`settings-tab ${activeTab === tab.key ? 'settings-tab-active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Content */}
          <form className="settings-panel" onSubmit={handleSave}>
            {activeTab === 'account' && (
              <div className="settings-section">
                <div className="settings-section-head">
                  <div className="settings-section-title">Informasi Akun</div>
                  <div className="settings-section-note">
                    Data ini tampil di header dan dropdown profil
                  </div>
                </div>

                <div className="settings-field">
                  <label>Username</label>
                  <input
                    type="text"
                    value={account.username}
                    onChange={(e) => handleAccountChange('username', e.target.value)}
                    placeholder="Username"
                  />
                </div>

                <div className="settings-field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={account.email}
                    onChange={(e) => handleAccountChange('email', e.target.value)}
                    placeholder="nama@perusahaan.com"
                  />
                </div>

                <div className="settings-field">
                  <label>Role</label>
                  <input
                    type="text"
                    value={account.role}
                    onChange={(e) => handleAccountChange('role', e.target.value)}
                    placeholder="System Admin"
                  />
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="settings-section">
                <div className="settings-section-head">
                  <div className="settings-section-title">Preferensi Notifikasi</div>
                  <div className="settings-section-note">
                    Atur kapan NOAH boleh mengirim notifikasi ke kamu
                  </div>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-title">Alarm Kritis</div>
                    <div className="settings-row-note">Kirim notifikasi saat ada alarm critical baru</div>
                  </div>
                  <Switch
                    checked={notifications.criticalAlarm}
                    onChange={(v) => setNotifications((p) => ({ ...p, criticalAlarm: v }))}
                  />
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-title">Ringkasan Mingguan</div>
                    <div className="settings-row-note">Email ringkasan kesehatan aplikasi setiap Senin</div>
                  </div>
                  <Switch
                    checked={notifications.weeklySummary}
                    onChange={(v) => setNotifications((p) => ({ ...p, weeklySummary: v }))}
                  />
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-title">Update Ticketing</div>
                    <div className="settings-row-note">Notifikasi saat status request/use case berubah</div>
                  </div>
                  <Switch
                    checked={notifications.ticketingUpdate}
                    onChange={(v) => setNotifications((p) => ({ ...p, ticketingUpdate: v }))}
                  />
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-title">Pengingat Kelengkapan Data</div>
                    <div className="settings-row-note">Ingatkan aplikasi yang datanya belum lengkap</div>
                  </div>
                  <Switch
                    checked={notifications.dataCompletenessReminder}
                    onChange={(v) => setNotifications((p) => ({ ...p, dataCompletenessReminder: v }))}
                  />
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="settings-section">
                <div className="settings-section-head">
                  <div className="settings-section-title">Ubah Password</div>
                  <div className="settings-section-note">
                    Gunakan password minimal 8 karakter, kombinasi huruf & angka
                  </div>
                </div>

                <div className="settings-field">
                  <label>Password Saat Ini</label>
                  <input
                    type="password"
                    value={security.currentPassword}
                    onChange={(e) => handleSecurityChange('currentPassword', e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div className="settings-field">
                  <label>Password Baru</label>
                  <input
                    type="password"
                    value={security.newPassword}
                    onChange={(e) => handleSecurityChange('newPassword', e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div className="settings-field">
                  <label>Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    value={security.confirmPassword}
                    onChange={(e) => handleSecurityChange('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="settings-section">
                <div className="settings-section-head">
                  <div className="settings-section-title">Tampilan</div>
                  <div className="settings-section-note">
                    Sesuaikan kepadatan tabel dan warna aksen dashboard
                  </div>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-title">Tabel Padat (Compact)</div>
                    <div className="settings-row-note">Kurangi padding baris pada Total Server &amp; tabel lain</div>
                  </div>
                  <Switch
                    checked={appearance.compactTable}
                    onChange={(v) => setAppearance((p) => ({ ...p, compactTable: v }))}
                  />
                </div>

                <div className="settings-field">
                  <label>Warna Aksen</label>
                  <div className="accent-options">
                    {['red', 'navy', 'green'].map((color) => (
                      <button
                        type="button"
                        key={color}
                        className={`accent-dot accent-${color} ${
                          appearance.accentColor === color ? 'accent-dot-active' : ''
                        }`}
                        onClick={() => setAppearance((p) => ({ ...p, accentColor: color }))}
                        aria-label={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="settings-actions">
              <button type="submit" className="settings-save-btn">
                <Save size={15} />
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
