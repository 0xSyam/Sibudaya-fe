# Layanan Fasilitasi Lembaga Budaya DIY (Frontend)

Frontend aplikasi pengajuan fasilitasi kegiatan dan sarana prasarana untuk lembaga budaya DIY, dibangun dengan Next.js App Router.

## Ringkasan

Proyek ini mencakup:

- Landing page layanan fasilitasi.
- Autentikasi user (login, register, reset password, Google OAuth callback).
- Dashboard pengguna untuk pengajuan dan pelacakan status.
- Dashboard admin untuk monitoring status dan pengaturan fasilitasi.
- Komponen UI berbasis Tailwind CSS dengan desain sesuai mockup Figma.

Sebagian besar data di halaman dashboard saat ini masih menggunakan data statis/mock di sisi frontend (belum terhubung penuh ke backend domain pengajuan).

## Tech Stack

- Next.js `16.1.6` (App Router)
- React `19.2.3`
- TypeScript `5`
- Tailwind CSS `4`
- ESLint `9` + `eslint-config-next`

## Prasyarat

- Node.js `>= 20` (disarankan LTS terbaru)
- npm atau pnpm

## Instalasi & Menjalankan Proyek

1. Install dependency:

```bash
npm install
```

2. Buat `.env.local` di root proyek:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_AUTH_USE_API=true
```

3. Jalankan development server:

```bash
npm run dev
```

4. Akses aplikasi di:

```text
http://localhost:3000
```

## Scripts

- `npm run dev` menjalankan app di port `3000`
- `npm run build` build production
- `npm run start` menjalankan build production di port `3000`
- `npm run lint` linting

## Environment Variables

| Variable | Wajib | Default di kode | Fungsi |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Ya (disarankan) | `http://localhost:3001/api/v1` di `app/lib/api.ts` | Base URL backend API |
| `NEXT_PUBLIC_AUTH_USE_API` | Tidak | `"true"` | Menentukan auth via backend API atau mode lokal |

### Catatan penting fallback URL

Ada perbedaan fallback `NEXT_PUBLIC_API_URL` di kode:

- `app/lib/api.ts` fallback ke `http://localhost:3001/api/v1`
- `next.config.ts` fallback ke `http://localhost:3000/api/v1`

Untuk mencegah perilaku tidak konsisten, selalu set `NEXT_PUBLIC_API_URL` secara eksplisit di `.env.local`.

## Struktur Direktori

```text
app/
  components/
    auth/                  # komponen UI reusable untuk auth
    home/                  # action landing page
  lib/
    api.ts                 # API client + token handling
    auth-context.tsx       # AuthProvider + useAuth
    auth-guard.tsx         # proteksi route dashboard (client-side)
    types.ts               # type auth & error
  auth/google/callback/    # callback OAuth Google
  login/ register/ reset-password/
  dashboard/
    components/
      dashboard-sidebar.tsx
      dashboard-topbar.tsx
      forms/               # reusable fields/button/stepper untuk form pengajuan
    admin/                 # halaman admin + pengaturan
    ajukan-fasilitasi/     # wizard pengajuan 3 langkah
    status/                # status pengajuan user
public/figma/              # aset gambar/icon dari desain
middleware.ts              # security headers + matcher route
```

## Arsitektur Singkat

1. `RootLayout` membungkus aplikasi dengan `AuthProvider`.
2. Token disimpan di `localStorage` (`access_token`, `refresh_token`).
3. Route dashboard diproteksi `AuthGuard` (client-side redirect ke `/login`).
4. `apiFetch` otomatis:
- menambahkan header `Authorization` jika access token tersedia
- mencoba refresh token sekali saat respons `401`
- retry request setelah refresh berhasil

## Alur Autentikasi

### Login email/password

- Halaman: `/login`
- Validasi dasar di client (field wajib diisi)
- Memanggil `authApi.login`
- Jika sukses:
- simpan token ke `localStorage`
- set user ke context
- redirect berdasarkan role:
  - `ADMIN` / `SUPER_ADMIN` -> `/dashboard/admin`
  - `USER` -> `/dashboard`

### Register

- Halaman: `/register`
- Validasi dasar:
- email wajib
- password minimal 8 karakter
- konfirmasi password harus cocok
- Jika sukses: auto login dan redirect ke `/dashboard`

### Google OAuth

- Tombol login Google redirect ke `${NEXT_PUBLIC_API_URL}/auth/google`
- Callback halaman: `/auth/google/callback`
- Token diambil dari query param `access_token` dan `refresh_token`
- Setelah token tersimpan, frontend memanggil `refreshUser()` lalu redirect ke `/dashboard`

### Reset Password

- Halaman: `/reset-password`
- 2 tahap:
  1. Request token reset (`/auth/forgot-password`)
  2. Submit password baru (`/auth/reset-password`)
- Jika `NEXT_PUBLIC_AUTH_USE_API=false`, flow berjalan dalam mode lokal (tanpa request backend auth reset).

## Integrasi API (Auth)

Endpoint yang digunakan frontend:

- `POST /auth/login`
- `POST /auth/register`
- `GET /auth/google` (redirect OAuth)
- `GET /auth/me`
- `POST /auth/refresh`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

Kontrak token:

