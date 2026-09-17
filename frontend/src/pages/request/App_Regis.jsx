import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ClipboardList } from 'lucide-react';
import Layout from '../../components/layout';
import { appRegistration } from '../../services/api'; // adjust path if api.js lives elsewhere
import '../../style/request_style/Main_Style.css';

const steps = [
    { id: 1, label: 'Application Summary' },
    { id: 2, label: 'Data Management' },
    { id: 3, label: 'Application Detail' },
    { id: 4, label: 'Asset Owner' },
    { id: 5, label: 'Review' },
];

const initialFormData = {
    // Step 1: Application Summary
    appName: '',
    appCategory: '',
    appDescription: '',
    appUrl: '',
    // Step 2: Data Management
    dataClassification: '',
    dataSource: '',
    dataRetention: '',
    // Step 3: Application Detail
    version: '',
    server: '',
    database: '',
    techStack: '',
    // Step 4: Asset Owner
    ownerName: '',
    ownerEmail: '',
    backupOwner: '',
};

// Field yang wajib diisi per step. Sesuaikan di sini kalau ada field yang
// sebenarnya opsional.
const stepRequiredFields = {
    1: ['appName', 'appCategory', 'appDescription', 'appUrl'],
    2: ['dataClassification', 'dataSource', 'dataRetention'],
    3: ['version', 'server', 'database', 'techStack'],
    4: ['ownerName', 'ownerEmail', 'backupOwner'],
    5: [],
};

