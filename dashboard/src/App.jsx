import { useEffect, useState, useCallback } from "react";
import { getFleetStatus } from "./services/fleetApi";
import DashboardHeader from "./components/DashboardHeader";
import AvailabilityZones from "./components/AvailabilityZones";
import MetricCard from "./components/MetricCard";
import InstanceTable from "./components/InstanceTable";
import FleetHealthSummary from "./components/FleetHealthSummary";
import "./App.css";

function App() {
  const [fleet, setFleet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fleetHealthy =
    fleet !== null &&
    fleet.healthyTargets > 0 &&
    fleet.unhealthyTargets === 0 &&
    fleet.instances.every(
      (instance) =>
        instance.ec2State === "running" &&
        instance.lifecycleState === "InService",
    );

  const runningInstances = fleet
    ? fleet.instances.filter((instance) => instance.ec2State === "running")
        .length
    : 0;

  const inServiceInstances = fleet
    ? fleet.instances.filter(
        (instance) => instance.lifecycleState === "InService",
      ).length
    : 0;

  const healthyAvailabilityZones = fleet
    ? new Set(
        fleet.instances
          .filter(
            (instance) =>
              instance.ec2State === "running" &&
              instance.lifecycleState === "InService",
          )
          .map((instance) => instance.availabilityZone),
      ).size
    : 0;

  const fleetStatus = (() => {
    if (!fleet) return "Unavailable";

    if (runningInstances === 0 || fleet.healthyTargets === 0) {
      return "Unavailable";
    }

    const isOperational =
      runningInstances === fleet.desiredCapacity &&
      inServiceInstances === fleet.desiredCapacity &&
      fleet.healthyTargets === fleet.desiredCapacity &&
      fleet.unhealthyTargets === 0 &&
      healthyAvailabilityZones > 0;

    return isOperational ? "Operational" : "Degraded";
  })();

  const fetchFleet = useCallback(async () => {
    try {
      setError("");
      setRefreshing(true);

      const data = await getFleetStatus();

      setFleet(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFleet();

    const interval = setInterval(() => {
      fetchFleet();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchFleet]);

  if (loading) {
    return (
      <main className="loading-container">
        <div className="loading-card">
          <div className="loading-spinner"></div>

          <h2>Loading Fleet Information</h2>

          <p>Connecting to AWS and retrieving your fleet status...</p>
        </div>
      </main>
    );
  }

  if (error && !fleet) {
    return <p>Error: {error}</p>;
  }

  return (
    <main>
      <DashboardHeader
        refreshing={refreshing}
        lastUpdated={lastUpdated}
        fleetStatus={fleetStatus}
        onRefresh={fetchFleet}
      />

      <section className="metrics-grid">
        <MetricCard
          title="Desired Capacity"
          value={fleet.desiredCapacity}
          description={`Minimum: ${fleet.minSize} · Maximum: ${fleet.maxSize}`}
        />

        <MetricCard
          title="Healthy Targets"
          value={fleet.healthyTargets}
          description="Registered healthy targets"
          status="healthy"
        />

        <MetricCard
          title="Unhealthy Targets"
          value={fleet.unhealthyTargets}
          description="Targets requiring attention"
          status={fleet.unhealthyTargets > 0 ? "unhealthy" : "healthy"}
        />

        <MetricCard
          title="Running Instances"
          value={runningInstances}
          description={`Across ${
            new Set(
              fleet.instances.map((instance) => instance.availabilityZone),
            ).size
          } availability zones`}
        />
      </section>

      <FleetHealthSummary
        runningInstances={runningInstances}
        inServiceInstances={inServiceInstances}
        healthyTargets={fleet.healthyTargets}
        desiredCapacity={fleet.desiredCapacity}
        availabilityZones={healthyAvailabilityZones}
      />

      <AvailabilityZones instances={fleet.instances} />

      <InstanceTable instances={fleet.instances} />

      {/* EC2 instance table will go here */}
    </main>
  );
}

export default App;
