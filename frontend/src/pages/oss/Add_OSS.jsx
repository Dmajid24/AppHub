import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Server } from "lucide-react";
import Layout from "../../components/Layout";
import "../../style/oss_style/Main_Style.css";

const steps = [
  { id: 1, label: "General Application" },
  { id: 2, label: "Application Address" },
  { id: 3, label: "Coverage & Location" },
  { id: 4, label: "License & Status" },
  { id: 5, label: "Review" },
];

const VENDOR_OPTIONS = ["Nokia", "Huawei", "Ericsson", "ZTE", "Cisco", "Juniper Networks"];

const COVERAGE_AREA_OPTIONS = ["Sumabagut", "Sumagteng", "Sumagsel", "Jabo Inner", "Jabo Outer", "Nasional"];

const OS_TYPE_OPTIONS = [
  "Linux (RHEL)",
  "Linux (Ubuntu)",
  "Windows Server",
  "Cisco IOS-XR",
  "Junos OS",
  "Unix (Solaris)",
  "Embedded / Proprietary",
];

const SERVER_LOCATION_OPTIONS = [
  "Data Center Jakarta",
  "Data Center Bandung",
  "Data Center Surabaya",
  "Data Center Medan",
  "Cloud (AWS)",
  "Cloud (GCP)",
];

const LICENSE_OPTIONS = ["09/01/2027V2", "15/03/2026V1", "22/11/2025V3", "Belum ada sertifikat"];

const initialFormData = {
  // Step 1: General Application
  vendor: VENDOR_OPTIONS[0],
  applicationName: "",
  osType: "",
  details: "",
  // Step 2: Application Address
  ipAddress: "",
  hostname: "",
  url: "",
  // Step 3: Coverage & Location
  coverageArea: "",
  serverLocation: "",
  rackLocation: "",
  // Step 4: License & Status
  serialNumber: "",
  licensedCertificate: LICENSE_OPTIONS[0],
  tsaStatus: "",
};

