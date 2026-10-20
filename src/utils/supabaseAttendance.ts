import { StudentAbsenceRecord } from '../types';
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { getAbsenceRecords, saveAbsenceRecords } from './storage';

export interface SupabaseAttendanceConfig {
  url: string;
  anonKey: string;
  tableName?: string;
  enabled?: boolean;
}

const SUPABASE_ATTENDANCE_CONFIG_KEY = 'skmp_supabase_attendance_config_v1';

export const DEFAULT_SUPABASE_TABLE = 'attendance_records';

export const BUILTIN_SUPABASE_URL = 'https://gzydcfewzmlddyvpiwdh.supabase.co';
export const BUILTIN_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6eWRjZmV3em1sZGR5dnBpd2RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzNzk2OTgsImV4cCI6MjEwNzk1NTY5OH0.r3SHAUe2oElZr6LGmq-98Pp_vydjmE_-jjgJvTlSf4o';

let cachedClient: SupabaseClient | null = null;
let cachedClientKey: string = '';

/**
 * Dapatkan atau bina instans Supabase Client rasmi
 */
export function getSupabaseClient(): SupabaseClient | null {
  const cfg = getSupabaseAttendanceConfig();
  if (!cfg.url || !cfg.anonKey || !cfg.enabled) {
    return null;
  }
  const key = `${cfg.url}:::${cfg.anonKey}`;
  if (cachedClient && cachedClientKey === key) {
    return cachedClient;
  }
  try {
    cachedClient = createClient(cfg.url, cfg.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    cachedClientKey = key;
    return cachedClient;
  } catch (err) {
    console.warn('[SUPABASE] Gagal membina client:', err);
    return null;
  }
}

/**
 * Bersihkan URL Supabase agar tidak berlaku pertindihan '/rest/v1' atau trailing slash
 */
export function sanitizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim().replace(/\/+$/, '');
  url = url.replace(/\/rest\/v1\/?$/i, '');
  return url.replace(/\/+$/, '');
}

/**
 * Dapatkan konfigurasi Supabase khas untuk e-Kehadiran
 */
export function getSupabaseAttendanceConfig(): SupabaseAttendanceConfig {
  let envUrl = '';
  let envKey = '';
  try {
    envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
    envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  } catch {}

  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(SUPABASE_ATTENDANCE_CONFIG_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.url && parsed.anonKey) {
          const storedUrl = sanitizeSupabaseUrl(parsed.url) || BUILTIN_SUPABASE_URL;
          const storedKey = (parsed.anonKey || BUILTIN_SUPABASE_ANON_KEY).trim();
          return {
            url: storedUrl,
            anonKey: storedKey,
            tableName: parsed.tableName || DEFAULT_SUPABASE_TABLE,
            enabled: parsed.enabled !== false
          };
        }
      }
    }
  } catch {}

  const finalUrl = sanitizeSupabaseUrl(envUrl) || BUILTIN_SUPABASE_URL;
  const finalKey = (envKey || BUILTIN_SUPABASE_ANON_KEY).trim();

  return {
    url: finalUrl,
    anonKey: finalKey,
    tableName: DEFAULT_SUPABASE_TABLE,
    enabled: true
  };
}

import { getBackendApiUrl } from './apiConfig';

/**
 * Simpan konfigurasi Supabase (Tempatan dan Pelayan Berpusat)
 */
export function saveSupabaseAttendanceConfig(config: SupabaseAttendanceConfig): void {
  const cleanConfig = {
    url: sanitizeSupabaseUrl(config.url),
    anonKey: config.anonKey.trim(),
    tableName: config.tableName || DEFAULT_SUPABASE_TABLE,
    enabled: config.enabled !== false
  };

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        SUPABASE_ATTENDANCE_CONFIG_KEY,
        JSON.stringify(cleanConfig)
      );
    }
  } catch (err) {
    console.error('Failed to save Supabase config to localStorage:', err);
  }

  // Segerakkan ke Pelayan Express agar semua peranti (guru & waris) berkongsi tetapan Supabase yang sama
  try {
    const url = getBackendApiUrl('/api/attendance/supabase-config');
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanConfig)
    }).catch(() => {});
  } catch {}
}

/**
 * Muat turun konfigurasi Supabase dari pelayan jika belum ada dalam storan tempatan
 */
