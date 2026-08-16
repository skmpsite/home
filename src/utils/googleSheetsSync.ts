import {
  SchoolProfile,
  Staff,
  NewsItem,
  CalendarEvent,
  GalleryItem,
  AwardItem,
  DownloadDocument,
  FeedbackEntry
} from '../types';
import { DEFAULT_GAS_URL } from '../config';
import { getSafeNewsImageUrl, formatGoogleDriveUrl } from './imageHelpers';

const GAS_URL_KEY = 'skmp_gas_url_v1';

export function getGasWebAppUrl(): string {
  try {
    const customUrl = localStorage.getItem(GAS_URL_KEY);
    if (customUrl && customUrl.trim()) {
      return customUrl.trim();
    }
    return DEFAULT_GAS_URL;
  } catch (err) {
    console.warn('Failed to read GAS URL from localStorage', err);
    return DEFAULT_GAS_URL;
  }
}

export function saveGasWebAppUrl(url: string): void {
  try {
    localStorage.setItem(GAS_URL_KEY, url.trim());
  } catch (err) {
    console.error('Failed to save GAS URL to localStorage', err);
  }
}

/**
 * Automatisasi penghantaran Maklum Balas terus ke Google Sheet
 */
export async function syncFeedbackToGoogleSheets(entry: FeedbackEntry): Promise<boolean> {
  const url = getGasWebAppUrl();
  if (!url) {
    console.info('Google Sheets URL belum dikonfigurasi. Data disimpan dalam storan tempatan.');
    return false;
  }

  try {
    // Mode no-cors membenarkan permintaan ke Google Apps Script tanpa ralat CORS
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      mode: 'no-cors',
      body: JSON.stringify({
        action: 'submitFeedback',
        data: {
          id: entry.id,
          name: entry.name,
          email: entry.email,
          phone: entry.phone || '-',
          category: entry.category,
          subject: entry.subject,
          message: entry.message,
          createdAt: entry.createdAt
        }
      })
    });
    console.log('Maklum balas berjaya dihantar ke Google Sheets!');
    return true;
  } catch (err) {
    console.error('Gagal menghantar maklum balas ke Google Sheets:', err);
    return false;
  }
}

/**
 * Hantar permohonan kemaskini data pukal ke Google Sheets
 */
