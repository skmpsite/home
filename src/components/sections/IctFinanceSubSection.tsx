import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Edit3,
  Trash2,
  Search,
  Filter,
  Download,
  Printer,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  Lock,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Info,
  Paperclip,
  Upload,
  Eye,
  ZoomIn,
  ZoomOut,
  Receipt,
  Image as ImageIcon
} from 'lucide-react';
import { IctCashFlowRecord, SchoolProfile, Staff } from '../../types';
import {
  loadIctCashFlow,
  saveIctCashFlow,
  formatCurrencyRM,
  calculateCashFlowTotals,
  computeRunningBalances,
  exportIctFinanceCsv,
  ICT_INFLOW_CATEGORIES,
  ICT_OUTFLOW_CATEGORIES,
  INITIAL_ICT_CASHFLOW,
  generateDigitalReceiptSvgUrl,
  compressReceiptImageFile
} from '../../utils/ictFinanceHelpers';
import { findPkPentadbiranStaff } from '../../utils/staffHelpers';

interface IctFinanceSubSectionProps {
  isAdmin?: boolean;
  isTeacher?: boolean;
  userRole?: 'admin' | 'guru' | null;
  profile?: SchoolProfile;
  staffList?: Staff[];
  onOpenLogin?: () => void;
}

export const IctFinanceSubSection: React.FC<IctFinanceSubSectionProps> = ({
  isAdmin = false,
  isTeacher = false,
  userRole = null,
  profile,
  staffList = [],
  onOpenLogin
}) => {
  const [records, setRecords] = useState<IctCashFlowRecord[]>(() => loadIctCashFlow());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'semua' | 'masuk' | 'keluar'>('semua');
  const [filterMonth, setFilterMonth] = useState<string>('semua'); // "YYYY-MM" or "semua"
  const [filterCategory, setFilterCategory] = useState<string>('semua');
  const [filterReceipt, setFilterReceipt] = useState<'semua' | 'dengan_resit' | 'tanpa_resit'>('semua');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<IctCashFlowRecord | null>(null);
  const [deleteConfirmRecord, setDeleteConfirmRecord] = useState<IctCashFlowRecord | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Receipt modal & zoom states
  const [viewingReceiptRecord, setViewingReceiptRecord] = useState<IctCashFlowRecord | null>(null);
  const [receiptZoomLevel, setReceiptZoomLevel] = useState<number>(1);

  // Form inputs
  const [formDate, setFormDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [formType, setFormType] = useState<'masuk' | 'keluar'>('masuk');
  const [formCategory, setFormCategory] = useState<string>(ICT_INFLOW_CATEGORIES[0]);
  const [formDescription, setFormDescription] = useState('');
  const [formRefNo, setFormRefNo] = useState('');
  const [formAmount, setFormAmount] = useState<string>('');
  const [formPayerPayee, setFormPayerPayee] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formReceiptUrl, setFormReceiptUrl] = useState<string>('');
  const [formReceiptFileName, setFormReceiptFileName] = useState<string>('');
  const [isCompressingReceipt, setIsCompressingReceipt] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Auto show toast
  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  // Available months extracted from records
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    records.forEach((r) => {
      if (r.date && r.date.length >= 7) {
        monthsSet.add(r.date.slice(0, 7));
      }
    });
    return Array.from(monthsSet).sort().reverse();
  }, [records]);

  // Overall totals across entire dataset
  const overallTotals = useMemo(() => {
    return calculateCashFlowTotals(records);
  }, [records]);

  // Running balance array ordered by date
  const recordsWithBalance = useMemo(() => {
    return computeRunningBalances(records);
  }, [records]);

  // Filtered records based on active filters
  const filteredRecords = useMemo(() => {
    return recordsWithBalance.filter((r) => {
      if (filterType !== 'semua' && r.type !== filterType) {
        return false;
      }
      if (filterMonth !== 'semua') {
        const itemMonth = (r.date || '').slice(0, 7);
        if (itemMonth !== filterMonth) return false;
      }
      if (filterCategory !== 'semua' && r.category !== filterCategory) {
        return false;
      }
      if (filterReceipt === 'dengan_resit' && !r.receiptUrl) {
        return false;
      }
      if (filterReceipt === 'tanpa_resit' && r.receiptUrl) {
        return false;
      }
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const matchDesc = (r.description || '').toLowerCase().includes(q);
        const matchRef = (r.refNo || '').toLowerCase().includes(q);
        const matchCategory = (r.category || '').toLowerCase().includes(q);
        const matchPayer = (r.payerOrPayee || '').toLowerCase().includes(q);
        if (!matchDesc && !matchRef && !matchCategory && !matchPayer) {
          return false;
        }
      }
      return true;
    });
  }, [recordsWithBalance, filterType, filterMonth, filterCategory, filterReceipt, searchTerm]);

  // Totals for the currently filtered view
  const filteredTotals = useMemo(() => {
    return calculateCashFlowTotals(filteredRecords);
  }, [filteredRecords]);

  // Open Form for Add
  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormType('masuk');
    setFormCategory(ICT_INFLOW_CATEGORIES[0]);
    setFormDescription('');
    setFormRefNo('');
    setFormAmount('');
    setFormPayerPayee('');
    setFormNotes('');
    setFormReceiptUrl('');
    setFormReceiptFileName('');
    setFormError(null);
    setIsFormOpen(true);
  };

  // Open Form for Edit
  const handleOpenEdit = (record: IctCashFlowRecord) => {
    setEditingRecord(record);
    setFormDate(record.date);
    setFormType(record.type);
    setFormCategory(record.category);
    setFormDescription(record.description);
    setFormRefNo(record.refNo);
    setFormAmount(record.amount.toString());
    setFormPayerPayee(record.payerOrPayee || '');
    setFormNotes(record.notes || '');
    setFormReceiptUrl(record.receiptUrl || '');
    setFormReceiptFileName(record.receiptFileName || '');
    setFormError(null);
    setIsFormOpen(true);
  };

  // Handle Receipt Upload
  const handleReceiptFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setFormError('Saiz fail resit melebihi 10MB. Sila pilih gambar yang lebih kecil.');
      return;
    }

    try {
      setIsCompressingReceipt(true);
      setFormError(null);
      const result = await compressReceiptImageFile(file);
      setFormReceiptUrl(result.dataUrl);
      setFormReceiptFileName(result.fileName);
      triggerToast('Resit/bukti pembelian berjaya dimuat naik!');
    } catch (err) {
      console.error('Error processing receipt file:', err);
      setFormError('Gagal memproses fail resit. Sila cuba lagi.');
    } finally {
      setIsCompressingReceipt(false);
    }
  };

  // Auto-generate official digital voucher if physical receipt is absent
  const handleGenerateDigitalVoucher = () => {
    if (!formDescription.trim()) {
      setFormError('Sila isikan butiran urus niaga terlebih dahulu untuk menjana resit.');
      return;
    }
    const numAmt = parseFloat(formAmount) || 0;
    const ref = formRefNo.trim() || `BB/ICT/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`;
    if (!formRefNo.trim()) {
      setFormRefNo(ref);
    }
    const digitalSvg = generateDigitalReceiptSvgUrl({
      refNo: ref,
      date: formDate,
      type: formType,
      category: formCategory,
      description: formDescription.trim(),
      amount: numAmt,
      payerOrPayee: formPayerPayee.trim() || undefined,
      notes: formNotes.trim() || undefined
    });
    setFormReceiptUrl(digitalSvg);
    setFormReceiptFileName(`Baucar_Digital_${ref.replace(/[/\\?%*:|"<>]/g, '_')}.svg`);
    triggerToast('Resit/Baucar digital rasmi SKMP berjaya dijana!');
  };

  const handleRemoveReceipt = () => {
    setFormReceiptUrl('');
    setFormReceiptFileName('');
  };

  // Quick remove receipt directly from viewing record
  const handleDeleteReceiptFromRecord = (recordId: string) => {
    const updated = records.map((r) => {
      if (r.id === recordId) {
        return {
          ...r,
          receiptUrl: undefined,
          receiptFileName: undefined,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });
    setRecords(updated);
    saveIctCashFlow(updated);
    setViewingReceiptRecord(null);
    triggerToast('Lampiran resit berjaya dipadam daripada transaksi.');
  };

  // Save Add / Edit
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formDate) {
      setFormError('Sila pilih tarikh transaksi.');
      return;
    }
    if (!formDescription.trim()) {
      setFormError('Sila masukkan butiran atau keterangan transaksi.');
      return;
    }
    if (!formRefNo.trim()) {
      setFormError('Sila masukkan nombor rujukan / baucar bayaran / resit.');
      return;
    }
    const numAmt = parseFloat(formAmount);
    if (isNaN(numAmt) || numAmt <= 0) {
      setFormError('Sila masukkan jumlah amaun yang sah (lebih daripada 0).');
      return;
    }

    if (editingRecord) {
      // Update
      const updated = records.map((r) => {
        if (r.id === editingRecord.id) {
          return {
            ...r,
            date: formDate,
            type: formType,
            category: formCategory,
            description: formDescription.trim(),
            refNo: formRefNo.trim(),
            amount: numAmt,
            payerOrPayee: formPayerPayee.trim() || undefined,
            notes: formNotes.trim() || undefined,
            receiptUrl: formReceiptUrl || undefined,
            receiptFileName: formReceiptFileName || undefined,
            updatedAt: new Date().toISOString(),
            updatedBy: userRole === 'admin' ? 'Admin SKMP' : 'Penyelaras ICT'
          };
        }
        return r;
      });
      setRecords(updated);
      saveIctCashFlow(updated);
      setIsFormOpen(false);
      triggerToast('Rekod transaksi & bukti resit berjaya dikemaskini!');
    } else {
      // Add new
      const newRecord: IctCashFlowRecord = {
        id: `cf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        date: formDate,
        type: formType,
        category: formCategory,
        description: formDescription.trim(),
        refNo: formRefNo.trim(),
        amount: numAmt,
        payerOrPayee: formPayerPayee.trim() || undefined,
        notes: formNotes.trim() || undefined,
        receiptUrl: formReceiptUrl || undefined,
        receiptFileName: formReceiptFileName || undefined,
        createdAt: new Date().toISOString(),
        createdBy: userRole === 'admin' ? 'Admin SKMP' : 'Penyelaras ICT'
      };
      const updated = [...records, newRecord];
      setRecords(updated);
      saveIctCashFlow(updated);
      setIsFormOpen(false);
      triggerToast('Transaksi baharu & bukti resit berjaya direkodkan!');
    }
  };

  // Delete transaction
  const handleDeleteRecord = () => {
    if (!deleteConfirmRecord) return;
    const updated = records.filter((r) => r.id !== deleteConfirmRecord.id);
    setRecords(updated);
    saveIctCashFlow(updated);
    setDeleteConfirmRecord(null);
    triggerToast('Transaksi berjaya dipadam daripada sistem.');
  };

  // Reset to initial data
  const handleResetData = () => {
    if (window.confirm('Adakah anda pasti mahu memulihkan data asal contoh aliran tunai ICT SK Merbau Pulas?')) {
      setRecords(INITIAL_ICT_CASHFLOW);
      saveIctCashFlow(INITIAL_ICT_CASHFLOW);
      triggerToast('Data aliran tunai telah ditetapkan semula kepada data asal.');
    }
  };

  // PK Pentadbiran & Principal info for signatures
  const pkStaff = useMemo(() => findPkPentadbiranStaff(staffList), [staffList]);
  const pkName = pkStaff?.name || 'Puan Noraini binti Yusof';
  const headmasterName = profile?.principalName || 'Guru Besar SK Merbau Pulas';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/50 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-xs sm:text-sm font-bold">{successToast}</span>
        </div>
      )}

      {/* Hero / Header Card for Cash Flow */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950/80 to-slate-900 rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-400/30">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Pengurusan Kewangan & Aliran Tunai ICT</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sistem Aliran Tunai (Cash Flow) ICT
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Penyata rekod kemasukan peruntukan, sumbangan PIBG, serta perbelanjaan penyelenggaraan, peralatan, dan bahan habis pakai Makmal Komputer SK Merbau Pulas dengan pengiraan baki automatik.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => exportIctFinanceCsv(records)}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/15 transition cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
              title="Eksport data dalam fail CSV"
            >
              <Download className="w-4 h-4 text-blue-300" />
              <span>Eksport CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/15 transition cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
              title="Cetak Penyata Aliran Tunai Rasmi A4"
            >
              <Printer className="w-4 h-4 text-yellow-300" />
              <span>Cetak Penyata PDF</span>
            </button>

            {isAdmin ? (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition cursor-pointer hover:scale-[1.03] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Transaksi</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="px-4 py-2.5 rounded-2xl bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 font-bold text-xs flex items-center gap-2 border border-yellow-400/30 transition cursor-pointer"
                title="Log masuk untuk menambah atau mengedit transaksi"
              >
                <Lock className="w-4 h-4 text-yellow-400" />
                <span>Log Masuk Admin (Edit)</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Large Stat Cards: Duit Masuk, Duit Keluar, Baki Semasa (Auto-Calculated) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
          {/* 1. Duit Masuk */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 backdrop-blur-md shadow-lg relative overflow-hidden group hover:border-emerald-400/50 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Jumlah Duit Masuk
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-400/30">
                {overallTotals.countIn} Transaksi
              </span>
            </div>
            <div className="mt-2.5 text-2xl sm:text-3xl font-black text-emerald-300 tracking-tight">
              {formatCurrencyRM(overallTotals.totalIn)}
            </div>
            <div className="text-[11px] text-emerald-400/70 font-medium mt-1">
              Peruntukan KPM & Sumbangan PIBG
            </div>
          </div>

          {/* 2. Duit Keluar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/40 border border-rose-500/30 backdrop-blur-md shadow-lg relative overflow-hidden group hover:border-rose-400/50 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                Jumlah Duit Keluar
              </span>
              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-black border border-rose-400/30">
                {overallTotals.countOut} Transaksi
              </span>
            </div>
            <div className="mt-2.5 text-2xl sm:text-3xl font-black text-rose-300 tracking-tight">
              {formatCurrencyRM(overallTotals.totalOut)}
            </div>
            <div className="text-[11px] text-rose-400/70 font-medium mt-1">
              Penyelenggaraan, Alat & Bahan Habis
            </div>
          </div>

          {/* 3. Baki Semasa (Auto Calculated) */}
          <div
            className={`p-4 sm:p-5 rounded-2xl backdrop-blur-md shadow-lg relative overflow-hidden group transition ${
              overallTotals.balance >= 0
                ? 'bg-blue-950/60 border border-yellow-400/50 hover:border-yellow-300'
                : 'bg-red-950/60 border border-red-500 hover:border-red-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-yellow-300 uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-yellow-400" />
                Baki Semasa Tunai ICT
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
                  overallTotals.balance >= 0
                    ? 'bg-yellow-400 text-blue-950 border-yellow-300'
                    : 'bg-red-500 text-white border-red-400'
                }`}
              >
                {overallTotals.balance >= 0 ? 'Surplus / Positif' : 'Defisit'}
              </span>
            </div>
            <div className="mt-2.5 text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formatCurrencyRM(overallTotals.balance)}
            </div>
            <div className="text-[11px] text-slate-300 font-medium mt-1 flex items-center gap-1">
              <span>Auto Kira: Masuk ({formatCurrencyRM(overallTotals.totalIn)}) - Keluar ({formatCurrencyRM(overallTotals.totalOut)})</span>
            </div>
          </div>
        </div>

        {/* Non-admin notice */}
        {!isAdmin && (
          <div className="mt-4 p-3 rounded-xl bg-blue-900/30 border border-blue-400/30 flex items-center justify-between gap-3 text-xs text-blue-200">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-yellow-300 shrink-0" />
              <span>
                <strong>Mod Paparan Telus (Baca Sahaja):</strong> Pengguna biasa dan guru boleh melihat semua rekod aliran tunai secara telus. Hanya Pentadbir (Admin) dibenarkan mengedit atau memadam data.
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenLogin}
              className="px-3 py-1 bg-yellow-400 text-blue-950 font-bold rounded-lg text-[11px] shrink-0 hover:bg-yellow-300 transition"
            >
              Log Masuk
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/10 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari butiran, no rujukan, penerima..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950/80 border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Type Filter Buttons */}
            <div className="flex rounded-xl bg-slate-950/60 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setFilterType('semua')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterType === 'semua'
                    ? 'bg-yellow-400 text-blue-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setFilterType('masuk')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  filterType === 'masuk'
                    ? 'bg-emerald-500 text-white'
                    : 'text-emerald-300 hover:text-white'
                }`}
              >
                <ArrowDownLeft className="w-3 h-3" />
                <span>Masuk</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterType('keluar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  filterType === 'keluar'
                    ? 'bg-rose-500 text-white'
                    : 'text-rose-300 hover:text-white'
                }`}
              >
                <ArrowUpRight className="w-3 h-3" />
                <span>Keluar</span>
              </button>
            </div>

            {/* Month Filter */}
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950/80 border border-white/15 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="semua">Semua Bulan</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  Bulan: {m}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950/80 border border-white/15 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 max-w-[200px] truncate"
            >
              <option value="semua">Semua Kategori</option>
              <optgroup label="Duit Masuk">
                {ICT_INFLOW_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Duit Keluar">
                {ICT_OUTFLOW_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </optgroup>
            </select>

            {/* Quick Receipt Filter */}
            <div className="flex rounded-xl bg-slate-950/60 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setFilterReceipt('semua')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterReceipt === 'semua'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Papar semua rekod"
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setFilterReceipt('dengan_resit')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  filterReceipt === 'dengan_resit'
                    ? 'bg-emerald-600 text-white'
                    : 'text-emerald-300 hover:text-white'
                }`}
                title="Papar transaksi yang mempunyai bukti resit"
              >
                <Paperclip className="w-3 h-3" />
                <span>Ada Resit</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterReceipt('tanpa_resit')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterReceipt === 'tanpa_resit'
                    ? 'bg-amber-600 text-white'
                    : 'text-amber-300 hover:text-white'
                }`}
                title="Papar transaksi yang belum dilampirkan resit"
              >
                Tiada
              </button>
            </div>

            {/* Reset Filters button if active */}
            {(searchTerm || filterType !== 'semua' || filterMonth !== 'semua' || filterCategory !== 'semua' || filterReceipt !== 'semua') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('semua');
                  setFilterMonth('semua');
                  setFilterCategory('semua');
                  setFilterReceipt('semua');
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs transition"
                title="Reset Penapis"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filtered Summary stats */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[11px] text-slate-300">
          <div>
            Menunjukkan <strong className="text-white">{filteredRecords.length}</strong> daripada {records.length} rekod transaksi.
          </div>
          <div className="flex items-center gap-3">
            <span>Masuk: <strong className="text-emerald-400">{formatCurrencyRM(filteredTotals.totalIn)}</strong></span>
            <span>Keluar: <strong className="text-rose-400">{formatCurrencyRM(filteredTotals.totalOut)}</strong></span>
            <span>Baki Paparan: <strong className="text-yellow-300">{formatCurrencyRM(filteredTotals.balance)}</strong></span>
          </div>
        </div>
      </div>

      {/* Cash Flow Table (Fit-to-screen, responsive, running balance) */}
      <div className="w-full rounded-2xl border border-white/10 shadow-2xl bg-slate-900/80 backdrop-blur-xl overflow-hidden">
        <table className="w-full text-left border-collapse table-fixed select-none">
          <colgroup>
            <col className="w-[11%] sm:w-[9%]" />
            <col className="w-[13%] sm:w-[11%]" />
            <col className="w-[28%] sm:w-[28%]" />
            <col className="w-[12%] sm:w-[11%]" />
            <col className="w-[12%] sm:w-[11%]" />
            <col className="w-[12%] sm:w-[11%]" />
            <col className="w-[12%] sm:w-[12%]" />
            {isAdmin && <col className="w-[0%] sm:w-[7%]" />}
          </colgroup>
          <thead>
            <tr className="bg-slate-950/85 border-b border-white/10 text-xs font-black uppercase text-slate-300">
              <th className="p-2 sm:p-3 text-center border-r border-white/10">Tarikh</th>
              <th className="p-2 sm:p-3 border-r border-white/10">No. Rujukan</th>
              <th className="p-2 sm:p-3 border-r border-white/10">Butiran & Kategori</th>
              <th className="p-2 sm:p-3 text-center border-r border-white/10 text-emerald-300">Resit / Bukti</th>
              <th className="p-2 sm:p-3 text-right border-r border-white/10 text-emerald-400">Duit Masuk</th>
              <th className="p-2 sm:p-3 text-right border-r border-white/10 text-rose-400">Duit Keluar</th>
              <th className="p-2 sm:p-3 text-right border-r border-white/10 text-yellow-300">Baki Semasa</th>
              {isAdmin && <th className="p-2 sm:p-3 text-center hidden sm:table-cell">Tindakan</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 8 : 7} className="p-8 text-center text-slate-400">
                  <div className="max-w-md mx-auto space-y-2">
                    <FileText className="w-8 h-8 text-slate-500 mx-auto" />
                    <p className="font-bold text-sm text-slate-300">Tiada rekod transaksi dijumpai.</p>
                    <p className="text-xs text-slate-400">
                      Sila ubah kata kunci carian atau tetapan penapis di atas.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRecords.map((r, idx) => {
                const isMasuk = r.type === 'masuk';
                return (
                  <tr
                    key={r.id}
                    className="hover:bg-white/[0.03] transition duration-150 group"
                  >
                    {/* Tarikh */}
                    <td className="p-2 sm:p-3 text-center border-r border-white/10">
                      <div className="font-bold text-xs text-slate-200">
                        {r.date}
                      </div>
                      <span className="text-[9px] text-slate-400 block sm:hidden font-mono mt-0.5">
                        #{idx + 1}
                      </span>
                    </td>

                    {/* No Rujukan */}
                    <td className="p-2 sm:p-3 border-r border-white/10">
                      <div className="font-mono text-[11px] sm:text-xs font-bold text-slate-300 truncate" title={r.refNo}>
                        {r.refNo}
                      </div>
                      {r.payerOrPayee && (
                        <div className="text-[9px] sm:text-[10px] text-slate-400 truncate mt-0.5" title={r.payerOrPayee}>
                          {r.payerOrPayee}
                        </div>
                      )}
                    </td>

                    {/* Butiran & Kategori */}
                    <td className="p-2 sm:p-3 border-r border-white/10">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${
                            isMasuk
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                          }`}
                        >
                          {r.category}
                        </span>
                      </div>
                      <div className="font-bold text-xs sm:text-sm text-white mt-1 leading-snug line-clamp-2">
                        {r.description}
                      </div>
                      {r.notes && (
                        <div className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 truncate italic">
                          Nota: {r.notes}
                        </div>
                      )}

                      {/* Mobile receipt preview badge */}
                      {r.receiptUrl && (
                        <div className="mt-1.5 sm:hidden">
                          <button
                            type="button"
                            onClick={() => {
                              setViewingReceiptRecord(r);
                              setReceiptZoomLevel(1);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold"
                          >
                            <Paperclip className="w-3 h-3" />
                            <span>Lihat Resit / Bukti</span>
                          </button>
                        </div>
                      )}

                      {/* Mobile action buttons when admin */}
                      {isAdmin && (
                        <div className="flex sm:hidden items-center gap-2 mt-2 pt-1 border-t border-white/5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(r)}
                            className="px-2 py-0.5 rounded bg-yellow-400 text-blue-950 text-[10px] font-bold flex items-center gap-1"
                          >
                            <Edit3 className="w-2.5 h-2.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmRecord(r)}
                            className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                            <span>Padam</span>
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Resit / Bukti Pembelian */}
                    <td className="p-2 sm:p-3 text-center border-r border-white/10">
                      {r.receiptUrl ? (
                        <button
                          type="button"
                          onClick={() => {
                            setViewingReceiptRecord(r);
                            setReceiptZoomLevel(1);
                          }}
                          className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold transition shadow-sm group/btn hover:scale-105"
                          title="Klik untuk melihat resit atau bukti pembelian"
                        >
                          <Paperclip className="w-3.5 h-3.5 text-emerald-400 group-hover/btn:rotate-12 transition" />
                          <span className="hidden md:inline">Lihat Resit</span>
                          <span className="md:hidden">Resit</span>
                        </button>
                      ) : isAdmin ? (
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(r)}
                          className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-yellow-400/20 text-slate-400 hover:text-yellow-300 border border-white/10 hover:border-yellow-400/30 text-[10px] font-medium transition"
                          title="Tambah resit/bukti pembelian"
                        >
                          <Upload className="w-3 h-3" />
                          <span className="hidden lg:inline">+ Lampirkan</span>
                          <span className="lg:hidden">+ Resit</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic font-mono">-</span>
                      )}
                    </td>

                    {/* Duit Masuk */}
                    <td className="p-2 sm:p-3 text-right border-r border-white/10">
                      {isMasuk ? (
                        <span className="font-black text-xs sm:text-sm text-emerald-400 block">
                          +{formatCurrencyRM(r.amount)}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs font-mono">-</span>
                      )}
                    </td>

                    {/* Duit Keluar */}
                    <td className="p-2 sm:p-3 text-right border-r border-white/10">
                      {!isMasuk ? (
                        <span className="font-black text-xs sm:text-sm text-rose-400 block">
                          -{formatCurrencyRM(r.amount)}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs font-mono">-</span>
                      )}
                    </td>

                    {/* Baki Semasa (Running Balance) */}
                    <td className="p-2 sm:p-3 text-right border-r border-white/10">
                      <div
                        className={`font-black text-xs sm:text-sm ${
                          r.runningBalance >= 0 ? 'text-yellow-300' : 'text-rose-400'
                        }`}
                      >
                        {formatCurrencyRM(r.runningBalance)}
                      </div>
                      <span className="text-[8.5px] text-slate-400 block">
                        Baki Garisan
                      </span>
                    </td>

                    {/* Tindakan (Admin Only - Desktop) */}
                    {isAdmin && (
                      <td className="p-2 sm:p-3 text-center hidden sm:table-cell">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(r)}
                            className="p-1.5 rounded-lg hover:bg-yellow-400 hover:text-blue-950 text-slate-300 transition"
                            title="Edit Transaksi"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmRecord(r)}
                            className="p-1.5 rounded-lg hover:bg-rose-600 hover:text-white text-rose-300 transition"
                            title="Padam Transaksi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
          {filteredRecords.length > 0 && (
            <tfoot>
              <tr className="bg-slate-950/90 font-black text-xs sm:text-sm text-white border-t-2 border-white/20">
                <td colSpan={4} className="p-3 text-right uppercase tracking-wider text-yellow-300 border-r border-white/10">
                  Jumlah Transaksi Terpilih:
                </td>
                <td className="p-3 text-right text-emerald-400 border-r border-white/10">
                  {formatCurrencyRM(filteredTotals.totalIn)}
                </td>
                <td className="p-3 text-right text-rose-400 border-r border-white/10">
                  {formatCurrencyRM(filteredTotals.totalOut)}
                </td>
                <td className="p-3 text-right text-yellow-300 border-r border-white/10">
                  {formatCurrencyRM(filteredTotals.balance)}
                </td>
                {isAdmin && <td className="p-3 hidden sm:table-cell"></td>}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Reset to demo data button (for admin) */}
      {isAdmin && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleResetData}
            className="text-[11px] text-slate-400 hover:text-slate-200 underline flex items-center gap-1 transition"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Pulihkan Data Contoh Aliran Tunai ICT SKMP</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH / EDIT TRANSAKSI (ADMIN) */}
      {/* ========================================================================= */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-white max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white">
                  {editingRecord ? 'Kemaskini Transaksi Aliran Tunai' : 'Tambah Transaksi Aliran Tunai Baharu'}
                </h4>
                <p className="text-xs text-slate-300">
                  {editingRecord ? 'Pinda butiran urus niaga ICT' : 'Rekodkan penerimaan duit masuk atau perbelanjaan keluar'}
                </p>
              </div>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 flex items-center gap-2 text-xs text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveForm} className="mt-5 space-y-4">
              {/* 1. Jenis Transaksi: Duit Masuk vs Duit Keluar */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Jenis Transaksi <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('masuk');
                      setFormCategory(ICT_INFLOW_CATEGORIES[0]);
                    }}
                    className={`p-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 border transition ${
                      formType === 'masuk'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/30'
                        : 'bg-slate-950/60 text-slate-300 border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    <span>Duit Masuk (+)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormType('keluar');
                      setFormCategory(ICT_OUTFLOW_CATEGORIES[0]);
                    }}
                    className={`p-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 border transition ${
                      formType === 'keluar'
                        ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/30'
                        : 'bg-slate-950/60 text-slate-300 border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Duit Keluar (-)</span>
                  </button>
                </div>
              </div>

              {/* 2. Tarikh Transaksi */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Tarikh Transaksi <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              {/* 3. Kategori */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Kategori <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  {formType === 'masuk' ? (
                    ICT_INFLOW_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))
                  ) : (
                    ICT_OUTFLOW_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* 4. Butiran / Keterangan Urus Niaga */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Butiran / Keterangan Transaksi <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Contoh: Pembelian 2 Unit Toner Pencetak HP LaserJet Makmal"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              {/* 5. No Rujukan & Amaun (Grid 2 cols) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    No. Rujukan / Baucar / Resit <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formRefNo}
                    onChange={(e) => setFormRefNo(e.target.value)}
                    placeholder="Contoh: BB/ICT/2026/008"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Jumlah Amaun (RM) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                      RM
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      placeholder="0.00"
                      required
                      className="w-full pl-11 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 6. Diterima Daripada / Dibayar Kepada */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {formType === 'masuk' ? 'Diterima Daripada' : 'Dibayar Kepada / Pembekal'}
                </label>
                <input
                  type="text"
                  value={formPayerPayee}
                  onChange={(e) => setFormPayerPayee(e.target.value)}
                  placeholder={formType === 'masuk' ? 'Contoh: Kementerian Pendidikan Malaysia / PIBG' : 'Contoh: Mega Tech Computer Supplies'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              {/* 7. Catatan Tambahan */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Catatan Tambahan (Pilihan)
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Catatan sokongan atau rujukan invois berkaitan..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              {/* 8. Resit & Bukti Pembelian */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/15 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Receipt className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white">
                        Resit / Bukti Pembelian
                      </label>
                      <span className="text-[10px] text-slate-400">
                        Lampirkan gambar resit fizikal, invois, atau baucar bayaran
                      </span>
                    </div>
                  </div>
                  {formReceiptUrl && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                      Resit Dilampirkan
                    </span>
                  )}
                </div>

                {formReceiptUrl ? (
                  <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center gap-3">
                      {/* Thumbnail Preview */}
                      <div className="w-16 h-16 rounded-lg bg-slate-950 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center relative group">
                        <img
                          src={formReceiptUrl}
                          alt="Pratonton Resit"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {formReceiptFileName || 'Resit_Transaksi.jpg'}
                        </p>
                        <p className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Fail sedia untuk disimpan bersama transaksi</span>
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <a
                            href={formReceiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-slate-200 transition"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Lihat Penuh</span>
                          </a>
                          <button
                            type="button"
                            onClick={handleRemoveReceipt}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-[11px] font-bold text-rose-300 border border-rose-500/30 transition"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Padam Resit</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* File Drop / Upload Input */}
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/20 hover:border-emerald-400/60 rounded-xl bg-slate-900/50 hover:bg-slate-900/80 cursor-pointer transition text-center group">
                      <input
                        type="file"
                        accept="image/*,.pdf,.svg"
                        onChange={handleReceiptFileUpload}
                        disabled={isCompressingReceipt}
                        className="hidden"
                      />
                      {isCompressingReceipt ? (
                        <div className="flex items-center gap-2 text-xs text-yellow-300 py-1">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Sedang memampat dan memproses fail resit...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-400 group-hover:scale-110 transition mb-1.5" />
                          <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                            Pilih Fail Resit / Tangkap Gambar
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            Menyokong JPG, PNG, WebP atau tangkapan kamera telefon (Maks 10MB)
                          </span>
                        </>
                      )}
                    </label>

                    {/* Auto Generate Digital Voucher option */}
                    <div className="pt-1 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">
                        Tiada resit fizikal?
                      </span>
                      <button
                        type="button"
                        onClick={handleGenerateDigitalVoucher}
                        className="px-2.5 py-1 rounded-lg bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 border border-yellow-400/30 text-[11px] font-bold transition flex items-center gap-1.5"
                        title="Jana baucar pembayaran/penerimaan rasmi digital dengan cop SK Merbau Pulas"
                      >
                        <Receipt className="w-3 h-3" />
                        <span>Jana Baucar/Resit Digital Rasmi SKMP</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingRecord ? 'Simpan Perubahan' : 'Simpan Transaksi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PENGESAHAN PADAM TRANSAKSI */}
      {/* ========================================================================= */}
      {deleteConfirmRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl text-white space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-400/30 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-lg font-black text-white">Padam Transaksi Ini?</h4>
              <p className="text-xs text-slate-300">
                Adakah anda pasti mahu memadam rekod transaksi bernilai{' '}
                <strong className="text-yellow-300">{formatCurrencyRM(deleteConfirmRecord.amount)}</strong> bagi:
              </p>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-left text-slate-200 mt-2">
                <div><strong>Tarikh:</strong> {deleteConfirmRecord.date}</div>
                <div><strong>No. Rujukan:</strong> {deleteConfirmRecord.refNo}</div>
                <div><strong>Butiran:</strong> {deleteConfirmRecord.description}</div>
              </div>
              <p className="text-[11px] text-rose-300 mt-2">
                Tindakan ini akan mengira semula baki semasa aliran tunai secara automatik.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmRecord(null)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteRecord}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-600/30 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Padam</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CETAK PENYATA RASMI ALIRAN TUNAI ICT (A4 PRINT VIEW) */}
      {/* ========================================================================= */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl max-h-[92vh] overflow-y-auto relative">
            {/* Header controls inside print modal */}
            <div className="no-print flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-900 font-bold text-xs border border-blue-200">
                  Pratonton Cetakan Rasmi A4
                </span>
                <span className="text-xs text-slate-500">
                  Penyata Aliran Tunai Makmal Komputer
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Sekarang</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition"
                  title="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="space-y-6 printable-content">
              {/* Official School Letterhead */}
              <div className="flex items-center gap-5 pb-4 border-b-2 border-slate-800">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/9/91/Coat_of_arms_of_Malaysia.svg"
                  alt="Jata Negara"
                  className="w-16 h-16 object-contain shrink-0"
                />
                <div className="text-center flex-1">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
                    SEKOLAH KEBANGSAAN MERBAU PULAS
                  </h2>
                  <p className="text-xs font-bold text-slate-700">
                    KOD SEKOLAH: KBA5012 • DAERAH KUALA MUDA / YAN, KEDAH DARUL AMAN
                  </p>
                  <p className="text-[11px] text-slate-600">
                    09300 KUALA KETIL, KEDAH • TEL: 04-4161223 • EMEL: KBA5012@moe.edu.my
                  </p>
                  <div className="mt-2 inline-block px-4 py-1 rounded bg-slate-100 border border-slate-300 text-xs font-black uppercase tracking-wider text-slate-900">
                    PENYATA ALIRAN TUNAI KELUAR MASUK KEWANGAN ICT SESI 2026
                  </div>
                </div>
                <div className="w-16 h-16 rounded-xl bg-blue-900 text-yellow-400 flex flex-col items-center justify-center font-black text-xs shrink-0 shadow">
                  <span>SKMP</span>
                  <span className="text-[9px] text-white">ICT</span>
                </div>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Tarikh Penyata</span>
                  <strong className="text-slate-900">{new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Unit / Lokasi</span>
                  <strong className="text-slate-900">Makmal Komputer (Bilik ICT 1)</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Jumlah Transaksi</span>
                  <strong className="text-slate-900">{records.length} Urus Niaga</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Baki Bersih Semasa</span>
                  <strong className="text-emerald-700">{formatCurrencyRM(overallTotals.balance)}</strong>
                </div>
              </div>

              {/* Financial Summary Highlight */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300">
                  <div className="text-[10px] uppercase font-bold text-emerald-800">Jumlah Duit Masuk (+)</div>
                  <div className="text-base sm:text-lg font-black text-emerald-700">{formatCurrencyRM(overallTotals.totalIn)}</div>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-300">
                  <div className="text-[10px] uppercase font-bold text-rose-800">Jumlah Duit Keluar (-)</div>
                  <div className="text-base sm:text-lg font-black text-rose-700">{formatCurrencyRM(overallTotals.totalOut)}</div>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-300">
                  <div className="text-[10px] uppercase font-bold text-blue-900">Baki Semasa Simpanan</div>
                  <div className="text-base sm:text-lg font-black text-blue-900">{formatCurrencyRM(overallTotals.balance)}</div>
                </div>
              </div>

              {/* Detailed Transaction Table */}
              <div>
                <h5 className="text-xs font-black uppercase text-slate-800 mb-2">
                  Buku Tunai / Rekod Transaksi Terperinci:
                </h5>
                <table className="w-full text-left border-collapse text-xs border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-black uppercase text-slate-700">
                      <th className="p-2 border-r border-slate-300 w-8 text-center">Bil</th>
                      <th className="p-2 border-r border-slate-300 w-20">Tarikh</th>
                      <th className="p-2 border-r border-slate-300 w-28">No. Rujukan</th>
                      <th className="p-2 border-r border-slate-300">Keterangan / Butiran</th>
                      <th className="p-2 border-r border-slate-300 text-right w-24">Masuk (RM)</th>
                      <th className="p-2 border-r border-slate-300 text-right w-24">Keluar (RM)</th>
                      <th className="p-2 text-right w-24">Baki (RM)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {recordsWithBalance.map((r, idx) => {
                      const isMasuk = r.type === 'masuk';
                      return (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="p-2 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                          <td className="p-2 border-r border-slate-300">{r.date}</td>
                          <td className="p-2 border-r border-slate-300 font-mono text-[10px]">{r.refNo}</td>
                          <td className="p-2 border-r border-slate-300">
                            <span className="font-bold">{r.description}</span>
                            <span className="text-[10px] text-slate-500 block">
                              [{r.category}] {r.payerOrPayee ? `• ${r.payerOrPayee}` : ''}
                            </span>
                          </td>
                          <td className="p-2 border-r border-slate-300 text-right font-mono font-bold text-emerald-700">
                            {isMasuk ? r.amount.toFixed(2) : '-'}
                          </td>
                          <td className="p-2 border-r border-slate-300 text-right font-mono font-bold text-rose-700">
                            {!isMasuk ? r.amount.toFixed(2) : '-'}
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-slate-900">
                            {r.runningBalance.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-black border-t-2 border-slate-400">
                      <td colSpan={4} className="p-2 text-right border-r border-slate-300">
                        JUMLAH KESELURUHAN (RM):
                      </td>
                      <td className="p-2 text-right border-r border-slate-300 text-emerald-800 font-mono">
                        {overallTotals.totalIn.toFixed(2)}
                      </td>
                      <td className="p-2 text-right border-r border-slate-300 text-rose-800 font-mono">
                        {overallTotals.totalOut.toFixed(2)}
                      </td>
                      <td className="p-2 text-right font-mono text-slate-900 font-black">
                        {overallTotals.balance.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Signatures / Endorsement section */}
              <div className="pt-8 grid grid-cols-2 gap-12 text-xs">
                <div className="space-y-12">
                  <div>
                    <p className="font-bold text-slate-800">Disediakan oleh:</p>
                    <div className="h-14"></div>
                    <div className="border-b border-slate-400 w-48"></div>
                    <p className="font-black text-slate-900 mt-1">PENYELARAS ICT</p>
                    <p className="text-slate-600">Unit ICT & Makmal Komputer SKMP</p>
                    <p className="text-slate-500 text-[10px]">Tarikh: .......................................</p>
                  </div>
                </div>

                <div className="space-y-12 text-right">
                  <div>
                    <p className="font-bold text-slate-800">Disemak & Disahkan oleh:</p>
                    <div className="h-14"></div>
                    <div className="border-b border-slate-400 w-48 ml-auto"></div>
                    <p className="font-black text-slate-900 mt-1">{headmasterName}</p>
                    <p className="text-slate-600">Guru Besar / GPK Pentadbiran</p>
                    <p className="text-slate-500 text-[10px]">SK Merbau Pulas (KBA5012)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PAPARAN BUKTI & RESIT PEMBELIAN (INTERACTIVE RECEIPT VIEWER) */}
      {/* ========================================================================= */}
      {viewingReceiptRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl max-w-3xl w-full shadow-2xl text-white overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30 shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm sm:text-base text-white">
                    Bukti & Resit Pembelian ICT
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="font-mono text-emerald-300">{viewingReceiptRecord.refNo}</span>
                    <span>•</span>
                    <span>{viewingReceiptRecord.date}</span>
                    <span>•</span>
                    <span className="font-bold text-yellow-300">{formatCurrencyRM(viewingReceiptRecord.amount)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Zoom Controls */}
                <button
                  type="button"
                  onClick={() => setReceiptZoomLevel((prev) => Math.max(0.6, prev - 0.2))}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
                  title="Zum Keluar"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptZoomLevel(1)}
                  className="px-2 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-mono transition"
                  title="Set Semula Saiz"
                >
                  {Math.round(receiptZoomLevel * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptZoomLevel((prev) => Math.min(2.5, prev + 0.2))}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
                  title="Zum Masuk"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-white/15 mx-1" />
                <button
                  type="button"
                  onClick={() => setViewingReceiptRecord(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 transition"
                  title="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Transaction summary banner & Receipt Image Canvas */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {/* Summary card */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Butiran Urus Niaga:</span>
                  <span className="font-bold text-white text-sm">{viewingReceiptRecord.description}</span>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 text-[10px] font-bold">
                      {viewingReceiptRecord.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${viewingReceiptRecord.type === 'masuk' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                      {viewingReceiptRecord.type === 'masuk' ? 'Duit Masuk' : 'Duit Keluar'}
                    </span>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    {viewingReceiptRecord.type === 'masuk' ? 'Diterima Daripada:' : 'Dibayar Kepada / Pembekal:'}
                  </span>
                  <span className="font-bold text-white text-sm">
                    {viewingReceiptRecord.payerOrPayee || 'Unit ICT SK Merbau Pulas'}
                  </span>
                  {viewingReceiptRecord.notes && (
                    <div className="text-[11px] text-slate-400 mt-1 italic">
                      Nota: {viewingReceiptRecord.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Receipt Image Display Canvas with zoom */}
              <div className="rounded-2xl bg-slate-950 border border-white/15 p-3 sm:p-4 overflow-auto flex items-center justify-center min-h-[350px] max-h-[550px] relative">
                {viewingReceiptRecord.receiptUrl ? (
                  <div
                    style={{ transform: `scale(${receiptZoomLevel})`, transformOrigin: 'center center' }}
                    className="transition-transform duration-200"
                  >
                    <img
                      src={viewingReceiptRecord.receiptUrl}
                      alt={`Bukti Resit ${viewingReceiptRecord.refNo}`}
                      referrerPolicy="no-referrer"
                      className="max-h-[500px] w-auto object-contain rounded-xl shadow-2xl border border-white/10"
                    />
                  </div>
                ) : (
                  <div className="text-center text-slate-400 p-8 space-y-2">
                    <FileText className="w-10 h-10 text-slate-500 mx-auto" />
                    <p className="font-bold text-sm text-slate-300">Tiada fail resit dilampirkan bagi transaksi ini.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 sm:p-5 bg-slate-950/80 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-slate-400 text-[11px]">
                {viewingReceiptRecord.receiptFileName ? (
                  <span>Fail: <strong className="text-slate-200">{viewingReceiptRecord.receiptFileName}</strong></span>
                ) : (
                  <span>Resit Rasmi SK Merbau Pulas (KBA5012)</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Download image/file */}
                {viewingReceiptRecord.receiptUrl && (
                  <a
                    href={viewingReceiptRecord.receiptUrl}
                    download={viewingReceiptRecord.receiptFileName || `Resit_${viewingReceiptRecord.refNo}.png`}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Muat Turun Bukti</span>
                  </a>
                )}

                {/* Edit / Change receipt if Admin */}
                {isAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const rec = viewingReceiptRecord;
                        setViewingReceiptRecord(null);
                        handleOpenEdit(rec);
                      }}
                      className="px-3 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold transition flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Tukar Resit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteReceiptFromRecord(viewingReceiptRecord.id)}
                      className="px-3 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 font-bold transition flex items-center gap-1.5"
                      title="Padam lampiran resit daripada rekod ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Padam Lampiran</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setViewingReceiptRecord(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
