# Restaurant Management System

Restaurant Management System adalah aplikasi manajemen restoran berbasis web yang terdiri dari **frontend Next.js** dan **backend Fastify**. Aplikasi ini mendukung proses pemesanan makanan melalui QR/table guest flow, dashboard admin, manajemen menu, meja, akun, order, upload gambar, autentikasi, serta komunikasi real-time menggunakan Socket.IO.

Project ini menggunakan struktur **monorepo sederhana** dengan dua aplikasi utama:

```txt
restaurant-management/
├── client/              # Frontend Next.js
├── server/              # Backend Fastify + Prisma
├── docker-compose.yml   # Menjalankan client dan server dengan Docker
├── package.json         # Script root untuk menjalankan client dan server bersamaan
└── README.md
```

---

## Fitur Utama

### 1. Customer Ordering

Customer dapat melakukan pemesanan melalui halaman guest/customer. Alur ini cocok digunakan untuk sistem restoran berbasis meja, QR code, atau self-ordering.

### 2. Admin Dashboard

Admin dapat mengelola data restoran seperti akun, menu makanan, meja, order, dan indikator/dashboard.

### 3. Authentication & Authorization

Backend menyediakan fitur autentikasi menggunakan token, refresh token, cookie, dan middleware keamanan.

### 4. Real-Time Order Update

Aplikasi menggunakan Socket.IO agar perubahan order dapat dikirim secara real-time dari backend ke frontend.

### 5. Menu & Media Management

Admin dapat menambah, mengubah, dan menghapus data makanan, termasuk upload gambar makanan ke server.

### 6. Table Management

Sistem mendukung pengelolaan meja restoran, token meja, status meja, dan relasi meja dengan guest/order.

### 7. Docker Support

Project sudah memiliki `Dockerfile` pada folder `client/` dan `server/`, serta `docker-compose.yml` pada root project.

---

## Tech Stack

### Frontend

Frontend berada di folder `client/`.

| Teknologi                          | Fungsi                                                                |
| ---------------------------------- | --------------------------------------------------------------------- |
| Next.js 15                         | Framework React untuk frontend                                        |
| React 19                           | Library UI utama                                                      |
| TypeScript                         | Bahasa utama untuk type safety                                        |
| Tailwind CSS                       | Styling UI                                                            |
| Radix UI / shadcn-style components | Komponen UI seperti dialog, dropdown, popover, select, toast, tooltip |
| TanStack React Query               | Data fetching dan server state management                             |
| TanStack React Table               | Pengelolaan tabel data                                                |
| React Hook Form                    | Form handling                                                         |
| Zod                                | Validasi schema                                                       |
| Socket.IO Client                   | Komunikasi real-time ke backend                                       |
| Recharts                           | Visualisasi chart/dashboard                                           |
| QRCode                             | Generate QR code                                                      |
| Lucide React                       | Icon UI                                                               |
| Sharp                              | Optimasi image                                                        |

### Backend

Backend berada di folder `server/`.

| Teknologi                     | Fungsi                                    |
| ----------------------------- | ----------------------------------------- |
| Node.js 20                    | Runtime backend                           |
| Fastify                       | Framework backend API                     |
| TypeScript                    | Bahasa utama backend                      |
| Prisma ORM                    | ORM untuk akses database                  |
| SQLite                        | Database lokal/default                    |
| Socket.IO / fastify-socket.io | Real-time communication                   |
| Zod                           | Validasi request dan environment variable |
| fast-jwt                      | JWT authentication                        |
| bcrypt                        | Hashing password                          |
| @fastify/cors                 | CORS middleware                           |
| @fastify/cookie               | Cookie handling                           |
| @fastify/helmet               | Security headers                          |
| @fastify/multipart            | Upload file/form-data                     |
| @fastify/static               | Serve file statis/upload                  |
| Croner                        | Scheduled job                             |
| date-fns / date-fns-tz        | Utility tanggal dan timezone              |

### DevOps / Tooling

| Teknologi      | Fungsi                                                    |
| -------------- | --------------------------------------------------------- |
| Docker         | Containerization client dan server                        |
| Docker Compose | Menjalankan client dan server bersamaan                   |
| ESLint         | Linting kode                                              |
| Prettier       | Formatting kode                                           |
| Nodemon / TSX  | Menjalankan backend development dengan hot reload         |
| Concurrently   | Menjalankan client dan server bersamaan dari root project |

---

## Arsitektur Singkat

