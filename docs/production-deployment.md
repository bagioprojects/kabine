# Canlı Sunucu (Production) Güvenli Canlıya Geçiş Kılavuzu

Bu kılavuz, **Politic** simülasyon projesinin canlı (production) ortama taşınırken uygulanması gereken en güvenli, yüksek performanslı ve modern sunucu mimarisini açıklamaktadır.

---

## 1. Genel Mimari Şeması (Nginx Reverse Proxy)

Canlı ortama geçildiğinde kullanıcıların ve adminlerin doğrudan `3000`, `5173` veya `5174` gibi iç portlara erişmesi **güvenlik açığı yaratır**. En güvenli yaklaşım, sunucu önünde bir **Nginx Ters Proxy (Reverse Proxy)** kullanmaktır.

Dış dünyaya yalnızca standart web portları olan **80 (HTTP)** ve **443 (HTTPS - SSL)** açılır. Diğer tüm portlar sunucu içinde (localhost) çalışır ve dışarıdan erişime kapatılır.

```mermaid
graph TD
    User([Vatandaş/Oyuncu]) -->|HTTPS:443 /| Nginx{Nginx Reverse Proxy}
    Admin([Yönetici]) -->|HTTPS:443 /websc-admin| Nginx
    Mobile([Mobil Uygulama]) -->|HTTPS:443 /api| Nginx
    
    subgraph Sunucu İçi (Localhost - Güvenlik Duvarı Arkası)
        Nginx -->|Proxy Pass| WebUser[Vatandaş Arayüzü: Port 5173]
        Nginx -->|Proxy Pass| WebAdmin[Admin Paneli: Port 5174]
        Nginx -->|Proxy Pass + WS| BackendAPI[Express API + Socket.io: Port 3000]
    end
```

---

## 2. Nginx Konfigürasyon Dosyası (Zorlaştırılmış URL Güvenliği)

Aşağıdaki konfigürasyon, hem Vatandaş Arayüzünü, hem zorlaştırılmış `/websc-admin` uzantılı Yönetici Panelini, hem de backend API ve Socket.io (WebSocket) bağlantılarını tek bir domain (`politic.oyunadi.com` veya `oyunadi.com`) üzerinden güvenli bir şekilde sunar.

### Nginx Konfigürasyon Örneği (`/etc/nginx/sites-available/politic`)

```nginx
# HTTP trafiğini HTTPS'e yönlendir
server {
    listen 80;
    listen [::]:80;
    server_name politic.oyunadi.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name politic.oyunadi.com;

    # SSL Sertifika Yolları (Certbot otomatik oluşturur)
    ssl_certificate /etc/letsencrypt/live/politic.oyunadi.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/politic.oyunadi.com/privkey.pem;
    
    # Güçlü SSL Güvenlik Ayarları
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # HSTS (HTTP Strict Transport Security) - Güvenliği zorunlu kılar
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # 1. Vatandaş Arayüzü (Ana Sayfa) -> Port 5173
    location / {
        proxy_pass http://127.0.0.1:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 2. Zorlaştırılmış Admin Paneli URL'si -> Port 5174
    # Dışarıdan sadece /websc-admin/ üzerinden erişilebilir
    location /websc-admin/ {
        proxy_pass http://127.0.0.1:5174/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 3. Backend API -> Port 3000
    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 4. Socket.io (Real-time Harita, Borsa ve Lojistik) -> Port 3000 + WebSockets
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSockets için zaman aşımlarını artır
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

---

## 3. Adım Adım Sunucu Kurulum Reçetesi (Ubuntu/Debian)

### Adım A: Gerekli Paketlerin Yüklenmesi
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install nginx git curl ufw -y

# Node.js LTS sürümünün kurulması
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Adım B: Güvenlik Duvarı (UFW) Yapılandırması
Sadece SSH ve Web trafiğine izin verin. `3000`, `5173`, `5174` portları dış dünyaya kesinlikle kapatılmalıdır.
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Adım C: PM2 ile Servislerin Arka Planda Çalıştırılması
Projelerinizin sunucu kapansa dahi otomatik yeniden başlaması ve arka planda crash olmadan çalışması için `pm2` sürecini kullanın.
```bash
sudo npm install -g pm2

# API Server'ı başlat
cd /var/www/political-simulation-project/apps/api
pm2 start dist/main.js --name "politic-api"

# Web uygulamalarını production build alıp statik olarak sunmak en performanslısıdır:
# Alternatif olarak Vite dev server yerine önbellekli build çıktılarını Nginx ile doğrudan sunabilirsiniz.
```

### Adım D: SSL Sertifikası (Certbot) Kurulumu
Let's Encrypt kullanarak ücretsiz ve otomatik yenilenen SSL sertifikası alın:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d politic.oyunadi.com
```
Certbot, yukarıdaki Nginx konfigürasyonunu otomatik olarak algılar ve SSL ayarlarını günceller.

---

## 4. Canlı Ortamda En Güvenli Yöntemler ve Alınacak Önlemler

1. **Vite'in `strictPort: true` Ayarı:**
   Tüm arayüzlerde port çakışmalarını önlemek için `vite.config.ts` içinde `strictPort: true` ve `host: '127.0.0.1'` kullanılmalıdır. Bu sayede servislerin dış ağa açılması engellenir.
2. **CORS Güvenliği:**
   Backend `api/src/main.ts` (veya CORS yapılandırması) içinde `cors.origin` canlı domaininizle sınırlandırılmalıdır:
   ```typescript
   app.enableCors({
     origin: ['https://politic.oyunadi.com'],
     credentials: true
   });
   ```
3. **JWT ve Cookie Güvenliği:**
   Kullanıcı ve admin tokenları HTTPS üzerinden `HttpOnly, Secure, SameSite=Strict` cookie'leri vasıtasıyla saklanmalıdır. Bu sayede XSS saldırılarıyla tokenların çalınması engellenir.
4. **Veritabanı Erişimi:**
   MongoDB/PostgreSQL veritabanı portları (`27017` / `5432`) dışarıya kapatılmalı, yalnızca `127.0.0.1` üzerinden dinleme yapmalıdır.
