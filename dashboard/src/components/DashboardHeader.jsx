
function DashboardHeader({
  refreshing,
  lastUpdated,
  fleetStatus,
  onRefresh,
}) {
  const statusClass = fleetStatus.toLowerCase();

  return (
    <header className="dashboard-header">
      <div className="header-content">
        <div>
          <h1>Multi-AZ Fleet Monitor</h1>
          <p>AWS infrastructure monitoring dashboard</p>
        </div>

        <div className="header-actions">
          <span className="region-badge">eu-north-1</span>

          <span className={`status-badge ${statusClass}`}>
            {fleetStatus}
          </span>

          <button onClick={onRefresh} disabled={refreshing}>
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="header-footer">
        <span>
          Last updated:{" "}
          {lastUpdated
            ? lastUpdated.toLocaleTimeString()
            : "Not available"}
        </span>

        <span>Auto-refresh: 30 seconds</span>
      </div>
    </header>
  );
}

export default DashboardHeader;
