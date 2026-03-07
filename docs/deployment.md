# Maktabah — Deployment Reference

## Overview

Maktabah runs on a single VPS. The backend, database, and PDF files all live on
the same server. The frontend is built into static files and served by Nginx on
the same machine. No containers, no cloud functions, no managed services at launch.

This setup is simple, cheap, and sufficient for the scale of this project at launch.

---

## Infrastructure at a Glance

| Component | Service | Cost |
|---|---|---|
| VPS (backend + database + PDFs) | Hetzner Cloud CX22 | ~€4–6/month |
| Frontend hosting | Served by Nginx on the same VPS | Included |
| SSL certificate | Let's Encrypt via Certbot | Free |
| Domain name | Any registrar | ~€10–15/year |
| Email sending (password reset) | Brevo or Resend free tier | Free at launch |
| PDF storage | VPS filesystem at launch | Included in VPS |

**Total running cost at launch: approximately €5–7/month.**

---

## How Traffic Flows in Production

```
User's browser
      |
      | HTTPS — port 443
      ↓
   Nginx
   ├── Serves frontend static files (HTML, CSS, JS) directly
   ├── Proxies /api/ requests → Spring Boot on localhost:8080
   └── Handles SSL certificate (Spring Boot never sees HTTPS)
      |
      | HTTP — localhost:8080 (internal only, not exposed publicly)
      ↓
Spring Boot application
      |
      | localhost:5432 (internal only, not exposed publicly)
      ↓
PostgreSQL database
```

Only Nginx is exposed to the public internet on ports 80 and 443.
Spring Boot and PostgreSQL are internal only — never directly reachable from outside.

---

## Server — What Gets Installed on the VPS

Operating system: **Ubuntu 22.04 LTS**

Software installed via apt:

| Software | Purpose |
|---|---|
| Java 21 | Runs the Spring Boot JAR |
| PostgreSQL 15 or 16 | Application database |
| Nginx | Reverse proxy + static file server |
| Certbot | Manages Let's Encrypt SSL certificate |

No Docker. No Node.js on the server. Just these four things and the application files.

---

## Directory Layout on the Server

```
/opt/maktabah/
├── maktabah.jar          ← Spring Boot fat JAR (deployed here)
└── .env                  ← production environment variables (chmod 600)

/var/www/maktabah/        ← built frontend static files served by Nginx
├── index.html
├── assets/
└── ...

/var/maktabah/pdfs/       ← PDF book files
├── aqeedah/
├── fiqh/
├── hadith/
└── seerah/

/etc/systemd/system/
└── maktabah.service      ← systemd service that runs Spring Boot

/etc/nginx/sites-available/
└── maktabah              ← Nginx server configuration

/etc/letsencrypt/         ← SSL certificates managed by Certbot

logs/maktabah.log         ← application log (path set in application.properties)
```

---

## Systemd Service

Spring Boot runs as a background systemd service so it starts automatically
on server boot and restarts if it crashes.

File location: `/etc/systemd/system/maktabah.service`

```ini
[Unit]
Description=Maktabah Spring Boot Application
After=network.target

[Service]
User=maktabah
ExecStart=/usr/bin/java -jar /opt/maktabah/maktabah.jar
EnvironmentFile=/opt/maktabah/.env
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Key Points
- Runs as a dedicated `maktabah` system user — not as root
- `EnvironmentFile` loads all production secrets from `/opt/maktabah/.env`
- `Restart=always` means the service recovers automatically from crashes
- `RestartSec=10` waits 10 seconds before restarting to avoid rapid restart loops

### Service Commands

```bash
# Start the service
sudo systemctl start maktabah

# Stop the service
sudo systemctl stop maktabah

# Restart after deploying a new JAR
sudo systemctl restart maktabah

# Check current status and recent logs
sudo systemctl status maktabah

# Enable auto-start on server boot
sudo systemctl enable maktabah