export async function syncBulkDataToGoogleSheets(payload: {
  profile?: SchoolProfile;
  staffList?: Staff[];
  newsList?: NewsItem[];
  events?: CalendarEvent[];
  gallery?: GalleryItem[];
  awards?: AwardItem[];
  documents?: DownloadDocument[];
  feedbackList?: FeedbackEntry[];
}): Promise<{ success: boolean; message: string }> {
  const url = getGasWebAppUrl();
  if (!url) {
    return {
      success: false,
      message: 'Sila masukkan URL Web App Google Apps Script terlebih dahulu!'
    };
  }

  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      mode: 'no-cors',
      body: JSON.stringify({
        action: 'syncBulkData',
        payload
      })
    });

    return {
      success: true,
      message: 'Isyarat penyelarasan data berjaya dihantar ke Google Sheets!'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Ralat penyelarasan Google Sheets: ${err?.message || 'Tidak diketahui'}`
    };
  }
}

/**
 * Muat turun data terkini secara langsung dari Google Sheets
 */
export async function fetchSchoolDataFromGoogleSheets(): Promise<any | null> {
  const url = getGasWebAppUrl();
  if (!url) return null;

  try {
    const fetchUrl = url.includes('?') ? `${url}&action=getData` : `${url}?action=getData`;
    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Status HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.warn('Gagal memuat turun data dari Google Sheets secara langsung:', err);
    return null;
  }
}

/**
 * Memetakan data dari Google Sheets ke format data aplikasi portal
 */
export function parseSchoolDataFromSheets(rawData: any): {
  events?: CalendarEvent[];
  staffList?: Staff[];
  newsList?: NewsItem[];
  profileUpdates?: Partial<SchoolProfile>;
} {
  if (!rawData || typeof rawData !== 'object') return {};

  const parsed: {
    events?: CalendarEvent[];
    staffList?: Staff[];
    newsList?: NewsItem[];
    profileUpdates?: Partial<SchoolProfile>;
  } = {};

  // 1. Takwim Sekolah
  if (Array.isArray(rawData.Takwim_Sekolah) && rawData.Takwim_Sekolah.length > 0) {
    const validEvents: CalendarEvent[] = rawData.Takwim_Sekolah
      .filter((row: any) => row.Tajuk && (row.Tarikh_Mula || row.Date))
      .map((row: any, idx: number) => ({
        id: row.ID || `evt-sheet-${idx + 1}`,
        title: row.Tajuk || row.Title || '',
        date: row.Tarikh_Mula || row.Date || '',
        endDate: row.Tarikh_Tamat || row.EndDate || undefined,
        category: (row.Kategori || 'acara').toLowerCase() as any,
        description: row.Penerangan || row.Description || '',
        location: row.Lokasi || row.Location || '',
        targetGroup: row.Kumpulan_Sasaran || row.TargetGroup || ''
      }));

    if (validEvents.length > 0) {
      parsed.events = validEvents;
    }
  }

  // 2. Warga Sekolah
  if (Array.isArray(rawData.Warga_Sekolah) && rawData.Warga_Sekolah.length > 0) {
    // Dapatkan data staf setempat sedia ada untuk mengekalkan foto tempatan jika sheet belum ada foto
    let localStaffList: Staff[] = [];
    try {
      const rawStored = localStorage.getItem('skmp_staff_v1');
      if (rawStored) {
        localStaffList = JSON.parse(rawStored);
      }
    } catch {
      // ignore
    }

    const validStaff: Staff[] = rawData.Warga_Sekolah
      .filter((row: any) => row.Nama)
      .map((row: any, idx: number) => {
        const name = (row.Nama || '').trim();
        const position = (row.Jawatan || 'Guru').trim();
        const isGuruBesar = position.toLowerCase().includes('guru besar') || name.toLowerCase().includes('norhafiza');
        const rawPhoto = (row.Foto_URL || row.PhotoUrl || '').trim();
        
        let photoUrl = rawPhoto;
        if (isGuruBesar) {
          if (!rawPhoto || rawPhoto.includes('unsplash.com') || rawPhoto.includes('1786556385385') || rawPhoto.includes('1786555771027')) {
            photoUrl = ''; // will fallback to official principal photo in component
          }
        } else {
          // Jika Google Sheets tiada foto (atau kosong), semak jika staf setempat ada foto yang telah dimuat naik
          if (!photoUrl || photoUrl === '' || photoUrl === 'null' || photoUrl === 'undefined') {
            const localMatch = localStaffList.find(
              (ls) => (row.ID && ls.id === row.ID) || (name && ls.name.toLowerCase() === name.toLowerCase())
            );
            if (localMatch && localMatch.photoUrl && !localMatch.photoUrl.includes('ui-avatars.com')) {
              photoUrl = localMatch.photoUrl;
            }
          }
        }
        
        return {
          id: row.ID || `staf-sheet-${idx + 1}`,
          name: isGuruBesar ? (name || 'Puan Norhafiza Binti Dolah') : name,
          position: isGuruBesar ? 'Guru Besar (DG48)' : position,
          category: (row.Kategori || (isGuruBesar ? 'pentadbir' : 'guru')).toLowerCase() as any,
          grade: isGuruBesar ? 'DG48' : (row.Gred || 'DG41'),
          subject: row['Subjek/Tugas'] || row.Subject || '',
          email: row['E-mel'] || row.Email || '',
          phone: row.Telefon || row.Phone || '',
          photoUrl: formatGoogleDriveUrl(photoUrl),
          order: Number(row.Susunan) || idx + 1
        };
      });

    if (validStaff.length > 0) {
      parsed.staffList = validStaff;
    }
  }

  // 3. Berita & Pengumuman
  if (Array.isArray(rawData.Berita_Pengumuman) && rawData.Berita_Pengumuman.length > 0) {
    const validNews: NewsItem[] = rawData.Berita_Pengumuman
      .filter((row: any) => row.Tajuk)
      .map((row: any, idx: number) => ({
        id: row.ID || `news-sheet-${idx + 1}`,
        title: row.Tajuk || '',
        date: row.Tarikh || new Date().toLocaleDateString('ms-MY'),
        category: (row.Kategori || 'pengumuman').toLowerCase() as any,
        summary: row.Ringkasan || '',
        content: row.Kandungan || '',
        imageUrl: getSafeNewsImageUrl(row.Gambar_URL, row.Kategori),
        author: row.Penulis || 'Pentadbiran SKMP',
        isPinned: String(row.Sematkan).toLowerCase() === 'true' || String(row.Sematkan) === '1',
        views: 100
      }));

    if (validNews.length > 0) {
      parsed.newsList = validNews;
    }
  }

  return parsed;
}

