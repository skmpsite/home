import { Staff, SchoolProfile } from '../types';

/**
 * Normalizes text for robust keyword matching (removes punctuation, excess spaces)
 */
const cleanText = (str: string): string => {
  return (str || '')
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Calculates a numerical seniority score for school staff based on KPM Malaysian hierarchy:
 * 1. Guru Besar / Pengetua (Highest priority: 1,000,000)
 * 2. Penolong Kanan Pentadbiran / Kurikulum / Akademik / GPK 1 (900,000)
 * 3. Penolong Kanan Hal Ehwal Murid / GPK HEM / GPK 2 (800,000)
 * 4. Penolong Kanan Kokurikulum / GPK Koko / GPK 3 (700,000)
 * 5. Penolong Kanan Lain-lain (PK Petang, PK PPKI: 600,000)
 * 6. Guru Kanan Mata Pelajaran / GKMP / Ketua Bidang (500,000 + Gred)
 * 7. Pentadbir Am (400,000 + Gred)
 * 8. Barisan Guru mengikut gred tertinggi ke terendah (DG54 > DG52 > DG48 > DG44 > DG42 > DG41 > DG38...) (200,000 + Gred * 1000)
 * 9. Staf Sokongan / AKP mengikut gred tertinggi ke terendah (N29 > N22 > N19 > N11...) (100,000 + Gred * 1000)
 */
export const getSeniorityScore = (staff: Staff, profile?: SchoolProfile): number => {
  const rawPos = staff.position || '';
  const rawName = staff.name || '';
  const rawCat = staff.category || '';
  const rawGrade = staff.grade || '';

  const pos = cleanText(rawPos);
  const name = cleanText(rawName);
  const cat = cleanText(rawCat);
  const gradeStr = rawGrade.toUpperCase().trim();

  // Extract numerical value from grade (e.g., 'DG48' -> 48, 'N22' -> 22, 'Gred 44' -> 44)
  const gradeMatch = gradeStr.match(/\d+/);
  const gradeNum = gradeMatch ? parseInt(gradeMatch[0], 10) : 0;

  // 1. GURU BESAR / PENGETUA
  const principalName = cleanText(profile?.principalName || 'norhafiza');
  const isGuruBesar =
    staff.id === 'staf-1' ||
    pos.includes('guru besar') ||
    pos.includes('pengetua') ||
    pos === 'gb' ||
    pos === 'pgb' ||
    pos.startsWith('guru besar') ||
    pos.startsWith('pengetua') ||
    (principalName.length > 3 && (name.includes(principalName) || principalName.includes(name))) ||
    name.includes('norhafiza');

  if (isGuruBesar) {
    return 1000000;
  }

  // Pengesanan Teguh Peranan Pentadbiran (Elakkan pertindihan 'kurikulum' dalam 'kokurikulum')
  const isKokoKeyword =
    pos.includes('kokurikulum') ||
    pos.includes('koko') ||
    pos.includes('ko kurikulum') ||
    pos.includes('ko-kurikulum') ||
    pos.includes('penolong kanan 3') ||
    pos.includes('penolong kanan tiga') ||
    pos.includes('pk 3') ||
    pos.includes('pk3') ||
    pos.includes('gpk 3') ||
    pos.includes('gpk3') ||
    pos.includes('pk koko') ||
    pos.includes('pkkoko') ||
    pos.includes('gpk koko') ||
    pos.includes('gpkkoko') ||
    pos.includes('pk ko') ||
    pos.includes('gpk ko');

  const isHEMKeyword =
    pos.includes('hal ehwal murid') ||
    pos.includes('hem') ||
    pos.includes('penolong kanan 2') ||
    pos.includes('penolong kanan dua') ||
    pos.includes('pk 2') ||
    pos.includes('pk2') ||
    pos.includes('gpk 2') ||
    pos.includes('gpk2') ||
    pos.includes('pk hem') ||
    pos.includes('pkhem') ||
    pos.includes('gpk hem') ||
    pos.includes('gpkhem');

  // 2. PENOLONG KANAN PENTADBIRAN / KURIKULUM / AKADEMIK / GPK 1 / PK 1
  const isPK1 =
    !isKokoKeyword &&
    !isHEMKeyword &&
    (pos.includes('kurikulum') ||
      pos.includes('pentadbiran') ||
      pos.includes('akademik') ||
      pos.includes('penolong kanan 1') ||
      pos.includes('penolong kanan satu') ||
      pos.includes('pk 1') ||
      pos.includes('pk1') ||
      pos.includes('gpk 1') ||
      pos.includes('gpk1') ||
      pos.includes('pk kurikulum') ||
      pos.includes('pk pentadbiran') ||
      pos.includes('gpk kurikulum') ||
      pos.includes('gpk pentadbiran') ||
      pos.includes('gpk akademik') ||
      (cat.includes('pentadbir') && staff.id === 'staf-2'));

  if (isPK1) {
    return 900000 + gradeNum;
  }

  // 3. PENOLONG KANAN HAL EHWAL MURID / GPK HEM / PK HEM / PK 2
  const isPKHEM =
    !isKokoKeyword &&
    (isHEMKeyword || (cat.includes('pentadbir') && staff.id === 'staf-3'));

  if (isPKHEM) {
    return 800000 + gradeNum;
  }

  // 4. PENOLONG KANAN KOKURIKULUM / GPK KOKO / PK KOKO / PK 3
  const isPKKoko =
    isKokoKeyword || (cat.includes('pentadbir') && staff.id === 'staf-4');

  if (isPKKoko) {
    return 700000 + gradeNum;
  }

  // 5. PENOLONG KANAN LAIN (Petang / Tingkatan 6 / Pendidikan Khas / PPKI)
  if (
    pos.includes('penolong kanan') ||
    pos.startsWith('gpk') ||
    pos.startsWith('pk ') ||
    pos.includes('pk petang') ||
    pos.includes('pk ppki')
  ) {
    return 600000 + gradeNum;
  }

  // 6. GURU KANAN MATA PELAJARAN (GKMP) / KETUA BIDANG
  if (pos.includes('gkmp') || pos.includes('guru kanan') || pos.includes('ketua bidang')) {
    return 500000 + (gradeNum * 1000);
  }

  // 7. PENTADBIR AM (jika dikategorikan sebagai pentadbir)
  if (cat.includes('pentadbir')) {
    return 400000 + (gradeNum * 1000);
  }

  // 8. GURU / PENDIDIK (DG)
  const isTeacher =
    cat.includes('guru') ||
    gradeStr.includes('DG') ||
    pos.includes('guru') ||
    pos.includes('ustaz') ||
    pos.includes('ustazah') ||
    pos.includes('cikgu') ||
    pos.includes('panitia');

  if (isTeacher) {
    // Pastikan gred lebih tinggi di atas: DG54 (254,000) > DG52 (252,000) > DG48 (248,000) > DG44 (244,000) > DG41 (241,000)...
    return 200000 + (gradeNum * 1000);
  }

  // 9. STAF SOKONGAN / AKP (Anggota Kumpulan Pelaksana - N, C, W, FT, FA, H dsb.)
  // Gred lebih tinggi di atas: N29 (129,000) > N22 (122,000) > N19 (119,000) > N11 (111,000)
  return 100000 + (gradeNum * 1000);
};

/**
 * Checks if staff member is an Administrator (Guru Besar / Penolong Kanan)
 */
export const isAdministrator = (staff: Staff, profile?: SchoolProfile): boolean => {
  const score = getSeniorityScore(staff, profile);
  if (score >= 400000) return true;

  const pos = cleanText(staff.position || '');
  const cat = cleanText(staff.category || '');
  return (
    staff.id === 'staf-1' ||
    staff.id === 'staf-2' ||
    staff.id === 'staf-3' ||
    staff.id === 'staf-4' ||
    pos.includes('guru besar') ||
    pos.includes('pengetua') ||
    pos.includes('penolong kanan') ||
    pos.includes('gpk') ||
    pos.startsWith('pk ') ||
    pos.includes('kurikulum') ||
    pos.includes('hal ehwal murid') ||
    pos.includes('kokurikulum') ||
    cat.includes('pentadbir')
  );
};

/**
 * Sorts staff array strictly by seniority and descending grade:
 * 1. Guru Besar (Score 1,000,000)
 * 2. Penolong Kanan Kurikulum / Pentadbiran (Score ~900,000)
 * 3. Penolong Kanan Hal Ehwal Murid (Score ~800,000)
 * 4. Penolong Kanan Kokurikulum (Score ~700,000)
 * 5. Penolong Kanan Lain (Score ~600,000)
 * 6. GKMP (Score ~500,000)
 * 7. Barisan Guru mengikut gred tertinggi ke terendah (DG54 > DG52 > DG48 > DG44 > DG42 > DG41 > DG38...)
 * 8. Staf Sokongan / AKP mengikut gred tertinggi ke terendah (N29 > N26 > N22 > N19 > FT19 > N14 > N11)
 */
export const sortStaffBySeniority = (staffList: Staff[], profile?: SchoolProfile): Staff[] => {
  if (!Array.isArray(staffList)) return [];

  return [...staffList].sort((a, b) => {
    const scoreA = getSeniorityScore(a, profile);
    const scoreB = getSeniorityScore(b, profile);

    // 1. Sort by seniority score (highest score first)
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }

    // 2. Secondary sort by order if available and distinct
    if (a.order !== undefined && b.order !== undefined && a.order !== b.order && a.order > 0 && b.order > 0) {
      return a.order - b.order;
    }

    // 3. Fallback alphabetical sort by name
    return (a.name || '').localeCompare(b.name || '', 'ms');
  });
};
