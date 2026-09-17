import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight } from 'lucide-react';
import Layout from '../../components/layout';
import '../../style/security_style/Add_Style.css';

const steps = [
  { id: 1, label: 'Application Information' },
  { id: 2, label: 'Technical Details' },
  { id: 3, label: 'Risk & Recommendation' },
  { id: 4, label: 'Review' },
];

const initialFormData = {
  applicationName: '',
  appOwner: '',
  objectSource: '',
  ipDomain: '',
  endpoint: '',
  platform: '',
  description: '',
  cvss: '',
  impact: '',
  dataDump: '',
  recommendation: '',
  references: '',
};

const stepRequiredFields = {
  1: ['applicationName', 'appOwner', 'objectSource'],
  2: ['ipDomain', 'endpoint', 'platform', 'description'],
  3: ['cvss', 'impact', 'dataDump', 'recommendation', 'references'],
  4: [],
};

const fieldLabels = {
  applicationName: 'Application Name',
  appOwner: 'App Owner',
  objectSource: 'Object Source',
  ipDomain: 'IP/Domain',
  endpoint: 'Endpoint',
  platform: 'Platform',
  description: 'Description',
  cvss: 'CVSS',
  impact: 'Impact',
  dataDump: 'Data Dump',
  recommendation: 'Recommendation',
  references: 'References',
};

