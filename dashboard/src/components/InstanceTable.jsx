
function InstanceTable({ instances }) {
  return (
    <section className="instances-section">
      <div className="section-header">
        <h2>EC2 Instances</h2>
        <span>{instances.length} total instances</span>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Instance ID</th>
              <th>Private IP</th>
              <th>Instance Type</th>
              <th>Availability Zone</th>
              <th>EC2 State</th>
              <th>Lifecycle State</th>
            </tr>
          </thead>

          <tbody>
            {instances.map((instance) => (
              <tr key={instance.instanceId}>
                <td>{instance.instanceId}</td>
                <td>{instance.privateIp}</td>
                <td>{instance.instanceType}</td>
                <td>{instance.availabilityZone}</td>

                <td>
                  <span
                    className={`status-badge ${
                      instance.ec2State === "running"
                        ? "healthy"
                        : "unhealthy"
                    }`}
                  >
                    {instance.ec2State}
                  </span>
                </td>

                <td>
                  <span
                    className={`status-badge ${
                      instance.lifecycleState === "InService"
                        ? "healthy"
                        : "unhealthy"
                    }`}
                  >
                    {instance.lifecycleState}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default InstanceTable;