const fieldLabels = {
    appName: 'App Name',
    appCategory: 'Category',
    appDescription: 'Description',
    appUrl: 'Application URL',
    dataClassification: 'Data Classification',
    dataSource: 'Data Source',
    dataRetention: 'Data Retention Policy',
    version: 'Version',
    server: 'Server',
    database: 'Database',
    techStack: 'Technology Stack',
    ownerName: 'Owner Name',
    ownerEmail: 'Owner Email',
    backupOwner: 'Backup Owner',
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AppRegis() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(initialFormData);
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [user] = useState(() => {
        try {
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Hapus error field ini begitu user mulai mengisi ulang
        setFieldErrors((prev) => {
            if (!prev[name]) return prev;
            const next = { ...prev };
            delete next[name];
            return next;
        });
    };

    // Validasi semua field wajib pada sebuah step. Mengembalikan objek error
    // (kosong jika valid) dan sekaligus set state fieldErrors.
    const validateStep = (step) => {
        const requiredFields = stepRequiredFields[step] || [];
        const errors = {};

        requiredFields.forEach((field) => {
            const value = formData[field]?.trim();
            if (!value) {
                errors[field] = `${fieldLabels[field]} wajib diisi.`;
            } else if (field === 'ownerEmail' && !emailPattern.test(value)) {
                errors[field] = 'Format email tidak valid.';
            }
        });

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        if (!validateStep(currentStep)) return;
        if (currentStep < steps.length) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setFieldErrors({});
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleSubmit = async () => {
        // Validasi ulang seluruh step (jaga-jaga kalau user sempat kembali
        // ke step sebelumnya lalu menghapus isian).
        for (let step = 1; step <= 4; step += 1) {
            if (!validateStep(step)) {
                setCurrentStep(step);
                return;
            }
        }

        const payload = {
            ...formData,
            registrant: user?.username || null,
            registrantEmail: user?.email || null,
        };

        setSubmitting(true);
        setSubmitError(null);
        try {
            await appRegistration(payload);
            setSubmitted(true);
        } catch (err) {
            setSubmitError(err.message || 'Gagal mendaftarkan aplikasi.');
        } finally {
            setSubmitting(false);
        }
    };

    // Data untuk step Review — dikelompokkan persis sama seperti struktur step 1-4,
    // supaya user gampang lihat "ini bagian mana yang saya isi".
    const reviewSections = [
        {
            title: 'Application Summary',
            rows: [
                { label: 'App Name', value: formData.appName },
                { label: 'Category', value: formData.appCategory },
                { label: 'Description', value: formData.appDescription },
                { label: 'Application URL', value: formData.appUrl },
            ],
        },
        {
            title: 'Data Management',
            rows: [
                { label: 'Data Classification', value: formData.dataClassification },
                { label: 'Data Source', value: formData.dataSource },
                { label: 'Data Retention Policy', value: formData.dataRetention },
            ],
        },
        {
            title: 'Application Detail',
            rows: [
                { label: 'Version', value: formData.version },
                { label: 'Server', value: formData.server },
                { label: 'Database', value: formData.database },
                { label: 'Technology Stack', value: formData.techStack },
            ],
        },
        {
            title: 'Asset Owner',
            rows: [
                { label: 'Owner Name', value: formData.ownerName },
                { label: 'Owner Email', value: formData.ownerEmail },
                { label: 'Backup Owner', value: formData.backupOwner },
            ],
        },
    ];

    if (submitted) {
        return (
            <Layout>
                <div className="request-content">
                    <div className="request-success">
                        <div className="request-success-icon">
                            <Check size={32} strokeWidth={2.5} color="#FFFFFF" />
                        </div>
                        <h2>Pendaftaran Aplikasi Berhasil</h2>
                        <p>
                            Aplikasi <strong>{formData.appName || 'baru'}</strong> telah didaftarkan oleh{' '}
                            <strong>{user?.username || 'Anda'}</strong> dan menunggu proses verifikasi.
                        </p>
                        <button className="request-btn-primary" onClick={() => navigate('/request')}>
                            Kembali ke Request
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    // Helper kecil biar JSX field nggak berulang-ulang nulis className/error
    const renderError = (field) =>
        fieldErrors[field] ? (
            <span className="request-field-error">{fieldErrors[field]}</span>
        ) : null;

    return (
        <Layout>
            <div className="request-content">

                {/* Page header, no "Feedback" wording, matches BotRegis pattern */}
                <div className="request-page-header">
                    <div className="request-page-header-icon">
                        <ClipboardList size={22} strokeWidth={2.2} color="#FFFFFF" />
                    </div>
                    <div>
                        <h1 className="request-page-header-title">Application Registration</h1>
                        <p className="request-page-header-subtitle">
                            Daftarkan aplikasi baru beserta detail teknis dan pemilik asetnya.
                        </p>
                    </div>
                </div>

                {/* Stepper */}
                <div className="request-stepper">
                    {steps.map((step, index) => (
                        <div className="request-stepper-item" key={step.id}>
                            <div className="request-stepper-node">
                                <div
                                    className={`request-stepper-circle ${currentStep === step.id
                                        ? 'active'
                                        : currentStep > step.id
                                            ? 'completed'
                                            : ''
                                        }`}
                                >
                                    {currentStep > step.id ? <Check size={14} strokeWidth={3} /> : step.id}
                                </div>
                                <span
                                    className={`request-stepper-label ${currentStep === step.id ? 'active' : ''
                                        }`}
                                >
                                    {step.label}
                                </span>
                            </div>
                            {index < steps.length - 1 && <div className="request-stepper-line" />}
                        </div>
                    ))}
                </div>

                <div className="request-form-card">

                    {/* Step 1: Application Summary */}
                    {currentStep === 1 && (
                        <>
                            <span className="request-form-badge">Application Summary</span>
                            <div className="request-form-grid">
                                <div className="form-group">
                                    <label htmlFor="appName">App Name *</label>
                                    <input
                                        id="appName"
                                        name="appName"
                                        type="text"
                                        placeholder="Type here..."
                                        value={formData.appName}
                                        onChange={handleChange}
                                        className={fieldErrors.appName ? 'input-error' : ''}
                                    />
                                    {renderError('appName')}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="appCategory">Category *</label>
                                    <input
                                        id="appCategory"
                                        name="appCategory"
                                        type="text"
                                        placeholder="Type here..."
                                        value={formData.appCategory}
                                        onChange={handleChange}
                                        className={fieldErrors.appCategory ? 'input-error' : ''}
                                    />
                                    {renderError('appCategory')}
                                </div>
                                <div className="form-group request-form-full">
                                    <label htmlFor="appDescription">Description *</label>
                                    <textarea
                                        id="appDescription"
                                        name="appDescription"
                                        rows={3}
                                        placeholder="Type here..."
                                        value={formData.appDescription}
                                        onChange={handleChange}
                                        className={fieldErrors.appDescription ? 'input-error' : ''}
                                    />
                                    {renderError('appDescription')}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="appUrl">Application URL *</label>
                                    <input
                                        id="appUrl"
                                        name="appUrl"
                                        type="text"
                                        placeholder="Type here..."
                                        value={formData.appUrl}
                                        onChange={handleChange}
                                        className={fieldErrors.appUrl ? 'input-error' : ''}
                                    />
                                    {renderError('appUrl')}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Step 2: Data Management */}
                    {currentStep === 2 && (
                        <>
                            <span className="request-form-badge">Data Management</span>
                            <div className="request-form-grid">
                                <div className="form-group">
                                    <label htmlFor="dataClassification">Data Classification *</label>
                                    <input
                                        id="dataClassification"
                                        name="dataClassification"
                                        type="text"
                                        placeholder="contoh: Confidential"
                                        value={formData.dataClassification}
                                        onChange={handleChange}
                                        className={fieldErrors.dataClassification ? 'input-error' : ''}
                                    />
                                    {renderError('dataClassification')}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="dataSource">Data Source *</label>
                                    <input
                                        id="dataSource"
                                        name="dataSource"
                                        type="text"
                                        placeholder="Type here..."
                                        value={formData.dataSource}
                                        onChange={handleChange}
                                        className={fieldErrors.dataSource ? 'input-error' : ''}
                                    />
                                    {renderError('dataSource')}
                                </div>
                                <div className="form-group request-form-full">
                                    <label htmlFor="dataRetention">Data Retention Policy *</label>
                                    <textarea
                                        id="dataRetention"
                                        name="dataRetention"
                                        rows={3}
                                        placeholder="Type here..."
                                        value={formData.dataRetention}
                                        onChange={handleChange}
                                        className={fieldErrors.dataRetention ? 'input-error' : ''}
                                    />
                                    {renderError('dataRetention')}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Step 3: Application Detail */}
                    {currentStep === 3 && (
                        <>
                            <span className="request-form-badge">Application Detail</span>
                            <div className="request-form-grid">
                                <div className="form-group">
                                    <label htmlFor="version">Version *</label>
                                    <input
                                        id="version"
                                        name="version"
                                        type="text"
                                        placeholder="contoh: v1.0.0"
                                        value={formData.version}
                                        onChange={handleChange}
                                        className={fieldErrors.version ? 'input-error' : ''}
                                    />
                                    {renderError('version')}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="server">Server *</label>
                                    <input
                                        id="server"
                                        name="server"
                                        type="text"
                                        placeholder="Type here..."
                                        value={formData.server}
                                        onChange={handleChange}
                                        className={fieldErrors.server ? 'input-error' : ''}
                                    />
                                    {renderError('server')}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="database">Database *</label>
                                    <input
                                        id="database"
                                        name="database"
                                        type="text"
                                        placeholder="Type here..."
                                        value={formData.database}
                                        onChange={handleChange}
                                        className={fieldErrors.database ? 'input-error' : ''}
                                    />
                                    {renderError('database')}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="techStack">Technology Stack *</label>
                                    <input
                                        id="techStack"
                                        name="techStack"
                                        type="text"
                                        placeholder="contoh: React, Laravel"
                                        value={formData.techStack}
                                        onChange={handleChange}
                                        className={fieldErrors.techStack ? 'input-error' : ''}
                                    />
                                    {renderError('techStack')}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Step 4: Asset Owner */}
                    {currentStep === 4 && (
                        <>
                            <span className="request-form-badge">Asset Owner</span>
                            <div className="request-form-grid">
                                <div className="form-group">
                                    <label htmlFor="ownerName">Owner Name *</label>
                                    <input
                                        id="ownerName"
                                        name="ownerName"
                                        type="text"
                                        placeholder="Type here..."
                                        value={formData.ownerName}
                                        onChange={handleChange}
                                        className={fieldErrors.ownerName ? 'input-error' : ''}
                                    />
                                    {renderError('ownerName')}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="ownerEmail">Owner Email *</label>
                                    <input
                                        id="ownerEmail"
                                        name="ownerEmail"
                                        type="email"
                                        placeholder="Type here..."
                                        value={formData.ownerEmail}
                                        onChange={handleChange}
                                        className={fieldErrors.ownerEmail ? 'input-error' : ''}
                                    />
                                    {renderError('ownerEmail')}
                                </div>
                                <div className="form-group request-form-full">
                                    <label htmlFor="backupOwner">Backup Owner *</label>
                                    <input
                                        id="backupOwner"
                                        name="backupOwner"
                                        type="text"
                                        placeholder="Type here..."
                                        value={formData.backupOwner}
                                        onChange={handleChange}
                                        className={fieldErrors.backupOwner ? 'input-error' : ''}
                                    />
                                    {renderError('backupOwner')}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Step 5: Review */}
                    {currentStep === 5 && (
                        <>
                            <span className="request-form-badge">Review</span>

                            <div className="request-review-registrant">
                                <span className="request-review-registrant-avatar">
                                    {(user?.username || 'GU').slice(0, 2).toUpperCase()}
                                </span>
                                <div>
                                    <p className="request-review-registrant-label">Didaftarkan oleh</p>
                                    <p className="request-review-registrant-name">
                                        {user?.username || 'Pengguna tidak dikenal'}
                                    </p>
                                    {user?.email && (
                                        <p className="request-review-registrant-email">{user.email}</p>
                                    )}
                                </div>
                            </div>

                            {reviewSections.map((section) => (
                                <div className="request-review-section" key={section.title}>
                                    <p className="request-review-section-title">{section.title}</p>
                                    <div className="request-summary-list">
                                        {section.rows.map((row) => (
                                            <div className="request-summary-row" key={row.label}>
                                                <span>{row.label}</span>
                                                <span className={!row.value ? 'request-summary-empty' : ''}>
                                                    {row.value || 'Belum diisi'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {submitError && (
                                <p className="request-form-error">{submitError}</p>
                            )}
                        </>
                    )}

                    <div className="request-form-actions">
                        {currentStep > 1 && (
                            <button className="request-btn-secondary" onClick={handleBack} disabled={submitting}>
                                Back
                            </button>
                        )}
                        <div className="request-form-actions-right">
                            {currentStep < steps.length ? (
                                <button className="request-btn-primary" onClick={handleNext}>
                                    Next
                                </button>
                            ) : (
                                <button
                                    className="request-btn-primary"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Submitting...' : 'Submit'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default AppRegis;