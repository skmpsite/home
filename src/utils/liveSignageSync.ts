import { SignageSlide, SignageConfig } from '../types';
import { saveSignageSlides, saveSignageConfig } from './storage';
import { syncBulkDataToGoogleSheets } from './googleSheetsSync';

/**
 * Menyimpan dan menyiarkan perubahan slaid / video ke SEMUA peranti dan Smart TV secara serta-merta
 */
export async function broadcastLiveSignage(
  slides: SignageSlide[],
  config: SignageConfig
): Promise<{ success: boolean; error?: string }> {
  // 1. Simpan ke storan setempat & lancarkan custom event setempat
  saveSignageSlides(slides);
  saveSignageConfig(config);

  try {
    // 2. Hantar ke pelayan API Utama (/api/signage) untuk penyiaran langsung kepada semua Smart TV
    const res = await fetch('/api/signage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ slides, config })
    });

    if (!res.ok) {
      console.warn('Pelayan API signage memberi status bukan 200:', res.status);
    }
  } catch (err) {
    console.warn('Gagal menghantar kemas kini slaid ke pelayan /api/signage:', err);
  }

  // 3. Hantar salinan ke Google Sheets secara automatik di latar belakang (background sync)
  try {
    syncBulkDataToGoogleSheets({
      signageSlides: slides,
      signageConfig: config
    }).catch(e => console.warn('Latar belakang Google Sheets sync warning:', e));
  } catch (err) {
    // Abaikan ralat latar belakang Google Sheets
  }

  return { success: true };
}

/**
 * Memuat turun status slaid dan video terkini dari pelayan langsung
 */
export async function fetchLiveSignageFromServer(): Promise<{
  slides: SignageSlide[];
  config: SignageConfig;
  lastUpdated: number;
} | null> {
  try {
    const res = await fetch(`/api/signage?_t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.slides)) {
        return {
          slides: data.slides,
          config: data.config || {},
          lastUpdated: data.lastUpdated || 0
        };
      }
    }
  } catch (err) {
    console.warn('Gagal memuat turun data signage dari /api/signage:', err);
  }
  return null;
}
