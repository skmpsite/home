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
import { sortStaffBySeniority } from './staffHelpers';

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
    const separator = url.includes('?') ? '&' : '?';
    const fetchUrl = `${url}${separator}action=getData&_t=${Date.now()}`;
    const response = await fetch(fetchUrl, {
      method: 'GET',
      cache: 'no-store',
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
      .filter((row: any) => {
        const title = row['Tajuk Acara'] || row.Tajuk || row.Title;
        const date = row.Mula || row.Tarikh_Mula || row.Date || row.StartDate;
        return title && date;
      })
      .map((row: any, idx: number) => {
        const title = row['Tajuk Acara'] || row.Tajuk || row.Title || '';
        let date = row.Mula || row.Tarikh_Mula || row.Date || row.StartDate || '';
        let endDate = row.Tamat || row.Tarikh_Tamat || row.EndDate || undefined;

        // Bersihkan format tarikh jika ISO string
        if (typeof date === 'string' && date.includes('T')) {
          date = date.split('T')[0];
        }
        if (typeof endDate === 'string' && endDate.includes('T')) {
          endDate = endDate.split('T')[0];
        }

        const category = (
          row['Kategori (akademik/kokurikulum/hemal/rasmi)'] ||
          row.Kategori ||
          'acara'
        ).toLowerCase();

        return {
          id: row.ID || `evt-sheet-${idx + 1}`,
          title,
          date,
          endDate: endDate || undefined,
          category: category as any,
          description: row.Catatan || row.Penerangan || row.Description || '',
          location: row.Lokasi || row.Location || '',
          targetGroup: row.Sasaran || row.Kumpulan_Sasaran || row.TargetGroup || ''
        };
      });

    if (validEvents.length > 0) {
      parsed.events = validEvents;
    }
  }

  // 2. Warga Sekolah
  if (Array.isArray(rawData.Warga_Sekolah) && rawData.Warga_Sekolah.length > 0) {
    // Dapatkan data staf dan profil setempat sedia ada untuk mengekalkan maklumat tempatan
    let localStaffList: Staff[] = [];
    let localProfile: SchoolProfile | null = null;
    try {
      const rawStored = localStorage.getItem('skmp_staff_v1');
      if (rawStored) {
        localStaffList = JSON.parse(rawStored);
      }
      const rawProfile = localStorage.getItem('skmp_profile_v1');
      if (rawProfile) {
        localProfile = JSON.parse(rawProfile);
      }
    } catch {
      // ignore
    }

    const validStaff: Staff[] = rawData.Warga_Sekolah
      .filter((row: any) => row.Nama || row.Name)
      .map((row: any, idx: number) => {
        const name = (row.Nama || row.Name || '').trim();
        const position = (row.Jawatan || row.Position || 'Guru').trim();
        const isGuruBesar =
          position.toLowerCase().includes('guru besar') ||
          name.toLowerCase().includes('norhafiza') ||
          (row.ID && row.ID === 'staf-1');
        
        // Baca foto dari pelbagai nama kolum yang mungkin wujud dalam Google Sheets
        const rawPhoto = (
          row['Gambar URL'] ||
          row['Foto URL / Link Google Drive'] ||
          row['Foto_URL'] ||
          row['Foto URL'] ||
          row.Foto_URL ||
          row.Gambar_URL ||
          row.PhotoUrl ||
          row.photoUrl ||
          row.Gambar ||
          row.Foto ||
          ''
        ).trim();
        
        let photoUrl = rawPhoto;

        // Semak sekiranya foto kosong dari sheet, ambil daripada simpanan tempatan jika ada
        if (!photoUrl || photoUrl === '' || photoUrl === 'null' || photoUrl === 'undefined') {
          if (isGuruBesar) {
            const localGb = localStaffList.find(
              (ls) => ls.id === 'staf-1' || ls.position.toLowerCase().includes('guru besar') || ls.name.toLowerCase().includes('norhafiza')
            );
            if (localGb && localGb.photoUrl && !localGb.photoUrl.includes('ui-avatars.com')) {
              photoUrl = localGb.photoUrl;
            } else if (localProfile && localProfile.principalPhotoUrl) {
              photoUrl = localProfile.principalPhotoUrl;
            }
          } else {
            const localMatch = localStaffList.find(
              (ls) => (row.ID && ls.id === row.ID) || (name && ls.name.toLowerCase() === name.toLowerCase())
            );
            if (localMatch && localMatch.photoUrl && !localMatch.photoUrl.includes('ui-avatars.com')) {
              photoUrl = localMatch.photoUrl;
            }
          }
        }

        const categoryRaw = (row['Kategori (pentadbiran/guru/akp)'] || row.Kategori || (isGuruBesar ? 'pentadbir' : 'guru')).toLowerCase();
        let normalizedCategory: 'pentadbir' | 'guru' | 'akp' = 'guru';
        if (categoryRaw.includes('pentadbir') || categoryRaw.includes('admin') || isGuruBesar) {
          normalizedCategory = 'pentadbir';
        } else if (categoryRaw.includes('akp') || categoryRaw.includes('staf sokongan')) {
          normalizedCategory = 'akp';
        }

        const grade = isGuruBesar ? 'DG48' : (row.Gred || row['Sub Kategori'] || row.Grade || 'DG41');
        const subject = row['Subjek/Tugas'] || row['Subjek'] || row.Subject || row['Tugas'] || (isGuruBesar ? 'Pengurusan & Pentadbiran' : '');
        const email = row['E-mel DELIMa'] || row['E-mel'] || row.Email || row['Emel'] || '';
        const phone = row.Telefon || row.Phone || '';
        
        return {
          id: row.ID || (isGuruBesar ? 'staf-1' : `staf-sheet-${idx + 1}`),
          name: isGuruBesar ? (name || (localProfile?.principalName) || 'Puan Norhafiza Binti Dolah') : name,
          position: isGuruBesar ? (position || 'Guru Besar (DG48)') : position,
          category: normalizedCategory,
          grade,
          subject,
          email,
          phone,
          photoUrl: formatGoogleDriveUrl(photoUrl),
          order: isGuruBesar ? 1 : (Number(row.Susunan || row.Order) || idx + 2)
        };
      });

    // Pastikan Guru Besar sentiasa dikekalkan sekiranya tiada baris Guru Besar dalam helaian Google Sheet
    const hasGuruBesarInValidStaff = validStaff.some(
      (s) => s.position.toLowerCase().includes('guru besar') || s.id === 'staf-1' || s.name.toLowerCase().includes('norhafiza')
    );

    if (!hasGuruBesarInValidStaff) {
      const localGb = localStaffList.find(
        (ls) => ls.id === 'staf-1' || ls.position.toLowerCase().includes('guru besar') || ls.name.toLowerCase().includes('norhafiza')
      );

      const gbEntry: Staff = {
        id: 'staf-1',
        name: localGb?.name || localProfile?.principalName || 'Puan Norhafiza Binti Dolah',
        position: localGb?.position || localProfile?.principalTitle || 'Guru Besar (DG48)',
        category: 'pentadbir',
        grade: 'DG48',
        subject: localGb?.subject || 'Pengurusan & Pentadbiran',
        email: localGb?.email || 'norhafiza.skmp@moe-dl.edu.my',
        phone: localGb?.phone || '019-456 7890',
        photoUrl: localGb?.photoUrl || localProfile?.principalPhotoUrl || '',
        order: 1
      };
      validStaff.unshift(gbEntry);
    }

    if (validStaff.length > 0) {
      parsed.staffList = sortStaffBySeniority(validStaff, localProfile || undefined);
    }
  }

  // 3. Berita & Pengumuman
  if (Array.isArray(rawData.Berita_Pengumuman) && rawData.Berita_Pengumuman.length > 0) {
    const validNews: NewsItem[] = rawData.Berita_Pengumuman
      .filter((row: any) => row.Tajuk || row.Title)
      .map((row: any, idx: number) => {
        const isPinned = row['Diutamakan (TRUE/FALSE)'] !== undefined
          ? String(row['Diutamakan (TRUE/FALSE)']).toLowerCase() === 'true'
          : String(row.Sematkan).toLowerCase() === 'true' || String(row.Sematkan) === '1';

        const rawImg = row['Gambar URL'] || row.Gambar_URL || row.ImageUrl || row.photoUrl || '';

        return {
          id: row.ID || `news-sheet-${idx + 1}`,
          title: row.Tajuk || row.Title || '',
          date: row.Tarikh || row.Date || new Date().toLocaleDateString('ms-MY'),
          category: (row.Kategori || row.Category || 'pengumuman').toLowerCase() as any,
          summary: row.Ringkasan || row.Summary || '',
          content: row.Kandungan || row.Content || '',
          imageUrl: getSafeNewsImageUrl(rawImg, row.Kategori),
          author: row.Penulis || row.Author || 'Pentadbiran SKMP',
          isPinned,
          views: 100
        };
      });

    if (validNews.length > 0) {
      parsed.newsList = validNews;
    }
  }

  // 4. Profil Sekolah (Key-Value format dari Sheet)
  if (Array.isArray(rawData.Profil_Sekolah) && rawData.Profil_Sekolah.length > 0) {
    const profileUpdates: Partial<SchoolProfile> = {};
    rawData.Profil_Sekolah.forEach((row: any) => {
      const key = (row['Kod Sekolah'] || row.Key || row.Kunci || row.key || '').trim().toLowerCase();
      const val = (row['Nama Sekolah'] || row.Value || row.Nilai || row.value || '').trim();

      if (!key || !val) return;

      if (key === 'nama_sekolah' || key === 'nama') profileUpdates.name = val;
      else if (key === 'kod_sekolah' || key === 'kod') profileUpdates.code = val;
      else if (key === 'alamat') profileUpdates.address = val;
      else if (key === 'telefon' || key === 'tel') profileUpdates.phone = val;
      else if (key === 'email' || key === 'e-mel') profileUpdates.email = val;
      else if (key === 'guru_besar') profileUpdates.principalName = val;
      else if (key === 'jawatan_guru_besar' || key === 'jawatan') profileUpdates.principalTitle = val;
      else if (key === 'foto_guru_besar' || key === 'gambar_guru_besar') profileUpdates.principalPhotoUrl = formatGoogleDriveUrl(val);
      else if (key === 'perutusan_guru_besar' || key === 'perutusan') profileUpdates.principalSpeech = val;
      else if (key === 'motto') profileUpdates.motto = val;
      else if (key === 'visi') profileUpdates.vision = val;
      else if (key === 'misi') profileUpdates.mission = val;
    });

    if (Object.keys(profileUpdates).length > 0) {
      parsed.profileUpdates = profileUpdates;
    }
  }

  return parsed;
}