# Follow live logs
sudo journalctl -u maktabah -f
```

---

## Nginx Configuration

File location: `/etc/nginx/sites-available/maktabah`

```nginx
# Redirect all HTTP traffic to HTTPS
server {
    listen 80;
    server_name maktabah.com www.maktabah.com;
    return 301 https://$host$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl;
    server_name maktabah.com www.maktabah.com;

    ssl_certificate /etc/letsencrypt/live/maktabah.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/maktabah.com/privkey.pem;

    # Serve frontend static files
    root /var/www/maktabah;
    index index.html;

    # All non-API routes serve index.html
    # This handles hash-based client-side routing correctly
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy all /api/ requests to Spring Boot
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Enable and Reload

```bash
# Create symlink to enable the site
sudo ln -s /etc/nginx/sites-available/maktabah /etc/nginx/sites-enabled/

# Test config for syntax errors before reloading
sudo nginx -t

# Reload Nginx (no downtime)
sudo nginx -s reload
```

---

## SSL Certificate — Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate (Nginx plugin handles verification automatically)
sudo certbot --nginx -d maktabah.com -d www.maktabah.com

# Certbot auto-renewal — test that it works
sudo certbot renew --dry-run
```

Certbot installs a cron job or systemd timer that automatically renews the
certificate before it expires. No manual renewal needed.

---

## Production Environment Variables

Stored in `/opt/maktabah/.env` on the server.
Referenced by the systemd service via `EnvironmentFile`.
Never committed to version control.

```bash
# Set file permissions — only maktabah user can read
chmod 600 /opt/maktabah/.env
chown maktabah:maktabah /opt/maktabah/.env
```

Contents of `/opt/maktabah/.env`:

```env
DB_URL=jdbc:postgresql://localhost:5432/maktabah_db
DB_USERNAME=maktabah_app
DB_PASSWORD=strong_random_password_here
JWT_SECRET=a_very_long_random_string_at_least_64_characters
PDF_STORAGE_PATH=/var/maktabah/pdfs
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=your@email.com
MAIL_PASSWORD=your_smtp_password
APP_BASE_URL=https://maktabah.com
FRONTEND_URL=https://maktabah.com
```

### Production vs Development Differences

| Variable | Development | Production |
|---|---|---|
| `DB_USERNAME` | `postgres` | `maktabah_app` (least-privilege user) |
| `PDF_STORAGE_PATH` | `C:\Users\adnan\...\pdfs` | `/var/maktabah/pdfs` |
| `STRIPE_SECRET_KEY` | `sk_test_...` | `sk_live_...` |
| `APP_BASE_URL` | `http://localhost:5173` | `https://maktabah.com` |
| `FRONTEND_URL` | not set | `https://maktabah.com` |

---

## Production application.properties Changes

The same `application.properties` file is used in both environments.
These values are read from env vars so they automatically use the correct
production values when the production `.env` is loaded.

One additional property is needed for production — CORS reads the allowed
frontend origin from an environment variable:

```properties
app.frontend.url=${FRONTEND_URL}
```

`SecurityConfig.java` reads `app.frontend.url` for allowed CORS origins.
In development, `localhost:5173` is hardcoded as a fallback. In production,
`FRONTEND_URL=https://maktabah.com` is set in `.env` and takes over.

---

## Deploying a New Version

Run these steps every time you release an update.

### Step 1 — Build the Backend

```bash
# From the backend/ folder on your local machine
mvn clean package -DskipTests
```

This produces: `backend/target/maktabah-0.0.1-SNAPSHOT.jar`

### Step 2 — Build the Frontend

```bash
# From the frontend/ folder on your local machine
npm run build
```

This produces: `frontend/dist/` — a folder of plain HTML, CSS, and JS files.

### Step 3 — Copy Files to the Server

```bash
# Copy the new JAR
scp backend/target/maktabah-0.0.1-SNAPSHOT.jar maktabah@your-server-ip:/opt/maktabah/maktabah.jar

# Copy the built frontend files
scp -r frontend/dist/* maktabah@your-server-ip:/var/www/maktabah/
```

### Step 4 — Restart the Backend Service

```bash
# SSH into the server
ssh maktabah@your-server-ip

# Restart Spring Boot
sudo systemctl restart maktabah

# Confirm it started cleanly
sudo systemctl status maktabah
```

### Step 5 — Verify

```bash
# Watch live logs for a few seconds to confirm no startup errors
sudo journalctl -u maktabah -f

# Test that the API responds
curl https://maktabah.com/api/fields

# Test that the frontend loads
# Open https://maktabah.com in a browser
```

Frontend changes (no backend change) skip Steps 1 and 4 — just build and copy dist/.
Backend changes (no frontend change) skip Steps 2 and 3 (dist copy) — just build JAR and restart.

---

## Database

### Production Setup

```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Create the application database
CREATE DATABASE maktabah_db;

# Create a least-privilege application user (Security phase step)
CREATE USER maktabah_app WITH ENCRYPTED PASSWORD 'strong_password_here';

# Grant only what the app needs
GRANT CONNECT ON DATABASE maktabah_db TO maktabah_app;
GRANT USAGE ON SCHEMA public TO maktabah_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO maktabah_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO maktabah_app;
```

### Schema Management
`spring.jpa.hibernate.ddl-auto=update` — Hibernate applies schema changes automatically
on startup. No separate migration tool is needed at this stage.

For production safety in the future, consider switching to `validate` and managing
migrations manually with Flyway or Liquibase — but this is not needed at launch.

### Backups
Set up a daily backup of the PostgreSQL database using `pg_dump`:

```bash
# Example backup command (add to cron)
pg_dump -U maktabah_app maktabah_db > /backups/maktabah_$(date +%Y%m%d).sql
```

Store backups off the VPS (e.g. download to local machine weekly).

---

## PDF Storage

### At Launch
PDFs are stored on the VPS at the path set in `PDF_STORAGE_PATH` (`/var/maktabah/pdfs`).
Subdirectories match the field structure: `aqeedah/`, `fiqh/`, `hadith/`, `seerah/`.

```bash
# Create the PDF directory structure on the server
sudo mkdir -p /var/maktabah/pdfs/{aqeedah,fiqh,hadith,seerah}
sudo chown -R maktabah:maktabah /var/maktabah/pdfs
```

Uploading PDFs to the server:
```bash
scp pdfs/aqeedah/usool-al-thalatha.pdf maktabah@your-server-ip:/var/maktabah/pdfs/aqeedah/
```

### Future Migration to Object Storage
When the PDF library grows large or VPS disk space becomes a concern,
migrate to object storage (DigitalOcean Spaces or AWS S3).

What changes: only the download logic in `BookController.java` / `BookService.java`.
What stays the same: database `pdf_filename` values, folder structure, all other code.
This migration is not needed at launch — plan for it when storage exceeds 10GB.

---

## Stripe — Live Mode Checklist

Before going live with real payments:

- [ ] Switch `STRIPE_SECRET_KEY` from `sk_test_...` to `sk_live_...`
- [ ] Switch `STRIPE_PRICE_ID` from test price ID to live price ID
- [ ] Update `STRIPE_WEBHOOK_SECRET` with the live webhook secret from Stripe dashboard
- [ ] Register the production webhook URL in the Stripe dashboard:
  `https://maktabah.com/api/payment/webhook`
- [ ] Set webhook to listen for: `checkout.session.completed`,
  `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
- [ ] Test with a real card for a small amount and verify webhook fires correctly
- [ ] Stop the local Stripe CLI listener — production uses the registered webhook URL

---

## Domain and DNS

Point your domain to the Hetzner VPS IP address:

| Record | Type | Value |
|---|---|---|
| `maktabah.com` | A | `your.vps.ip.address` |
| `www.maktabah.com` | A | `your.vps.ip.address` |

DNS propagation can take up to 48 hours, but usually resolves within an hour.
Run Certbot only after DNS has propagated — it verifies domain ownership during setup.

---

## First-Time Server Setup — Full Sequence

This is the complete sequence for setting up a brand new VPS from scratch.

```bash
# 1. Update the system
sudo apt update && sudo apt upgrade -y

# 2. Install Java 21
sudo apt install -y openjdk-21-jdk

# 3. Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# 4. Install Nginx
sudo apt install -y nginx

# 5. Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# 6. Create the application system user
sudo useradd -r -s /bin/false maktabah

# 7. Create application directories
sudo mkdir -p /opt/maktabah
sudo mkdir -p /var/www/maktabah
sudo mkdir -p /var/maktabah/pdfs/{aqeedah,fiqh,hadith,seerah}
sudo chown -R maktabah:maktabah /opt/maktabah /var/maktabah

# 8. Set up PostgreSQL database and user (see Database section above)

# 9. Upload maktabah.jar and .env to /opt/maktabah/
# 10. Set permissions on .env
chmod 600 /opt/maktabah/.env

# 11. Install and enable the systemd service
sudo cp maktabah.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable maktabah
sudo systemctl start maktabah

# 12. Configure Nginx (see Nginx Configuration section above)
sudo nginx -t && sudo nginx -s reload

# 13. Obtain SSL certificate
sudo certbot --nginx -d maktabah.com -d www.maktabah.com

# 14. Upload frontend dist/ to /var/www/maktabah/
# 15. Upload PDFs to /var/maktabah/pdfs/

# 16. Verify everything is running
sudo systemctl status maktabah
curl https://maktabah.com/api/fields
```

---

## Monitoring and Logs

### Application Logs
```bash
# Follow live application output
sudo journalctl -u maktabah -f

# View last 100 lines
sudo journalctl -u maktabah -n 100

# Application log file (configured in application.properties)
tail -f logs/maktabah.log
```

### Nginx Logs
```bash
# Access log
tail -f /var/log/nginx/access.log

# Error log
tail -f /var/log/nginx/error.log
```

### Check Services Are Running
```bash
sudo systemctl status maktabah
sudo systemctl status nginx
sudo systemctl status postgresql
```

---

## Quick Reference — Key Paths and Commands

| What | Where / Command |
|---|---|
| Spring Boot JAR | `/opt/maktabah/maktabah.jar` |
| Production env vars | `/opt/maktabah/.env` |
| Frontend static files | `/var/www/maktabah/` |
| PDF files | `/var/maktabah/pdfs/` |
| Systemd service file | `/etc/systemd/system/maktabah.service` |
| Nginx config | `/etc/nginx/sites-available/maktabah` |
| SSL certificates | `/etc/letsencrypt/live/maktabah.com/` |
| Restart backend | `sudo systemctl restart maktabah` |
| Check backend status | `sudo systemctl status maktabah` |
| Reload Nginx | `sudo nginx -s reload` |
| Live backend logs | `sudo journalctl -u maktabah -f` |
| Build backend | `mvn clean package -DskipTests` (from `backend/`) |
| Build frontend | `npm run build` (from `frontend/`) |