```txt
User / Customer / Admin
        |
        v
Frontend - Next.js Client
http://localhost:3000
        |
        | REST API + Socket.IO
        v
Backend - Fastify Server
http://localhost:4000
        |
        v
Prisma ORM
        |
        v
SQLite Database
```

Frontend berkomunikasi dengan backend melalui REST API dan Socket.IO. Backend mengelola autentikasi, data akun, meja, menu, order, upload gambar, serta koneksi real-time. Database dikelola menggunakan Prisma dengan SQLite sebagai database default.

---

## Prasyarat

Pastikan sudah menginstall:

* Node.js 20 atau versi LTS terbaru
* npm
* Docker dan Docker Compose, jika ingin menjalankan dengan container

---

## Cara Menjalankan Project Secara Lokal

### 1. Clone Repository

```bash
git clone https://github.com/bimorajendraa/restaurant-management.git
cd restaurant-management
```

### 2. Install Dependency Root

```bash
npm install
```

### 3. Install Dependency Client

```bash
cd client
npm install
cd ..
```

### 4. Install Dependency Server

```bash
cd server
npm install
cd ..
```

---

## Konfigurasi Environment Variable

Project ini membutuhkan file `.env` pada folder `client/` dan `server/`.

### Client Environment

Buat file:

```bash
client/.env
```

Contoh isi:

```env
NEXT_PUBLIC_API_ENDPOINT=http://localhost:4000
NEXT_PUBLIC_URL=http://localhost:3000
DOCKER_PUBLIC_API_ENDPOINT=http://server:4000
```

Keterangan:

| Variable                     | Fungsi                                                  |
| ---------------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_API_ENDPOINT`   | URL backend yang digunakan client ketika berjalan lokal |
| `NEXT_PUBLIC_URL`            | URL frontend                                            |
| `DOCKER_PUBLIC_API_ENDPOINT` | URL backend ketika berjalan melalui Docker network      |

### Server Environment

Buat file:

```bash
server/.env
```

Contoh isi:

```env
PORT=4000
DOCKER_HOST=0.0.0.0
DATABASE_URL="file:./dev.db"

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRES_IN=15m
GUEST_ACCESS_TOKEN_EXPIRES_IN=15m
GUEST_REFRESH_TOKEN_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=7d

INITIAL_EMAIL_OWNER=admin@order.com
INITIAL_PASSWORD_OWNER=123456

DOMAIN=localhost
PROTOCOL=http
UPLOAD_FOLDER=uploads
CLIENT_URL=http://localhost:3000
CLIENT_DOCKER_URL=http://client:3000

GOOGLE_REDIRECT_CLIENT_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_AUTHORIZED_REDIRECT_URI=http://localhost:4000/auth/google/callback

