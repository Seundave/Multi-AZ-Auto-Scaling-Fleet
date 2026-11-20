
function AvailabilityZones({ instances }) {
  const zones = instances.reduce((acc, instance) => {
    const zone = instance.availabilityZone;

    if (!acc[zone]) {
      acc[zone] = {
        total: 0,
        running: 0,
      };
    }

    acc[zone].total += 1;

    if (instance.ec2State === "running") {
      acc[zone].running += 1;
    }

    return acc;
  }, {});

  const zoneEntries = Object.entries(zones);

  return (
    <section className="availability-section">
      <h2>Availability Zone Distribution</h2>

      <div className="availability-grid">
        {zoneEntries.map(([zone, data]) => (
          <article className="zone-card" key={zone}>
            <div className="zone-header">
              <h3>{zone}</h3>
              <span>{data.running} running</span>
            </div>

            <div className="zone-progress">
              <div
                className="zone-progress-fill"
                style={{
                  width: `${
                    data.total > 0
                      ? (data.running / data.total) * 100
                      : 0
                  }%`,
                }}
              />
            </div>

            <p>
              {data.running} of {data.total} instances running
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default AvailabilityZones;