- Request refresh mengirim `{ refresh_token }`
- Respons refresh diharapkan mengandung `access_token`
- Respons login/register diharapkan mengandung:
- `access_token`
- `refresh_token`
- `user` (`user_id`, `email`, `role`, `provider`, `created_at`)

## Daftar Route

### Public

- `/` landing page
- `/login`
- `/register`
- `/reset-password`
- `/auth/google/callback`

### User dashboard

- `/dashboard` ringkasan pengajuan
- `/dashboard/ajukan-fasilitasi` pilih jenis fasilitasi
- `/dashboard/ajukan-fasilitasi/form` langkah 1
- `/dashboard/ajukan-fasilitasi/form/step-2` langkah 2
- `/dashboard/ajukan-fasilitasi/form/step-3` langkah 3
- `/dashboard/status/dalam-proses`
- `/dashboard/status/survey-lapangan`
- `/dashboard/status/selesai`

### Admin dashboard

- `/dashboard/admin` status pengajuan + filter + statistik
- `/dashboard/admin/status/dalam-proses` timeline interaktif (ubah status per tahap)
- `/dashboard/admin/status/survey-lapangan` timeline interaktif (ubah status per tahap)
- `/dashboard/admin/pengaturan-fasilitasi` tab pengaturan general/pentas/hibah

## Detail Fitur Per Halaman

### Dashboard User

- Menampilkan 2 kartu utama: panduan dan ajukan fasilitasi.
- Menampilkan tabel status pengajuan.
- Data saat ini menggunakan array statis di frontend.

### Form Pengajuan (3 langkah)

- Langkah 1: identitas lembaga + NIK + paket fasilitasi.
- Langkah 2: detail kegiatan (nama, tujuan, tanggal, alamat kegiatan).
- Langkah 3: administrasi & dokumen (rekening, dana, proposal, alamat).
- Navigasi antar langkah saat ini berbasis link; belum tersambung ke API submit final.

### Dashboard Admin

- Search berdasarkan nama kegiatan.
- Sort tanggal (`Terbaru` asc/desc).
- Filter:
- jenis (`sapras` / `pentas`)
- status (`all`, `selesai`, `dalam_proses`, `perlu_tindakan`, `ditolak`)
- rentang tanggal (`startDate`, `endDate`)
- Statistik ringkas: total, dalam proses, perlu tindakan, selesai.

### Status Admin (Dalam Proses / Survey Lapangan)

- Timeline tahap pengajuan dengan status:
- `completed`
- `in_progress`
- `locked`
- Setiap tahap memiliki dropdown status.
- Mengubah status memajukan/memundurkan `activeStep` secara lokal.
- Beberapa tahap menampilkan komponen tambahan (date picker placeholder / tombol unggah).

### Pengaturan Fasilitasi Admin

- Terdiri dari 3 tab:
- `General` (jenis lembaga)
- `Pentas` (jenis fasilitasi, kuota, dokumen contoh)
- `Sarana Prasarana` (jenis, kuota, dokumen contoh)
- Fitur CRUD lokal via dialog:
- tambah/edit/hapus item
- unggah file contoh (UI only)
- konfirmasi simpan / batal
- Perubahan saat ini belum dipersist ke backend (`TODO: persist changes`).

## Middleware & Keamanan

`middleware.ts` saat ini:

- Menambahkan header:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- Matcher route:
- `/dashboard/:path*`
- `/login`
- `/register`
- `/reset-password`

Catatan: proteksi autentikasi utama tetap dilakukan client-side melalui `AuthGuard`.

## Konvensi Kode

- Path alias: `@/* -> ./*` (lihat `tsconfig.json`)
- Styling: Tailwind utility classes
- Font utama: Inter via `next/font/google`
- Komponen client ditandai `"use client"` pada file yang membutuhkan state/effect/browser API

## Known Limitations

- Banyak data dashboard masih hardcoded/mock.
- Fitur pengajuan 3 langkah belum mengirim payload final ke backend.
- Beberapa fitur admin masih TODO:
- persist perubahan pengaturan fasilitasi
- proses upload file nyata ke backend/storage
- Auth session tidak menggunakan cookie HttpOnly; token disimpan di `localStorage`.
- Middleware belum melakukan validasi token server-side.

## Troubleshooting

### Tidak bisa login meski backend hidup

Periksa:

- `NEXT_PUBLIC_API_URL` mengarah ke backend yang benar
- CORS backend mengizinkan origin frontend (`http://localhost:3000`)
- endpoint auth backend sesuai kontrak di atas

### Login selalu mode lokal

Pastikan:

```env
NEXT_PUBLIC_AUTH_USE_API=true
```

### Callback Google gagal

Pastikan backend mengembalikan query param:

- `access_token`
- `refresh_token`

ke URL callback frontend:

```text
/auth/google/callback
```

## Build & Deploy

1. Set environment variable production:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_AUTH_USE_API` (opsional, default `true`)

2. Build:

```bash
npm run build
```

3. Run:

```bash
npm run start
```

## Rekomendasi Pengembangan Lanjutan

- Integrasikan seluruh data dashboard dengan backend real.
- Pindahkan autentikasi ke model yang lebih aman (cookie HttpOnly + server-side guard).
- Tambah test otomatis (unit/integration/e2e) untuk alur auth dan form pengajuan.
- Terapkan validasi schema form (misalnya Zod) agar validasi konsisten.
