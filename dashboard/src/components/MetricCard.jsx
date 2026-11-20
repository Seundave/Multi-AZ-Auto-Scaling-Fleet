
function MetricCard({ title, value, description, status }) {
  return (
    <article className="metric-card">
      <div className="metric-card-header">
        <h3>{title}</h3>

        {status && (
          <span className={`metric-status ${status}`}>
            {status}
          </span>
        )}
      </div>

      <p className="metric-value">{value}</p>

      <p className="metric-description">{description}</p>
    </article>
  );
}

export default MetricCard;