export async function syncSupabaseConfigFromServer(): Promise<SupabaseAttendanceConfig | null> {
  try {
    const url = getBackendApiUrl('/api/attendance/supabase-config');
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.success && data.config && data.config.url && data.config.anonKey) {
      const cfg: SupabaseAttendanceConfig = {
        url: sanitizeSupabaseUrl(data.config.url),
        anonKey: data.config.anonKey.trim(),
        tableName: data.config.tableName || DEFAULT_SUPABASE_TABLE,
        enabled: data.config.enabled !== false
      };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SUPABASE_ATTENDANCE_CONFIG_KEY, JSON.stringify(cfg));
      }
      return cfg;
    }
  } catch {}
  return null;
}

/**
 * Semak sama ada Supabase telah dikonfigurasikan
 */
export function isSupabaseAttendanceConfigured(): boolean {
  const cfg = getSupabaseAttendanceConfig();
  return Boolean(cfg.url && cfg.anonKey && cfg.enabled);
}

/**
 * Bina HTTP headers yang tepat untuk Supabase PostgREST API
 * Menyokong kedua-dua format JWT lama ('eyJ...') dan format baharu ('sb_publishable_...')
 */
export function buildSupabaseHeaders(key: string, custom: Record<string, string> = {}): Record<string, string> {
  const cleanKey = (key || '').trim();
  const headers: Record<string, string> = {
    apikey: cleanKey,
    Accept: 'application/json',
    ...custom
  };

  // Hanya hantar Authorization Bearer jika kunci ialah JWT yang sah (bermula dengan 'ey')
  // Mengelakkan ralat '401 Invalid JWT' jika pengguna menggunakan kunci baharu sb_publishable_
  if (cleanKey.startsWith('ey')) {
    headers['Authorization'] = `Bearer ${cleanKey}`;
  }

  return headers;
}

/**
 * Panggilan fetch selamat ke Supabase dengan sokongan dwi-format automatik
 */
async function fetchSupabaseSafe(
  url: string,
  key: string,
  options: { method?: string; headers?: Record<string, string>; body?: string } = {}
): Promise<Response> {
  const headers = buildSupabaseHeaders(key, options.headers);
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body
  });

  // Jika dapat 401 dan Authorization header ada, cuba sekali lagi dengan hanya apikey
  if (res.status === 401 && headers['Authorization']) {
    const fallbackHeaders = { ...headers };
    delete fallbackHeaders['Authorization'];
    try {
      const retryRes = await fetch(url, {
        method: options.method || 'GET',
        headers: fallbackHeaders,
        body: options.body
      });
      if (retryRes.ok) return retryRes;
    } catch {}
  }

  return res;
}

/**
 * Uji sambungan ke Supabase dengan maklum balas diagnostik yang terperinci
 */
