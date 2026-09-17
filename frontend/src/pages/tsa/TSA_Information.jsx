import { Activity, AlertTriangle, Clock3, ShieldCheck } from 'lucide-react';
import Layout from '../../components/layout';
import '../../style/tsa_style/Main_Style.css';

const summaryCards = [
  {
    title: 'Assessment Coverage',
    value: '82%',
    detail: 'Area aplikasi dan infrastruktur dicek',
    icon: ShieldCheck,
    tone: 'good',
  },
  {
    title: 'Remediation Items',
    value: '6',
    detail: 'Temuan yang perlu ditindaklanjuti',
    icon: AlertTriangle,
    tone: 'warning',
  },
  {
    title: 'Operational Readiness',
    value: 'High',
    detail: 'Proses review & pelaporan berjalan',
    icon: Activity,
    tone: 'good',
  },
  {
    title: 'Next Review',
    value: '14 Hari',
    detail: 'Jadwal audit berikutnya',
    icon: Clock3,
    tone: 'neutral',
  },
];

const focusAreas = [
  {
    title: 'Vulnerability Review',
    detail: 'Tinjau dependency dan konfigurasi keamanan secara berkala.',
  },
  {
    title: 'Policy Alignment',
    detail: 'Pastikan standar TSA selaras dengan kebijakan internal.',
  },
  {
    title: 'Incident Readiness',
    detail: 'Latih tim untuk skenario respons dan eskalasi cepat.',
  },
];

const programNotes = [
  {
    title: 'Data protection',
    text: 'Semua data sensitif diklasifikasikan dan dilindungi sesuai standar TSA.',
  },
  {
    title: 'Access review',
    text: 'Hak akses diverifikasi setiap kuartal untuk mengurangi eksposur risiko.',
  },
  {
    title: 'Reporting cadence',
    text: 'Laporan TSA dikirim kepada pemangku kepentingan secara rutin.',
  },
];

function TSAInformation() {
  return (
    <Layout>
      <div className="tsa-page">
        <div className="tsa-summary-grid">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div className={`tsa-summary-card ${card.tone}`} key={card.title}>
                <div className="tsa-summary-icon">
                  <Icon size={18} strokeWidth={2} />
                </div>
                <div>
                  <p className="tsa-summary-title">{card.title}</p>
                  <h3>{card.value}</h3>
                  <span>{card.detail}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="tsa-grid">
          <section className="tsa-card">
            <div className="tsa-card-header">
              <div>
                <p className="tsa-card-label">Focus Areas</p>
                <h2>Prioritas keamanan TSA</h2>
              </div>
              <span className="tsa-chip">Quarterly Plan</span>
            </div>

            <div className="tsa-list">
              {focusAreas.map((item) => (
                <div className="tsa-list-item" key={item.title}>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="tsa-card">
            <div className="tsa-card-header">
              <div>
                <p className="tsa-card-label">Program Notes</p>
                <h2>Catatan inti TSA</h2>
              </div>
            </div>

            <div className="tsa-alert-list">
              {programNotes.map((note) => (
                <div className="tsa-alert-item" key={note.title}>
                  <div className="tsa-alert-icon">
                    <ShieldCheck size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <h3>{note.title}</h3>
                    <p>{note.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default TSAInformation;
