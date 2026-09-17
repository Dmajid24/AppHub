import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Download, ListChecks } from 'lucide-react';
import Layout from '../../components/layout';
import '../../style/request_style/Main_Style.css';

const initialFormData = {
    appName: '',
    pic: '',
    useCaseName: '',
    description: '',
    objective: '',
    feasibilityBenefit: '',
    custodyPic: '',
};

function UseCaseRegis() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('request');
    const [formData, setFormData] = useState(initialFormData);
    const [notaDinasFile, setNotaDinasFile] = useState(null);
    const [businessReqFile, setBusinessReqFile] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        console.log('Use case request submitted:', formData, {
            notaDinasFile,
            businessReqFile,
        });
        setSubmitted(true);
    };

    const isFormValid =
        formData.appName && formData.useCaseName && formData.objective;

    if (submitted) {
        return (
            <Layout>
                <div className="request-content">
                    <div className="request-success">
                        <div className="request-success-icon">
                            <Check size={32} strokeWidth={2.5} color="#FFFFFF" />
                        </div>
                        <h2>Use Case Request Berhasil Diajukan</h2>
                        <p>
                            Use case <strong>{formData.useCaseName}</strong> untuk aplikasi{' '}
                            <strong>{formData.appName}</strong> sudah dikirim dan menunggu review.
                        </p>
                        <button className="request-btn-primary" onClick={() => navigate('/request')}>
                            Kembali ke Request
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="request-content">

                {/* Page header, matches AppRegis/BotRegis pattern */}
                <div className="request-page-header">
                    <div className="request-page-header-icon">
                        <ListChecks size={22} strokeWidth={2.2} color="#FFFFFF" />
                    </div>
                    <div>
                        <h1 className="request-page-header-title">Use Case Request</h1>
                        <p className="request-page-header-subtitle">
                            Ajukan use case baru untuk aplikasi yang sudah terdaftar, lengkap dengan dokumen pendukung.
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="request-tabs">
                    <button
                        className={`request-tab ${activeTab === 'request' ? 'active' : ''}`}
                        onClick={() => setActiveTab('request')}
                    >
                        Use Case Request
                    </button>
                    <button
                        className={`request-tab ${activeTab === 'summary' ? 'active' : ''}`}
                        onClick={() => setActiveTab('summary')}
                    >
                        Summary
                    </button>
                </div>

                <div className="request-form-card">
                    {activeTab === 'request' ? (
                        <>
                            <span className="request-form-badge">Use Case Request</span>

                            <div className="request-form-grid">
                                <div className="form-group">
                                    <label htmlFor="appName">App Name</label>
                                    <input
                                        id="appName"
                                        name="appName"
                                        type="text"
                                        placeholder="Select or type app name..."
                                        value={formData.appName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="pic">PIC</label>
                                    <input
                                        id="pic"
                                        name="pic"
                                        type="text"
                                        placeholder="Type here..."
                                        value={formData.pic}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="useCaseName">Use Case Name</label>
                                    <input
                                        id="useCaseName"
                                        name="useCaseName"
                                        type="text"
                                        placeholder="Type here..."
                                        value={formData.useCaseName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="description">Description</label>
                                    <input
                                        id="description"
                                        name="description"
                                        type="text"
                                        placeholder="Type here..."
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="objective">Objective</label>
                                    <input
                                        id="objective"
                                        name="objective"
                                        type="text"
                                        placeholder="Type here..."
                                        value={formData.objective}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="feasibilityBenefit">Feasibility & Benefit</label>
                                    <input
                                        id="feasibilityBenefit"
                                        name="feasibilityBenefit"
                                        type="text"
                                        placeholder="Type here..."
                                        value={formData.feasibilityBenefit}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="custodyPic">Custody PIC</label>
                                    <select
                                        id="custodyPic"
                                        name="custodyPic"
                                        value={formData.custodyPic}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select departements...</option>
                                        <option value="IT Infrastructure">IT Infrastructure</option>
                                        <option value="Engineering">Engineering</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Security">Security</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="notaDinas">Nota Dinas</label>
                                    <div className="request-file-input">
                                        <label htmlFor="notaDinas" className="request-file-btn">
                                            Choose File
                                        </label>
                                        <span className="request-file-name">
                                            {notaDinasFile ? notaDinasFile.name : 'No file chosen'}
                                        </span>
                                        <input
                                            id="notaDinas"
                                            type="file"
                                            className="request-file-hidden"
                                            onChange={(e) => setNotaDinasFile(e.target.files[0] || null)}
                                        />
                                    </div>
                                </div>

                                <div className="form-group request-form-full">
                                    <label htmlFor="businessRequirement">
                                        Business Requirement
                                        <a
                                            href="#"
                                            className="request-template-link"
                                            onClick={(e) => e.preventDefault()}
                                        >
                                            <Download size={13} strokeWidth={2} />
                                            Download Template: business-requirement-template.docx
                                        </a>
                                    </label>
                                    <div className="request-file-input">
                                        <label htmlFor="businessRequirement" className="request-file-btn">
                                            Choose File
                                        </label>
                                        <span className="request-file-name">
                                            {businessReqFile ? businessReqFile.name : 'No file chosen'}
                                        </span>
                                        <input
                                            id="businessRequirement"
                                            type="file"
                                            className="request-file-hidden"
                                            onChange={(e) => setBusinessReqFile(e.target.files[0] || null)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="request-form-actions">
                                <div />
                                <div className="request-form-actions-right">
                                    <button
                                        className="request-btn-primary"
                                        onClick={handleSubmit}
                                        disabled={!isFormValid}
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <span className="request-form-badge">Summary</span>
                            <div className="request-summary-list">
                                <div className="request-summary-row">
                                    <span>App Name</span>
                                    <span>{formData.appName || '-'}</span>
                                </div>
                                <div className="request-summary-row">
                                    <span>PIC</span>
                                    <span>{formData.pic || '-'}</span>
                                </div>
                                <div className="request-summary-row">
                                    <span>Use Case Name</span>
                                    <span>{formData.useCaseName || '-'}</span>
                                </div>
                                <div className="request-summary-row">
                                    <span>Description</span>
                                    <span>{formData.description || '-'}</span>
                                </div>
                                <div className="request-summary-row">
                                    <span>Objective</span>
                                    <span>{formData.objective || '-'}</span>
                                </div>
                                <div className="request-summary-row">
                                    <span>Feasibility & Benefit</span>
                                    <span>{formData.feasibilityBenefit || '-'}</span>
                                </div>
                                <div className="request-summary-row">
                                    <span>Custody PIC</span>
                                    <span>{formData.custodyPic || '-'}</span>
                                </div>
                                <div className="request-summary-row">
                                    <span>Nota Dinas</span>
                                    <span>{notaDinasFile ? notaDinasFile.name : '-'}</span>
                                </div>
                                <div className="request-summary-row">
                                    <span>Business Requirement</span>
                                    <span>{businessReqFile ? businessReqFile.name : '-'}</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}

export default UseCaseRegis;
