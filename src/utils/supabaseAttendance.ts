import { StudentAbsenceRecord } from '../types';

export interface SupabaseAttendanceConfig {
  url: string;
  anonKey: string;
  tableName?: string;
  enabled?: boolean;
}

const SUPABASE_ATTENDANCE_CONFIG_KEY = 'skmp_supabase_attendance_config_v1';

export const DEFAULT_SUPABASE_TABLE = 'attendance_records';

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
          return {
            url: parsed.url.trim().replace(/\/+$/, ''),
            anonKey: parsed.anonKey.trim(),
            tableName: parsed.tableName || DEFAULT_SUPABASE_TABLE,
            enabled: parsed.enabled !== false
          };
        }
      }
    }
  } catch {}

  return {
    url: envUrl.trim().replace(/\/+$/, ''),
    anonKey: envKey.trim(),
    tableName: DEFAULT_SUPABASE_TABLE,
    enabled: Boolean(envUrl && envKey)
  };
}

/**
 * Simpan konfigurasi Supabase
 */
export function saveSupabaseAttendanceConfig(config: SupabaseAttendanceConfig): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        SUPABASE_ATTENDANCE_CONFIG_KEY,
        JSON.stringify({
          url: config.url.trim().replace(/\/+$/, ''),
          anonKey: config.anonKey.trim(),
          tableName: config.tableName || DEFAULT_SUPABASE_TABLE,
          enabled: config.enabled !== false
        })
      );
    }
  } catch (err) {
    console.error('Failed to save Supabase config:', err);
  }
}

/**
 * Semak sama ada Supabase telah dikonfigurasikan
 */
export function isSupabaseAttendanceConfigured(): boolean {
  const cfg = getSupabaseAttendanceConfig();
  return Boolean(cfg.url && cfg.anonKey && cfg.enabled);
}

/**
 * Uji sambungan ke Supabase
 */
export async function testSupabaseAttendanceConnection(
  urlInput?: string,
  keyInput?: string
): Promise<{ success: boolean; message: string; count?: number }> {
  const cfg = getSupabaseAttendanceConfig();
  const url = (urlInput || cfg.url || '').trim().replace(/\/+$/, '');
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
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        message: 'Sambungan ke jadual Supabase berjaya!',
        count: Array.isArray(data) ? data.length : 0
      };
    } else {
      const errText = await res.text();
      return {
        success: false,
        message: `Ralat Supabase (${res.status}): ${errText.slice(0, 150)}`
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal menyambung ke Supabase: ${err.message || String(err)}`
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

/**
 * Tarik semua rekod ketidakhadiran dari Supabase REST API
 */
export async function fetchAttendanceFromSupabase(): Promise<StudentAbsenceRecord[]> {
  const cfg = getSupabaseAttendanceConfig();
  if (!cfg.url || !cfg.anonKey || !cfg.enabled) return [];

  try {
    const table = cfg.tableName || DEFAULT_SUPABASE_TABLE;
    const endpoint = `${cfg.url}/rest/v1/${table}?select=*&order=created_at.desc&limit=500`;

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: cfg.anonKey,
        Authorization: `Bearer ${cfg.anonKey}`,
        Accept: 'application/json'
      }
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
 * Hantar satu rekod ketidakhadiran ke Supabase (Upsert / Merge)
 */
export async function pushSingleAbsenceToSupabase(record: StudentAbsenceRecord): Promise<boolean> {
  const cfg = getSupabaseAttendanceConfig();
  if (!cfg.url || !cfg.anonKey || !cfg.enabled) return false;

  try {
    const table = cfg.tableName || DEFAULT_SUPABASE_TABLE;
    const endpoint = `${cfg.url}/rest/v1/${table}`;
    const payload = recordToSupabaseRow(record);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        apikey: cfg.anonKey,
        Authorization: `Bearer ${cfg.anonKey}`,
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

  try {
    const table = cfg.tableName || DEFAULT_SUPABASE_TABLE;
    const endpoint = `${cfg.url}/rest/v1/${table}`;
    const payload = records.map(recordToSupabaseRow);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        apikey: cfg.anonKey,
        Authorization: `Bearer ${cfg.anonKey}`,
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
`;
