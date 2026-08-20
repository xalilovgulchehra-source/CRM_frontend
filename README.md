# Sartaroshxona CRM — Frontend

Sartaroshxona/salon uchun boshqaruv dashboard ilovasi. Next.js 15 + Tailwind CSS 4 bilan yaratilgan.

## Xususiyatlari

- **Kirish / Ro'yxatdan o'tish** — JWT autentifikatsiya
- **Dashboard** — statistika kartalari va navbatlar ro'yxati
- **Mijozlar** — CRUD, qidiruv, modal orqali qo'shish/tahrirlash
- **Xizmatlar** — CRUD, narx va davomiylik bilan
- **Navbatlar** — yaratish, status o'zgartirish, filtrlash

## O'rnatish

```bash
npm install
```

## Sozlash

`.env.local` faylini yarating:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Ishga tushirish

```bash
npm run dev
```

http://localhost:3000 da ochiladi.

## Deploy (Vercel)

1. Reponi GitHub'ga yuklang
2. https://vercel.com/new da import qiling
3. Environment variable qo'shing:
   - `NEXT_PUBLIC_API_URL` = backend API manzilingiz
4. Deploy tugmasini bosing

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS 4
- **Language:** TypeScript
- **Auth:** JWT (localStorage + Bearer token)

## Struktura

```
src/
├── app/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── dashboard/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── clients/page.tsx
│       ├── services/page.tsx
│       └── bookings/page.tsx
├── components/
│   ├── DashboardLayout.tsx
│   └── Modal.tsx
├── lib/
│   ├── api.ts
│   └── auth-context.tsx
└── types/
    └── index.ts
```
