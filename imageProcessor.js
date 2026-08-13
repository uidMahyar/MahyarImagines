/* ============================================================
   پردازش تصویر: هر عکس ورودی رو مستقل از فرمت/نسبت اصلی‌ش
   به یه تکسچر ۱۶×۱۶ پیکسلی PNG (استاندارد آیتم‌های وانیلا)
   تبدیل می‌کنه — کراپ مربعی از وسط + ریسایز pixelated.
   ============================================================ */

const TEXTURE_SIZE = 16;

/**
 * فایل تصویر ورودی رو می‌گیره و یه شیء برمی‌گردونه شامل:
 *  - blob: خروجی PNG آماده برای ریختن تو زیپ
 *  - previewUrl: object URL برای نمایش پیش‌نمایش تو UI
 */
function processImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('فایل انتخابی عکس نیست'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('خوندن فایل با مشکل مواجه شد'));

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('عکس قابل بارگذاری نبود'));

      img.onload = () => {
        try {
          const result = cropAndResize(img);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}

function cropAndResize(img) {
  const srcW = img.naturalWidth;
  const srcH = img.naturalHeight;
  const side = Math.min(srcW, srcH);
  const sx = (srcW - side) / 2;
  const sy = (srcH - side) / 2;

  // مرحله اول: کراپ مربعی در رزولوشن اصلی (کیفیت بالا حفظ می‌شه)
  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = side;
  cropCanvas.height = side;
  const cropCtx = cropCanvas.getContext('2d');
  cropCtx.drawImage(img, sx, sy, side, side, 0, 0, side, side);

  // مرحله دوم: ریسایز نهایی به ۱۶×۱۶ با اسموتینگ (نتیجه بهتر از
  // پرش مستقیم به رزولوشن خیلی کوچیک‌تره)
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = TEXTURE_SIZE;
  finalCanvas.height = TEXTURE_SIZE;
  const finalCtx = finalCanvas.getContext('2d');
  finalCtx.imageSmoothingEnabled = true;
  finalCtx.imageSmoothingQuality = 'high';
  finalCtx.drawImage(cropCanvas, 0, 0, side, side, 0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

  const previewUrl = finalCanvas.toDataURL('image/png');

  return new Promise((resolve) => {
    finalCanvas.toBlob((blob) => {
      resolve({ blob, previewUrl });
    }, 'image/png');
  });
}
