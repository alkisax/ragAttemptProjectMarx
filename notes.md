download mongodb community edition
https://www.mongodb.com/products/self-managed/community-edition
run service as network service user
data directory - C:\Program Files\MongoDB\Server\8.2\data\
αντιγράφω το - C:\Program Files\MongoDB\Server\8.2\bin
στο start → enviroment variables (επεξεργασια μεταβλιτων περιβάλλοντος συστήματος) → κουμπί μετβλητές περιβάλλοντος (tab για προχωρημένους) → μεταβλητές συστήματος → path (ΔΙΠΛΟ ΚΛΙΚ) → δημιουργία και Paste το C:\Program Files\MongoDB\Server\8.2\bin

κατεβάζω mongodb shell https://www.mongodb.com/try/download/shell (MSI)

for all users

ελεγχω με mongod --version


# hetzner try
Hetznerfirstserver
49.12.76.128/32

- αρχική συνδεση
`ssh root@49.12.76.128`
`pm2 list`

- Step — Update and upgrade your system
`apt update && apt upgrade -y`
- Step 2 — Install basic tools
`apt install -y git curl ufw`
- If you want basic safety without learning firewall rules, you can just run this once and forget about it
`ufw allow OpenSSH`
`ufw enable`

- Step – Install Node 20 (the stable LTS)
`curl -fsSL https://deb.nodesource.com/setup_20.x | bash -`
`apt install -y nodejs`
- Check Node and npm versions
`node -v`
`npm -v`
- Step — Install PM2 (to keep your app running 24/7)
`npm install -g pm2`
`pm2 -v`
- Step — Create your working directory
`mkdir -p /var/www`
`cd /var/www`

- - So, adding more projects later is very easy — you’ll just make new sub-folders inside /var/www.
/var/www/
 ├─ ragAttemptProjectMarx/
 │   └─ backend/
 ├─ sharedFeesProject/
 │   └─ backend/
 ├─ biasedTarot/
 │   └─ backend/
 └─ wordpressSite/
     └─ public_html/

Each project can:
run on its own port (e.g. 3001, 3002, 3003, …)
have its own Nginx config (so each gets its own domain or subdomain)
be managed by PM2 under a different name (pm2 start build/src/server.js --name project-name)

- STEP — Clone your GitHub repo
`git clone https://github.com/alkisax/ragAttemptProjectMarx.git`
`cd ragAttemptProjectMarx/backend`

- STEP — Install dependencies and build
`npm install`
`npm run build`
- - your frontend hasn’t been built yet — the folder ../frontend/dist doesn’t exist until you run npm run build in the frontend.
```
cd ..
cd frontend
npm install
npm run build
cd ../backend
npm run build
pm2 start build/src/server.js --name marx-rag
curl http://localhost:3001/api/ping
```
- create env
`nano .env`
βαζω το περιεχόμενο και 
`Ctrl + O, Enter, Ctrl + X`

- Step — Tell PM2 to load the .env file
- Delete the old process and start it again with the .env file loaded manually
`pm2 delete marx-rag`
- restart
`pm2 start build/src/server.js --name marx-rag`
- test
`curl http://localhost:3001/api/ping`

- test (μονο πρωτοι 500 χαρακτήρες)
```
curl -s -X POST http://localhost:3001/api/rag/ask-extended-hybrid \
  -H "Content-Type: application/json" \
  -d '{"query": "division of labor"}' | head -c 500; echo
```

- **πως βλέπω τα backend logs**
```
pm2 logs marx-rag --lines 20
```
- clean your logs
`pm2 flush`

- How to stop or restart (after code or .env changes) manually
```
pm2 stop marx-rag
pm2 restart marx-rag
```

## προσβαση απο το ιντερνετ
- ανοίγω πορτ
(μένει ανοιχτό μέχρι να το κλείσω `ufw deny 3001`)
```
ufw allow 3001
```

- τωρα για να συνδεθώ επισκέφτομαι την http://49.12.76.128:3001/api/ping με τον ngnx δεν θα χρειαζόμαστε το :3001
```
apt install -y nginx
```

έλεγχος
```
systemctl status nginx
```
- Άνοιξε τη θύρα 80 (προεπιλεγμένη HTTP)
```
ufw allow 'Nginx Full'
```
- Φτιάξε νέο αρχείο ρυθμίσεων:
```
nano /etc/nginx/sites-available/marx-rag
```
```
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
εξοδος `Ctrl + O → Enter → Ctrl + X`
- Ενεργοποίησέ το
```
ln -s /etc/nginx/sites-available/marx-rag /etc/nginx/sites-enabled/
```
- ελενγχος
```
nginx -t
```
```
systemctl restart nginx
```
έλεγχος browser → `http://49.12.76.128`

## .env → front problem
1. μπες στο φάκελο του frontend στο Hetzner:
`cd /var/www/ragAttemptProjectMarx/frontend`
2. άνοιξε (ή δημιούργησε) το .env αρχείο:
`nano .env`
3. άλλαξε το περιεχόμενο σε:
`VITE_BACKEND_URL=http://49.12.76.128`
(ή αν αργότερα βάλουμε Nginx + domain, θα το αλλάξεις π.χ. σε https://marxchat.app)
4. ξαναχτίσε το frontend:
`npm run build`
5. ξαναχτίσε το backend για να αντιγράψει το νέο dist μέσα στο build:
```bash
cd ../backend
npm run build
pm2 restart marx-rag
```

# adding second app
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

# adding a third app
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

  # 🧠 Kuhn app → main site (/)
  location / {
    proxy_pass http://localhost:3002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  # 📘 Marx app → served under /capital
  location /capital/ {
    rewrite ^/capital(/.*)$ $1 break;
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  # 🔴 Mao app → served under /mao
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

# deploy changes
```bash
cd ragAttemptProjectMarx/
git pull origin main
cd frontend
npm install
npm run build
```
if needed .env
`pm2 restart <app-name> --update-env`

curl http://localhost:3002/api/ping

if config changes
```bash
nginx -t
systemctl restart nginx
```



