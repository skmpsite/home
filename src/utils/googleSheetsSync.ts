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

const GAS_URL_KEY = 'skmp_gas_url_v1';

export function getGasWebAppUrl(): string {
  try {
    return localStorage.getItem(GAS_URL_KEY) || '';
  } catch (err) {
    console.warn('Failed to read GAS URL from localStorage', err);
    return '';
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
