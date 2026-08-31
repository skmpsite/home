import { FullStudentRecord } from '../types';
import { initialStudentsData } from '../data/studentsData';

export const GOOGLE_SHEET_STUDENTS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1eODYEpiGFEVRe6RjoxZrPX3bPXpGYOR7l9PaGi8EKEo/gviz/tq?tqx=out:csv';

export const GOOGLE_SHEET_STUDENTS_EDIT_URL =
  'https://docs.google.com/spreadsheets/d/1eODYEpiGFEVRe6RjoxZrPX3bPXpGYOR7l9PaGi8EKEo/edit?usp=drive_link';

const CACHE_KEY_STUDENTS = 'skmp_sheet_students_detailed_v1';
const CACHE_KEY_TIME = 'skmp_sheet_students_timestamp_v1';
const CACHE_KEY_PHOTOS = 'skmp_student_photos_v1';

export function getLocalStudentPhotos(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PHOTOS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to load local student photos', err);
  }
  return {};
}

export function saveLocalStudentPhoto(studentKey: string, photoUrl: string): void {
  try {
    const photos = getLocalStudentPhotos();
    photos[studentKey] = photoUrl;
    localStorage.setItem(CACHE_KEY_PHOTOS, JSON.stringify(photos));

    // Also update student in cached list if present
    const cachedStudents = getCachedDetailedStudents();
    const updated = cachedStudents.map((s) => {
      if (s.id === studentKey || s.studentId === studentKey || s.ic === studentKey) {
        return { ...s, photoUrl };
      }
      return s;
    });
    localStorage.setItem(CACHE_KEY_STUDENTS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save local student photo', err);
  }
}

/**
 * Syncs student photo directly to Google Sheets via Google Apps Script Web App
 */
export async function syncStudentPhotoToGoogleSheets(
  student: FullStudentRecord,
  photoDataUrl: string
): Promise<{ success: boolean; message: string }> {
  // First persist in local cache
  const primaryKey = student.studentId || student.ic || student.id;
  saveLocalStudentPhoto(primaryKey, photoDataUrl);
  if (student.ic && student.ic !== primaryKey) {
    saveLocalStudentPhoto(student.ic, photoDataUrl);
  }
  if (student.id && student.id !== primaryKey) {
    saveLocalStudentPhoto(student.id, photoDataUrl);
  }

  // Attempt Google Apps Script sync
  try {
    const gasUrl = localStorage.getItem('skmp_gas_url_v1') || '';
    if (gasUrl && gasUrl.trim().startsWith('http')) {
      await fetch(gasUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        mode: 'no-cors',
        body: JSON.stringify({
          action: 'updateStudentPhoto',
          data: {
            studentId: student.studentId || '',
            ic: student.ic || '',
            bil: student.bil || 0,
            name: student.name || '',
            year: student.year || '',
            className: student.className || '',
            photoUrl: photoDataUrl,
            updatedAt: new Date().toISOString()
          }
        })
      });
      return {
        success: true,
        message: 'Gambar murid berjaya disimpan & disegerakkan ke Google Sheets!'
      };
    }
  } catch (err) {
    console.warn('Google Apps Script student photo sync failed/bypassed:', err);
  }

  return {
    success: true,
    message: 'Gambar murid berjaya disimpan di pangkalan data portal!'
  };
}

/**
 * Standard RFC 4180 CSV parser that handles quoted commas, quotes, and newlines
 */
export function parseGoogleSheetCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      currentVal += '"';
      i++; // skip escaped quote
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentVal.trim());
      if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Converts parsed Google Sheets rows into FullStudentRecord objects
 */
