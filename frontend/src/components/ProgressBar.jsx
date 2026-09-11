import '../style/ProgressBar_Style.css';

export default function ProgressBar({
  value = 0,
  color = 'var(--red)',
  trackColor,
  height = 8,
  rounded = true,
}) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className="progress-track"
      style={{
        height,
        background: trackColor,
        borderRadius: rounded ? 6 : 2,
      }}
    >
      <div
        className="progress-fill"
        style={{
          width: `${clamped}%`,
          background: color,
          borderRadius: rounded ? 6 : 2,
        }}
      />
    </div>
  );
}
