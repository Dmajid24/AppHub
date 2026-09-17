import { useState } from 'react';
import { ArrowLeft, Search, Check, Clock, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import Layout from '../../components/layout';
import '../../style/feedback_style/Main_Style.css';

const statusMeta = {
    open: { label: 'Open', color: 'var(--amber)', icon: Clock },
    in_progress: { label: 'In Progress', color: 'var(--navy)', icon: Loader2 },
    closed: { label: 'Closed', color: 'var(--green)', icon: CheckCircle2 },
};

function TicketStatusBadge({ status }) {
    const meta = statusMeta[status] || statusMeta.open;
    const Icon = meta.icon;
    return (
        <span className="ticket-status-badge" style={{ background: meta.color }}>
            <Icon size={14} strokeWidth={2.4} />
            {meta.label}
        </span>
    );
}

function CheckTicket({ onBack, tickets = [] }) {
    const [ticketId, setTicketId] = useState('');
    const [searched, setSearched] = useState(false);
    const [result, setResult] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!ticketId.trim()) return;
        const found = tickets.find(
            (t) => t.id.toLowerCase() === ticketId.trim().toLowerCase()
        );
        setResult(found || null);
        setSearched(true);
    };

    const handleReset = () => {
        setTicketId('');
        setSearched(false);
        setResult(null);
    };

    return (
        <Layout>
            <div className="feedback-content">
                <button className="feedback-back-btn" onClick={onBack}>
                    <ArrowLeft size={16} strokeWidth={2} />
                    Kembali ke Result Feedback
                </button>

                <div className="ticket-search-card">
                    <div>
                        <div className="panel-title">Cek Status Tiket</div>
                        <div className="panel-note">
                            Masukkan nomor tiket yang kamu terima saat submit keluhan
                        </div>
                    </div>
                    <form className="ticket-search-row" onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Contoh: TCK-251103-8842"
                            value={ticketId}
                            onChange={(e) => setTicketId(e.target.value)}
                        />
                        <button type="submit" className="feedback-btn-primary" disabled={!ticketId.trim()}>
                            <Search size={15} strokeWidth={2.4} />
                            Cari
                        </button>
                    </form>
                </div>

                {searched && !result && (
                    <div className="ticket-not-found">
                        <XCircle size={36} strokeWidth={2} color="var(--red)" />
                        <h2>Tiket Tidak Ditemukan</h2>
                        <p>
                            Periksa kembali nomor tiket kamu, atau hubungi tim support jika masalah
                            berlanjut.
                        </p>
                        <button className="feedback-btn-secondary" onClick={handleReset}>
                            Cari Lagi
                        </button>
                    </div>
                )}

                {result && (
                    <>
                        <div className="panel">
                            <div className="panel-head">
                                <div>
                                    <div className="panel-title">{result.id}</div>
                                    <div className="panel-note">Diajukan oleh {result.fullName}</div>
                                </div>
                                <TicketStatusBadge status={result.status} />
                            </div>

                            <div className="ticket-info-grid">
                                <div className="ticket-info-item">
                                    <span className="ticket-info-label">Aplikasi</span>
                                    <span className="ticket-info-value">{result.application}</span>
                                </div>
                                <div className="ticket-info-item">
                                    <span className="ticket-info-label">Kategori</span>
                                    <span className="ticket-info-value">{result.category}</span>
                                </div>
                                <div className="ticket-info-item">
                                    <span className="ticket-info-label">Regional</span>
                                    <span className="ticket-info-value">{result.regional}</span>
                                </div>
                                <div className="ticket-info-item">
                                    <span className="ticket-info-label">Tanggal Submit</span>
                                    <span className="ticket-info-value">{result.submittedDate}</span>
                                </div>
                                <div className="ticket-info-item">
                                    <span className="ticket-info-label">Terakhir Diupdate</span>
                                    <span className="ticket-info-value">{result.updatedDate}</span>
                                </div>
                            </div>

                            <div className="ticket-description">
                                <span className="ticket-info-label">Deskripsi Masalah</span>
                                <p>{result.description}</p>
                            </div>
                        </div>

                        <div className="panel">
                            <div className="panel-head">
                                <div>
                                    <div className="panel-title">Progres Penanganan</div>
                                    <div className="panel-note">Riwayat status tiket kamu</div>
                                </div>
                            </div>
                            <div className="ticket-timeline">
                                {result.timeline.map((step, index) => (
                                    <div className="ticket-timeline-item" key={step.label}>
                                        <div className="ticket-timeline-marker">
                                            <div className={`ticket-timeline-dot ${step.done ? 'done' : ''}`}>
                                                {step.done && <Check size={12} strokeWidth={3} color="#fff" />}
                                            </div>
                                            {index < result.timeline.length - 1 && (
                                                <div
                                                    className={`ticket-timeline-line ${step.done ? 'done' : ''}`}
                                                />
                                            )}
                                        </div>
                                        <div className="ticket-timeline-content">
                                            <span
                                                className={`ticket-timeline-label ${step.done ? 'done' : ''}`}
                                            >
                                                {step.label}
                                            </span>
                                            <span className="ticket-timeline-date">{step.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {!searched && (
                    <div className="form-hint form-hint-center">
                        Belum punya nomor tiket? Coba contoh:{' '}
                        {tickets.map((t) => t.id).join(' · ')}
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default CheckTicket;