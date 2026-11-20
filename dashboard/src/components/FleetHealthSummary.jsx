function FleetHealthSummary({
  runningInstances,
  inServiceInstances,
  healthyTargets,
  desiredCapacity,
  availabilityZones,
}) {
  const healthChecks = [
    {
      label: "Running Instances",
      current: runningInstances,
      expected: desiredCapacity,
    },
    {
      label: "In-Service Instances",
      current: inServiceInstances,
      expected: desiredCapacity,
    },
    {
      label: "Healthy Targets",
      current: healthyTargets,
      expected: desiredCapacity,
    },
    {
      label: "Healthy Availability Zones",
      current: availabilityZones,
      expected: "Dynamic",
    },
  ];

  return (
    <section className="health-summary">
      <div className="section-header">
        <h2>Fleet Health Summary</h2>
        <span>Infrastructure health checks</span>
      </div>

      <div className="health-checks-grid">
        {healthChecks.map((check) => {
          const isHealthy =
            check.expected === "Dynamic"
              ? check.current > 0
              : check.current === check.expected;

          return (
            <article className="health-check-card" key={check.label}>
              <div className="health-check-header">
                <h3>{check.label}</h3>

                <span
                  className={`health-indicator ${
                    isHealthy ? "healthy" : "unhealthy"
                  }`}
                >
                  {isHealthy ? "Healthy" : "Attention"}
                </span>
              </div>

              <p className="health-check-value">
                {check.current}
                <span> / {check.expected}</span>
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default FleetHealthSummary;
