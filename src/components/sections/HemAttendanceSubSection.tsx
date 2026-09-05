import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  User,
  UserCheck,
  UserX,
  Users,
  Percent,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileText,
  Upload,
  Camera,
  Image as ImageIcon,
  Send,
  Search,
  Filter,
  Eye,
  Trash2,
  Check,
  Clock,
  Printer,
  Share2,
  Sparkles,
  Phone,
  HelpCircle,
  Building2,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  X,
  FileCheck,
  MessageCircle,
  Copy,
  ExternalLink,
  Link,
  CalendarCheck2
} from 'lucide-react';
import { StudentRecord, StudentAbsenceRecord, SchoolHoliday } from '../../types';
import {
  sortYears,
  sortClasses,
  sortClassBreakdown,
  getYearTheme,
  getActiveSchoolHoliday,
  isKedahWeekend
} from '../../utils/studentHelpers';
import { SchoolHolidayModal } from '../attendance/SchoolHolidayModal';

interface HemAttendanceSubSectionProps {
  students: StudentRecord[];
  absenceRecords: StudentAbsenceRecord[];
  schoolHolidays?: SchoolHoliday[];
  onSaveSchoolHolidays?: (holidays: SchoolHoliday[]) => void;
  onAddAbsenceRecord: (
    record: Omit<StudentAbsenceRecord, 'id' | 'refNo' | 'createdAt'>
  ) => StudentAbsenceRecord;
  onUpdateAbsenceRecord?: (record: StudentAbsenceRecord) => void;
  onDeleteAbsenceRecord?: (id: string) => void;
  isAdmin?: boolean;
  isTeacher?: boolean;
  userRole?: 'admin' | 'guru' | null;
  onOpenLogin?: () => void;
}

const REASON_CATEGORIES = [
  { id: 'sakit', label: 'Demam / Sakit (Slip Cuti Sakit MC)', icon: '🤒', color: 'text-amber-400 bg-amber-500/20 border-amber-400/30' },
  { id: 'hospital', label: 'Temujanji Hospital / Klinik Pakar', icon: '🏥', color: 'text-sky-400 bg-sky-500/20 border-sky-400/30' },
  { id: 'kecemasan', label: 'Kecemasan Keluarga / Kematian Waris', icon: '🚨', color: 'text-rose-400 bg-rose-500/20 border-rose-400/30' },
  { id: 'keluarga', label: 'Urusan Keluarga / Balik Kampung', icon: '🚗', color: 'text-purple-400 bg-purple-500/20 border-purple-400/30' },
  { id: 'bencana', label: 'Bencana Alam / Banjir / Masalah Laluan', icon: '🌧️', color: 'text-blue-400 bg-blue-500/20 border-blue-400/30' },
  { id: 'lain', label: 'Lain-lain Sebab Munasabah', icon: '📋', color: 'text-slate-300 bg-slate-500/20 border-slate-400/30' }
] as const;

