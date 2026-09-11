import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import Layout from '../../components/Layout';

/**
 * DetailStateWrapper
 * ------------------
 * Wrapper reusable untuk halaman detail aplikasi yang membutuhkan
 * state loading / error / not-found sebelum menampilkan konten.
 *
 * Props:
 *   isLoading  - boolean: sedang fetch data?
 *   error      - string|null: pesan error jika fetch gagal
 *   notFound   - boolean: data sudah selesai dimuat tapi null?
 *   onBack     - function: handler tombol "Kembali"
 *   children   - konten yang ditampilkan saat data tersedia
 */
function DetailStateWrapper({ isLoading, error, notFound, onBack, children }) {
    if (isLoading) {
        return (
            <Layout>
                <div className="profile-notfound">
                    <Loader2 size={20} className="spin" strokeWidth={2} />
                    <span style={{ marginLeft: 8 }}>Memuat data aplikasi...</span>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="profile-notfound">
                    <AlertTriangle size={20} strokeWidth={2} />
                    <span style={{ marginLeft: 8 }}>{error}</span>
                    <button className="profile-back-btn" onClick={onBack} style={{ marginTop: 16 }}>
                        <ArrowLeft size={16} strokeWidth={2} />
                        Kembali ke App Portofolio
                    </button>
                </div>
            </Layout>
        );
    }

    if (notFound) {
        return (
            <Layout>
                <div className="profile-notfound">
                    <p>Aplikasi tidak ditemukan.</p>
                    <button className="profile-back-btn" onClick={onBack}>
                        <ArrowLeft size={16} strokeWidth={2} />
                        Kembali ke App Portofolio
                    </button>
                </div>
            </Layout>
        );
    }

    return children;
}

export default DetailStateWrapper;
