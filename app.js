/* ============================================================
   منطق اصلی اپ: ناوبری صفحه‌ها، رندر دسته‌ها، مدیریت آپلود شمشیر
   ============================================================ */

// state آپلودهای شمشیر: material-key -> {blob, previewUrl}
const swordTextures = new Map();

/* ---------- ناوبری ---------- */

function showScreen(screenId, extra) {
  document.querySelectorAll('.screen').forEach((el) => el.classList.remove('active'));
  const target = document.getElementById(`screen-${screenId}`);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });

  if (screenId === 'soon' && extra) {
    document.getElementById('soonTitle').textContent = `${extra} — به‌زودی تو کوره`;
  }
}

document.addEventListener('click', (e) => {
  const navBtn = e.target.closest('[data-nav]');
  if (navBtn) {
    showScreen(navBtn.dataset.nav);
  }
});

/* ---------- رندر گرید دسته‌ها ---------- */

function renderCategoryGrid() {
  const grid = document.getElementById('categoryGrid');
  grid.innerHTML = '';

  CATEGORIES.forEach((cat, i) => {
    const card = document.createElement(cat.ready ? 'button' : 'div');
    card.className = `cat-card${cat.ready ? '' : ' locked'}`;
    card.setAttribute('type', cat.ready ? 'button' : undefined);
    if (!cat.ready) card.setAttribute('aria-disabled', 'true');

    card.innerHTML = `
      <span class="cat-badge ${cat.ready ? 'ready' : 'soon'}">${cat.ready ? 'فعال' : 'به‌زودی'}</span>
      <span class="cat-index">${String(i + 1).padStart(2, '0')}</span>
      <div class="cat-icon-wrap">${cat.icon}</div>
      <h3 class="cat-name">${cat.name}</h3>
      <p class="cat-count">${cat.count}</p>
    `;

    card.addEventListener('click', () => {
      if (cat.ready) {
        showScreen(cat.id);
      } else {
        showScreen('soon', cat.name);
      }
    });

    grid.appendChild(card);
  });
}

/* ---------- رندر اسلات‌های شمشیر ---------- */

function renderSwordSlots() {
  const grid = document.getElementById('slotGrid');
  grid.innerHTML = '';

  document.getElementById('progressTotal').textContent = toFarsiDigits(
    SWORD_MATERIALS.filter((m) => !m.optional).length
  );

  SWORD_MATERIALS.forEach((material) => {
    const card = document.createElement('div');
    card.className = 'slot-card';
    card.dataset.material = material.key;

    card.innerHTML = `
      <div class="slot-top">
        <div class="slot-material">
          <span class="slot-swatch" style="background:${material.swatch}"></span>
          <span class="slot-material-name">${material.label}</span>
        </div>
        ${material.optional ? '<span class="slot-optional-tag">اختیاری</span>' : ''}
      </div>
      <div class="slot-drop">
        <input type="file" accept="image/*" aria-label="آپلود تکسچر ${material.label}">
        <button class="slot-clear" type="button" aria-label="حذف تکسچر ${material.label}" title="حذف">
          <svg viewBox="0 0 24 24" fill="none"><path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
        </button>
        <div class="slot-preview"><img alt=""></div>
        <svg class="slot-drop-icon" viewBox="0 0 24 24" fill="none"><path d="M12 4V16M12 4L7 9M12 4L17 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 17V18C4 19.1 4.9 20 6 20H18C19.1 20 20 19.1 20 18V17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        <span class="slot-drop-text">عکس رو بکش اینجا یا کلیک کن</span>
        <span class="slot-drop-sub">مربعی بهتره — خودکار به ۱۶×۱۶ می‌شه</span>
      </div>
      <div class="slot-status" data-status></div>
    `;

    grid.appendChild(card);

    const fileInput = card.querySelector('input[type="file"]');
    const dropZone = card.querySelector('.slot-drop');
    const clearBtn = card.querySelector('.slot-clear');

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handleMaterialUpload(material, file, card);
    });

    // drag & drop
    ['dragenter', 'dragover'].forEach((evt) => {
      dropZone.addEventListener(evt, (e) => {
        e.preventDefault();
        card.classList.add('drag-over');
      });
    });
    ['dragleave', 'drop'].forEach((evt) => {
      dropZone.addEventListener(evt, (e) => {
        e.preventDefault();
        card.classList.remove('drag-over');
      });
    });
    dropZone.addEventListener('drop', (e) => {
      const file = e.dataTransfer.files[0];
      if (file) handleMaterialUpload(material, file, card);
    });

    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      swordTextures.delete(material.key);
      card.classList.remove('filled');
      card.querySelector('[data-status]').textContent = '';
      card.querySelector('[data-status]').className = 'slot-status';
      fileInput.value = '';
      updateProgress();
    });
  });

  updateProgress();
}

