const express = require("express");
const http = require("http");
const app = express();
const port = process.env.PORT || 3000;

// Helper function to fetch metadata using IMDSv2 (Session Token approach)
async function getIMDSv2Metadata(path) {
  return new Promise((resolve) => {
    // Step 1: Get IMDSv2 Token
    const tokenReq = http.request(
      {
        hostname: "169.254.169.254",
        path: "/latest/api/token",
        method: "PUT",
        headers: {
          "X-aws-ec2-metadata-token-ttl-seconds": "30",
        },
        timeout: 1000,
      },
      (res) => {
        let token = "";
        res.on("data", (chunk) => (token += chunk));
        res.on("end", () => {
          if (res.statusCode !== 200) {
            resolve("Not Available (Local/Non-AWS)");
            return;
          }
          // Step 2: Fetch the requested metadata using the token
          const dataReq = http.request(
            {
              hostname: "169.254.169.254",
              path: `/latest/meta-data/${path}`,
              method: "GET",
              headers: {
                "X-aws-ec2-metadata-token": token,
              },
              timeout: 1000,
            },
            (dataRes) => {
              let data = "";
              dataRes.on("data", (chunk) => (data += chunk));
              dataRes.on("end", () => resolve(data || "Unknown"));
            },
          );
          dataReq.on("error", () => resolve("Unknown"));
          dataReq.end();
        });
      },
    );
    tokenReq.on("error", () => resolve("Not Available (Local/Non-AWS)"));
    tokenReq.end();
  });
}

// Health Check Endpoint for ALB
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "Healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    message: "Application is running and healthy.",
  });
});

// Root Endpoint exposing Instance Identity via IMDSv2
app.get("/", async (req, res) => {
  const instanceId = await getIMDSv2Metadata("instance-id");
  const availabilityZone = await getIMDSv2Metadata(
    "placement/availability-zone",
  );

  res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>AWS Multi-AZ App</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 50px; background: #f4f6f9; color: #333; }
                .card { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); max-width: 600px; }
                h1 { color: #232f3e; }
                .badge { background: #ff9900; color: white; padding: 5px 10px; border-radius: 4px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>Multi-AZ AWS Infrastructure</h1>
                <p>Successfully running behind your <strong>Application Load Balancer</strong>.</p>
                <hr>
                <p><strong>Instance ID:</strong> <span class="badge">${instanceId}</span></p>
                <p><strong>Availability Zone:</strong> <span class="badge">${availabilityZone}</span></p>
                <p><strong>Runtime:</strong> Node.js ${process.version}</p>
            </div>
        </body>
        </html>
    `);
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is listening on port ${port}`);
});
