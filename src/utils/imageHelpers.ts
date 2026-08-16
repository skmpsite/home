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
 * Menukar pautan perkongsian Google Drive (view/open/uc) kepada URL imej terus (direct image CDN)
 * yang boleh dipaparkan oleh pelayar web tanpa ralat CORS atau paparan halaman kosong.
 */
export function formatGoogleDriveUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Jika sudah data URI
  if (trimmed.startsWith('data:image/')) return trimmed;

  // Semak jika pautan Google Drive
  const driveFileRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=view&)?id=)|docs\.google\.com\/uc\?id=)([a-zA-Z0-9_-]+)/i;
  const match = trimmed.match(driveFileRegex);
  if (match && match[1]) {
    const fileId = match[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  return trimmed;
}

/**
 * Memampatkan fail imej secara automatik sebelum disimpan ke Google Sheets / Storan.
 * Ini memastikan saiz data URI muat dalam had sel Google Sheets (< 50,000 aksara)
 * dan menghalang isu gambar terpotong / corrupt atau QuotaExceededError.
 */
export function compressAndResizeImage(
  file: File,
  maxWidth: number = 400,
  maxHeight: number = 400,
  quality: number = 0.72
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca fail imej.'));
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        reject(new Error('Fail imej kosong.'));
        return;
      }

      const img = new Image();
      img.onerror = () => {
        // Fallback selamat jika decoding canvas gagal
        resolve(result);
      };
      img.onload = () => {
        try {
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          if (width <= 0 || height <= 0) {
            resolve(result);
            return;
          }

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.max(1, Math.round(width * ratio));
            height = Math.max(1, Math.round(height * ratio));
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(result);
            return;
          }

          // Lukis latar belakang putih jika PNG ada ketelusan (transparency)
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Eksport ke JPEG berkualiti optimum dan saiz sangat padat (<15KB)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (err) {
          console.warn('Fallback ke fail asal semasa mampatan:', err);
          resolve(result);
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Mampatan khas untuk gambar profil / potret warga sekolah (saiz padat ~5-10KB)
 * Memastikan keselamatan storan localStorage & had sel Google Sheets.
 */
export function compressStaffPhoto(file: File): Promise<string> {
  return compressAndResizeImage(file, 200, 260, 0.72);
}