export const HemAttendanceSubSection: React.FC<HemAttendanceSubSectionProps> = ({
  students,
  absenceRecords,
  schoolHolidays = [],
  onSaveSchoolHolidays,
  onAddAbsenceRecord,
  onUpdateAbsenceRecord,
  onDeleteAbsenceRecord,
  isAdmin = false,
  isTeacher = false,
  userRole,
  onOpenLogin
}) => {
  const isAuthorized = isAdmin || isTeacher || userRole === 'admin' || userRole === 'guru';
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState<boolean>(false);

  // Auto-hide info penerangan selepas 5 saat
  const [showPortalInfo, setShowPortalInfo] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPortalInfo(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Active view tab inside Attendance portal
  const [attendanceViewTab, setAttendanceViewTab] = useState<'borang' | 'analisis' | 'senarai'>('borang');

  // Pastikan waris (bukan guru/admin) hanya melihat borang e-kehadiran
  useEffect(() => {
    if (!isAuthorized && attendanceViewTab !== 'borang') {
      setAttendanceViewTab('borang');
    }
  }, [isAuthorized, attendanceViewTab]);

  // Selected date for live calculation (Default: Today YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  // Check if selectedDate falls within any School Holiday range (or default weekend Friday & Saturday in Kedah)
  const activeHoliday = useMemo(() => {
    return getActiveSchoolHoliday(selectedDate, schoolHolidays);
  }, [schoolHolidays, selectedDate]);

  // Calculate Kedah School Week Days: Ahad - Sabtu (Jumaat & Sabtu are weekend holidays)
  const schoolWeekDays = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday ...
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - dayOfWeek);

    const days = [
      { name: 'Ahad', shortLabel: 'Ahd', offset: 0, isWeekend: false },
      { name: 'Isnin', shortLabel: 'Isn', offset: 1, isWeekend: false },
      { name: 'Selasa', shortLabel: 'Sel', offset: 2, isWeekend: false },
      { name: 'Rabu', shortLabel: 'Rab', offset: 3, isWeekend: false },
      { name: 'Khamis', shortLabel: 'Kha', offset: 4, isWeekend: false },
      { name: 'Jumaat', shortLabel: 'Jum', offset: 5, isWeekend: true },
      { name: 'Sabtu', shortLabel: 'Sab', offset: 6, isWeekend: true }
    ];

    return days.map((d) => {
      const dt = new Date(sunday);
      dt.setDate(sunday.getDate() + d.offset);
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      return {
        label: d.name,
        shortLabel: d.shortLabel,
        isWeekend: d.isWeekend,
        dateStr: `${yyyy}-${mm}-${dd}`,
        formatted: `${dd}/${mm}`
      };
    });
  }, []);

  // Share to WhatsApp modal states
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareSelectedClassKey, setShareSelectedClassKey] = useState<string>('semua');
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  const showCopiedToast = (msg: string) => {
    setCopiedToast(msg);
    setTimeout(() => {
      setCopiedToast(null);
    }, 3000);
  };

  // Filter for class analysis
  const [analysisClassFilter, setAnalysisClassFilter] = useState<string>('semua');

  // Filter for records table
  const [filterDateMode, setFilterDateMode] = useState<'selected' | 'semua'>('selected');
  const [filterClass, setFilterClass] = useState<string>('semua');
  const [filterReason, setFilterReason] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Lightbox modal for previewing uploaded slip / doctor letter
  const [previewAttachment, setPreviewAttachment] = useState<{
    url: string;
    name?: string;
    studentName: string;
    refNo: string;
  } | null>(null);

  // Success modal after parent submits form
  const [submittedReceipt, setSubmittedReceipt] = useState<StudentAbsenceRecord | null>(null);

  // Warning modal for duplicate submission
  const [duplicateWarningRecord, setDuplicateWarningRecord] = useState<StudentAbsenceRecord | null>(null);

  // Form State for Waris Absence submission
  const [formYear, setFormYear] = useState<string>('');
  const [formClass, setFormClass] = useState<string>('');
  const [formStudentId, setFormStudentId] = useState<string>('');
  const [formStudentSearch, setFormStudentSearch] = useState<string>('');
  const [formCustomStudentName, setFormCustomStudentName] = useState<string>('');
  const [formDateFrom, setFormDateFrom] = useState<string>(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [formDateTo, setFormDateTo] = useState<string>(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [formReasonCategory, setFormReasonCategory] = useState<
    'sakit' | 'hospital' | 'kecemasan' | 'keluarga' | 'bencana' | 'lain'
  >('sakit');
  const [formReasonDetails, setFormReasonDetails] = useState<string>('');
  const [formParentName, setFormParentName] = useState<string>('');
  const [formParentPhone, setFormParentPhone] = useState<string>('');
  const [formParentRel, setFormParentRel] = useState<string>('Bapa Kandung');
  const [formAttachmentUrl, setFormAttachmentUrl] = useState<string>('');
  const [formAttachmentName, setFormAttachmentName] = useState<string>('');
  const [formDeclaration, setFormDeclaration] = useState<boolean>(false);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // Extract unique years according to strict hierarchy: Tahun 6, 5, 4, 3, 2, 1, Pra Sekolah
  const availableYears = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.year) set.add(s.year);
    });
    return sortYears(Array.from(set));
  }, [students]);

  // Extract classes available for selected year according to strict hierarchy: Ibnu Sina, Ibnu Khaldun, Pra Intan, Pra Berlian
  const availableClassesForYear = useMemo(() => {
    if (!formYear) return [];
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.year === formYear && s.className) {
        set.add(s.className);
      }
    });
    return sortClasses(Array.from(set));
  }, [students, formYear]);

  // Students in selected year and class
  const filteredStudentsForForm = useMemo(() => {
    if (!formYear || !formClass) return [];
    return students
      .filter((s) => s.year === formYear && s.className === formClass)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [students, formYear, formClass]);

  // Selected student details
  const selectedStudent = useMemo(() => {
    if (!formStudentId) return null;
    return students.find((s) => s.id === formStudentId) || null;
  }, [students, formStudentId]);

  // Handle student selection to auto-fill guardian info
  const handleSelectStudent = (student: StudentRecord) => {
    setFormStudentId(student.id);
    setFormStudentSearch(student.name);

    if (student.parent1Name && !formParentName) {
      setFormParentName(student.parent1Name);
    }
    if (student.parent1Phone && !formParentPhone) {
      setFormParentPhone(student.parent1Phone);
    }
    if (student.parent1Rel) {
      setFormParentRel(student.parent1Rel);
    }
  };

  // Handle File / Medical Slip Upload (Base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Saiz fail melebihi 5MB. Sila muat naik imej atau dokumen yang lebih kecil.');
      return;
    }

    setFormAttachmentName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormAttachmentUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Calculate days difference
  const calculatedDaysCount = useMemo(() => {
    if (!formDateFrom || !formDateTo) return 1;
    const d1 = new Date(formDateFrom);
    const d2 = new Date(formDateTo);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  }, [formDateFrom, formDateTo]);

  // Submit Absence Form
  const handleSubmitAbsenceForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const isManualStudent = formStudentId === 'TIADA_NAMA';

    if (!formYear || !formClass) {
      setFormError('Sila pilih Tahun dan Kelas murid.');
      return;
    }
    if (!formStudentId) {
      setFormError('Sila pilih nama murid yang terlibat.');
      return;
    }
    if (isManualStudent && !formCustomStudentName.trim()) {
      setFormError('Sila isikan nama murid dalam kotak yang disediakan.');
      return;
    }
    if (!isManualStudent && !selectedStudent) {
      setFormError('Sila pilih nama murid yang terlibat.');
      return;
    }
    if (!formDateFrom || !formDateTo) {
      setFormError('Sila pilih tarikh ketidakhadiran.');
      return;
    }
    if (new Date(formDateTo) < new Date(formDateFrom)) {
      setFormError('Tarikh tamat tidak boleh lebih awal daripada tarikh mula.');
      return;
    }
    if (!formReasonDetails.trim()) {
      setFormError('Sila nyatakan catatan sebab ketidakhadiran.');
      return;
    }
    if (!formParentName.trim() || !formParentPhone.trim()) {
      setFormError('Sila isikan nama dan nombor telefon waris.');
      return;
    }
    if (!formDeclaration) {
      setFormError('Sila tandakan perakuan kesahihan maklumat.');
      return;
    }

    // Semak jika borang makluman murid ini telah dihantar sebelum ini bagi tarikh yang sama/bertindih
    const existingDuplicate = absenceRecords.find((rec) => {
      if (rec.status === 'ditolak') return false;
      if (isManualStudent) {
        if (rec.studentName.trim().toLowerCase() !== formCustomStudentName.trim().toLowerCase()) return false;
        if (rec.className !== formClass || rec.year !== formYear) return false;
      } else {
        if (rec.studentId !== selectedStudent.id) return false;
      }
      // Semak pertindihan tarikh: [formDateFrom, formDateTo] dan [rec.dateFrom, rec.dateTo]
      return !(formDateTo < rec.dateFrom || formDateFrom > rec.dateTo);
    });

    if (existingDuplicate) {
      setDuplicateWarningRecord(existingDuplicate);
      return;
    }

    setFormSubmitting(true);

    try {
      const studentName = isManualStudent ? formCustomStudentName.trim().toUpperCase() : selectedStudent.name;
      const studentId = isManualStudent ? `manual-${Date.now()}` : selectedStudent.id;
      const studentIc = isManualStudent ? '-' : selectedStudent.ic;
      const studentYear = isManualStudent ? formYear : selectedStudent.year;
      const studentClass = isManualStudent ? formClass : selectedStudent.className;

      const newRecord = onAddAbsenceRecord({
        studentId,
        studentName,
        studentIc,
        year: studentYear,
        className: studentClass,
        dateFrom: formDateFrom,
        dateTo: formDateTo,
        daysCount: calculatedDaysCount,
        reasonCategory: formReasonCategory,
        reasonDetails: formReasonDetails.trim(),
        parentName: formParentName.trim(),
        parentPhone: formParentPhone.trim(),
        parentRelationship: formParentRel,
        attachmentUrl: formAttachmentUrl || undefined,
        attachmentName: formAttachmentName || undefined,
        status: 'disahkan',
        verifiedBy: 'Sistem e-Kehadiran Waris',
        verifiedAt: new Date().toISOString()
      });

      setSubmittedReceipt(newRecord);

      // Reset form
      setFormStudentId('');
      setFormStudentSearch('');
      setFormCustomStudentName('');
      setFormReasonDetails('');
      setFormAttachmentUrl('');
      setFormAttachmentName('');
      setFormDeclaration(false);
      setFormError('');
    } catch (err) {
      console.error('Error submitting absence record:', err);
      setFormError('Ralat semasa menghantar borang. Sila cuba lagi.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // ATTENDANCE CALCULATIONS FOR THE SELECTED DATE
  // ----------------------------------------------------
  const dailyAbsenceRecords = useMemo(() => {
    return absenceRecords.filter((rec) => {
      if (rec.status === 'ditolak') return false;
      return selectedDate >= rec.dateFrom && selectedDate <= rec.dateTo;
    });
  }, [absenceRecords, selectedDate]);

  // Set of absent student IDs for selected date
  const absentStudentIds = useMemo(() => {
    const ids = new Set<string>();
    dailyAbsenceRecords.forEach((rec) => {
      ids.add(rec.studentId);
    });
    return ids;
  }, [dailyAbsenceRecords]);

  // Total Students Enrolment
  const totalEnrolment = students.length || 375;
  // Jika hari cuti sekolah: Hadir 0% dan Tidak Hadir 100%
  const totalAbsentCount = activeHoliday ? totalEnrolment : absentStudentIds.size;
  const totalPresentCount = activeHoliday ? 0 : Math.max(0, totalEnrolment - totalAbsentCount);
  const overallPercentage = activeHoliday
    ? '0.0'
    : totalEnrolment > 0
    ? ((totalPresentCount / totalEnrolment) * 100).toFixed(1)
    : '100.0';

  // Classes list and breakdown
  const allClassesBreakdown = useMemo(() => {
    const classMap: Record<
      string,
      {
        year: string;
        className: string;
        classTeacher: string;
        total: number;
        absentStudents: StudentRecord[];
        presentCount: number;
        absentCount: number;
        percentage: string;
      }
    > = {};

    students.forEach((s) => {
      const key = `${s.year} - ${s.className}`;
      if (!classMap[key]) {
        classMap[key] = {
          year: s.year,
          className: s.className,
          classTeacher: s.classTeacher || 'Guru Kelas',
          total: 0,
          absentStudents: [],
          presentCount: 0,
          absentCount: 0,
          percentage: '100.0'
        };
      }
      classMap[key].total += 1;
      if (absentStudentIds.has(s.id)) {
        classMap[key].absentStudents.push(s);
      }
    });

    const breakdownList = Object.keys(classMap).map((key) => {
      const item = classMap[key];
      const absent = activeHoliday ? item.total : item.absentStudents.length;
      const present = activeHoliday ? 0 : Math.max(0, item.total - absent);
      const pct = activeHoliday
        ? '0.0'
        : item.total > 0
        ? ((present / item.total) * 100).toFixed(1)
        : '100.0';
      return {
        key,
        ...item,
        absentCount: absent,
        presentCount: present,
        percentage: pct
      };
    });

    return sortClassBreakdown(breakdownList);
  }, [students, absentStudentIds, activeHoliday]);

  // Generate Direct Link to Form
  const getFormDirectUrl = (classKey?: string) => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.searchParams.set('tab', 'hem');
    url.searchParams.set('subtab', 'kehadiran');
    url.searchParams.set('view', 'borang');

    if (classKey && classKey !== 'semua') {
      const parts = classKey.split(':::');
      if (parts.length === 2) {
        url.searchParams.set('year', parts[0]);
        url.searchParams.set('class', parts[1]);
      }
    } else {
      url.searchParams.delete('year');
      url.searchParams.delete('class');
    }

    url.hash = 'borang-kehadiran-waris';
    return url.toString();
  };

  const getShareWhatsAppText = (classKey?: string) => {
    const targetUrl = getFormDirectUrl(classKey);
    let classTitle = '';
    if (classKey && classKey !== 'semua') {
      const parts = classKey.split(':::');
      if (parts.length === 2) {
        classTitle = `\n🏫 *Kelas: ${parts[0]} (${parts[1]})*`;
      }
    }

    return `📢 *MAKLUMAN KETIDAKHADIRAN MURID SK MERBAU PULAS*${classTitle}

Assalamualaikum & Salam Sejahtera Tuan/Puan Waris Penjaga,

Sekiranya anak jagaan tuan/puan *TIDAK DAPAT HADIR* ke sekolah hari ini, mohon kerjasama untuk mengisi borang makluman rasmi melalui pautan di bawah:

🔗 *Pautan Borang e-Kehadiran Waris:*
${targetUrl}

📌 *Peringatan Mesra:*
• Sila lampirkan slip cuti sakit (MC) atau surat rasmi sebagai dokumen sokongan.
• Maklumat ini diselaraskan terus ke dalam rekod e-Kehadiran / APDM sekolah.

Kerjasama dan keprihatinan pihak tuan/puan didahului dengan ucapan terima kasih.`;
  };

  const handleDirectWhatsAppShare = (classKey?: string) => {
    const text = getShareWhatsAppText(classKey || shareSelectedClassKey);
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handleNativeShare = async (classKey?: string) => {
    const text = getShareWhatsAppText(classKey || shareSelectedClassKey);
    const url = getFormDirectUrl(classKey || shareSelectedClassKey);
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Borang Makluman Ketidakhadiran Murid (Waris) SK Merbau Pulas',
          text: text,
          url: url
        });
        showCopiedToast('Berjaya dikongsi!');
      } catch (err) {
        handleDirectWhatsAppShare(classKey);
      }
    } else {
      handleDirectWhatsAppShare(classKey);
    }
  };

  const handleCopyText = (classKey?: string) => {
    const text = getShareWhatsAppText(classKey || shareSelectedClassKey);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    showCopiedToast('Mesej WhatsApp penuh berjaya disalin!');
  };

  const handleCopyLinkOnly = (classKey?: string) => {
    const url = getFormDirectUrl(classKey || shareSelectedClassKey);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    showCopiedToast('Pautan borang berjaya disalin!');
  };

  // Deep Link Auto-Navigation to Borang and pre-fill class if present
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const search = window.location.search || '';
    const hash = window.location.hash || '';
    const params = new URLSearchParams(search);

    const isBorangRequested =
      params.get('view') === 'borang' ||
      params.get('form') === 'kehadiran' ||
      params.get('borang') === 'kehadiran' ||
      params.get('subtab') === 'kehadiran' ||
      hash.includes('borang') ||
      hash.includes('kehadiran');

    if (isBorangRequested) {
      setAttendanceViewTab('borang');

      const pYear = params.get('year') || params.get('tahun');
      const pClass = params.get('class') || params.get('kelas');
      if (pYear) {
        setFormYear(pYear);
      }
      if (pClass) {
        setFormClass(pClass);
      }

      // Smooth scroll to the form element
      const timer = setTimeout(() => {
        const el = document.getElementById('borang-kehadiran-waris');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, []);

  // Filtered breakdown for Analisis Kehadiran Tab
  const filteredClassesBreakdown = useMemo(() => {
    if (analysisClassFilter === 'semua') {
      return allClassesBreakdown;
    }
    return allClassesBreakdown.filter((item) => {
      const fullKey = `${item.year} - ${item.className}`;
      return analysisClassFilter === fullKey || analysisClassFilter === item.className || analysisClassFilter === item.key;
    });
  }, [allClassesBreakdown, analysisClassFilter]);

  // Summary statistics for currently filtered classes in Analisis tab
  const selectedAnalysisStats = useMemo(() => {
    let total = 0;
    let absent = 0;
    let present = 0;
    filteredClassesBreakdown.forEach((item) => {
      total += item.total;
      absent += item.absentCount;
      present += item.presentCount;
    });
    const pct = total > 0 ? ((present / total) * 100).toFixed(1) : '100.0';
    return {
      classesCount: filteredClassesBreakdown.length,
      total,
      absent,
      present,
      percentage: pct
    };
  }, [filteredClassesBreakdown]);

  // Filtered absence list for table / search
  const filteredAbsenceRecordsList = useMemo(() => {
    return absenceRecords.filter((rec) => {
      // Date filter based on selectedDate (Ahad - Khamis or custom date)
      if (filterDateMode === 'selected') {
        const isWithinRange = selectedDate >= rec.dateFrom && selectedDate <= rec.dateTo;
        if (!isWithinRange) return false;
      }
      if (filterClass !== 'semua') {
        const classKey = `${rec.year} - ${rec.className}`;
        if (classKey !== filterClass && rec.className !== filterClass) return false;
      }
      if (filterReason !== 'semua' && rec.reasonCategory !== filterReason) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = rec.studentName.toLowerCase().includes(q);
        const matchRef = rec.refNo.toLowerCase().includes(q);
        const matchParent = rec.parentName.toLowerCase().includes(q);
        const matchClass = `${rec.year} ${rec.className}`.toLowerCase().includes(q);
        if (!matchName && !matchRef && !matchParent && !matchClass) return false;
      }
      return true;
    });
  }, [absenceRecords, filterDateMode, selectedDate, filterClass, filterReason, searchQuery]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Attendance Top Header Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-6 sm:p-8 rounded-3xl border border-emerald-500/30 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold rounded-full text-xs border border-emerald-400/30">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sistem Pengurusan & Makluman Kehadiran SKMP</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>e-Kehadiran</span>
              <span className="text-xs bg-yellow-400 text-blue-950 font-black px-2.5 py-0.5 rounded-full shadow-sm">
                HEM
              </span>
            </h3>

            {/* Collapsible Portal Info with 5-second auto-hide & simple arrow toggle */}
            <div className="max-w-2xl">
              <div
                className={`transition-all duration-500 overflow-hidden ${
                  showPortalInfo ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pb-1">
                  Portal rasmi pengisian makluman ketidakhadiran murid oleh waris berserta muat naik slip cuti sakit (MC)
                  dan paparan peratusan kehadiran harian sekolah secara automatik.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPortalInfo(!showPortalInfo)}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-yellow-300 hover:text-yellow-200 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition mt-0.5 border border-white/10"
                title={showPortalInfo ? "Sembunyikan info" : "Papar info e-Kehadiran"}
              >
                <span>{showPortalInfo ? "Sembunyikan Info" : "Info e-Kehadiran"}</span>
                {showPortalInfo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Quick Date Control (Ahad, Isnin, Selasa, Rabu, Khamis) */}
          <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex flex-col gap-2.5 shadow-xl flex-shrink-0">
            <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>Pilih Hari & Tarikh:</span>
              </span>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300">
                {new Date(selectedDate).toLocaleDateString('ms-MY', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />

            {/* Active Holiday Banner under date picker */}
            {activeHoliday && (
              <div className="bg-amber-500/20 border border-amber-400/40 rounded-xl px-2.5 py-1.5 text-xs text-amber-200 font-bold flex items-center justify-between gap-2 shadow-sm">
                <span className="flex items-center gap-1.5 truncate">
                  <span>🏖️</span>
                  <span className="truncate">{activeHoliday.title}</span>
                </span>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded flex-shrink-0">
                  {isKedahWeekend(selectedDate).isWeekend ? 'CUTI HUJUNG MINGGU' : 'CUTI SEKOLAH'}
                </span>
              </div>
            )}

            {/* 7 Hari Mingguan: Ahad - Sabtu (Jumaat & Sabtu cuti hujung minggu) */}
            <div className="grid grid-cols-7 gap-1 text-[10px]">
              {schoolWeekDays.map((day) => {
                const isActive = selectedDate === day.dateStr;
                const holidayForDay = getActiveSchoolHoliday(day.dateStr, schoolHolidays);
                const isDayHoliday = !!holidayForDay;
                return (
                  <button
                    key={day.label}
                    type="button"
                    onClick={() => setSelectedDate(day.dateStr)}
                    className={`py-1.5 px-0.5 sm:px-1 rounded-lg font-bold transition text-center flex flex-col items-center justify-center relative ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/40 border border-emerald-300'
                        : isDayHoliday
                        ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40'
                        : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/5'
                    }`}
                    title={`${day.label} (${day.formatted})${isDayHoliday ? ` - Cuti: ${holidayForDay.title}` : ''}`}
                  >
                    <span className="leading-tight text-[9px] sm:text-[10px] truncate max-w-full">
                      <span className="hidden sm:inline">{day.label}</span>
                      <span className="sm:hidden">{day.shortLabel}</span>
                    </span>
                    <span className={`text-[8px] sm:text-[8.5px] opacity-90 ${isActive ? 'text-slate-900 font-extrabold' : isDayHoliday ? 'text-yellow-300 font-black' : 'text-slate-400'}`}>
                      {isDayHoliday ? 'Cuti' : day.formatted}
                    </span>
                    {isDayHoliday && !isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-0.5 right-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Admin Holiday Manager Button */}
            {isAuthorized && (
              <button
                type="button"
                onClick={() => setIsHolidayModalOpen(true)}
                className="mt-1 w-full py-2 px-3 bg-gradient-to-r from-amber-500/20 to-yellow-500/15 hover:from-amber-500/30 hover:to-yellow-500/25 text-amber-300 border border-amber-400/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
                title="Buka Kalendar Pengurusan Cuti Sekolah"
              >
                <CalendarCheck2 className="w-3.5 h-3.5 text-yellow-400" />
                <span>Kalendar Cuti Sekolah</span>
                {schoolHolidays && schoolHolidays.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-yellow-400 text-slate-950 font-black rounded-full text-[10px]">
                    {schoolHolidays.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Live Metrics Grid (Total Enrolment, Hadir, Tidak Hadir, Peratus) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          {/* Total Enrolment */}
          <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-3.5 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Jumlah Murid</p>
              <h4 className="text-2xl font-black text-white">{totalEnrolment}</h4>
              <p className="text-[10px] text-slate-400">14 Buah Kelas</p>
            </div>
          </div>

          {/* Hadir (Auto) */}
          <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-emerald-500/30 flex items-center gap-3.5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500" />
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Hadir (Auto)</p>
              <h4 className="text-2xl font-black text-emerald-400">{totalPresentCount}</h4>
              <p className="text-[10px] text-emerald-300/80">
                {activeHoliday ? '0.0% • Cuti Sekolah' : 'Kira sebagai hadir'}
              </p>
            </div>
          </div>

          {/* Tidak Hadir */}
          <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-rose-500/30 flex items-center gap-3.5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-rose-500" />
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-400/30 flex items-center justify-center flex-shrink-0">
              <UserX className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">Tidak Hadir</p>
              <h4 className="text-2xl font-black text-rose-400">{totalAbsentCount}</h4>
              <p className="text-[10px] text-rose-300/80">
                {activeHoliday ? `100.0% • ${activeHoliday.title}` : `${dailyAbsenceRecords.length} borang diisi`}
              </p>
            </div>
          </div>

          {/* Peratusan Kehadiran */}
          <div className={`backdrop-blur-md p-4 rounded-2xl border flex items-center gap-3.5 shadow-lg ${
            activeHoliday
              ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-amber-400/50'
              : 'bg-gradient-to-br from-yellow-500/20 to-amber-500/10 border-yellow-400/40'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-blue-950 flex items-center justify-center flex-shrink-0 shadow-md">
              <Percent className="w-6 h-6 font-black" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-yellow-300 uppercase tracking-wider truncate">
                {activeHoliday ? 'Cuti Sekolah' : 'Peratus Kehadiran'}
              </p>
              <h4 className="text-2xl font-black text-yellow-400">{overallPercentage}%</h4>
              <p className="text-[10px] text-slate-300 font-semibold truncate max-w-[150px]">
                {activeHoliday
                  ? `🏖️ ${activeHoliday.title}`
                  : Number(overallPercentage) >= 95
                  ? '🌟 Sasaran KPM Tercapai'
                  : Number(overallPercentage) >= 90
                  ? '👍 Tahap Memuaskan'
                  : '⚠️ Perlu Perhatian'}
              </p>
            </div>
          </div>
        </div>

        {/* Notice Info Banner */}
        {activeHoliday ? (
          <div className="mt-4 p-3.5 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 rounded-xl border border-amber-400/40 flex items-start gap-2.5 text-xs text-amber-200 shadow-md">
            <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong>{isKedahWeekend(selectedDate).isWeekend ? 'Cuti Hujung Minggu (Default Kedah):' : 'Cuti Persekolahan:'}</strong> Tarikh ini ditandakan sebagai cuti iaitu{' '}
              <span className="text-yellow-300 font-extrabold underline">{activeHoliday.title}</span>.
              Sistem e-Kehadiran memaparkan status kehadiran sebagai <strong>Hadir 0%</strong> dan <strong>Tidak Hadir 100%</strong> (Semua murid bercuti & tiada sesi persekolahan beroperasi).
            </p>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-emerald-950/60 rounded-xl border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-200">
            <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Prinsip Pengiraan e-Kehadiran:</strong> Murid yang{' '}
              <span className="text-yellow-300 font-bold underline">tidak mengisi borang ketidakhadiran</span> dikira
              secara automatik sebagai <strong>HADIR</strong> ke sekolah pada tarikh tersebut.
            </p>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <button
            onClick={() => setAttendanceViewTab('borang')}
            className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition ${
              attendanceViewTab === 'borang'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-400'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Borang e-Kehadiran Waris</span>
            <span className="text-[10px] bg-yellow-400 text-slate-950 px-1.5 py-0.5 rounded font-black">Isi Sini</span>
          </button>

          {/* Tab Analisis dan Senarai Rekod KHAS untuk Admin dan Guru Sahaja */}
          {isAuthorized && (
            <>
              <button
                onClick={() => setAttendanceViewTab('analisis')}
                className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition ${
                  attendanceViewTab === 'analisis'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Analisis Mengikut Kelas ({allClassesBreakdown.length})</span>
              </button>

              <button
                onClick={() => setAttendanceViewTab('senarai')}
                className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition ${
                  attendanceViewTab === 'senarai'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>Senarai Rekod & Bukti Slip MC ({absenceRecords.length})</span>
              </button>
            </>
          )}
        </div>

        {/* Akses Status Badge (Untuk Guru & Pentadbir yang Log Masuk) */}
        {isAuthorized && (
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[11px] font-bold text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Akses Guru & Pentadbir</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BORANG E-KEHADIRAN WARIS                                           */}
      {/* ========================================================================= */}
      {attendanceViewTab === 'borang' && (
        <div
          id="borang-kehadiran-waris"
          className="bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl text-white scroll-mt-24"
        >
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="border-b border-white/10 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold rounded-full text-xs mb-2 border border-emerald-500/30">
                  <Send className="w-3.5 h-3.5" />
                  <span>Borang Makluman Rasmi</span>
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>Borang Makluman Ketidakhadiran Murid (Waris)</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                  Ibu bapa dan penjaga diminta mengisi borang ini sekiranya anak jagaan tidak dapat hadir ke sekolah. Sila
                  lampirkan slip cuti sakit (MC) atau surat rasmi sebagai dokumen sokongan.
                </p>
              </div>

              {/* Ikon WhatsApp Ringkas & Salin Pautan */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  id="btn-share-whatsapp-borang"
                  onClick={() => setIsShareModalOpen(true)}
                  className="w-10 h-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl border border-emerald-400/40 transition active:scale-95 flex items-center justify-center shadow-lg shadow-emerald-950/50 group cursor-pointer"
                  title="Kongsi Pautan Borang ke WhatsApp"
                  aria-label="Kongsi Pautan Borang ke WhatsApp"
                >
                  <MessageCircle className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                </button>

                <button
                  type="button"
                  id="btn-copy-pautan-borang"
                  onClick={() => handleCopyLinkOnly()}
                  className="w-10 h-10 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white rounded-2xl border border-white/10 transition active:scale-95 flex items-center justify-center shadow-md cursor-pointer"
                  title="Salin Pautan Terus Borang Ini"
                  aria-label="Salin Pautan Terus Borang Ini"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {formError && (
              <div className="p-4 bg-rose-500/20 border border-rose-500/40 rounded-2xl flex items-center gap-3 text-rose-300 text-xs sm:text-sm font-semibold">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitAbsenceForm} className="space-y-6">
              {/* Bahagian 1: Pilih Tahun & Kelas */}
              <div className="bg-white/5 p-4 sm:p-5 rounded-2xl border border-white/10 space-y-4">
                <h5 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  <span>1. Maklumat Tahun & Kelas Murid</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Pilih Tahun / Tingkatan <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={formYear}
                      onChange={(e) => {
                        setFormYear(e.target.value);
                        setFormClass('');
                        setFormStudentId('');
                        setFormStudentSearch('');
                      }}
                      className="w-full bg-slate-800 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      required
                    >
                      <option value="">-- Sila Pilih Tahun --</option>
                      {availableYears.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Pilih Nama Kelas <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={formClass}
                      disabled={!formYear}
                      onChange={(e) => {
                        setFormClass(e.target.value);
                        setFormStudentId('');
                        setFormStudentSearch('');
                        setFormCustomStudentName('');
                      }}
                      className="w-full bg-slate-800 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50"
                      required
                    >
                      <option value="">{formYear ? '-- Sila Pilih Kelas --' : '-- Pilih Tahun Dahulu --'}</option>
                      {availableClassesForYear.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pilih Nama Murid */}
                {formYear && formClass && (
                  <div className="pt-2 border-t border-white/10 space-y-2">
                    <label className="block text-xs font-bold text-slate-300">
                      Pilih Nama Murid (Senarai Lengkap SKMP) <span className="text-rose-400">*</span>
                    </label>

                    <div className="space-y-2">
                      <select
                        value={formStudentId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormStudentId(val);
                          if (val === 'TIADA_NAMA') {
                            setFormStudentSearch('Tiada nama');
                          } else {
                            const found = students.find((s) => s.id === val);
                            if (found) handleSelectStudent(found);
                          }
                        }}
                        className="w-full bg-slate-800 border border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        required
                      >
                        <option value="">-- Sila Pilih Nama Murid --</option>
                        {filteredStudentsForForm.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name}
                          </option>
                        ))}
                        <option value="TIADA_NAMA" className="text-amber-300 font-bold">
                          Tiada nama
                        </option>
                      </select>

                      {/* Kotak nama untuk diisi sekiranya pengguna memilih "Tiada nama" */}
                      {formStudentId === 'TIADA_NAMA' && (
                        <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-xl space-y-2 animate-fadeIn">
                          <label className="block text-xs font-bold text-amber-300 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            <span>Nama Murid <span className="text-rose-400">*</span></span>
                          </label>
                          <input
                            type="text"
                            value={formCustomStudentName}
                            onChange={(e) => setFormCustomStudentName(e.target.value)}
                            placeholder="Sila taip nama penuh murid di sini..."
                            className="w-full bg-slate-900 border border-amber-400/50 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 uppercase"
                            required
                          />
                          <p className="text-[11px] text-amber-200/80">
                            Nama murid ini akan didaftarkan ke dalam rekod makluman ketidakhadiran kelas {formYear} {formClass}.
                          </p>
                        </div>
                      )}

                      {selectedStudent && formStudentId !== 'TIADA_NAMA' && (
                        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs space-y-1">
                          <div className="flex items-center justify-between text-emerald-300 font-bold">
                            <span>{selectedStudent.name}</span>
                            <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-400/30">
                              {selectedStudent.year} - {selectedStudent.className}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300">
                            Guru Kelas:{' '}
                            <strong className="text-white">
                              {selectedStudent.classTeacher || 'Guru Kelas SKMP'}
                            </strong>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bahagian 2: Maklumat Waris */}
              <div className="bg-white/5 p-4 sm:p-5 rounded-2xl border border-white/10 space-y-4">
                <h5 className="text-xs font-black uppercase tracking-wider text-yellow-400 flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4" />
                  <span>2. Maklumat Waris / Penjaga</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Hubungan <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={formParentRel}
                      onChange={(e) => setFormParentRel(e.target.value)}
                      className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      <option value="Bapa Kandung">Bapa Kandung</option>
                      <option value="Ibu Kandung">Ibu Kandung</option>
                      <option value="Penjaga Sah">Penjaga Sah</option>
                      <option value="Datuk / Nenek">Datuk / Nenek</option>
                      <option value="Abang / Kakak">Abang / Kakak</option>
                      <option value="Lain-lain">Lain-lain</option>
                    </select>
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Nama Waris <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formParentName}
                      onChange={(e) => setFormParentName(e.target.value)}
                      placeholder="Nama penuh waris"
                      className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      required
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      No. Telefon (WhatsApp) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formParentPhone}
                      onChange={(e) => setFormParentPhone(e.target.value)}
                      placeholder="Cth: 0123456789"
                      className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Bahagian 3: Tarikh & Catatan Sebab Ketidakhadiran */}
              <div className="bg-white/5 p-4 sm:p-5 rounded-2xl border border-white/10 space-y-4">
                <h5 className="text-xs font-black uppercase tracking-wider text-sky-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>3. Tarikh & Catatan Sebab Ketidakhadiran</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Tarikh Mula Tidak Hadir <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={formDateFrom}
                      onChange={(e) => {
                        setFormDateFrom(e.target.value);
                        if (!formDateTo || new Date(formDateTo) < new Date(e.target.value)) {
                          setFormDateTo(e.target.value);
                        }
                      }}
                      className="w-full bg-slate-800 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Tarikh Akhir Tidak Hadir <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={formDateTo}
                      min={formDateFrom}
                      onChange={(e) => setFormDateTo(e.target.value)}
                      className="w-full bg-slate-800 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      required
                    />
                  </div>
                </div>

                <div className="text-right text-[11px] text-emerald-300 font-bold">
                  Tempoh Ketidakhadiran: <span className="text-yellow-300">{calculatedDaysCount} Hari</span>
                </div>

                {/* Catatan Terperinci Sebab Tidak Hadir */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Catatan / Keterangan Sebab Tidak Hadir <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    value={formReasonDetails}
                    onChange={(e) => setFormReasonDetails(e.target.value)}
                    rows={3}
                    placeholder="Contoh: Demam panas sejak petang semalam dan telah dibawa ke Klinik Kesihatan Kulim. Doktor memberikan slip cuti sakit (MC) selama 1 hari."
                    className="w-full bg-slate-800 border border-white/20 rounded-xl p-3 text-xs text-white font-normal focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    required
                  />
                </div>
              </div>

              {/* Bahagian 4: Upload Bukti Slip Cuti Sakit / Kamera */}
              <div className="bg-white/5 p-4 sm:p-5 rounded-2xl border border-white/10 space-y-3">
                <h5 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span>4. Muat Naik Bukti Slip Cuti Sakit (MC) / Surat Doktor</span>
                </h5>
                <p className="text-[11px] text-slate-300">
                  Format disokong: Imej JPG, PNG, WEBP atau fail PDF (Maksimum 5MB). Boleh ambil foto secara langsung menggunakan kamera.
                </p>

                {formAttachmentUrl ? (
                  <div className="p-3.5 bg-slate-800 rounded-xl border border-emerald-500/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {formAttachmentUrl.startsWith('data:image') ? (
                        <img
                          src={formAttachmentUrl}
                          alt="Slip MC"
                          className="w-14 h-14 object-cover rounded-lg border border-white/20 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-purple-500/20 text-purple-300 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-7 h-7" />
                        </div>
                      )}
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">
                          {formAttachmentName || 'Slip_Cuti_Sakit.jpg'}
                        </p>
                        <p className="text-[10px] text-emerald-400 font-semibold">✓ Dokumen / foto berjaya dilampirkan</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setFormAttachmentUrl('');
                        setFormAttachmentName('');
                      }}
                      className="p-2.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-xl transition flex items-center gap-1 text-xs font-bold"
                      title="Padam lampiran"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Padam</span>
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-white/20 hover:border-emerald-400 bg-slate-800/40 hover:bg-emerald-950/20 rounded-2xl p-6 sm:p-7 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition text-center shadow-lg group">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 group-hover:bg-emerald-500/30 flex items-center justify-center text-emerald-300 transition shadow-inner">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-white block">
                        Klik atau Tarik Fail Slip Cuti Sakit / Surat Rasmi Waris ke Sini
                      </span>
                      <span className="text-[10.5px] text-slate-400 block mt-0.5">
                        Menyokong imej (JPG, PNG) daripada galeri / tangkap foto kamera, atau fail dokumen PDF
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Bahagian 5: Perakuan Waris */}
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formDeclaration}
                    onChange={(e) => setFormDeclaration(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-emerald-500 rounded cursor-pointer flex-shrink-0"
                    required
                  />
                  <span className="text-xs text-slate-200 leading-relaxed">
                    Saya dengan ini memperakui bahawa segala maklumat dan dokumen lampiran yang diberikan adalah benar
                    dan sahih bagi tujuan rekod pengurusan Hal Ehwal Murid (HEM) SK Merbau Pulas.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-black shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{formSubmitting ? 'Menghantar Makluman...' : 'Hantar Makluman Ketidakhadiran'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ANALISIS & PERATUSAN KEHADIRAN MENGIKUT KELAS                      */}
      {/* ========================================================================= */}
      {isAuthorized && attendanceViewTab === 'analisis' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl text-white space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h4 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <span>Analisis Kehadiran Mengikut Kelas</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Pecahan jumlah murid hadir, tidak hadir dan peratusan kehadiran bagi setiap kelas pada{' '}
                  <strong className="text-yellow-300">{selectedDate}</strong>.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-slate-950/60 px-4 py-2.5 rounded-2xl border border-white/10">
                <div className="text-left">
                  <span className="text-[11px] text-slate-400 block font-medium">Purata Keseluruhan:</span>
                  <span className="text-xl sm:text-2xl font-black text-yellow-400">{overallPercentage}%</span>
                </div>
                {analysisClassFilter !== 'semua' && (
                  <div className="text-left border-l border-white/10 pl-4">
                    <span className="text-[11px] text-emerald-400 block font-medium">Pilihan Semasa:</span>
                    <span className="text-xl sm:text-2xl font-black text-emerald-300">{selectedAnalysisStats.percentage}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Filter Controls Bar: ONLY Specific Class Dropdown */}
            <div className="p-4 sm:p-5 bg-slate-950/60 rounded-2xl border border-white/10 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 max-w-lg">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-blue-400" />
                      <span>Pilih Kelas Khusus:</span>
                    </label>
                    {analysisClassFilter !== 'semua' && (
                      <button
                        type="button"
                        onClick={() => setAnalysisClassFilter('semua')}
                        className="text-[11px] font-bold text-amber-300 hover:text-amber-200 underline"
                      >
                        Papar Semua 14 Kelas
                      </button>
                    )}
                  </div>
                  <select
                    value={analysisClassFilter}
                    onChange={(e) => setAnalysisClassFilter(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/20 text-white text-xs sm:text-sm font-bold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-inner"
                  >
                    <option value="semua">Semua Kelas ({allClassesBreakdown.length} Kelas)</option>
                    {allClassesBreakdown.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.year} - {c.className}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-3 font-semibold text-xs text-slate-300 sm:self-end pt-1">
                  <span className="text-slate-300">
                    Jumlah Murid: <strong className="text-white">{selectedAnalysisStats.total}</strong>
                  </span>
                  <span className="text-emerald-400">
                    Hadir: <strong>{selectedAnalysisStats.present}</strong>
                  </span>
                  <span className="text-rose-400">
                    Tidak Hadir: <strong>{selectedAnalysisStats.absent}</strong>
                  </span>
                  <span className="text-yellow-400">
                    Peratusan: <strong>{selectedAnalysisStats.percentage}%</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Grid of Classes */}
            {filteredClassesBreakdown.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClassesBreakdown.map((item) => {
                  const pct = Number(item.percentage);
                  const yearTheme = getYearTheme(item.year);
                  let badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40';
                  let barColor = 'bg-emerald-500';
                  if (pct < 90) {
                    badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-400/40';
                    barColor = 'bg-rose-500';
                  } else if (pct < 95) {
                    badgeColor = 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40';
                    barColor = 'bg-yellow-400';
                  }

                  const isSingleSelected = analysisClassFilter === item.key;

                  return (
                    <div
                      key={item.key}
                      className={`p-4 sm:p-5 rounded-2xl border ${yearTheme.cardBorder} ${yearTheme.cardBg} space-y-3 transition shadow-lg relative overflow-hidden ${
                        isSingleSelected ? 'ring-2 ring-yellow-400/60 shadow-yellow-500/10' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <span className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${yearTheme.badge}`}>
                            {item.year}
                          </span>
                          <h5 className={`text-base font-black mt-1 ${yearTheme.headerAccent} truncate`}>{item.className}</h5>
                          <p className="text-[11px] text-slate-300 truncate mt-0.5" title={item.classTeacher}>
                            Guru: <strong>{item.classTeacher}</strong>
                          </p>
                        </div>

                        <div className={`flex-shrink-0 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-black border shadow-sm ${badgeColor} text-center`}>
                          {item.percentage}%
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="w-full h-2.5 bg-slate-950/80 rounded-full overflow-hidden border border-white/10">
                          <div
                            className={`h-full ${barColor} transition-all duration-500`}
                            style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-300 font-semibold pt-0.5">
                          <span className="text-emerald-400 font-bold">Hadir: {item.presentCount}</span>
                          <span className="text-slate-400">Jumlah: {item.total}</span>
                          <span className="text-rose-400 font-bold">Tidak Hadir: {item.absentCount}</span>
                        </div>
                      </div>

                      {/* Absent students list in this class if any */}
                      {item.absentStudents.length > 0 && (
                        <div className="pt-2 border-t border-white/10 space-y-1">
                          <p className="text-[10px] font-bold text-rose-300">Murid Tidak Hadir:</p>
                          <div className="space-y-1">
                            {item.absentStudents.map((st) => (
                              <div
                                key={st.id}
                                className="text-[11px] bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-500/30 text-slate-200 flex items-center justify-between shadow-sm"
                              >
                                <span className="truncate font-medium">{st.name}</span>
                                <span className="text-[9px] bg-rose-500/30 text-rose-200 px-1.5 py-0.5 rounded font-bold">Cuti/MC</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quick Select Class Button */}
                      {analysisClassFilter !== item.key && (
                        <button
                          type="button"
                          onClick={() => {
                            setAnalysisClassFilter(item.key);
                          }}
                          className="w-full mt-2 py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white text-[11px] font-bold border border-white/10 transition flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-400" />
                          <span>Fokus & Semak Roster Kelas Ini</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-white/10 space-y-3">
                <Filter className="w-8 h-8 text-slate-400 mx-auto opacity-60" />
                <h5 className="text-sm font-bold text-white">Tiada kelas dijumpai</h5>
                <button
                  type="button"
                  onClick={() => setAnalysisClassFilter('semua')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow"
                >
                  Papar Semua Kelas
                </button>
              </div>
            )}

            {/* If 1 class is actively selected, show complete student roster with attendance status */}
            {analysisClassFilter !== 'semua' && filteredClassesBreakdown.length === 1 && (
              <div className="mt-8 pt-6 border-t border-white/15 space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 p-4 rounded-2xl border border-white/10">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-400/30">
                      Roster Terperinci
                    </span>
                    <h5 className="text-lg font-black text-white mt-1">
                      Senarai Penuh Murid {filteredClassesBreakdown[0].year} - {filteredClassesBreakdown[0].className}
                    </h5>
                    <p className="text-xs text-slate-300">
                      Guru Kelas: <strong>{filteredClassesBreakdown[0].classTeacher}</strong> &bull; Tarikh: <strong className="text-yellow-300">{selectedDate}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAnalysisClassFilter('semua')}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition self-start sm:self-center border border-white/10"
                  >
                    Tutup Roster & Lihat Semua Kelas
                  </button>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-white/10">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-300 border-b border-white/10 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-4 py-3 w-12 text-center">Bil</th>
                        <th className="px-4 py-3">Nama Murid</th>
                        <th className="px-4 py-3">No. KP / MyKid</th>
                        <th className="px-4 py-3">Jantina</th>
                        <th className="px-4 py-3 text-center">Status Kehadiran ({selectedDate})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-slate-900/40">
                      {students
                        .filter(
                          (s) =>
                            s.year === filteredClassesBreakdown[0].year &&
                            s.className === filteredClassesBreakdown[0].className
                        )
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((st, idx) => {
                          const isAbsent = absentStudentIds.has(st.id);
                          const absenceDetails = isAbsent
                            ? dailyAbsenceRecords.find((r) => r.studentId === st.id)
                            : null;

                          return (
                            <tr
                              key={st.id}
                              className={isAbsent ? 'bg-rose-950/30 hover:bg-rose-950/40' : 'hover:bg-white/5'}
                            >
                              <td className="px-4 py-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                              <td className="px-4 py-3 font-semibold text-white">
                                {st.name}
                              </td>
                              <td className="px-4 py-3 font-mono text-slate-300">{st.icNumber || st.id}</td>
                              <td className="px-4 py-3 text-slate-300">{st.gender || '-'}</td>
                              <td className="px-4 py-3 text-center">
                                {isAbsent ? (
                                  <div className="inline-flex flex-col items-center">
                                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                      TIDAK HADIR ({absenceDetails?.reasonCategory?.toUpperCase() || 'CUTI'})
                                    </span>
                                    {absenceDetails?.reasonDetails && (
                                      <span className="text-[9.5px] text-rose-300/80 max-w-[200px] truncate mt-0.5" title={absenceDetails.reasonDetails}>
                                        {absenceDetails.reasonDetails}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                    HADIR
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SENARAI REKOD & BUKTI SLIP MC                                      */}
      {/* ========================================================================= */}
      {isAuthorized && attendanceViewTab === 'senarai' && (
        <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl text-white space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30 mb-1.5">
                <FileCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Pengesahan Dokumen Rasmi</span>
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>Senarai Rekod Ketidakhadiran & Bukti Slip MC</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Semakan dokumen perakuan waris, slip cuti sakit (MC) dan rekod ketidakhadiran murid SKMP mengikut tarikh.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 border border-white/15 transition shadow"
              >
                <Printer className="w-3.5 h-3.5 text-yellow-300" />
                <span>Cetak Senarai</span>
              </button>
            </div>
          </div>

          {/* Quick Date Mode Switcher */}
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-300">
                Tarikh Terpilih:{' '}
                <strong className="text-yellow-300 font-mono">
                  {selectedDate} ({schoolWeekDays.find((d) => d.dateStr === selectedDate)?.label || 'Hari Persekolahan'})
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setFilterDateMode('selected')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  filterDateMode === 'selected'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Tapis Hari Dipilih ({dailyAbsenceRecords.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterDateMode('semua')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  filterDateMode === 'semua'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Semua Tarikh ({absenceRecords.length})</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama murid / No. Rujukan..."
                className="w-full bg-slate-800 border border-white/15 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Filter by Class */}
            <div className="relative">
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full bg-slate-800 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="semua">Semua Kelas ({allClassesBreakdown.length})</option>
                {allClassesBreakdown.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.key}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Reason */}
            <div className="relative">
              <select
                value={filterReason}
                onChange={(e) => setFilterReason(e.target.value)}
                className="w-full bg-slate-800 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="semua">Semua Kategori Sebab</option>
                {REASON_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Records Table / Cards */}
          {filteredAbsenceRecordsList.length > 0 ? (
            <div className="space-y-3">
              {filteredAbsenceRecordsList.map((rec) => {
                const categoryMeta = REASON_CATEGORIES.find((c) => c.id === rec.reasonCategory) || REASON_CATEGORIES[0];
                return (
                  <div
                    key={rec.id}
                    className="bg-white/5 hover:bg-white/10 p-4 sm:p-5 rounded-2xl border border-white/10 space-y-3 transition shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black font-mono bg-yellow-400 text-blue-950 px-2 py-0.5 rounded">
                          {rec.refNo || 'KHD-SKMP'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${categoryMeta.color}`}>
                          {categoryMeta.icon} {categoryMeta.label}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-300 font-semibold flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        <span>
                          {rec.dateFrom} {rec.dateTo !== rec.dateFrom ? `hingga ${rec.dateTo}` : ''} ({rec.daysCount}{' '}
                          Hari)
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <p className="text-[10px] text-slate-400">Nama Murid:</p>
                        <h6 className="font-bold text-white text-sm">{rec.studentName}</h6>
                        <p className="text-[11px] text-emerald-300">
                          {rec.year} - {rec.className}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-400">Maklumat Waris:</p>
                        <p className="font-semibold text-white">
                          {rec.parentName} ({rec.parentRelationship || 'Waris'})
                        </p>
                        <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-yellow-300" />
                          <a
                            href={`https://wa.me/6${rec.parentPhone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-emerald-300 underline"
                          >
                            {rec.parentPhone}
                          </a>
                        </p>
                      </div>

                      <div className="sm:col-span-2">
                        <p className="text-[10px] text-slate-400">Catatan Sebab:</p>
                        <p className="text-slate-200 italic leading-relaxed">{rec.reasonDetails}</p>
                      </div>
                    </div>

                    {/* Bottom Actions: Slip Preview, Status & Admin Delete */}
                    <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {rec.attachmentUrl ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewAttachment({
                                url: rec.attachmentUrl!,
                                name: rec.attachmentName,
                                studentName: rec.studentName,
                                refNo: rec.refNo
                              })
                            }
                            className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-white border border-purple-400/40 text-xs font-bold flex items-center gap-1.5 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat Bukti / Slip MC</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Tiada lampiran fail</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{rec.status === 'disahkan' ? 'Disahkan' : rec.status}</span>
                        </span>

                        {isAuthorized && onDeleteAbsenceRecord && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Adakah anda pasti ingin memadam rekod ketidakhadiran bagi ${rec.studentName}?`)) {
                                onDeleteAbsenceRecord(rec.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition"
                            title="Padam rekod"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-10 text-center bg-slate-950/40 rounded-2xl border border-white/10 space-y-3 text-slate-300">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h5 className="text-base font-bold text-white">
                {filterDateMode === 'selected'
                  ? `Tiada Rekod Ketidakhadiran Pada ${selectedDate}`
                  : 'Tiada Rekod Ketidakhadiran Dijumpai'}
              </h5>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Peratusan kehadiran adalah 100% penuh. Semua murid dianggap hadir ke sekolah sehingga ada borang makluman atau slip cuti sakit (MC) yang dihantar oleh waris.
              </p>
              {filterDateMode === 'selected' && (
                <button
                  type="button"
                  onClick={() => setFilterDateMode('semua')}
                  className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition"
                >
                  <Eye className="w-3.5 h-3.5 text-purple-300" />
                  <span>Semak Semua Tarikh Yang Pernah Dihantar</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: SUBMISSION RECEIPT CARD                                          */}
      {/* ========================================================================= */}
      {submittedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-white shadow-2xl space-y-5 animate-scaleUp">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-400/40 shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-white">Makluman Berjaya Dihantar!</h4>
              <p className="text-xs text-emerald-300 font-semibold">
                Rekod ketidakhadiran telah direkodkan dalam sistem Hal Ehwal Murid (HEM).
              </p>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-white/10 pb-2 font-mono">
                <span className="text-slate-400">No. Rujukan:</span>
                <span className="font-black text-yellow-300">{submittedReceipt.refNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nama Murid:</span>
                <span className="font-bold text-white text-right">{submittedReceipt.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kelas:</span>
                <span className="font-bold text-emerald-300">
                  {submittedReceipt.year} - {submittedReceipt.className}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tarikh:</span>
                <span className="font-bold text-white">
                  {submittedReceipt.dateFrom} {submittedReceipt.dateTo !== submittedReceipt.dateFrom ? `hingga ${submittedReceipt.dateTo}` : ''} ({submittedReceipt.daysCount} Hari)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sebab:</span>
                <span className="font-semibold text-slate-200">{submittedReceipt.reasonDetails}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `*MAKLUMAN KETIDAKHADIRAN MURID SKMP*\n\n` +
                    `*No. Rujukan:* ${submittedReceipt.refNo}\n` +
                    `*Nama Murid:* ${submittedReceipt.studentName}\n` +
                    `*Kelas:* ${submittedReceipt.year} - ${submittedReceipt.className}\n` +
                    `*Tarikh:* ${submittedReceipt.dateFrom} (${submittedReceipt.daysCount} Hari)\n` +
                    `*Sebab:* ${submittedReceipt.reasonDetails}\n` +
                    `*Nama Waris:* ${submittedReceipt.parentName} (${submittedReceipt.parentPhone})\n\n` +
                    `_Makluman ini dihantar melalui Portal Rasmi SK Merbau Pulas._`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Share2 className="w-4 h-4" />
                <span>Kongsi ke WhatsApp Guru</span>
              </a>

              <button
                type="button"
                onClick={() => setSubmittedReceipt(null)}
                className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ATTACHMENT / SLIP MC LIGHTBOX PREVIEW                           */}
      {/* ========================================================================= */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-2xl w-full text-white shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h5 className="font-bold text-sm text-white">
                  Bukti Slip Cuti Sakit / Dokumen: {previewAttachment.studentName}
                </h5>
                <p className="text-[11px] text-slate-400 font-mono">No. Ruj: {previewAttachment.refNo}</p>
              </div>
              <button
                onClick={() => setPreviewAttachment(null)}
                className="p-1.5 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center p-2 bg-slate-950 rounded-2xl border border-white/10 min-h-[250px]">
              {previewAttachment.url.startsWith('data:image') || previewAttachment.url.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                <img
                  src={previewAttachment.url}
                  alt="Bukti MC"
                  className="max-h-[60vh] max-w-full object-contain rounded-xl"
                />
              ) : (
                <iframe
                  src={previewAttachment.url}
                  title="Pratonton Dokumen"
                  className="w-full h-[55vh] rounded-xl"
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPreviewAttachment(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: MAKLUMAN PENGHANTARAN KALI KEDUA (DUPLICATE SUBMISSION WARNING) */}
      {/* ========================================================================= */}
      {duplicateWarningRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-500/60 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-white shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 flex-shrink-0 shadow-lg shadow-rose-500/20">
                <AlertCircle className="w-8 h-8 text-rose-400" />
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase mb-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Makluman Pendua / Telah Wujud</span>
                </div>
                <h4 className="text-lg sm:text-xl font-black text-white leading-tight">
                  Makluman Ketidakhadiran Murid Telah Dihantar!
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Penghantaran kali kedua bagi murid yang sama pada tarikh ini <strong className="text-rose-300">tidak dibenarkan</strong> kerana rekod makluman telah pun diterima dan disimpan dalam sistem.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 rounded-2xl border border-rose-500/20 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400 font-medium">No. Rujukan Rekod:</span>
                <span className="font-mono font-black text-yellow-300">{duplicateWarningRecord.refNo}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400 font-medium">Nama Murid:</span>
                <span className="font-bold text-white text-right">{duplicateWarningRecord.studentName}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400 font-medium">Kelas / Tahun:</span>
                <span className="font-bold text-emerald-300">
                  {duplicateWarningRecord.year} - {duplicateWarningRecord.className}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400 font-medium">Tarikh Tidak Hadir:</span>
                <span className="font-bold text-sky-300">
                  {duplicateWarningRecord.dateFrom} {duplicateWarningRecord.dateTo !== duplicateWarningRecord.dateFrom ? `hingga ${duplicateWarningRecord.dateTo}` : ''} ({duplicateWarningRecord.daysCount} Hari)
                </span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400 font-medium">Nama Waris:</span>
                <span className="font-semibold text-slate-200">{duplicateWarningRecord.parentName} ({duplicateWarningRecord.parentPhone})</span>
              </div>
              <div className="pt-1">
                <span className="text-slate-400 block mb-1 font-medium">Catatan / Sebab:</span>
                <p className="text-slate-200 bg-white/5 p-2.5 rounded-xl italic border border-white/5">
                  "{duplicateWarningRecord.reasonDetails}"
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDuplicateWarningRecord(null)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-xs transition shadow-xl shadow-rose-600/30"
              >
                Faham & Tutup Makluman
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: KONGSI BORANG KE WHATSAPP GROUP KELAS (GURU KE WARIS)             */}
      {/* ========================================================================= */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-7 max-w-xl w-full text-white shadow-2xl space-y-5 animate-scaleUp max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 flex-shrink-0 shadow-lg shadow-emerald-500/20">
                  <Share2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase mb-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>WhatsApp Kelas SKMP</span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-black text-white">
                    Kongsi Borang Makluman Ketidakhadiran
                  </h4>
                  <p className="text-xs text-slate-300">
                    Hantar jemputan pengisian borang terus ke WhatsApp Group kelas ibu bapa / waris.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pilihan Sasaran Kelas */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Pilih Sasaran Kelas (Pilihan untuk Guru Kelas):
              </label>
              <select
                value={shareSelectedClassKey}
                onChange={(e) => setShareSelectedClassKey(e.target.value)}
                className="w-full bg-slate-800 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="semua">📢 Umum / Semua Kelas (Pautan Standard)</option>
                {allClassesBreakdown.map((c) => {
                  const key = `${c.year}:::${c.className}`;
                  return (
                    <option key={key} value={key}>
                      🏫 {c.year} - {c.className} ({c.totalStudents} Murid)
                    </option>
                  );
                })}
              </select>
              <p className="text-[11px] text-slate-400">
                {shareSelectedClassKey === 'semua'
                  ? 'Pautan umum untuk semua murid dan penjaga SK Merbau Pulas.'
                  : 'Pautan khusus ini akan menetapkan Tahun & Kelas secara automatik apabila waris membuka borang ini.'}
              </p>
            </div>

            {/* Pautan Langsung Borang */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold flex items-center gap-1.5">
                  <Link className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pautan Terus (Direct Link):</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyLinkOnly(shareSelectedClassKey)}
                  className="text-emerald-400 hover:text-emerald-300 text-xs font-bold flex items-center gap-1 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Pautan Sahaja</span>
                </button>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl text-xs font-mono text-emerald-300 break-all select-all border border-emerald-500/20">
                {getFormDirectUrl(shareSelectedClassKey)}
              </div>
            </div>

            {/* Kotak Pratonton Mesej WhatsApp */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pratonton Mesej WhatsApp:</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyText(shareSelectedClassKey)}
                  className="text-emerald-400 hover:text-emerald-300 text-xs font-bold flex items-center gap-1 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Mesej Lengkap</span>
                </button>
              </div>
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-xs text-slate-200 whitespace-pre-line font-sans leading-relaxed select-text">
                {getShareWhatsAppText(shareSelectedClassKey)}
              </div>
            </div>

            {/* Tindakan Butang */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleNativeShare(shareSelectedClassKey)}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-emerald-900/40 border border-emerald-400/40 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Share2 className="w-4 h-4 text-emerald-200" />
                <span>Buka & Hantar ke WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopyText(shareSelectedClassKey)}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm rounded-2xl border border-white/10 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Copy className="w-4 h-4 text-slate-300" />
                <span>Salin Mesej Lengkap</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/50 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{copiedToast}</span>
        </div>
      )}

      {/* School Holiday Calendar Modal for Admin/Guru */}
      {isAuthorized && (
        <SchoolHolidayModal
          isOpen={isHolidayModalOpen}
          onClose={() => setIsHolidayModalOpen(false)}
          holidays={schoolHolidays || []}
          onSaveHolidays={(hols) => {
            if (onSaveSchoolHolidays) {
              onSaveSchoolHolidays(hols);
            }
          }}
          selectedDate={selectedDate}
          onSelectDate={(dt) => setSelectedDate(dt)}
        />
      )}
    </div>
  );
};
