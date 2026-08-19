export default function ConcentricProgress({ averageScore = 0 }) {
  // Ensure score is a valid number between 0 and 100
  const score = Math.min(Math.max(Number(averageScore) || 0, 0), 100);
  const degrees = score * 3.6;

  return (
    <div className="track-circle">
      <div
        className="progress-circle"
        style={{
          background: `conic-gradient(var(--primary) ${degrees}deg, var(--border) 0deg)`,
        }}
      >
        <div className="centeral-circle">
          Overall Score {Math.round(score)}%
        </div>
      </div>
    </div>
  );
}
