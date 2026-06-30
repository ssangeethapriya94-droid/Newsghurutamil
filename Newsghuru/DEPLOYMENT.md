# Newsghuru Production Deployment Guide (Hostinger VPS)

This guide provides step-by-step instructions for deploying both the English and Tamil portals, along with the admin dashboard and Express backend, on a Hostinger VPS using **Node.js, PM2, Nginx, and Certbot SSL**.

---

## Architecture Overview

In production, running dev servers (like `npm start` or `react-scripts start`) is resource-intensive and unstable. Instead, we use the following standard architecture:

*   **Express Backend**: Runs as a background service managed by **PM2** on port `5000`.
*   **Frontends & Admin (React)**: Compiled into optimized, static HTML/JS/CSS bundles (`npm run build`).
*   **Nginx Web Server**: Acts as the reverse proxy for backend API calls and directly serves the static frontend assets.

We will configure domains/subdomains like this (replace with your actual domains):
*   `newsghuru.in` — Tamil Frontend
*   `en.newsghuru.in` (or similar) — English Frontend
*   `admin.newsghuru.in` — Admin Dashboard
*   `api.newsghuru.in` — Backend Express API

---

## Step 1: VPS Prerequisites & Installation

Log into your Hostinger VPS via SSH and install the required dependencies:

### 1. Update the System
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Node.js (v18+) & NPM
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```
Verify installation:
```bash
node -v
npm -v
```

### 3. Install PM2 (Process Manager) globally
```bash
sudo npm install pm2 -g
```

### 4. Install Nginx (Web Server)
```bash
sudo apt install nginx -y
```

---

## Step 2: Code Deployment & Configuration

### 1. Clone your repository
Clone your code to your preferred directory, e.g., `/var/www/newsghuru`:
```bash
sudo mkdir -p /var/www/newsghuru
sudo chown -R $USER:$USER /var/www/newsghuru
git clone <your-repo-url> /var/www/newsghuru
cd /var/www/newsghuru
```

### 2. Install dependencies for all packages
Use the monorepo helper script:
```bash
npm run install:all
```

### 3. Set Up Environment Variables (.env)
Using the [.env.example](file:///d:/atriowings/Newsghuru/Newsghuru/.env.example) template, create a `.env` file in each directory:

*   **Backend**: `nano backend/.env`
    *   Set `MONGO_URI` to your production MongoDB string.
    *   Set `FRONTEND_URL` and `FRONTEND_URL_TA` to your production frontend domain URLs.
    *   Set `JWT_SECRET`, Razorpay, YouTube, and SMTP credentials.
*   **Admin Dashboard**: `nano admin/.env`
    *   Set `REACT_APP_API_URL=https://api.newsghuru.in`
*   **English Frontend**: `nano users-english/.env`
    *   Set `REACT_APP_API_URL=https://api.newsghuru.in`
    *   Set `REACT_APP_TAMIL_URL=https://newsghuru.in` (Tamil portal link)
*   **Tamil Frontend**: `nano users-tamil/.env`
    *   Set `REACT_APP_API_URL=https://api.newsghuru.in`
    *   Set `REACT_APP_ENGLISH_URL=https://en.newsghuru.in` (English portal link)

---

## Step 3: Build the Frontends for Production

Run the production build compiler script from the root directory:
```bash
npm run build:all
```
This command generates an optimized, static `/build` folder inside `/admin`, `/users-english`, and `/users-tamil`.

---

## Step 4: Run the Backend using PM2

Start the backend server as a background process that auto-restarts on crash or system reboot:

```bash
cd /var/www/newsghuru/backend
pm2 start server.js --name "newsghuru-api"
```

To ensure PM2 starts automatically on VPS reboots:
```bash
pm2 startup
```
Copy and run the command printed by the terminal, then save the process list:
```bash
pm2 save
```

Useful PM2 Commands:
*   `pm2 status` - View running services
*   `pm2 logs newsghuru-api` - View real-time logs
*   `pm2 restart newsghuru-api` - Restart backend

---

## Step 5: Configure Nginx to Serve the Portals

We will set up Nginx configuration blocks for the domains.

Create a new configuration file:
```bash
sudo nano /etc/nginx/sites-available/newsghuru
```

Paste the following configuration (replace `newsghuru.in` and subdomains with your actual domains):

```nginx
# 1. TAMIL FRONTEND (Main Domain)
server {
    listen 80;
    server_name newsghuru.in www.newsghuru.in;

    root /var/www/newsghuru/users-tamil/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable caching for static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|otf|json)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}

# 2. ENGLISH FRONTEND (Subdomain)
server {
    listen 80;
    server_name en.newsghuru.in;

    root /var/www/newsghuru/users-english/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|otf|json)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}

# 3. ADMIN DASHBOARD (Subdomain)
server {
    listen 80;
    server_name admin.newsghuru.in;

    root /var/www/newsghuru/admin/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|otf|json)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}

# 4. BACKEND API PROXY (Subdomain)
server {
    listen 80;
    server_name api.newsghuru.in;

    # Proxy to Node/Express running locally on port 5000
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Real IP forwarding
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Serve uploads directly via Nginx for optimal speed
    location /uploads/ {
        alias /var/www/newsghuru/backend/uploads/;
        expires 30d;
    }

    # Serve backend static images directly via Nginx
    location /images/ {
        alias /var/www/newsghuru/backend/images/;
        expires 30d;
    }
}
```

### Enable the Nginx configuration:
```bash
sudo ln -s /etc/nginx/sites-available/newsghuru /etc/nginx/sites-enabled/
```
Unlink the default configuration to prevent overlaps:
```bash
sudo unlink /etc/nginx/sites-enabled/default
```
Test the configuration:
```bash
sudo nginx -t
```
Restart Nginx:
```bash
sudo systemctl restart nginx
```

---

## Step 6: Secure with SSL (HTTPS) via Certbot

Install Certbot to automatically configure Let's Encrypt SSL certificates for all domains:

```bash
sudo apt install certbot python3-certbot-nginx -y
```

Obtain and apply SSL certificates (Certbot will edit Nginx automatically to redirect HTTP to HTTPS):
```bash
sudo certbot --nginx -d newsghuru.in -d www.newsghuru.in -d en.newsghuru.in -d admin.newsghuru.in -d api.newsghuru.in
```

Follow the prompts. Choose **Redirect** when asked to redirect all HTTP traffic to HTTPS.

Certbot automatically configures an auto-renew cron job. You can test it with:
```bash
sudo certbot renew --dry-run
```

---

## Troubleshooting & Verification

1.  **Check API Health**: Visit `https://api.yourdomain.com/` in your browser. You should see `{"success":true,"message":"News Ghuru API Running 🚀"}`.
2.  **Verify DB Seeding**: The server automatically seeds the default admin account, categories, subscription plans, and mock transactions when the DB is first connected and empty.
3.  **Client-Side Check**: Check your browser's Developer Console (`F12`) to confirm there are no `Mixed Content` (HTTP vs HTTPS) or CORS warnings blocking requests.
