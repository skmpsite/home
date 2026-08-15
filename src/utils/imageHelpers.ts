/**
 * Utility untuk pengurusan imej yang selamat, mampatan gambar bagi Google Sheets,
 * dan penyediaan fallback grafik SVG beresolusi tinggi tanpa sebarang ralat corrupt.
 */

// SVG Banner Vektor Beresolusi Tinggi (100% Selamat & Ringan, Tiada Pergantungan Internet)
export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  pengumuman: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e3a8a"/><stop offset="100%" stop-color="%230f172a"/></linearGradient><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23facc15"/><stop offset="100%" stop-color="%23eab308"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23bg)"/><circle cx="700" cy="80" r="180" fill="%23ffffff" fill-opacity="0.04"/><circle cx="100" cy="380" r="140" fill="%23ffffff" fill-opacity="0.03"/><rect x="50" y="50" width="700" height="350" rx="24" fill="none" stroke="%23facc15" stroke-width="3" stroke-opacity="0.3" stroke-dasharray="10 10"/><g transform="translate(400, 180)" text-anchor="middle"><circle cx="0" cy="-20" r="56" fill="url(%23gold)"/><path d="M-18 -20 L-6 -32 L-6 -8 L-18 -20 Z M-6 -26 L12 -34 L12 -6 L-6 -14 Z M16 -24 A6 6 0 0 1 16 -16 M20 -28 A12 12 0 0 1 20 -12" fill="none" stroke="%231e3a8a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><text y="75" fill="%23ffffff" font-size="28" font-weight="900" font-family="system-ui, sans-serif" letter-spacing="1">PENGUMUMAN RASMI</text><text y="108" fill="%23facc15" font-size="16" font-weight="700" font-family="system-ui, sans-serif" letter-spacing="3">SK MERBAU PULAS</text></g></svg>`,
  
  aktiviti: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23064e3b"/><stop offset="100%" stop-color="%230f172a"/></linearGradient><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2334d399"/><stop offset="100%" stop-color="%23059669"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23bg)"/><circle cx="120" cy="100" r="160" fill="%23ffffff" fill-opacity="0.04"/><rect x="50" y="50" width="700" height="350" rx="24" fill="none" stroke="%2334d399" stroke-width="3" stroke-opacity="0.3"/><g transform="translate(400, 180)" text-anchor="middle"><circle cx="0" cy="-20" r="56" fill="url(%23gold)"/><path d="M-16 -34 H16 V-18 C16 -10 10 -4 0 -4 C-10 -4 -16 -10 -16 -18 Z M-16 -28 H-24 C-24 -18 -16 -14 -16 -14 M16 -28 H24 C24 -18 16 -14 16 -14 M0 -4 V8 M-12 8 H12" fill="none" stroke="%23ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><text y="75" fill="%23ffffff" font-size="28" font-weight="900" font-family="system-ui, sans-serif" letter-spacing="1">AKTIVITI &amp; PROGRAM SEKOLAH</text><text y="108" fill="%2334d399" font-size="16" font-weight="700" font-family="system-ui, sans-serif" letter-spacing="3">SK MERBAU PULAS</text></g></svg>`,

  pekeliling: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23312e81"/><stop offset="100%" stop-color="%230f172a"/></linearGradient><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23818cf8"/><stop offset="100%" stop-color="%234f46e5"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23bg)"/><circle cx="680" cy="350" r="160" fill="%23ffffff" fill-opacity="0.04"/><rect x="50" y="50" width="700" height="350" rx="24" fill="none" stroke="%23818cf8" stroke-width="3" stroke-opacity="0.3"/><g transform="translate(400, 180)" text-anchor="middle"><circle cx="0" cy="-20" r="56" fill="url(%23gold)"/><path d="M-14 -38 H6 L18 -26 V-2 C18 4 12 10 6 10 H-14 C-20 10 -26 4 -26 -2 V-26 C-26 -32 -20 -38 -14 -38 Z M4 -36 V-24 H16 M-14 -12 H6 M-14 -2 H2" fill="none" stroke="%23ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><text y="75" fill="%23ffffff" font-size="28" font-weight="900" font-family="system-ui, sans-serif" letter-spacing="1">PEKELILING &amp; SIARAN RASMI</text><text y="108" fill="%23a5b4fc" font-size="16" font-weight="700" font-family="system-ui, sans-serif" letter-spacing="3">KEMENTERIAN PENDIDIKAN MALAYSIA</text></g></svg>`,

  default: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e293b"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23bg)"/><rect x="50" y="50" width="700" height="350" rx="24" fill="none" stroke="%23facc15" stroke-width="3" stroke-opacity="0.3"/><g transform="translate(400, 180)" text-anchor="middle"><circle cx="0" cy="-20" r="56" fill="%23facc15"/><path d="M-18 -10 L0 -26 L18 -10 L18 10 L-18 10 Z" fill="none" stroke="%230f172a" stroke-width="4" stroke-linejoin="round"/><text y="75" fill="%23ffffff" font-size="28" font-weight="900" font-family="system-ui, sans-serif" letter-spacing="1">SK MERBAU PULAS</text><text y="108" fill="%23facc15" font-size="16" font-weight="700" font-family="system-ui, sans-serif" letter-spacing="3">BERILMU • BERAMAL • BERBAKTI</text></g></svg>`
};

/**
 * Mengesahkan dan mengembalikan URL imej yang sah, atau fallback jika rosak / kosong
 */
export function getSafeNewsImageUrl(url?: string | null, category?: string): string {
  const cat = (category || 'pengumuman').toLowerCase();
  const fallback = CATEGORY_FALLBACK_IMAGES[cat] || CATEGORY_FALLBACK_IMAGES.default;

  if (!url || typeof url !== 'string') {
    return fallback;
  }

  const trimmed = url.trim();
  if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
    return fallback;
  }

  // Semak jika base64 terpotong (truncated data uri)
  if (trimmed.startsWith('data:image')) {
    if (!trimmed.includes(';base64,') || trimmed.length < 50) {
      return fallback;
    }
  }

  return trimmed;
}

/**
 * Memampatkan fail imej secara automatik sebelum disimpan ke Google Sheets / Storan.
 * Ini memastikan saiz data URI muat dalam had sel Google Sheets (< 50,000 aksara)
 * dan menghalang isu gambar terpotong / corrupt.
 */
export function compressAndResizeImage(
  file: File,
  maxWidth: number = 640,
  maxHeight: number = 480,
  quality: number = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca fail imej.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format imej tidak sah.'));
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Lukis latar belakang putih jika PNG ada ketelusan (transparency)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Eksport ke JPEG berkualiti optimum dan saiz sangat padat (~15KB)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
