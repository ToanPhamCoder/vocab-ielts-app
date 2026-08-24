# Vocab IELTS — Web PWA

App học từ vựng tiếng Anh hướng tới **IELTS 9.0 Reading**, sử dụng thuật toán **FSRS** (Free Spaced Repetition Scheduler).

## Tính năng

- **Lưu từ vựng** — nhóm theo ngày nhập, tag, tìm kiếm, filter trạng thái
- **Ôn tập FSRS** — flashcard active recall với Again / Hard / Good / Easy
- **Nhắc ôn tập** — browser notification định kỳ + modal ôn đầu ngày
- **Dashboard** — biểu đồ tiến độ, IELTS Readiness Score, mục tiêu tháng (9,000 word families)

## Chạy local

```bash
npm install
npm run dev
```

Mở http://localhost:5173

## Build & deploy

```bash
npm run build
npm run preview
```

Deploy thư mục `dist/` lên GitHub Pages, Vercel, hoặc Netlify.

## Công nghệ

- React 19 + TypeScript + Vite 6
- Tailwind CSS 4
- Dexie.js (IndexedDB)
- ts-fsrs
- Recharts
- vite-plugin-pwa

## PWA

App có thể cài lên desktop/mobile qua trình duyệt (Add to Home Screen / Install). Bật thông báo trong **Cài đặt** để nhận nhắc ôn tập.

## Đồng bộ tài khoản (Supabase)

App hỗ trợ **Email + Google login** và sync từ vựng giữa các thiết bị.

### 1. Tạo project Supabase

1. Vào [supabase.com](https://supabase.com) → New project
2. **SQL Editor** → dán nội dung file [`supabase/schema.sql`](supabase/schema.sql) → Run
3. **Authentication → Providers**
   - Bật **Email**
   - Bật **Google** (dán Client ID / Secret từ Google Cloud Console)
4. **Authentication → URL Configuration**
   - Site URL: `https://vocab-ielts-app.vercel.app`
   - Redirect URLs: `http://localhost:5173/**` và `https://vocab-ielts-app.vercel.app/**`

### 2. Thêm API keys

Copy từ **Settings → API**:

```bash
cp .env.example .env
# điền VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY
```

Trên Vercel: Project → Settings → Environment Variables → thêm 2 biến trên → Redeploy.

### 3. Chạy lại

```bash
npm run dev
```

Đăng nhập cùng một tài khoản trên máy tính và điện thoại → dữ liệu sẽ đồng bộ.
