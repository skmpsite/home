import { Staff, SchoolProfile } from '../types';

/**
 * Calculates a numerical seniority score for school staff based on KPM Malaysian hierarchy:
 * 1. Guru Besar / Pengetua (Highest priority: ~100,000)
 * 2. Penolong Kanan Pentadbiran / Kurikulum (PK 1 / PK Kurikulum: ~90,000)
 * 3. Penolong Kanan Hal Ehwal Murid (PK HEM: ~80,000)
 * 4. Penolong Kanan Kokurikulum (PK Koko: ~70,000)
 * 5. Penolong Kanan Lain-lain (PK Petang, PK PPKI: ~60,000)
 * 6. Guru Kanan Mata Pelajaran / GKMP (~50,000 + Gred)
 * 7. Barisan Guru mengikut gred tertinggi ke terendah (DG54 > DG52 > DG48 > DG44 > DG42 > DG41 > DG38...) (~30,000 + Gred)
 * 8. Staf Sokongan / AKP mengikut gred tertinggi ke terendah (N29 > N22 > N19 > N11...) (~10,000 + Gred)
 */
export const getSeniorityScore = (staff: Staff, profile?: SchoolProfile): number => {
  const pos = (staff.position || '').toLowerCase().trim();
  const name = (staff.name || '').toLowerCase().trim();
  const cat = (staff.category || '').toLowerCase().trim();
  const gradeStr = (staff.grade || '').toUpperCase().trim();

  // Extract numerical value from grade (e.g., 'DG48' -> 48, 'N22' -> 22, 'Gred 44' -> 44)
  const gradeMatch = gradeStr.match(/\d+/);
  const gradeNum = gradeMatch ? parseInt(gradeMatch[0], 10) : 0;

  // 1. Guru Besar / Pengetua
  const isGuruBesar =
    staff.id === 'staf-1' ||
    pos.includes('guru besar') ||
    pos.includes('pengetua') ||
    (profile?.principalName && name.includes(profile.principalName.toLowerCase()));

  if (isGuruBesar) {
    return 100000;
  }

  // 2. Penolong Kanan Kurikulum / Pentadbiran / GPK 1
  if (
    pos.includes('penolong kanan kurikulum') ||
    pos.includes('penolong kanan pentadbiran') ||
    pos.includes('penolong kanan 1') ||
    pos.includes('penolong kanan satu') ||
    pos.includes('pk kurikulum') ||
    pos.includes('pk pentadbiran') ||
    pos.includes('pk 1') ||
    pos.includes('pk1') ||
    pos.includes('gpk 1') ||
    pos.includes('gpk1') ||
    pos.includes('gpk kurikulum') ||
    pos.includes('gpk pentadbiran') ||
    ((pos.includes('kurikulum') || pos.includes('pentadbiran')) && (pos.includes('penolong kanan') || pos.includes('gpk')))
  ) {
    return 90000 + gradeNum;
  }

  // 3. Penolong Kanan Hal Ehwal Murid / GPK HEM
  if (
    pos.includes('penolong kanan hal ehwal murid') ||
    pos.includes('penolong kanan hem') ||
    pos.includes('pk hal ehwal murid') ||
    pos.includes('pk hem') ||
    pos.includes('pkhem') ||
    pos.includes('gpk hal ehwal murid') ||
    pos.includes('gpk hem') ||
    pos.includes('gpkhem') ||
    (pos.includes('hal ehwal murid') && (pos.includes('penolong kanan') || pos.includes('gpk')))
  ) {
    return 80000 + gradeNum;
  }

  // 4. Penolong Kanan Kokurikulum / GPK Kokurikulum
  if (
    pos.includes('penolong kanan kokurikulum') ||
    pos.includes('penolong kanan koko') ||
    pos.includes('pk kokurikulum') ||
    pos.includes('pk koko') ||
    pos.includes('pkkoko') ||
    pos.includes('gpk kokurikulum') ||
    pos.includes('gpk koko') ||
    pos.includes('gpkkoko') ||
    (pos.includes('kokurikulum') && (pos.includes('penolong kanan') || pos.includes('gpk')))
  ) {
    return 70000 + gradeNum;
  }

  // 5. Penolong Kanan Lain (Petang / Pendidikan Khas / PPKI)
  if (pos.includes('penolong kanan') || pos.startsWith('gpk') || pos.startsWith('pk ')) {
    return 60000 + gradeNum;
  }

  // 6. Guru Kanan Mata Pelajaran / GKMP / Ketua Bidang
  if (pos.includes('gkmp') || pos.includes('guru kanan') || pos.includes('ketua bidang')) {
    return 50000 + (gradeNum * 100);
  }

  // 7. Pentadbir Am (jika dikategorikan sebagai pentadbir)
  if (cat === 'pentadbir') {
    return 40000 + (gradeNum * 100);
  }

  // 8. Guru / Barisan Tenaga Pengajar (DG)
  const isTeacher = cat === 'guru' || gradeStr.includes('DG') || pos.includes('guru') || pos.includes('ustaz') || pos.includes('ustazah');
  if (isTeacher) {
    return 30000 + (gradeNum * 100);
  }

  // 9. Staf Sokongan / AKP (Anggota Kumpulan Pelaksana - N, C, W, FT, FA, H dsb.)
  return 10000 + (gradeNum * 100);
};

/**
 * Sorts staff array strictly by seniority and descending grade:
 * Guru Besar -> PK Kurikulum -> PK HEM -> PK Koko -> Guru (Gred Tertinggi: DG54..DG41..) -> Staf Sokongan (Gred Tertinggi: N29..N11..)
 */
export const sortStaffBySeniority = (staffList: Staff[], profile?: SchoolProfile): Staff[] => {
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
