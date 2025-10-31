# 🚀 Deploying a MERN App on Hetzner Cloud (Full Tutorial)

This guide explains **step-by-step** how to deploy your MERN (MongoDB,
Express, React, Node.js) app on a **Hetzner Cloud VPS**, make it
accessible via the internet, and manage it safely and professionally.

------------------------------------------------------------------------

## 🧩 Part 1 --- Initial Connection & System Setup

### 🎯 Goal:

Connect to your new Hetzner VPS and make sure it's ready to host web
apps.

### 🪜 Steps:

**1️⃣ Connect via SSH**

``` bash
ssh root@49.12.76.128
```

→ Connects to your remote server as the root user.

**2️⃣ Check that PM2 processes exist**

``` bash
pm2 list
```

**3️⃣ Update your system**

``` bash
apt update && apt upgrade -y
```

-   `apt update`: refreshes the list of available packages.\
-   `apt upgrade -y`: upgrades all packages automatically.

**4️⃣ Install basic tools**

``` bash
apt install -y git curl ufw
```

-   `git`: for cloning repositories.\
-   `curl`: for testing APIs or downloading scripts.\
-   `ufw`: Ubuntu's firewall utility.

**5️⃣ Allow SSH and enable the firewall**

``` bash
ufw allow OpenSSH
ufw enable
```

-   Opens port 22 (SSH).\
-   Enables the firewall so only allowed ports can be accessed.

------------------------------------------------------------------------

## 🧩 Part 2 --- Install Node.js & PM2

### 🎯 Goal:

Install the runtime (Node.js) and a process manager (PM2) to keep your
app running 24/7.

**1️⃣ Install Node.js 20 (LTS)**

``` bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -


apt install -y nodejs
```
- -fsSL → σημαίνει "quiet mode, show errors, follow redirects".
- | bash - → "πάρε το script που κατέβασες και εκτέλεσέ το με bash".

**2️⃣ Verify installation**

``` bash
node -v
npm -v
```

**3️⃣ Install PM2 globally**

``` bash
npm install -g pm2
pm2 -v
```

-   PM2 ensures your Node apps stay alive and restart automatically on
    crashes.

------------------------------------------------------------------------

## 🧩 Part 3 --- Project Folder & Repository

### 🎯 Goal:

Organize multiple apps on the same VPS under `/var/www`.

**1️⃣ Create your workspace**

``` bash
mkdir -p /var/www
cd /var/www
```

**2️⃣ Example structure**

    /var/www/
     ├─ ragAttemptProjectMarx/
     │   └─ backend/
     ├─ sharedFeesProject/
     │   └─ backend/
     ├─ biasedTarot/
     │   └─ backend/
     └─ wordpressSite/
         └─ public_html/

Each app runs on a separate port (e.g. 3001, 3002, 3003) and can have
its own Nginx config.

**3️⃣ Clone your repository**

``` bash
git clone https://github.com/alkisax/ragAttemptProjectMarx.git
cd ragAttemptProjectMarx/backend
```

------------------------------------------------------------------------

## 🧩 Part 4 --- Build and Run Your Backend

### 🎯 Goal:

Install dependencies, build the backend, and run it with PM2.

``` bash
npm install
npm run build
```

If frontend not built yet, do:

``` bash
cd ../frontend
npm install
npm run build
cd ../backend
npm run build
pm2 start build/src/server.js --name marx-rag
curl http://localhost:3001/api/ping
```

✅ Expected output: `pong`

------------------------------------------------------------------------

## 🧩 Part 5 --- Environment Variables

### 🎯 Goal:

Create your `.env` file and reload PM2 with it.

**1️⃣ Create the file**

``` bash
nano .env
```

Add your content, then save with:

    Ctrl + O → Enter → Ctrl + X

**2️⃣ Restart the process**

``` bash
pm2 delete marx-rag
pm2 start build/src/server.js --name marx-rag
curl http://localhost:3001/api/ping
```

**3️⃣ Test full functionality**

``` bash
curl -s -X POST http://localhost:3001/api/rag/ask-extended-hybrid   -H "Content-Type: application/json"   -d '{"query": "division of labor"}' | head -c 500; echo
```

**4️⃣ View logs**

``` bash
pm2 logs marx-rag --lines 20
```

**5️⃣ Clear logs**

``` bash
pm2 flush
```

------------------------------------------------------------------------

## 🧩 Part 6 --- Access from the Internet

### 🎯 Goal:

Allow your app to be visible to the public internet.

**1️⃣ Open the backend port**

``` bash
ufw allow 3001
```

✅ Now anyone can access `http://49.12.76.128:3001/api/ping`.

**2️⃣ When you want to close it:**

``` bash
ufw deny 3001
```

------------------------------------------------------------------------

## 🧩 Part 7 --- Install and Configure Nginx

