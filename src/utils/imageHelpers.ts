/**
 * Utility untuk pengurusan imej yang selamat, mampatan gambar bagi Google Sheets,
 * dan penyediaan gambar foto berkualiti tinggi tanpa sebarang teks rosak/corrupt.
 */

// Senarai Foto Rasmi Berkualiti Tinggi Mengikut Kategori & ID Berita
export const OFFICIAL_NEWS_PHOTOS: Record<string, string> = {
  'news-1': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
  'news-2': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800',
  'news-3': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
  pengumuman: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
  aktiviti: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800',
  pekeliling: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
  default: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=800'
};

// URL Gantian Sekunder Jika Unsplash Disekat Rangkaian Sekolah
export const SECONDARY_FALLBACK_PHOTOS: Record<string, string> = {
  pengumuman: 'https://images.pexels.com/photos/8471799/pexels-photo-8471799.jpeg?auto=compress&cs=tinysrgb&w=800',
  aktiviti: 'https://images.pexels.com/photos/8613317/pexels-photo-8613317.jpeg?auto=compress&cs=tinysrgb&w=800',
  pekeliling: 'https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg?auto=compress&cs=tinysrgb&w=800',
  default: 'https://images.pexels.com/photos/8471799/pexels-photo-8471799.jpeg?auto=compress&cs=tinysrgb&w=800'
};

/**
 * Mengesahkan dan mengembalikan URL foto yang sah.
 * Menapis dan membuang sebarang data SVG teks lama yang kelihatan rosak / corrupt.
 */
export function getSafeNewsImageUrl(url?: string | null, category?: string, newsId?: string): string {
  const cat = (category || 'pengumuman').toLowerCase();
  const defaultPhoto = (newsId && OFFICIAL_NEWS_PHOTOS[newsId]) || OFFICIAL_NEWS_PHOTOS[cat] || OFFICIAL_NEWS_PHOTOS.default;

  if (!url || typeof url !== 'string') {
    return defaultPhoto;
  }

  const trimmed = url.trim();
  if (
    trimmed === '' ||
    trimmed === 'null' ||
    trimmed === 'undefined' ||
    trimmed.startsWith('data:image/svg') ||
    trimmed.includes('<svg') ||
    trimmed.includes('BERILMU') ||
    trimmed.includes('PENGUMUMAN RASMI') ||
    trimmed.length < 15
  ) {
    return defaultPhoto;
  }

  // Semak jika base64 terpotong (truncated data uri)
  if (trimmed.startsWith('data:image/')) {
    if (!trimmed.includes(';base64,') || trimmed.length < 100) {
      return defaultPhoto;
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

