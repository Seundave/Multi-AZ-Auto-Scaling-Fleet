#!/bin/bash
# Exit immediately if any command fails
set -e

# Redirect stdout and stderr to /var/log/user-data.log for debugging
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo "=== Starting User Data Bootstrap ==="

# 1. Update system packages and install Git
dnf update -y
dnf install -y git

# 2. Install Node.js 22.x LTS via NodeSource repository
curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -
dnf install -y nodejs

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# 3. Create a dedicated non-root system user for security
echo "Creating dedicated application user..."
useradd -r -s /bin/false nodejs

# 4. Clone the repository into /opt/app and assign ownership
APP_DIR="/opt/multi-az-app"
REPO_URL="https://github.com/Seundave/Multi-AZ-Auto-Scaling-Fleet.git"

echo "Cloning repository from $REPO_URL..."
git clone "$REPO_URL" "$APP_DIR"

# Assign ownership of the app directory to the non-root user
chown -R nodejs:nodejs "$APP_DIR"

# Navigate into the sub-folder where package.json lives
cd "$APP_DIR/app"

# 5. Install dependencies reproducibly using the lockfile (run as nodejs user)
echo "Installing Node.js dependencies..."
su -s /bin/bash -c "npm ci --production" nodejs

# 6. Create a dedicated Systemd service file running as non-root user
SERVICE_NAME="multi-az-fleet-monitor"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"

echo "Creating systemd service file at $SERVICE_FILE..."
cat <<EOF > "$SERVICE_FILE"
[Unit]
Description=Multi-AZ Fleet Monitor Node.js Application
After=network.target

[Service]
Type=simple
User=nodejs
Group=nodejs
WorkingDirectory=$APP_DIR/app
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=$SERVICE_NAME
Environment=NODE_ENV=production
Environment=PORT=8080

[Install]
WantedBy=multi-user.target
EOF

# 7. Reload systemd, enable, and start the service
echo "Starting and enabling systemd service..."
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
systemctl start "$SERVICE_NAME"

# 8. Post-boot Health Check Verification Loop
echo "Verifying application health endpoint..."
MAX_ATTEMPTS=12
ATTEMPT=0
HEALTH_URL="http://localhost:8080/health"

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if curl -s --fail "$HEALTH_URL" > /dev/null; then
        echo "Success! Application responded successfully to $HEALTH_URL"
        echo "=== User Data Bootstrap Complete ==="
        exit 0
    fi
    ATTEMPT=$((ATTEMPT + 1))
    echo "Attempt $ATTEMPT/$MAX_ATTEMPTS: Waiting for app to listen on port 8080..."
    sleep 5
done

echo "Error: Application failed to respond at $HEALTH_URL after $((MAX_ATTEMPTS * 5)) seconds."
systemctl status "$SERVICE_NAME"
journalctl -u "$SERVICE_NAME" -n 50 --no-pager
exit 1