function Add_OSS() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    const payload = {
      ...formData,
      registrant: user?.username || null,
      registrantEmail: user?.email || null,
    };
    // TODO: Kirim payload ke API backend untuk diproses.
    console.log("OSS registration submitted:", payload);
    setSubmitted(true);
  };

  const reviewSections = [
    {
      title: "General Application",
      rows: [
        { label: "Vendor", value: formData.vendor },
        { label: "Application Name", value: formData.applicationName },
        { label: "OS Type", value: formData.osType },
        { label: "Details", value: formData.details },
      ],
    },
    {
      title: "Application Address",
      rows: [
        { label: "IP Address", value: formData.ipAddress },
        { label: "Hostname", value: formData.hostname },
        { label: "URL", value: formData.url },
      ],
    },
    {
      title: "Coverage & Location",
      rows: [
        { label: "Coverage Area", value: formData.coverageArea },
        { label: "Server Location", value: formData.serverLocation },
        { label: "Rack Location", value: formData.rackLocation },
      ],
    },
    {
      title: "License & Status",
      rows: [
        { label: "Serial Number", value: formData.serialNumber },
        { label: "Licensed Certificate", value: formData.licensedCertificate },
        { label: "TSA Status", value: formData.tsaStatus },
      ],
    },
  ];

  if (submitted) {
    return (
      <Layout>
        <div className="oss-page">
          <div className="oss-form-success">
            <div className="oss-form-success-icon">
              <Check size={32} strokeWidth={2.5} color="#FFFFFF" />
            </div>
            <h2>OSS Berhasil Ditambahkan</h2>
            <p>
              <strong>{formData.applicationName || "Perangkat baru"}</strong> dari vendor{" "}
              <strong>{formData.vendor}</strong> telah tercatat di inventaris OSS oleh{" "}
              <strong>{user?.username || "Anda"}</strong>.
            </p>
            <button className="oss-btn-primary" onClick={() => navigate("/oss-data")}>
              Kembali ke OSS Data Integration
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="oss-page">
        <button type="button" className="oss-form-back-btn" onClick={() => navigate("/oss-data")}>
          <ArrowLeft size={16} strokeWidth={2} />
          Back to OSS Data Integration
        </button>

        {/* Header Indicator */}
        <div className="oss-form-title-row">
          <div className="oss-form-header-icon">
            <Server size={18} strokeWidth={2.2} color="#FFFFFF" />
          </div>
          <h2 className="oss-form-title">Create New OSS Details</h2>
        </div>

        {/* Stepper */}
        <div className="oss-form-stepper">
          {steps.map((step, index) => (
            <div className="oss-stepper-item" key={step.id}>
              <div className="oss-stepper-node">
                <div
                  className={`oss-stepper-circle ${
                    currentStep === step.id ? "active" : currentStep > step.id ? "completed" : ""
                  }`}
                >
                  {currentStep > step.id ? <Check size={14} strokeWidth={3} /> : step.id}
                </div>
                <span className={`oss-stepper-label ${currentStep === step.id ? "active" : ""}`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && <div className="oss-stepper-line" />}
            </div>
          ))}
        </div>

        <div className="oss-form-card">
          {/* Step 1: General Application */}
          {currentStep === 1 && (
            <>
              <span className="oss-form-badge">General Application</span>
              <div className="oss-form-grid">
                <div className="oss-form-group">
                  <label htmlFor="vendor">Vendor</label>
                  <select id="vendor" name="vendor" value={formData.vendor} onChange={handleChange}>
                    {VENDOR_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="oss-form-group">
                  <label htmlFor="applicationName">Application Name</label>
                  <input
                    id="applicationName"
                    name="applicationName"
                    type="text"
                    placeholder="e.g. Nokia NC10"
                    value={formData.applicationName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="oss-form-group">
                  <label htmlFor="osType">OS Type</label>
                  <select id="osType" name="osType" value={formData.osType} onChange={handleChange}>
                    <option value="">Select operating system</option>
                    {OS_TYPE_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="oss-form-group">
                  <label htmlFor="details">Details</label>
                  <input
                    id="details"
                    name="details"
                    type="text"
                    placeholder="Hardware Only"
                    value={formData.details}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 2: Application Address */}
          {currentStep === 2 && (
            <>
              <span className="oss-form-badge">Application Address</span>
              <div className="oss-form-grid">
                <div className="oss-form-group">
                  <label htmlFor="ipAddress">IP Address</label>
                  <input
                    id="ipAddress"
                    name="ipAddress"
                    type="text"
                    placeholder="e.g. 10.40.48.9"
                    value={formData.ipAddress}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="oss-form-group">
                  <label htmlFor="hostname">Hostname</label>
                  <input
                    id="hostname"
                    name="hostname"
                    type="text"
                    placeholder="e.g. oss-srv-01"
                    value={formData.hostname}
                    onChange={handleChange}
                  />
                </div>

                <div className="oss-form-group oss-form-full">
                  <label htmlFor="url">URL</label>
                  <input
                    id="url"
                    name="url"
                    type="text"
                    placeholder="e.g. https://nokia-nc10.internal"
                    value={formData.url}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 3: Coverage & Location */}
          {currentStep === 3 && (
            <>
              <span className="oss-form-badge">Coverage & Location</span>
              <div className="oss-form-grid">
                <div className="oss-form-group">
                  <label htmlFor="coverageArea">Coverage Area</label>
                  <select id="coverageArea" name="coverageArea" value={formData.coverageArea} onChange={handleChange}>
                    <option value="">Select coverage area</option>
                    {COVERAGE_AREA_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="oss-form-group">
                  <label htmlFor="serverLocation">Server Location</label>
                  <select id="serverLocation" name="serverLocation" value={formData.serverLocation} onChange={handleChange}>
                    <option value="">Select datacenter region</option>
                    {SERVER_LOCATION_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="oss-form-group oss-form-full">
                  <label htmlFor="rackLocation">Rack Location</label>
                  <input
                    id="rackLocation"
                    name="rackLocation"
                    type="text"
                    placeholder="e.g. Rack 04, Slot B"
                    value={formData.rackLocation}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 4: License & Status */}
          {currentStep === 4 && (
            <>
              <span className="oss-form-badge">License & Status</span>
              <div className="oss-form-grid">
                <div className="oss-form-group">
                  <label htmlFor="serialNumber">Serial Number</label>
                  <input
                    id="serialNumber"
                    name="serialNumber"
                    type="text"
                    placeholder="e.g. 6804701018969206893741248"
                    value={formData.serialNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="oss-form-group">
                  <label htmlFor="licensedCertificate">Licensed Sertifikat</label>
                  <select
                    id="licensedCertificate"
                    name="licensedCertificate"
                    value={formData.licensedCertificate}
                    onChange={handleChange}
                  >
                    {LICENSE_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="oss-form-group oss-form-full">
                  <label htmlFor="tsaStatus">TSA Status</label>
                  <input
                    id="tsaStatus"
                    name="tsaStatus"
                    type="text"
                    placeholder="e.g. Evaluated / Active"
                    value={formData.tsaStatus}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <>
              <span className="oss-form-badge">Review</span>

              <div className="oss-review-registrant">
                <span className="oss-review-registrant-avatar">
                  {(user?.username || "GU").slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <p className="oss-review-registrant-label">Didaftarkan oleh</p>
                  <p className="oss-review-registrant-name">
                    {user?.username || "Pengguna tidak dikenal"}
                  </p>
                  {user?.email && <p className="oss-review-registrant-email">{user.email}</p>}
                </div>
              </div>

              {reviewSections.map((section) => (
                <div className="oss-review-section" key={section.title}>
                  <p className="oss-review-section-title">{section.title}</p>
                  <div className="oss-review-list">
                    {section.rows.map((row) => (
                      <div className="oss-review-row" key={row.label}>
                        <span>{row.label}</span>
                        <span className={!row.value ? "oss-review-empty" : ""}>
                          {row.value || "Belum diisi"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          <div className="oss-form-actions">
            {currentStep > 1 && (
              <button type="button" className="oss-btn-secondary" onClick={handleBack}>
                Back
              </button>
            )}
            <div className="oss-form-actions-right">
              {currentStep < steps.length ? (
                <button type="button" className="oss-btn-primary" onClick={handleNext}>
                  Next
                </button>
              ) : (
                <button type="button" className="oss-btn-primary" onClick={handleSubmit}>
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Add_OSS;