### 🎯 Goal:

Use Nginx to serve your app at `http://49.12.76.128` (no `:3001`).

**1️⃣ Install Nginx**

``` bash
apt install -y nginx
systemctl status nginx
```

**2️⃣ Allow Nginx in firewall**

``` bash
ufw allow 'Nginx Full'
```

**3️⃣ Create new configuration**

``` bash
nano /etc/nginx/sites-available/marx-rag
```

Paste this:

``` nginx
server {
  listen 80;
  server_name 49.12.76.128;

  location / {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

Save & exit (Ctrl + O → Enter → Ctrl + X)

**4️⃣ Enable it**

``` bash
ln -s /etc/nginx/sites-available/marx-rag /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

✅ Test in browser → <http://49.12.76.128>

------------------------------------------------------------------------

## 🧩 Part 8 --- Frontend Fix (Vite Environment)

### 🎯 Goal:

Point your frontend build to the public backend URL.

**1️⃣ Edit frontend .env**

``` bash
cd /var/www/ragAttemptProjectMarx/frontend
nano .env
```

Set:

    VITE_BACKEND_URL=http://49.12.76.128

**2️⃣ Rebuild frontend & backend**

``` bash
npm run build
cd ../backend
npm run build
pm2 restart marx-rag
```

✅ Now frontend requests go to the live server instead of `localhost`.

------------------------------------------------------------------------

## 🧩 Part 9 --- Useful PM2 Commands

  Command                  Description
  ------------------------ -----------------------------------------
  `pm2 list`               Shows all running processes
  `pm2 stop marx-rag`      Stops the app
  `pm2 restart marx-rag`   Restarts the app
  `pm2 logs marx-rag`      Shows logs
  `pm2 flush`              Clears all logs
  `pm2 startup`            Generates a startup script for auto-run
  `pm2 save`               Saves current state for next reboot

------------------------------------------------------------------------

## 🧩 Part 10 --- Extra Tips

-   If you reboot the VPS, run once:

    ``` bash
    pm2 startup
    pm2 save
    ```

    This ensures your apps start automatically on boot.

-   To add a new app, just make a new folder in `/var/www` and repeat
    the process with a new port.

------------------------------------------------------------------------

🎉 **Done!**\
You now have a fully working, production-ready MERN deployment on
Hetzner Cloud.

## adding more apps
### adding second app
```bash
cd /var/www
git clone https://github.com/alkisax/ragKuhnChatWithDocument.git kuhn
cd kuhn/frontend
npm install
nano .env
```
```
VITE_BACKEND_URL=http://49.12.76.128/kuhn
```
```bash
npm run build
cd ../backend
nano .env
```
```
BACK_END_PORT=3002
MONGODB_URI=your_mongodb_uri_here
OPENAI_API_KEY=your_openai_key_here
BACKEND_URL=http://49.12.76.128:3002
FRONTEND_URL=http://49.12.76.128/kuhn
```
```bash
npm run build
pm2 restart kuhn-rag --update-env

pm2 start build/src/server.js --name kuhn-rag
curl http://localhost:3001/api/ping
npm install
npm run build
pm2 restart kuhn-rag
```

```
systemctl status nginx
// σβηνωτ ο παλιο και το φτιάχνω απο την αρχη
rm /etc/nginx/sites-available/marx-rag
rm /etc/nginx/sites-enabled/marx-rag
nano /etc/nginx/sites-available/rag-multi
```
```nginx
server {
  listen 80;
  server_name 49.12.76.128;

  # 📚 Kuhn app → main site (/)
  location / {
    proxy_pass http://localhost:3002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  # 🧠 Marx app → served under /capital
  location /capital/ {
    rewrite ^/capital(/.*)$ $1 break;
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```
```bash
ln -s /etc/nginx/sites-available/rag-multi /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
curl http://49.12.76.128/api/ping; echo
curl http://49.12.76.128/capital/api/ping; echo

```

### adding a third app
```bash
cd /var/www
git clone https://github.com/alkisax/ragAttemptProject mao
cd mao/frontend
npm install
nano .env
```
```bash
VITE_BACKEND_URL=http://49.12.76.128/mao
```
```bash
nano vite.config.ts
```
```bash
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// https://vite.dev/config/
export default defineConfig({
  base: '/mao/',
  plugins: [react()],
})
```
```bash
npm run build
cd ../backend
nano .env
```
```bash
BACK_END_PORT=3003
MONGODB_URI=your_mongodb_uri_here
OPENAI_API_KEY=your_openai_key_here
BACKEND_URL=http://49.12.76.128:3003
FRONTEND_URL=http://49.12.76.128/mao
```
```bash
npm install typescript --save-dev
npm run build
pm2 start build/src/server.js --name mao-rag
curl http://localhost:3003/api/ping; echo
systemctl status nginx
nano /etc/nginx/sites-available/rag-multi
```
```nginx
server {
  listen 80;
  server_name 49.12.76.128;

  # Kuhn app → main site (/)
  location / {
    proxy_pass http://localhost:3002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  # Marx app → served under /capital
  location /capital/ {
    rewrite ^/capital(/.*)$ $1 break;
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  # Mao app → served under /mao
  location /mao/ {
    rewrite ^/mao(/.*)$ $1 break;
    proxy_pass http://localhost:3003;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```
