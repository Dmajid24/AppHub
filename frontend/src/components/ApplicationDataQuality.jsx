import { useEffect, useId, useState } from 'react';
import { fetchApplicationDataQuality } from '../services/applications';
import '../style/ApplicationDataQuality.css';
import { ListChecks, ChevronDown } from 'lucide-react';

export default function ApplicationDataQuality({ applicationId }) {
  const titleId = useId();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');
    setResult(null);

    async function load() {
      try {
        const data = await fetchApplicationDataQuality(applicationId);

        if (!cancelled) setResult(data);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Gagal memuat kelengkapan informasi.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [applicationId, reloadKey]);

  // Hindari menampilkan hasil aplikasi sebelumnya saat ID berubah.
  const data =
    result?.applicationId === applicationId ? result : null;

  const percentage = data
    ? Math.max(0, Math.min(100, data.completenessPercentage))
    : 0;

  const complete = data?.status === 'Complete';

  // Informasi kosong ditampilkan lebih dahulu.
  const checks = [...(data?.checks ?? [])].sort(
    (a, b) => Number(a.isComplete) - Number(b.isComplete)
  );

  return (
    <section
      className="adq-card"
      data-complete={data ? String(complete) : undefined}
      aria-labelledby={titleId}
    >
      {loading ? (
        <>
          <h2 id={titleId}>Kelengkapan informasi</h2>
          <p className="adq-muted" role="status">
            Memeriksa informasi aplikasi…
          </p>
        </>
      ) : error ? (
        <>
          <h2 id={titleId}>Kelengkapan informasi</h2>
          <div role="alert">
            <p className="adq-muted">{error}</p>
            <button
              type="button"
              className="adq-retry"
              onClick={() => setReloadKey((value) => value + 1)}
            >
              Coba lagi
            </button>
          </div>
        </>
      ) : data ? (
        <>
          <div className="adq-overview">
            <div className="adq-copy">
              <span className="adq-eyebrow">INFORMASI APLIKASI</span>
              <h2 id={titleId}>Kelengkapan informasi</h2>
              <p>
                <strong>{data.completedFields} dari {data.totalFields}</strong>
                {' '}informasi yang diperiksa sudah terisi.
              </p>
              <span className="adq-status">
                <span aria-hidden="true">{complete ? '✓' : '!'}</span>
                {data.statusLabel}
              </span>
            </div>

            <div
              className="adq-score"
              style={{ '--adq-value': `${percentage}%` }}
              role="meter"
              aria-label="Persentase keterisian informasi"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percentage}
              aria-valuetext={`${data.completedFields} dari ${data.totalFields} informasi terisi`}
            >
              <span aria-hidden="true">
                <strong>
                  {percentage.toLocaleString('id-ID')}<small>%</small>
                </strong>
                <span>terisi</span>
              </span>
            </div>
          </div>

          {!complete && data.missingFields.length > 0 && (
            <div className="adq-missing">
              <strong>Perlu dilengkapi</strong>
              <ul>
                {data.missingFields.map((field) => (
                  <li key={field.key}>{field.label}</li>
                ))}
              </ul>
            </div>
          )}

          <details className="adq-details">
            <summary>
                <span className="adq-trigger-icon" aria-hidden="true">
                    <ListChecks size={21} strokeWidth={1.8} />
                </span>

                <span className="adq-trigger-copy">
                    <strong className="adq-label-closed">
                    Lihat rincian pemeriksaan
                    </strong>
                    <strong className="adq-label-open">
                    Tutup rincian pemeriksaan
                    </strong>
                    <span>
                    {data.completedFields} dari {data.totalFields} informasi sudah terisi
                    </span>
                </span>

                <span className="adq-trigger-arrow" aria-hidden="true">
                    <ChevronDown size={18} strokeWidth={2} />
                </span>
                </summary>

            <ul className="adq-checks">
              {checks.map((check) => (
                <li
                  key={check.key}
                  data-complete={String(check.isComplete)}
                >
                  <span className="adq-check-icon" aria-hidden="true">
                    {check.isComplete ? '✓' : '!'}
                  </span>
                  <span className="adq-check-label">{check.label}</span>
                  <span className="adq-check-state">
                    {check.isComplete ? 'Terisi' : 'Belum terisi'}
                  </span>
                </li>
              ))}
            </ul>
          </details>

          <p className="adq-note">
            Aturan demo · Memeriksa keterisian 10 informasi dengan bobot sama.
            Nilai 100% belum memastikan kebenaran atau kemutakhiran data.
          </p>
        </>
      ) : (
        <>
          <h2 id={titleId}>Kelengkapan informasi</h2>
          <p className="adq-muted">Data kelengkapan belum tersedia.</p>
        </>
      )}
    </section>
  );
}