import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Bot, ArrowLeft } from 'lucide-react';
import Layout from '../../components/Layout';
import { fetchApplications } from '../../services/applications';
import '../../style/feedback_style/Main_Style.css';

const steps = [
    { id: 1, label: 'Bot Information' },
    { id: 2, label: 'Categories' },
];

const availableCategories = [
    'Data Not Synchronize',
    'Ticketing Handling',
    'RH Visit',
    'KPI',
    'Preventive Maintenance',
    'User Management',
    'Application Error',
    'Performance',
    'SVA',
    'Territory Operation',
];

const initialFormData = {
    application: '',
    telegramChannel: '',
    joinLink: '',
    helpdeskContact: '',
    categories: [],
};

function BotRegis() {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(initialFormData);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        let cancelled = false;
        fetchApplications()
            .then((data) => { if (!cancelled) setApplications(data); })
            .catch(() => {});
        return () => { cancelled = true; };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const toggleCategory = (category) => {
        setFormData((prev) => {
            const exists = prev.categories.includes(category);
            return {
                ...prev,
                categories: exists
                    ? prev.categories.filter((c) => c !== category)
                    : [...prev.categories, category],
            };
        });
    };

    const handleNext = () => setCurrentStep(2);
    const handleBack = () => setCurrentStep(1);

    const handleSubmit = () => {
        // TODO: Kirim formData ke API backend untuk mendaftarkan bot Telegram.
        console.log('Bot registration submitted:', formData);
        setSubmitted(true);
    };

    const isStep1Valid =
        formData.application && formData.telegramChannel && formData.helpdeskContact;

    if (submitted) {
        return (
            <Layout>
                <div className="feedback-content">
                    <div className="feedback-success">
                        <div className="feedback-success-icon">
                            <Check size={32} strokeWidth={2.5} color="#FFFFFF" />
                        </div>
                        <h2>Bot Telegram Berhasil Didaftarkan</h2>
                        <p>
                            Bot untuk aplikasi <strong>{formData.application}</strong> sudah aktif
                            di channel <strong>{formData.telegramChannel}</strong>. Tiket dari bot
                            akan diteruskan ke helpdesk yang terdaftar.
                        </p>
                        <button className="feedback-btn-primary" onClick={() => navigate('/feedback/result')}>
                            Kembali ke Result Feedback
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="feedback-content">
                <button className="feedback-back-btn" onClick={() => navigate('/feedback/result')}>
                    <ArrowLeft size={16} strokeWidth={2} />
                    Kembali
                </button>

                {/* Page header, no "Feedback" wording anywhere */}
                <div className="regis-header">
                    <div className="regis-header-icon">
                        <Bot size={22} strokeWidth={2.2} color="#FFFFFF" />
                    </div>
                    <div>
                        <h1 className="regis-header-title">Register Telegram Bot</h1>
                        <p className="regis-header-subtitle">
                            Daftarkan bot Telegram untuk aplikasi kamu agar tiket otomatis masuk ke helpdesk terkait.
                        </p>
                    </div>
                </div>

                {/* Stepper */}
                <div className="feedback-stepper">
                    {steps.map((step, index) => (
                        <div className="feedback-stepper-item" key={step.id}>
                            <div className="feedback-stepper-node">
                                <div
                                    className={`feedback-stepper-circle ${
                                        currentStep === step.id
                                            ? 'active'
                                            : currentStep > step.id
                                            ? 'completed'
                                            : ''
                                    }`}
                                >
                                    {currentStep > step.id ? <Check size={14} strokeWidth={3} /> : step.id}
                                </div>
                                <span
                                    className={`feedback-stepper-label ${
                                        currentStep === step.id ? 'active' : ''
                                    }`}
                                >
                                    {step.label}
                                </span>
                            </div>
                            {index < steps.length - 1 && <div className="feedback-stepper-line" />}
                        </div>
                    ))}
                </div>

                <div className="feedback-form-card">
                    {currentStep === 1 && (
                        <>
                            <span className="feedback-form-badge">
                                <Bot size={15} strokeWidth={2} />
                                Bot Telegram Information
                            </span>

                            <div className="feedback-form-grid">
                                <div className="form-group">
                                    <label htmlFor="application">Select Application</label>
                                    <select
                                        id="application"
                                        name="application"
                                        value={formData.application}
                                        onChange={handleChange}
                                    >
                                        <option value="">Pilih aplikasi...</option>
                                        {applications.map((app) => (
                                            <option key={app.id} value={app.name}>
                                                {app.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="telegramChannel">Telegram Channel</label>
                                    <input
                                        id="telegramChannel"
                                        name="telegramChannel"
                                        type="text"
                                        placeholder={
                                            formData.application
                                                ? 'contoh: @garasibmw_support'
                                                : 'Please select application first'
                                        }
                                        value={formData.telegramChannel}
                                        onChange={handleChange}
                                        disabled={!formData.application}
                                    />
                                    {!formData.application && (
                                        <span className="form-hint">Pilih aplikasi dulu untuk mengisi kolom ini.</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="joinLink">Join Link</label>
                                    <input
                                        id="joinLink"
                                        name="joinLink"
                                        type="text"
                                        placeholder="https://t.me/... (opsional)"
                                        value={formData.joinLink}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="helpdeskContact">Helpdesk Contact</label>
                                    <input
                                        id="helpdeskContact"
                                        name="helpdeskContact"
                                        type="text"
                                        placeholder="Email/kontak helpdesk penerima tiket"
                                        value={formData.helpdeskContact}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <p className="feedback-form-note">
                                Helpdesk yang terdaftar akan menerima dan merespon tiket yang masuk
                                melalui Bot Telegram ini.
                            </p>

                            <div className="feedback-form-actions">
                                <div />
                                <div className="feedback-form-actions-right">
                                    <button
                                        className="feedback-btn-primary"
                                        onClick={handleNext}
                                        disabled={!isStep1Valid}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {currentStep === 2 && (
                        <>
                            <span className="feedback-form-badge">Ticket Categories</span>
                            <p className="feedback-form-note">
                                Pilih kategori tiket yang akan ditangani oleh bot ini. Minimal satu kategori.
                            </p>

                            <div className="feedback-category-grid">
                                {availableCategories.map((category) => {
                                    const isChecked = formData.categories.includes(category);
                                    return (
                                        <label
                                            key={category}
                                            className={`feedback-category-chip ${isChecked ? 'active' : ''}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => toggleCategory(category)}
                                            />
                                            {isChecked && <Check size={14} strokeWidth={3} />}
                                            {category}
                                        </label>
                                    );
                                })}
                            </div>

                            {formData.categories.length > 0 && (
                                <p className="form-hint form-hint-center">
                                    {formData.categories.length} kategori dipilih
                                </p>
                            )}

                            <div className="feedback-form-actions">
                                <button className="feedback-btn-secondary" onClick={handleBack}>
                                    Back
                                </button>
                                <div className="feedback-form-actions-right">
                                    <button
                                        className="feedback-btn-primary"
                                        onClick={handleSubmit}
                                        disabled={formData.categories.length === 0}
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}

export default BotRegis;
