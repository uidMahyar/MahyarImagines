/* ============================================================
   تعریف دسته‌ها و جنس‌های هر دسته
   برای اضافه کردن دسته جدید فقط اینجا رو گسترش بده — یه
   builder جدید که همین قرارداد رو رعایت کنه (renderSlots,
   getResult) با app.js سازگاره.
   ============================================================ */

const CATEGORIES = [
  {
    id: 'swords',
    name: 'شمشیرها',
    count: '۶ جنس',
    ready: true,
    icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M14.5 3.5L20.5 9.5L10 20L4 20L4 14L14.5 3.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M4 20L9 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M12.5 5.5L18.5 11.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`
  },
  {
    id: 'pickaxes',
    name: 'کلنگ‌ها',
    count: '۶ جنس',
    ready: false,
    icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 3C7 3 3 6 3 6C3 6 7 9 7 9L12 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 3C17 3 21 6 21 6C21 6 17 9 17 9L12 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 12L6 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`
  },
  {
    id: 'axes',
    name: 'تبرها',
    count: '۶ جنس',
    ready: false,
    icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M18 3C13 3 9 7 9 12L14 12C14 8.5 15.5 6 18 5L18 3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M11 10L5 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`
  },
  {
    id: 'armor',
    name: 'زره‌ها',
    count: '۴ قطعه × ۶ جنس',
    ready: false,
    icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 3L19 6V11C19 16 16 19.5 12 21C8 19.5 5 16 5 11V6L12 3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`
  },
  {
    id: 'blocks',
    name: 'بلاک‌ها',
    count: 'به‌زودی',
    ready: false,
    icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M4 7.5L12 12L20 7.5M12 12V21" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`
  },
  {
    id: 'gui',
    name: 'منو و رابط',
    count: 'به‌زودی',
    ready: false,
    icon: `<svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="4" width="17" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 9H20.5" stroke="currentColor" stroke-width="1.8"/></svg>`
  }
];

// جنس‌های شمشیر — ترتیب و کدها دقیقاً هم‌راستا با item_texture.json وانیلای بدراک.
// مسی (copper) اختیاریه: از آپدیت پاییز ۲۰۲۵ (Java 1.21.9 / Bedrock 1.21.111)
// به بعد آیتم رسمیه، ولی برای پک‌های قدیمی‌تر لازم نیست کاربر پرش کنه.
const SWORD_MATERIALS = [
  { key: 'wood',      label: 'چوبی',   swatch: '#a9814f', optional: false },
  { key: 'stone',     label: 'سنگی',   swatch: '#8d8d8d', optional: false },
  { key: 'iron',      label: 'آهنی',   swatch: '#d8d8d0', optional: false },
  { key: 'gold',      label: 'طلایی',  swatch: '#f6c839', optional: false },
  { key: 'diamond',   label: 'الماسی', swatch: '#5fd8d0', optional: false },
  { key: 'netherite', label: 'نتریتی', swatch: '#4a3f42', optional: false },
  { key: 'copper',    label: 'مسی',    swatch: '#d97757', optional: true }
];
