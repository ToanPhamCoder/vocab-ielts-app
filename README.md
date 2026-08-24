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