function Add_Security() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const validateStep = (step) => {
    const requiredFields = stepRequiredFields[step] || [];
    const errors = {};

    requiredFields.forEach((field) => {
      if (!String(formData[field] || '').trim()) {
        errors[field] = `${fieldLabels[field]} wajib diisi.`;
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

  const handleSubmit = (event) => {
    event.preventDefault();
    for (let step = 1; step <= 3; step += 1) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        return;
      }
    }

    console.log('Security assessment payload:', formData);
    setSubmitted(true);
  };

  const renderError = (field) =>
    fieldErrors[field] ? <span className="sa-field-error">{fieldErrors[field]}</span> : null;

  const reviewSections = [
    {
      title: 'Application Information',
      rows: [
        { label: 'Application Name', value: formData.applicationName },
        { label: 'App Owner', value: formData.appOwner },
        { label: 'Object Source', value: formData.objectSource },
      ],
    },
    {
      title: 'Technical Details',
      rows: [
        { label: 'IP/Domain', value: formData.ipDomain },
        { label: 'Endpoint', value: formData.endpoint },
        { label: 'Platform', value: formData.platform },
        { label: 'Description', value: formData.description },
      ],
    },
    {
      title: 'Risk & Recommendation',
      rows: [
        { label: 'CVSS', value: formData.cvss },
        { label: 'Impact', value: formData.impact },
        { label: 'Data Dump', value: formData.dataDump },
        { label: 'Recommendation', value: formData.recommendation },
        { label: 'References', value: formData.references },
      ],
    },
  ];

  if (submitted) {
    return (
      <Layout>
        <div className="sa-add-page">
          <div className="sa-add-success-box">
            <div className="sa-add-success-icon">
              <Check size={32} strokeWidth={2.5} />
            </div>
            <h2>Security Assessment Berhasil Ditambahkan</h2>
            <p>
              Data untuk <strong>{formData.applicationName || 'aplikasi baru'}</strong> sudah
              masuk ke daftar penilaian keamanan.
            </p>
            <button type="button" className="sa-primary-btn" onClick={() => navigate('/security-assessment')}>
              Kembali ke Security Assessment
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="sa-add-page">
        <button type="button" className="sa-back-btn" onClick={() => navigate('/security-assessment')}>
          <ArrowLeft size={16} strokeWidth={2} />
          Back to Security Assessment
        </button>

        <div className="sa-stepper-wrap">
          <div className="sa-stepper-header">Security Assessment - Phase Dummy</div>

          <div className="sa-stepper">
            {steps.map((step, index) => (
              <div className="sa-step-item" key={step.id}>
                <div className="sa-step-node">
                  <div
                    className={`sa-step-circle ${
                      currentStep === step.id ? 'active' : currentStep > step.id ? 'completed' : ''
                    }`}
                  >
                    {currentStep > step.id ? <Check size={14} strokeWidth={3} /> : step.id}
                  </div>
                  <span className={`sa-step-label ${currentStep === step.id ? 'active' : ''}`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && <div className="sa-step-line" />}
              </div>
            ))}
          </div>
        </div>

        <div className="sa-form-card">
          <form onSubmit={handleSubmit} className="sa-form">
            {currentStep === 1 && (
              <div className="sa-form-grid">
                <div className="sa-field-group sa-span-1">
                  <label htmlFor="applicationName">Application Name *</label>
                  <input
                    id="applicationName"
                    name="applicationName"
                    type="text"
                    value={formData.applicationName}
                    onChange={handleChange}
                    placeholder="Select apps..."
                    className={fieldErrors.applicationName ? 'input-error' : ''}
                  />
                  {renderError('applicationName')}
                </div>

                <div className="sa-field-group sa-span-1">
                  <label htmlFor="appOwner">App Owner *</label>
                  <input
                    id="appOwner"
                    name="appOwner"
                    type="text"
                    value={formData.appOwner}
                    onChange={handleChange}
                    placeholder="Select apps owner..."
                    className={fieldErrors.appOwner ? 'input-error' : ''}
                  />
                  {renderError('appOwner')}
                </div>

                <div className="sa-field-group sa-span-1">
                  <label htmlFor="objectSource">Object Source *</label>
                  <input
                    id="objectSource"
                    name="objectSource"
                    type="text"
                    value={formData.objectSource}
                    onChange={handleChange}
                    placeholder="Type here..."
                    className={fieldErrors.objectSource ? 'input-error' : ''}
                  />
                  {renderError('objectSource')}
                </div>

                <div className="sa-field-group sa-span-1">
                  <label htmlFor="ipDomain">IP/DOMAIN</label>
                  <input
                    id="ipDomain"
                    name="ipDomain"
                    type="text"
                    value={formData.ipDomain}
                    onChange={handleChange}
                    placeholder="Type here..."
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="sa-form-grid">
                <div className="sa-field-group sa-span-1">
                  <label htmlFor="endpoint">Endpoint</label>
                  <input
                    id="endpoint"
                    name="endpoint"
                    type="text"
                    value={formData.endpoint}
                    onChange={handleChange}
                    placeholder="Type here..."
                    className={fieldErrors.endpoint ? 'input-error' : ''}
                  />
                  {renderError('endpoint')}
                </div>

                <div className="sa-field-group sa-span-1">
                  <label htmlFor="platform">Platform</label>
                  <input
                    id="platform"
                    name="platform"
                    type="text"
                    value={formData.platform}
                    onChange={handleChange}
                    placeholder="Type here..."
                    className={fieldErrors.platform ? 'input-error' : ''}
                  />
                  {renderError('platform')}
                </div>

                <div className="sa-field-group sa-span-1">
                  <label htmlFor="description">Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Type here..."
                    className={fieldErrors.description ? 'input-error' : ''}
                  />
                  {renderError('description')}
                </div>

                <div className="sa-field-group sa-span-1">
                  <label htmlFor="cvss">CVSS *</label>
                  <input
                    id="cvss"
                    name="cvss"
                    type="text"
                    value={formData.cvss}
                    onChange={handleChange}
                    placeholder="Type here..."
                    className={fieldErrors.cvss ? 'input-error' : ''}
                  />
                  {renderError('cvss')}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="sa-form-grid">
                <div className="sa-field-group sa-span-1">
                  <label htmlFor="impact">Impact *</label>
                  <input
                    id="impact"
                    name="impact"
                    type="text"
                    value={formData.impact}
                    onChange={handleChange}
                    placeholder="Type here..."
                    className={fieldErrors.impact ? 'input-error' : ''}
                  />
                  {renderError('impact')}
                </div>

                <div className="sa-field-group sa-span-1">
                  <label htmlFor="dataDump">Data Dump *</label>
                  <input
                    id="dataDump"
                    name="dataDump"
                    type="text"
                    value={formData.dataDump}
                    onChange={handleChange}
                    placeholder="Type here..."
                    className={fieldErrors.dataDump ? 'input-error' : ''}
                  />
                  {renderError('dataDump')}
                </div>

                <div className="sa-field-group sa-span-1">
                  <label htmlFor="recommendation">Recommendation *</label>
                  <input
                    id="recommendation"
                    name="recommendation"
                    type="text"
                    value={formData.recommendation}
                    onChange={handleChange}
                    placeholder="Type here..."
                    className={fieldErrors.recommendation ? 'input-error' : ''}
                  />
                  {renderError('recommendation')}
                </div>

                <div className="sa-field-group sa-span-1">
                  <label htmlFor="references">References *</label>
                  <input
                    id="references"
                    name="references"
                    type="text"
                    value={formData.references}
                    onChange={handleChange}
                    placeholder="Type here..."
                    className={fieldErrors.references ? 'input-error' : ''}
                  />
                  {renderError('references')}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="sa-review-box">
                {reviewSections.map((section) => (
                  <div className="sa-review-section" key={section.title}>
                    <p className="sa-review-title">{section.title}</p>
                    <div className="sa-review-list">
                      {section.rows.map((row) => (
                        <div className="sa-review-row" key={row.label}>
                          <span>{row.label}</span>
                          <strong>{row.value || 'Belum diisi'}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="sa-form-actions">
              {currentStep > 1 && (
                <button type="button" className="sa-secondary-btn" onClick={handleBack}>
                  Back
                </button>
              )}

              <div className="sa-form-actions-right">
                {currentStep < steps.length ? (
                  <button type="button" className="sa-primary-btn" onClick={handleNext}>
                    Next
                    <ChevronRight size={16} strokeWidth={2.2} />
                  </button>
                ) : (
                  <button type="submit" className="sa-primary-btn">
                    Submit
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default Add_Security;