export function mapRowsToStudents(rows: string[][]): FullStudentRecord[] {
  if (!rows || rows.length <= 1) return [];

  const students: FullStudentRecord[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length < 4 || !r[2]) continue;

    const bil = parseInt(r[0], 10) || i;
    const studentId = (r[1] || '').trim();
    const name = (r[2] || '').trim().toUpperCase();
    const ic = (r[3] || '').trim();
    const idType = (r[4] || '').trim();
    const dob = (r[5] || '').trim();
    const studyStatus = (r[6] || '').trim();
    const dateEnrolledSchool = (r[7] || '').trim();
    const dateEnrolledClass = (r[8] || '').trim();
    const year = (r[9] || '').trim().toUpperCase();
    const className = (r[10] || '').trim().toUpperCase();
    const dlpStatus = (r[11] || '').trim();
    const classType = (r[12] || '').trim();
    const streamDesc = (r[13] || '').trim();
    const fieldDesc = (r[14] || '').trim();
    const classTeacher = (r[15] || '').trim();
    const genderRaw = (r[16] || '').trim().toUpperCase();
    const gender: 'LELAKI' | 'PEREMPUAN' = genderRaw.includes('LELAKI') ? 'LELAKI' : 'PEREMPUAN';
    const race = (r[17] || '').trim();
    const religion = (r[18] || '').trim();
    const citizenship = (r[19] || '').trim();
    const countryOfOrigin = (r[20] || '').trim();
    const hostelStatus = (r[21] || '').trim();
    const hostelName = (r[22] || '').trim();
    const isOku = (r[23] || '').trim();
    const okuVerifiedDate = (r[24] || '').trim();
    const okuRegNo = (r[25] || '').trim();
    const okuRegDate = (r[26] || '').trim();
    const okuCardDate = (r[27] || '').trim();
    const okuCategory = (r[28] || '').trim();
    const okuSubCategory = (r[29] || '').trim();
    const orphanStatus = (r[30] || '').trim();
    const bankAccountNo = (r[31] || '').trim();
    const bankName = (r[32] || '').trim();

    // Penjaga 1
    const parent1Name = (r[33] || '').trim();
    const parent1Ic = (r[34] || '').trim();
    const parent1IdType = (r[35] || '').trim();
    const parent1Rel = (r[36] || '').trim();
    const parent1Job = (r[37] || '').trim();
    const parent1JobStatus = (r[38] || '').trim();
    const parent1Employer = (r[39] || '').trim();
    const parent1Income = (r[40] || '').trim();
    const parent1OfficePhone = (r[41] || '').trim();
    const parent1Phone = (r[42] || '').trim();
    const dependentsCount = (r[43] || '').trim();

    // Penjaga 2
    const parent2Name = (r[44] || '').trim();
    const parent2Ic = (r[45] || '').trim();
    const parent2IdType = (r[46] || '').trim();
    const parent2Rel = (r[47] || '').trim();
    const parent2Job = (r[48] || '').trim();
    const parent2JobStatus = (r[49] || '').trim();
    const parent2Employer = (r[50] || '').trim();
    const parent2Income = (r[51] || '').trim();
    const parent2OfficePhone = (r[52] || '').trim();
    const parent2Phone = (r[53] || '').trim();

    // Alamat
    const address1 = (r[54] || '').trim();
    const address2 = (r[55] || '').trim();
    const address3 = (r[56] || '').trim();
    const postcode = (r[57] || '').trim();
    const city = (r[58] || '').trim();
    const district = (r[59] || '').trim();
    const state = (r[60] || '').trim();

    const addrParts = [address1, address2, address3, postcode, city, district, state]
      .filter((p) => Boolean(p && p !== '-' && p !== '0'))
      .join(', ');

    const rawPhoto = (r[61] || '').trim();
    const localPhotos = getLocalStudentPhotos();
    const primaryKey = studentId || ic || `stu-${bil}`;
    const photoUrl =
      rawPhoto && (rawPhoto.startsWith('http') || rawPhoto.startsWith('data:image'))
        ? rawPhoto
        : localPhotos[primaryKey] || localPhotos[studentId] || localPhotos[ic] || undefined;

    const student: FullStudentRecord = {
      id: studentId ? `stu-${studentId}` : `stu-${ic || bil}`,
      bil,
      studentId,
      name,
      ic,
      idType,
      dob,
      studyStatus,
      dateEnrolledSchool,
      dateEnrolledClass,
      year,
      className,
      dlpStatus,
      classType,
      streamDesc,
      fieldDesc,
      classTeacher,
      gender,
      photoUrl,
      race,
      religion,
      citizenship,
      countryOfOrigin,
      hostelStatus,
      hostelName,
      isOku,
      okuVerifiedDate,
      okuRegNo,
      okuRegDate,
      okuCardDate,
      okuCategory,
      okuSubCategory,
      orphanStatus,
      bankAccountNo,
      bankName,
      parent1Name,
      parent1Ic,
      parent1IdType,
      parent1Rel,
      parent1Job,
      parent1JobStatus,
      parent1Employer,
      parent1Income,
      parent1OfficePhone,
      parent1Phone,
      dependentsCount,
      parent2Name,
      parent2Ic,
      parent2IdType,
      parent2Rel,
      parent2Job,
      parent2JobStatus,
      parent2Employer,
      parent2Income,
      parent2OfficePhone,
      parent2Phone,
      address1,
      address2,
      address3,
      postcode,
      city,
      district,
      state,
      fullAddress: addrParts || 'Tiada maklumat alamat lengkap'
    };

    students.push(student);
  }

  return students;
}

