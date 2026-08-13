/* ============================================================
   ساخت فایل mcpack نهایی.
   ساختار خروجی مطابق فرمت رسمی ریسورس‌پک بدراک:
     manifest.json
     pack_icon.png
     textures/item_texture.json   (اتلس آیتم‌ها — رفرنس تکسچر هر جنس)
     textures/items/<key>_sword.png

   min_engine_version روی [1, 20, 0] ثابته طبق درخواست کاربر
   (پک از ۱.۲۰ به بعد لود می‌شه). format_version مانیفست هم ۲
   هست که خط پایه‌ی پایدار فعلیه، نه preview.
   ============================================================ */

function uuidv4() {
  // RFC4122 v4 — کافیه چون فقط باید یکتا باشه، لازم نیست
  // امن رمزنگاری باشه.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * ورودی: shortName ("پک شمشیر من") + یه Map از material-key -> {blob}
 * فقط جنس‌هایی که کاربر پر کرده تو textureMap هستن؛ بقیه رو باز
 * نمی‌ذاریم چون بدون override اومدن، بازی خودش طرح وانیلا رو نشون می‌ده.
 */
async function buildSwordPack(packName, textureMap) {
  const zip = new JSZip();
  const headerUuid = uuidv4();
  const moduleUuid = uuidv4();

  const cleanName = (packName || 'پک شمشیر من').trim().slice(0, 60) || 'پک شمشیر من';

  const manifest = {
    format_version: 2,
    header: {
      name: cleanName,
      description: 'ساخته‌شده با کوره‌گر — ریسورس‌پک شمشیرهای سفارشی',
      uuid: headerUuid,
      version: [1, 0, 0],
      min_engine_version: [1, 20, 0]
    },
    modules: [
      {
        type: 'resources',
        uuid: moduleUuid,
        version: [1, 0, 0]
      }
    ]
  };

  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  // آیکون پک: یه آیکون ساده که تو runtime می‌سازیم (کاربر آپلود نکرده)
  const iconBlob = await generatePackIcon(textureMap);
  zip.file('pack_icon.png', iconBlob);

  // اتلس آیتم — برای هر جنسی که کاربر عکس داده یه ورودی می‌سازیم
  const textureData = {};
  const itemsFolder = zip.folder('textures').folder('items');

  for (const material of SWORD_MATERIALS) {
    const entry = textureMap.get(material.key);
    if (!entry) continue; // این جنس رو کاربر خالی گذاشته -> پیش‌فرض وانیلا می‌مونه

    const fileName = `${material.key}_sword.png`;
    itemsFolder.file(fileName, entry.blob);

    // کلید اتلس باید دقیقاً همون آیدی آیتم وانیلا باشه تا override واقعی
    // رو بازی بشناسه (iron_sword نه sword_iron یا هر اسم اختیاری).
    textureData[`${material.key}_sword`] = {
      textures: `textures/items/${fileName.replace('.png', '')}`
    };
  }

  const itemTexture = {
    resource_pack_name: 'vanilla',
    texture_name: 'atlas.items',
    texture_data: textureData
  };

  zip.folder('textures').file('item_texture.json', JSON.stringify(itemTexture, null, 2));

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
}

/**
 * آیکون پک رو از روی اولین تکسچر پرشده می‌سازه (یا یه پیش‌فرض
   خنثی اگه هیچی پر نشده بود) — روی زمینه تیره در ۱۲۸×۱۲۸.
 */
function generatePackIcon(textureMap) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1a1512';
    ctx.fillRect(0, 0, 128, 128);

    const firstEntry = [...textureMap.values()][0];
    if (firstEntry && firstEntry.previewUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.imageSmoothingEnabled = false;
        const pad = 20;
        ctx.drawImage(img, pad, pad, 128 - pad * 2, 128 - pad * 2);
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      };
      img.onerror = () => canvas.toBlob((blob) => resolve(blob), 'image/png');
      img.src = firstEntry.previewUrl;
    } else {
      ctx.strokeStyle = '#ff6b1a';
      ctx.lineWidth = 4;
      ctx.strokeRect(30, 30, 68, 68);
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    }
  });
}