async function handleMaterialUpload(material, file, card) {
  const statusEl = card.querySelector('[data-status]');
  statusEl.className = 'slot-status processing';
  statusEl.innerHTML = `<span class="slot-status-dot"></span> در حال پردازش...`;

  try {
    const result = await processImageFile(file);
    swordTextures.set(material.key, result);

    card.classList.add('filled');
    card.querySelector('.slot-preview img').src = result.previewUrl;

    statusEl.className = 'slot-status ok';
    statusEl.innerHTML = `<span class="slot-status-dot"></span> آماده — ۱۶×۱۶`;

    updateProgress();
  } catch (err) {
    statusEl.className = 'slot-status';
    statusEl.style.color = 'var(--err)';
    statusEl.textContent = err.message || 'خطا در پردازش عکس';
    showToast(err.message || 'یه مشکلی تو پردازش این عکس پیش اومد');
  }
}

function updateProgress() {
  const requiredKeys = SWORD_MATERIALS.filter((m) => !m.optional).map((m) => m.key);
  const filledRequired = requiredKeys.filter((k) => swordTextures.has(k)).length;

  document.getElementById('progressFilled').textContent = toFarsiDigits(filledRequired);

  const forgeBtn = document.getElementById('btnForge');
  // اجازه ساخت پک با حتی یک تکسچر هم هست (نیازی نیست همه ۶ تا پر بشه)،
  // چون بازی برای جنس‌های خالی خودش پیش‌فرض وانیلا رو نشون می‌ده.
  forgeBtn.disabled = swordTextures.size === 0;
}

/* ---------- ساخت پک نهایی ---------- */

document.getElementById('btnForge').addEventListener('click', async () => {
  const btn = document.getElementById('btnForge');
  if (btn.disabled) return;

  btn.disabled = true;
  btn.classList.add('working');
  const originalText = btn.querySelector('span').textContent;
  btn.querySelector('span').textContent = 'در حال ساخت...';

  try {
    const packName = document.getElementById('packName').value || 'پک شمشیر من';
    const blob = await buildSwordPack(packName, swordTextures);

    const fileSafeName = packName
      .trim()
      .replace(/[^\p{L}\p{N}\-_ ]/gu, '')
      .replace(/\s+/g, '-')
      .slice(0, 40) || 'sword-pack';

    const url = URL.createObjectURL(blob);
    const link = document.getElementById('downloadLink');
    link.href = url;
    link.download = `${fileSafeName}.mcpack`;
    document.getElementById('resultFileName').textContent = `${fileSafeName}.mcpack`;

    showScreen('result');
  } catch (err) {
    console.error(err);
    showToast('ساخت پک با خطا مواجه شد. دوباره امتحان کن.');
  } finally {
    btn.disabled = false;
    btn.classList.remove('working');
    btn.querySelector('span').textContent = originalText;
    updateProgress();
  }
});

/* ---------- توست خطا ---------- */

let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

/* ---------- کمکی: تبدیل عدد به فارسی ---------- */

function toFarsiDigits(n) {
  const map = { 0: '۰', 1: '۱', 2: '۲', 3: '۳', 4: '۴', 5: '۵', 6: '۶', 7: '۷', 8: '۸', 9: '۹' };
  return String(n).replace(/[0-9]/g, (d) => map[d]);
}

/* ---------- انیمیشن پس‌زمینه: جرقه‌های کوره ---------- */

function initSparkCanvas() {
  const canvas = document.getElementById('sparkCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function spawnParticle() {
    return {
      x: Math.random() * w,
      y: h + 10,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(0.4 + Math.random() * 1.1),
      size: 0.6 + Math.random() * 1.8,
      life: 0,
      maxLife: 200 + Math.random() * 260,
      hue: Math.random() > 0.3 ? '255,107,26' : '255,179,71'
    };
  }

  const maxParticles = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 46;
  for (let i = 0; i < maxParticles; i++) {
    const p = spawnParticle();
    p.y = Math.random() * h;
    particles.push(p);
  }

  function tick() {
    if (maxParticles === 0) return; // reduced motion: don't animate at all
    ctx.clearRect(0, 0, w, h);

    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life++;

      const lifeRatio = p.life / p.maxLife;
      const opacity = lifeRatio < 0.15
        ? lifeRatio / 0.15
        : lifeRatio > 0.7
          ? Math.max(0, 1 - (lifeRatio - 0.7) / 0.3)
          : 1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.hue}, ${opacity * 0.75})`;
      ctx.fill();

      if (p.life >= p.maxLife || p.y < -10) {
        particles[i] = spawnParticle();
      }
    });

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

/* ---------- شروع ---------- */

document.addEventListener('DOMContentLoaded', () => {
  renderCategoryGrid();
  renderSwordSlots();
  initSparkCanvas();
});