/**
 * Gets cached students from localStorage, or falls back to initial data
 */
export function getCachedDetailedStudents(): FullStudentRecord[] {
  const localPhotos = getLocalStudentPhotos();
  try {
    const raw = localStorage.getItem(CACHE_KEY_STUDENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((s: FullStudentRecord) => {
          const key = s.studentId || s.ic || s.id;
          const photo = s.photoUrl || localPhotos[key] || (s.studentId ? localPhotos[s.studentId] : undefined) || (s.ic ? localPhotos[s.ic] : undefined);
          return photo ? { ...s, photoUrl: photo } : s;
        });
      }
    }
  } catch (err) {
    console.warn('Failed to load cached students from localStorage', err);
  }

  // Fallback map from initialStudentsData
  return initialStudentsData.map((s) => {
    const key = s.id || s.ic;
    const photo = localPhotos[key] || (s.ic ? localPhotos[s.ic] : undefined);
    return {
      ...s,
      photoUrl: photo,
      fullAddress: `${s.parent1Name ? 'Keluarga ' + s.parent1Name : 'SK Merbau Pulas'}, 09300 Kuala Ketil, Kedah`
    };
  });
}

/**
 * Returns formatted last synchronized timestamp string
 */
export function getLastSyncTimestamp(): string {
  try {
    return localStorage.getItem(CACHE_KEY_TIME) || 'Belum disegerakkan';
  } catch {
    return 'Belum disegerakkan';
  }
}

/**
 * Fetches the latest student records from the Google Sheet
 */
export async function fetchGoogleSheetStudents(
  forceRefresh = false
): Promise<{ students: FullStudentRecord[]; fromCache: boolean; lastUpdated: string }> {
  // If not forcing refresh, return cache first if available
  const cached = getCachedDetailedStudents();
  const lastTime = getLastSyncTimestamp();

  if (!forceRefresh && cached.length > 0 && lastTime !== 'Belum disegerakkan') {
    return {
      students: cached,
      fromCache: true,
      lastUpdated: lastTime
    };
  }

  try {
    const cacheBuster = `_t=${Date.now()}`;
    const url = `${GOOGLE_SHEET_STUDENTS_CSV_URL}&${cacheBuster}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'text/csv, text/plain, */*'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Google Sheets returned HTTP ${response.status}: ${response.statusText}`);
    }

    const csvText = await response.text();
    if (!csvText || csvText.length < 50) {
      throw new Error('Respons Google Sheets kosong atau tidak lengkap');
    }

    const rows = parseGoogleSheetCSV(csvText);
    const mapped = mapRowsToStudents(rows);

    if (mapped.length > 0) {
      const nowStr = new Date().toLocaleString('ms-MY', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      try {
        localStorage.setItem(CACHE_KEY_STUDENTS, JSON.stringify(mapped));
        localStorage.setItem(CACHE_KEY_TIME, nowStr);
      } catch (saveErr) {
        console.warn('Unable to store full student list in localStorage', saveErr);
      }

      return {
        students: mapped,
        fromCache: false,
        lastUpdated: nowStr
      };
    } else {
      throw new Error('Tiada data murid dapat diekstrak daripada Google Sheets');
    }
  } catch (err: any) {
    console.error('Error fetching Google Sheets students:', err);
    return {
      students: cached.length > 0 ? cached : (initialStudentsData as FullStudentRecord[]),
      fromCache: true,
      lastUpdated: lastTime || 'Data Sandaran Tempatan'
    };
  }
}
