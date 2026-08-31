import {
  SchoolProfile,
  Staff,
  NewsItem,
  CalendarEvent,
  GalleryItem,
  AwardItem,
  DownloadDocument,
  FeedbackEntry,
  SignageSlide,
  SignageConfig,
  TeacherLinkItem
} from '../types';
import { DEFAULT_GAS_URL } from '../config';
import { initialTeacherLinks } from '../data/initialData';
import { getSafeNewsImageUrl, formatGoogleDriveUrl } from './imageHelpers';
import { sortStaffBySeniority } from './staffHelpers';
import { extractYouTubeId, getYouTubeThumbnail, isVideoUrl } from './signageMediaHelpers';

const GAS_URL_KEY = 'skmp_gas_url_v1';

export function getGasWebAppUrl(): string {
  try {
    // 1. Check URL query parameters (?gas= or ?gasUrl=) so TV links can carry the custom script URL directly
    if (typeof window !== 'undefined' && window.location?.search) {
      const params = new URLSearchParams(window.location.search);
      const gasParam = params.get('gas') || params.get('gasUrl') || params.get('gas_url');
      if (gasParam && gasParam.trim().startsWith('http')) {
        const cleanUrl = decodeURIComponent(gasParam.trim());
        localStorage.setItem(GAS_URL_KEY, cleanUrl);
        return cleanUrl;
      }
    }
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
  signageSlides?: SignageSlide[];
  signageConfig?: SignageConfig;
  teacherLinks?: TeacherLinkItem[];
}): Promise<{ success: boolean; message: string }> {
  const url = getGasWebAppUrl();
  if (!url) {
    return {
      success: false,
      message: 'Sila masukkan URL Web App Google Apps Script terlebih dahulu!'
    };
  }

  try {
    // 1. Cuba kaedah POST dengan payload JSON
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

    // 2. Jika payload mengandungi signageSlides, buat panggilan sandaran GET untuk memastikan Google Apps Script mengemaskini Google Sheets
    if (payload.signageSlides || payload.signageConfig) {
      try {
        const compactSignage = {
          signageSlides: payload.signageSlides,
          signageConfig: payload.signageConfig
        };
        const encoded = encodeURIComponent(JSON.stringify(compactSignage));
        const separator = url.includes('?') ? '&' : '?';
        const getSyncUrl = `${url}${separator}action=syncSignage&payload=${encoded}&_t=${Date.now()}`;
        fetch(getSyncUrl, { method: 'GET', mode: 'no-cors', cache: 'no-store' }).catch(() => {});
      } catch (e) {
        // Abaikan ralat fallback
      }
    }

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
  signageSlides?: SignageSlide[];
  signageConfig?: Partial<SignageConfig>;
  teacherLinks?: TeacherLinkItem[];
} {
  if (!rawData || typeof rawData !== 'object') return {};

  const parsed: {
    events?: CalendarEvent[];
    staffList?: Staff[];
    newsList?: NewsItem[];
    profileUpdates?: Partial<SchoolProfile>;
    signageSlides?: SignageSlide[];
    signageConfig?: Partial<SignageConfig>;
    teacherLinks?: TeacherLinkItem[];
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

  // 5. Slaid Digital Signage (Smart TV)
  if (Array.isArray(rawData.Signage_Digital) && rawData.Signage_Digital.length > 0) {
    const validSlides: SignageSlide[] = rawData.Signage_Digital
      .filter((row: any) => row.Tajuk || row.Title || row['URL_Media'] || row['URL_YouTube'] || row['URL_Video'])
      .map((row: any, idx: number) => {
        const rawYtUrl = String(row['URL_YouTube'] || row.YoutubeUrl || row.youtubeUrl || '').trim();
        const rawVidUrl = String(row['URL_Video'] || row.VideoUrl || row.videoUrl || '').trim();
        const rawImgUrl = String(row['URL_Media'] || row.ImageUrl || row.imageUrl || '').trim();
        const explicitYid = String(row['YouTube_ID'] || row.YoutubeId || row.youtubeId || '').trim();

        // Extract YouTube ID from any field if present
        const detectedYid =
          explicitYid ||
          extractYouTubeId(rawYtUrl) ||
          extractYouTubeId(rawVidUrl) ||
          extractYouTubeId(rawImgUrl) ||
          null;

        const mediaTypeRaw = String(row['Jenis_Media'] || row.MediaType || row.mediaType || '').toLowerCase();
        let mediaType: 'image' | 'video' | 'youtube' = 'image';
        if (detectedYid) {
          mediaType = 'youtube';
        } else if (mediaTypeRaw.includes('video') || isVideoUrl(rawVidUrl) || isVideoUrl(rawImgUrl)) {
          mediaType = 'video';
        } else {
          mediaType = 'image';
        }

        const isMutedStr = String(row['Status_Mute'] || row.isMuted || 'false').toLowerCase();
        const isMuted = isMutedStr === 'true' || isMutedStr === '1';

        const useVidDurStr = String(row['Guna_Durasi_Video'] || row.useVideoDuration || 'true').toLowerCase();
        const useVideoDuration = useVidDurStr !== 'false' && useVidDurStr !== '0';

        const isActiveStr = String(row['Aktif'] || row.isActive || 'true').toLowerCase();
        const isActive = isActiveStr !== 'false' && isActiveStr !== '0';

        const effectiveImgUrl = rawImgUrl
          ? formatGoogleDriveUrl(rawImgUrl)
          : detectedYid
          ? getYouTubeThumbnail(detectedYid)
          : '';

        const effectiveYoutubeUrl = detectedYid
          ? rawYtUrl || `https://www.youtube.com/watch?v=${detectedYid}`
          : undefined;

        return {
          id: row.ID || `signage-slide-${idx + 1}`,
          title: row.Tajuk || row.Title || 'Slaid Sekolah',
          subtitle: row.Subtajuk || row.Subtitle || '',
          mediaType,
          imageUrl: effectiveImgUrl,
          videoUrl: mediaType === 'video' ? formatGoogleDriveUrl(rawVidUrl || rawImgUrl) : '',
          youtubeUrl: effectiveYoutubeUrl,
          youtubeId: detectedYid || undefined,
          durationSeconds: Number(row['Durasi_Saat'] || row.durationSeconds) || (mediaType === 'youtube' ? 30 : 8),
          useVideoDuration,
          isMuted,
          isActive,
          category: (row.Kategori || row.category || 'pengumuman') as any,
          order: Number(row.Susunan || row.order) || (idx + 1),
          createdAt: row['Tarikh_Cipta'] || row.createdAt || new Date().toISOString().split('T')[0]
        };
      });

    if (validSlides.length > 0) {
      parsed.signageSlides = validSlides.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  }

  // 6. Konfigurasi Signage
  if (Array.isArray(rawData.Konfigurasi_Signage) && rawData.Konfigurasi_Signage.length > 0) {
    const configUpdates: Partial<SignageConfig> = {};
    rawData.Konfigurasi_Signage.forEach((row: any) => {
      const key = (row.Kunci || row.Key || row.key || '').trim().toLowerCase();
      const val = (row.Nilai || row.Value || row.value || '').trim();

      if (!key || !val) return;

      if (key === 'default_duration') configUpdates.defaultDuration = Number(val) || 8;
      else if (key === 'auto_play') configUpdates.autoPlay = val.toLowerCase() === 'true';
      else if (key === 'auto_enable_audio') configUpdates.autoEnableAudio = val.toLowerCase() === 'true';
      else if (key === 'show_clock') configUpdates.showClock = val.toLowerCase() === 'true';
      else if (key === 'show_marquee') configUpdates.showMarquee = val.toLowerCase() === 'true';
      else if (key === 'marquee_text') configUpdates.marqueeText = val;
      else if (key === 'show_weather_badge') configUpdates.showWeatherBadge = val.toLowerCase() === 'true';
      else if (key === 'theme') configUpdates.theme = val as any;
    });

    if (Object.keys(configUpdates).length > 0) {
      parsed.signageConfig = configUpdates;
    }
  }

  // 7. Pautan Guru / Portal Portfolio
  const teacherRows = rawData.Pautan_Guru || rawData.Teacher_Links || rawData.PautanGuru;
  if (Array.isArray(teacherRows) && teacherRows.length > 0) {
    const validTeacherLinks: TeacherLinkItem[] = teacherRows
      .filter((row: any) => (row.Tajuk || row.Title || row.title) && (row.Pautan || row.URL || row.url))
      .map((row: any, idx: number) => {
        let cat = (row.Kategori || row.Category || row.category || 'kurikulum').toLowerCase().trim();
        if (!['kurikulum', 'hem', 'kokurikulum', 'umum'].includes(cat)) {
          if (cat.includes('koku')) cat = 'kokurikulum';
          else if (cat.includes('hem') || cat.includes('murid')) cat = 'hem';
          else if (cat.includes('umum') || cat.includes('pentadbiran')) cat = 'umum';
          else cat = 'kurikulum';
        }

        let url = (row.Pautan || row.URL || row.url || '').trim();
        if (url && !url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('#')) {
          url = `https://${url}`;
        }

        return {
          id: row.ID || row.id || `tlink-sheet-${idx + 1}`,
          title: row.Tajuk || row.Title || row.title,
          category: cat as any,
          url: url || '#',
          description: row.Penerangan || row.Description || row.description || '',
          badge: row.Lencana || row.Badge || row.badge || '',
          iconName: row.Ikon || row.IconName || row.iconName || 'Globe',
          order: Number(row.Susunan || row.Order || row.order) || (idx + 1)
        };
      });

    if (validTeacherLinks.length > 0) {
      // Ensure the Student Database & Search Portal link is preserved across all devices
      const hasStudentPortal = validTeacherLinks.some(
        (l) =>
          l.id === 'tlink-h-carian' ||
          l.title.toLowerCase().includes('carian murid') ||
          l.url.includes('1eODYEpiGFEVRe6RjoxZrPX3bPXpGYOR7l9PaGi8EKEo')
      );

      if (!hasStudentPortal) {
        const studentPortalLink = initialTeacherLinks.find(
          (l) => l.id === 'tlink-h-carian' || l.url.includes('1eODYEpiGFEVRe6RjoxZrPX3bPXpGYOR7l9PaGi8EKEo')
        ) || {
          id: 'tlink-h-carian',
          title: 'Portal Senarai & Carian Murid (Google Sheets)',
          category: 'hem' as const,
          url: 'https://docs.google.com/spreadsheets/d/1eODYEpiGFEVRe6RjoxZrPX3bPXpGYOR7l9PaGi8EKEo/edit?usp=drive_link',
          description:
            'Portal carian maklumat lengkap 375 orang murid SKMP (Profil APDM, Kelas, Maklumat Ibu Bapa/Penjaga, No. Telefon & Alamat dari Google Sheets).',
          badge: 'Pangkalan Data Murid',
          iconName: 'Search',
          order: 7
        };

        const hemIndex = validTeacherLinks.findIndex((l) => l.category === 'hem');
        if (hemIndex !== -1) {
          validTeacherLinks.splice(hemIndex, 0, studentPortalLink);
        } else {
          validTeacherLinks.push(studentPortalLink);
        }
      }

      parsed.teacherLinks = validTeacherLinks.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  }

  return parsed;
}