PRODUCTION=false
PRODUCTION_URL=http://localhost:4000
SERVER_TIMEZONE=Asia/Jakarta
```

Keterangan penting:

| Variable                 | Fungsi                                              |
| ------------------------ | --------------------------------------------------- |
| `PORT`                   | Port backend Fastify                                |
| `DOCKER_HOST`            | Host binding server, gunakan `0.0.0.0` untuk Docker |
| `DATABASE_URL`           | Lokasi database SQLite untuk Prisma                 |
| `ACCESS_TOKEN_SECRET`    | Secret untuk access token                           |
| `REFRESH_TOKEN_SECRET`   | Secret untuk refresh token                          |
| `INITIAL_EMAIL_OWNER`    | Email akun owner/admin pertama                      |
| `INITIAL_PASSWORD_OWNER` | Password akun owner/admin pertama                   |
| `UPLOAD_FOLDER`          | Folder penyimpanan file upload                      |
| `CLIENT_URL`             | URL frontend lokal                                  |
| `CLIENT_DOCKER_URL`      | URL frontend dalam Docker network                   |
| `PRODUCTION`             | Mode production, `true` atau `false`                |
| `SERVER_TIMEZONE`        | Timezone server                                     |

---

## Setup Database Prisma

Masuk ke folder server:

```bash
cd server
```

Generate Prisma Client:

```bash
npx prisma generate
```

Jalankan migration / push schema ke SQLite:

```bash
npx prisma db push
```

Buka Prisma Studio untuk melihat isi database:

```bash
npx prisma studio
```

Prisma Studio akan berjalan pada:

```txt
http://localhost:5555
```

---

## Menjalankan Development Mode

### Menjalankan Client dan Server dari Root

Dari root project:

```bash
npm run dev
```

Script ini akan menjalankan:

```bash
npm run dev:server
npm run dev:client
```

Client berjalan di:

```txt
http://localhost:3000
```

Server berjalan di:

```txt
http://localhost:4000
```

Health check backend:

```txt
http://localhost:4000/health
```

---

## Menjalankan Manual Per Folder

### Client

```bash
cd client
npm run dev
```

### Server

```bash
cd server
npm run dev
```

---

## Menjalankan dengan Docker Compose

Pastikan file berikut sudah dibuat:

```txt
client/.env
server/.env
```

Lalu jalankan dari root project:

```bash
docker compose up --build
```

Atau jalankan di background:

```bash
docker compose up -d --build
```

Akses aplikasi:

```txt
Frontend: http://localhost:3000
Backend : http://localhost:4000
Prisma  : http://localhost:5555
```

Menghentikan container:

```bash
docker compose down
```

---

## Build Production

### Build Client dan Server dari Root

```bash
npm run build
```

### Menjalankan Production Mode

```bash
npm run start
```

Atau jalankan per folder.

Client:

```bash
cd client
npm run build
npm run start
```

Server:

```bash
cd server
npm run build
npm run start
```

---

## Script yang Tersedia

### Root Script

| Command                | Fungsi                                   |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Menjalankan client dan server bersamaan  |
| `npm run dev:client`   | Menjalankan frontend saja                |
| `npm run dev:server`   | Menjalankan backend saja                 |
| `npm run build`        | Build client dan server                  |
| `npm run build:client` | Build frontend                           |
| `npm run build:server` | Build backend                            |
| `npm run start`        | Menjalankan client dan server production |
| `npm run start:client` | Menjalankan frontend production          |
| `npm run start:server` | Menjalankan backend production           |

### Client Script

| Command         | Fungsi                                 |
| --------------- | -------------------------------------- |
| `npm run dev`   | Menjalankan Next.js development server |
| `npm run build` | Build aplikasi Next.js                 |
| `npm run start` | Menjalankan hasil build Next.js        |
| `npm run lint`  | Menjalankan linting client             |

### Server Script

| Command                | Fungsi                                      |
| ---------------------- | ------------------------------------------- |
| `npm run dev`          | Menjalankan Fastify dengan nodemon/tsx      |
| `npm run build`        | Compile TypeScript server ke folder `dist/` |
| `npm run start`        | Menjalankan server dari hasil build         |
| `npm run lint`         | Menjalankan ESLint server                   |
| `npm run lint:fix`     | Memperbaiki lint issue otomatis             |
| `npm run prettier`     | Mengecek format kode                        |
| `npm run prettier:fix` | Format kode otomatis                        |

---

## Endpoint Utama Backend

Backend memiliki beberapa route utama:

| Prefix        | Fungsi                   |
| ------------- | ------------------------ |
| `/health`     | Health check server      |
| `/auth`       | Authentication           |
| `/accounts`   | Manajemen akun           |
| `/media`      | Upload media             |
| `/static`     | Serve file upload/static |
| `/dishes`     | Manajemen menu makanan   |
| `/tables`     | Manajemen meja           |
| `/orders`     | Manajemen order          |
| `/guest`      | Guest/customer ordering  |
| `/indicators` | Data indikator/dashboard |
| `/test`       | Test endpoint            |

---

## Database Model Utama

Project menggunakan Prisma dengan beberapa model utama:

| Model          | Fungsi                          |
| -------------- | ------------------------------- |
| `Account`      | Data akun owner/employee        |
| `Dish`         | Data menu makanan               |
| `DishSnapshot` | Snapshot menu saat order dibuat |
| `Table`        | Data meja restoran              |
| `Order`        | Data pesanan                    |
| `Guest`        | Data customer/guest             |
| `RefreshToken` | Data refresh token              |
| `Socket`       | Data koneksi socket user/guest  |

---

## Catatan Development

* File upload disimpan di folder `server/uploads`.
* Backend menggunakan SQLite melalui Prisma, sehingga cocok untuk development dan demo lokal.
* Untuk production, database dapat dipindahkan ke PostgreSQL/MySQL dengan menyesuaikan `schema.prisma` dan `DATABASE_URL`.
* Pastikan secret token pada `.env` tidak menggunakan nilai default saat deploy production.
* Jangan commit file `.env` ke repository.

---

## License

Project ini menggunakan lisensi MIT.