```bash
ln -s /etc/nginx/sites-available/rag-multi /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

curl http://49.12.76.128/api/ping; echo
curl http://49.12.76.128/capital/api/ping; echo
curl http://49.12.76.128/mao/api/ping; echo
```
### deploy changes
```bash
ssh root@49.12.76.128
cd /var/www
cd ragAttemptProjectMarx/
git pull origin main
cd frontend
nano .env
npm install
npm run build
cd ../backend
nano .env
npm install
npm run build
pm2 list
pm2 restart marx-rag --update-env
nginx -t
systemctl reload nginx
curl http://localhost:3002/api/ping
```

οι ίδιες εντολές χωρίς nano για .env για να τις κάνω copy paste
```bash
ssh root@49.12.76.128
cd /var/www
cd ragAttemptProjectMarx/
git pull origin main
cd frontend
npm install
npm run build
cd ../backend
npm install
npm run build
pm2 list
pm2 restart marx-rag --update-env
nginx -t
systemctl reload nginx
curl http://localhost:3002/api/ping
```
```bash
cd /var/www && cd ragAttemptProjectMarx && git pull origin main && cd frontend && npm install && npm run build && cd ../backend && npm install && npm run build && pm2 list && pm2 restart marx-rag --update-env && nginx -t && systemctl reload nginx && curl http://localhost:3002/api/ping; echo
```
# domain
// αγοράστικε το portfolio-projects.space απο namecheap 1.98$ 31/10/2025
Στον πίνακα Namecheap → Domain List → portfolio-projects.space → Advanced DNS
| Type | Host  | Value (IP address) | TTL       |
| ---- | ----- | ------------------ | --------- |
| A    | `@`   | `49.12.76.128`     | Automatic |
| A    | `www` | `49.12.76.128`     | Automatic |

εκανα `ping portfolio-projects.space` και έλαβα
```
Pinging portfolio-projects.space [49.12.76.128] with 32 bytes of data:
Reply from 49.12.76.128: bytes=32 time=78ms TTL=43
Reply from 49.12.76.128: bytes=32 time=1070ms TTL=43
Reply from 49.12.76.128: bytes=32 time=78ms TTL=43
Reply from 49.12.76.128: bytes=32 time=99ms TTL=43

Ping statistics for 49.12.76.128:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 78ms, Maximum = 1070ms, Average = 331ms
```

συνδέομαι στον server
ssh root@49.12.76.128

Εγκατέστησε Certbot (αν δεν υπάρχει):
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

αυτό Θα κάνει αυτόματα: Έλεγχο DNS, Δημιουργία SSL certificate, Προσθήκη HTTPS config στο Nginx.
sudo certbot --nginx -d portfolio-projects.space -d www.portfolio-projects.space

έλεγχος
sudo systemctl reload nginx
και επισκεψη στο https://portfolio-projects.space

Τώρα πρέπει να ενημερώσουμε το nginx config ώστε το domain σου να δείχνει προς τα projects που ήδη τρέχουν (kuhn, marx, mao).
sudo nano /etc/nginx/sites-available/portfolio-projects.space

```nginx
# Redirect HTTP → HTTPS
server {
  listen 80;
  server_name portfolio-projects.space www.portfolio-projects.space;
  return 301 https://$host$request_uri;
}

# HTTPS version
server {
  listen 443 ssl;
  server_name portfolio-projects.space www.portfolio-projects.space;

  ssl_certificate /etc/letsencrypt/live/portfolio-projects.space/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/portfolio-projects.space/privkey.pem;

  # KUHN app → main site (/)
  location / {
    proxy_pass http://localhost:3002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  # MARX app → served under /capital
  location /capital/ {
    rewrite ^/capital(/.*)$ $1 break;
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  # MAO app → served under /mao
  location /mao/ {
    rewrite ^/mao(/.*)$ $1 break;
    proxy_pass http://localhost:3003;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

Ενεργοποίηση
sudo ln -s /etc/nginx/sites-available/portfolio-projects.space /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

αλλάζω τα .env 
απο 
VITE_BACKEND_URL=http://49.12.76.128/capital
σε
VITE_BACKEND_URL=https://portfolio-projects.space/capital
και απο 
FRONTEND_URL=http://49.12.76.128/capital/
σε
FRONTEND_URL=http://portfolio-projects.space/capital/