import { Users, Award, Mail, Briefcase } from 'lucide-react';
import Layout from '../../components/layout';
import '../../style/tsa_style/Main_Style.css';

const teamMembers = [
  {
    name: 'Ayu Pratama',
    role: 'Lead TSA Analyst',
    focus: 'Audit keamanan dan compliance',
    contact: 'ayu.pratama@telkomsel.co.id',
  },
  {
    name: 'Rizal Nugraha',
    role: 'Threat Intelligence',
    focus: 'Analisis kerentanan OSS dan aplikasi',
    contact: 'rizal.nugraha@telkomsel.co.id',
  },
  {
    name: 'Dina Wulan',
    role: 'Security Operations',
    focus: 'Koordinasi respons insiden',
    contact: 'dina.wulan@telkomsel.co.id',
  },
];

const initiatives = [
  { title: 'Triage Incident', detail: 'Tindakan cepat untuk temuan kritis dan ransomware.' },
  { title: 'OSS Compliance', detail: 'Pemeriksaan ketergantungan open source setiap sprint.' },
  { title: 'Policy Sync', detail: 'Sinkronisasi kebijakan keamanan lintas tim aplikasi.' },
];

function TSATeam() {
  return (
    <Layout>
      <div className="tsa-page">
        <div className="tsa-grid">
          <section className="tsa-card tsa-team-card">
            <div className="tsa-card-header">
              <div>
                <p className="tsa-card-label">Team members</p>
                <h2>Anggota tim TSA</h2>
              </div>
              <span className="tsa-chip">Core Team</span>
            </div>

            <div className="tsa-team-list">
              {teamMembers.map((member) => (
                <div className="tsa-team-item" key={member.name}>
                  <div className="tsa-team-avatar">
                    <Users size={20} strokeWidth={2} />
                  </div>
                  <div className="tsa-team-body">
                    <h3>{member.name}</h3>
                    <p>{member.role}</p>
                    <span>{member.focus}</span>
                  </div>
                  <a href={`mailto:${member.contact}`} className="tsa-team-contact">
                    <Mail size={16} />
                    <span>{member.contact}</span>
                  </a>
                </div>
              ))}
            </div>
          </section>

          <section className="tsa-card tsa-team-sidecard">
            <div className="tsa-card-header">
              <div>
                <p className="tsa-card-label">Initiatives</p>
                <h2>Inisiatif utama</h2>
              </div>
            </div>

            <div className="tsa-list">
              {initiatives.map((item) => (
                <div className="tsa-list-item" key={item.title}>
                  <div className="tsa-list-icon">
                    <Award size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="tsa-team-footer">
              <div>
                <h3>Peran tim</h3>
                <p>
                  Tim TSA mendukung penguatan keamanan, validasi OSS, dan pengurangan risiko
                  pada seluruh siklus hidup aplikasi.
                </p>
              </div>
              <div className="tsa-team-summary">
                <Briefcase size={18} />
                <span>Operasional 24/7 readiness</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default TSATeam;