export async function testSupabaseAttendanceConnection(
  urlInput?: string,
  keyInput?: string
): Promise<{ success: boolean; message: string; count?: number }> {
  const cfg = getSupabaseAttendanceConfig();
  const url = sanitizeSupabaseUrl(urlInput || cfg.url || '');
  const key = (keyInput || cfg.anonKey || '').trim();
  const table = cfg.tableName || DEFAULT_SUPABASE_TABLE;

  if (!url || !key) {
    return {
      success: false,
      message: 'Sila masukkan Project URL dan Anon Public Key Supabase.'
    };
  }

  try {
    const endpoint = `${url}/rest/v1/${table}?select=id&limit=1`;
    const res = await fetchSupabaseSafe(endpoint, key);

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        message: 'Sambungan ke jadual Supabase attendance_records berjaya dan aktif!',
        count: Array.isArray(data) ? data.length : 0
      };
    } else {
      const errText = await res.text();
      let friendlyError = `Ralat Supabase (${res.status}): ${errText.slice(0, 150)}`;

      if (res.status === 404 || errText.includes('42P01') || errText.includes('does not exist')) {
        friendlyError = `Pangkalan data bersambung, tetapi jadual '${table}' belum dicipta. Sila salin kod di tab 'Skrip SQL Schema' dan klik Run di Supabase SQL Editor.`;
      } else if (res.status === 401) {
        friendlyError = `Kunci API tidak sah atau salah disalin (401). Sila salin Publishable key atau anon public key dari Supabase Settings -> API.`;
      } else if (res.status === 403) {
        friendlyError = `Akses disekat oleh polisi keselamatan RLS (403). Sila pastikan anda telah menjalankan skrip SQL yang disertakan untuk memberi kebenaran baca/tulis.`;
      }

      return {
        success: false,
        message: friendlyError
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal menyambung ke Supabase (${url}): ${err.message || String(err)}. Sila semak Project URL.`
    };
  }
}

/**
 * Tukar StudentAbsenceRecord ke format kolum Supabase
 */
function recordToSupabaseRow(r: StudentAbsenceRecord) {
  return {
    id: r.id,
    ref_no: r.refNo,
    student_id: r.studentId,
    student_name: r.studentName,
    student_ic: r.studentIc || '-',
    year: r.year,
    class_name: r.className,
    date_from: r.dateFrom,
    date_to: r.dateTo,
    days_count: Number(r.daysCount) || 1,
    reason_category: r.reasonCategory,
    reason_details: r.reasonDetails || '',
    parent_name: r.parentName,
    parent_phone: r.parentPhone,
    parent_relationship: r.parentRelationship || 'Waris',
    attachment_url: r.attachmentUrl || '',
    attachment_name: r.attachmentName || '',
    status: r.status || 'disahkan',
    verified_by: r.verifiedBy || 'Waris Murid (Borang Atas Talian)',
    verified_at: r.verifiedAt || new Date().toISOString(),
    created_at: r.createdAt || new Date().toISOString(),
    updated_at: r.updatedAt || new Date().toISOString()
  };
}

/**
 * Tukar row Supabase ke StudentAbsenceRecord
 */
function supabaseRowToRecord(row: any): StudentAbsenceRecord {
  return {
    id: String(row.id || ''),
    refNo: String(row.ref_no || row.refNo || ''),
    studentId: String(row.student_id || row.studentId || ''),
    studentName: String(row.student_name || row.studentName || ''),
    studentIc: String(row.student_ic || row.studentIc || '-'),
    year: String(row.year || ''),
    className: String(row.class_name || row.className || ''),
    dateFrom: String(row.date_from || row.dateFrom || ''),
    dateTo: String(row.date_to || row.dateTo || row.date_from || ''),
    daysCount: Number(row.days_count || row.daysCount) || 1,
    reasonCategory: (row.reason_category || row.reasonCategory || 'lain') as any,
    reasonDetails: String(row.reason_details || row.reasonDetails || ''),
    parentName: String(row.parent_name || row.parentName || ''),
    parentPhone: String(row.parent_phone || row.parentPhone || ''),
    parentRelationship: String(row.parent_relationship || row.parentRelationship || 'Waris'),
    attachmentUrl: String(row.attachment_url || row.attachmentUrl || ''),
    attachmentName: String(row.attachment_name || row.attachmentName || ''),
    status: (row.status || 'disahkan') as any,
    verifiedBy: String(row.verified_by || row.verifiedBy || ''),
    verifiedAt: String(row.verified_at || row.verifiedAt || ''),
    createdAt: String(row.created_at || row.createdAt || ''),
    updatedAt: String(row.updated_at || row.updatedAt || '')
  };
}

let activeRealtimeChannel: RealtimeChannel | null = null;

/**
 * Langgan kemas kini masa nyata (Realtime WebSocket) daripada Supabase
 * Apabila waris menghantar borang di mana-mana peranti, acara ini akan diterima serta-merta (< 100ms)
 */
export function subscribeToSupabaseAttendanceRealtime(
  onUpdate: (records: StudentAbsenceRecord[]) => void
): () => void {
  const client = getSupabaseClient();
  const cfg = getSupabaseAttendanceConfig();
  if (!client || !cfg.enabled) {
    return () => {};
  }

  const table = cfg.tableName || DEFAULT_SUPABASE_TABLE;

  try {
    if (activeRealtimeChannel) {
      try {
        client.removeChannel(activeRealtimeChannel);
      } catch {}
    }

    const channel = client
      .channel('attendance_live_stream_' + Date.now())
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        async (payload) => {
          console.log('[SUPABASE REALTIME EVENT]', payload.eventType, payload.new || payload.old);
          try {
            // 1. Tindak balas pantas (< 50ms) menggunakan data daripada acara masa nyata terus ke UI
            if (payload.new && (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE')) {
              const newRec = supabaseRowToRecord(payload.new);
              if (newRec && newRec.id) {
                const current = getAbsenceRecords();
                const mergedNow = [newRec, ...current.filter((r) => r.id !== newRec.id)];
                saveAbsenceRecords(mergedNow, true, false);
                onUpdate(mergedNow);
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('skmp_attendance_synced', { detail: mergedNow }));
                }
              }
            } else if (payload.old && payload.eventType === 'DELETE') {
              const oldId = String((payload.old as any).id || '');
              if (oldId) {
                const current = getAbsenceRecords();
                const filtered = current.filter((r) => r.id !== oldId);
                saveAbsenceRecords(filtered, true, false);
                onUpdate(filtered);
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('skmp_attendance_synced', { detail: filtered }));
                }
              }
            }
          } catch (e) {
            console.warn('[SUPABASE REALTIME] Error processing instant payload:', e);
          }

          // 2. Muat turun senarai penuh secara langsung dari Supabase untuk jaminan 100% konsistensi
          try {
            const latestRecords = await fetchAttendanceFromSupabase();
            if (latestRecords && latestRecords.length > 0) {
              onUpdate(latestRecords);
            }
          } catch (err) {
            console.warn('[SUPABASE REALTIME] Error fetching fresh list:', err);
          }
        }
      )
      .subscribe((status) => {
        console.log('[SUPABASE REALTIME STATUS]', status);
      });

    activeRealtimeChannel = channel;

    return () => {
      try {
        client.removeChannel(channel);
      } catch {}
    };
  } catch (err) {
    console.warn('[SUPABASE REALTIME] Langganan ralat:', err);
    return () => {};
  }
}

/**
 * Tarik semua rekod ketidakhadiran dari Supabase secara langsung & pantas
 */
export async function fetchAttendanceFromSupabase(): Promise<StudentAbsenceRecord[]> {
  const cfg = getSupabaseAttendanceConfig();
  if (!cfg.url || !cfg.anonKey || !cfg.enabled) return [];

  const table = cfg.tableName || DEFAULT_SUPABASE_TABLE;
  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client
        .from(table)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (!error && Array.isArray(data)) {
        return data.map(supabaseRowToRecord);
      }
    } catch (err) {
      console.warn('[SUPABASE ATTENDANCE] Client fetch warning, falling back to REST:', err);
    }
  }

  try {
    const endpoint = `${cfg.url}/rest/v1/${table}?select=*&order=created_at.desc&limit=1000`;
    const res = await fetchSupabaseSafe(endpoint, cfg.anonKey, {
      method: 'GET'
    });

    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows)) {
        return rows.map(supabaseRowToRecord);
      }
    }
  } catch (err) {
    console.warn('[SUPABASE ATTENDANCE] Gagal mengambil rekod:', err);
  }

  return [];
}

/**
 * Hantar satu rekod ketidakhadiran ke Supabase secara langsung & pantas (Upsert / Merge)
 */
export async function pushSingleAbsenceToSupabase(record: StudentAbsenceRecord): Promise<boolean> {
  const cfg = getSupabaseAttendanceConfig();
  if (!cfg.url || !cfg.anonKey || !cfg.enabled) return false;

  const table = cfg.tableName || DEFAULT_SUPABASE_TABLE;
  const payload = recordToSupabaseRow(record);
  const client = getSupabaseClient();

  if (client) {
    try {
      const { error } = await client
        .from(table)
        .upsert(payload, { onConflict: 'id' });
      if (!error) return true;
      console.warn('[SUPABASE ATTENDANCE] Client upsert warning, fallback REST:', error);
    } catch (err) {
      console.warn('[SUPABASE ATTENDANCE] Client upsert exception:', err);
    }
  }

  try {
    const endpoint = `${cfg.url}/rest/v1/${table}`;
    const res = await fetchSupabaseSafe(endpoint, cfg.anonKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates'
      },
      body: JSON.stringify(payload)
    });

    return res.ok;
  } catch (err) {
    console.warn('[SUPABASE ATTENDANCE] Gagal menolak rekod individu:', err);
    return false;
  }
}

/**
 * Hantar rekod ketidakhadiran secara pukal ke Supabase
 */
export async function pushBulkAbsenceToSupabase(records: StudentAbsenceRecord[]): Promise<boolean> {
  const cfg = getSupabaseAttendanceConfig();
  if (!cfg.url || !cfg.anonKey || !cfg.enabled || !records.length) return false;

  const table = cfg.tableName || DEFAULT_SUPABASE_TABLE;
  const validRecords = records.filter((r) => r && r.id && r.dateFrom);
  const payload = validRecords.map(recordToSupabaseRow);
  const client = getSupabaseClient();

  if (client) {
    try {
      const { error } = await client
        .from(table)
        .upsert(payload, { onConflict: 'id' });
      if (!error) return true;
      console.warn('[SUPABASE ATTENDANCE] Bulk client upsert warning, fallback REST:', error);
    } catch (err) {
      console.warn('[SUPABASE ATTENDANCE] Bulk client upsert exception:', err);
    }
  }

  try {
    const endpoint = `${cfg.url}/rest/v1/${table}`;
    const res = await fetchSupabaseSafe(endpoint, cfg.anonKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates'
      },
      body: JSON.stringify(payload)
    });

    return res.ok;
  } catch (err) {
    console.warn('[SUPABASE ATTENDANCE] Gagal menolak rekod pukal:', err);
    return false;
  }
}

/**
 * Padam satu rekod ketidakhadiran dari Supabase
 */
export async function deleteAbsenceFromSupabase(id: string): Promise<boolean> {
  const cfg = getSupabaseAttendanceConfig();
  if (!cfg.url || !cfg.anonKey || !cfg.enabled || !id) return false;

  const table = cfg.tableName || DEFAULT_SUPABASE_TABLE;
  const client = getSupabaseClient();

  if (client) {
    try {
      const { error } = await client.from(table).delete().eq('id', id);
      if (!error) return true;
    } catch {}
  }

  try {
    const endpoint = `${cfg.url}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`;
    const res = await fetchSupabaseSafe(endpoint, cfg.anonKey, {
      method: 'DELETE'
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Skrip SQL yang sedia disalin ke dalam Supabase SQL Editor
 */
export const SUPABASE_ATTENDANCE_SQL_SCHEMA = `-- ================================================================
-- SKRIP STRUKTUR JADUAL E-KEHADIRAN UNTUK SUPABASE POSTGRESQL
-- Salin dan tampal keseluruhan skrip ini ke dalam Supabase SQL Editor:
-- ================================================================

CREATE TABLE IF NOT EXISTS public.attendance_records (
  id TEXT PRIMARY KEY,
  ref_no TEXT,
  student_id TEXT,
  student_name TEXT NOT NULL,
  student_ic TEXT DEFAULT '-',
  year TEXT,
  class_name TEXT,
  date_from TEXT NOT NULL,
  date_to TEXT NOT NULL,
  days_count INTEGER DEFAULT 1,
  reason_category TEXT DEFAULT 'lain',
  reason_details TEXT DEFAULT '',
  parent_name TEXT,
  parent_phone TEXT,
  parent_relationship TEXT DEFAULT 'Waris',
  attachment_url TEXT DEFAULT '',
  attachment_name TEXT DEFAULT '',
  status TEXT DEFAULT 'disahkan',
  verified_by TEXT DEFAULT 'Waris Murid (Borang Atas Talian)',
  verified_at TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks untuk kelajuan carian tarikh & kelas
CREATE INDEX IF NOT EXISTS idx_attendance_dates ON public.attendance_records (date_from, date_to);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance_records (student_id);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- 1. Polisi: Benarkan sesiapa membaca rekod kehadiran (Portal Awam & Guru)
DROP POLICY IF EXISTS "Public Read Attendance" ON public.attendance_records;
CREATE POLICY "Public Read Attendance" 
ON public.attendance_records FOR SELECT 
USING (true);

-- 2. Polisi: Benarkan waris memasukkan makluman kehadiran baru
DROP POLICY IF EXISTS "Public Insert Attendance" ON public.attendance_records;
CREATE POLICY "Public Insert Attendance" 
ON public.attendance_records FOR INSERT 
WITH CHECK (true);

-- 3. Polisi: Benarkan kemaskini atau pengesahan rekod
DROP POLICY IF EXISTS "Public Update Attendance" ON public.attendance_records;
CREATE POLICY "Public Update Attendance" 
ON public.attendance_records FOR UPDATE 
USING (true);

-- 4. Polisi: Benarkan pentadbir memadam rekod
DROP POLICY IF EXISTS "Public Delete Attendance" ON public.attendance_records;
CREATE POLICY "Public Delete Attendance" 
ON public.attendance_records FOR DELETE 
USING (true);
`;
