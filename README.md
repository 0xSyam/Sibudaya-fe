# Layanan Fasilitasi Lembaga Budaya DIY (Frontend)

Frontend aplikasi pengajuan fasilitasi kegiatan dan sarana prasarana untuk lembaga budaya DIY, dibangun dengan Next.js App Router.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4

## Menjalankan Proyek

1. Install dependency:

```bash
npm install
```

2. Buat file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

3. Jalankan development server:

```bash
npm run dev
```

4. Buka `http://localhost:3000` (atau port yang muncul di terminal).

## Scripts

- `npm run dev` - jalankan app mode development
- `npm run build` - build production
- `npm run start` - jalankan hasil build production
- `npm run lint` - linting dengan ESLint

## Struktur Fitur Utama

- `app/page.tsx` - landing page
- `app/login/page.tsx` - login email/password + Google OAuth
- `app/register/page.tsx` - registrasi akun
- `app/reset-password/page.tsx` - flow lupa password + reset password
- `app/auth/google/callback/page.tsx` - callback login Google
- `app/dashboard/layout.tsx` - layout dashboard (topbar, sidebar, auth guard)
- `app/dashboard/page.tsx` - dashboard user
- `app/dashboard/admin/page.tsx` - dashboard admin
- `app/dashboard/ajukan-fasilitasi/**` - pengajuan fasilitasi
- `app/dashboard/status/**` - status pengajuan user
- `app/dashboard/admin/status/**` - status pengajuan admin

## Catatan Integrasi API

- Base URL API diambil dari `NEXT_PUBLIC_API_URL`.
- Default fallback saat env belum di-set: `http://localhost:3000/api/v1`.
- Token auth disimpan di `localStorage` (`access_token`, `refresh_token`) dan ada mekanisme refresh token otomatis.
