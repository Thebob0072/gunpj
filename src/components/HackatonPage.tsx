'use client';

import { FC, useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Zap, Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Target, Trophy, Flame, ArrowLeft, FolderOpen } from 'lucide-react';
import { HackatonBudgetItem, HackatonSession } from '@/types';
import { BUDGET_DATA, BudgetItem } from '@/data/budget-categories';

// ─── Constants ────────────────────────────────────────────────────────────────

const BUDGET_CATEGORIES = BUDGET_DATA.categories;

const PRESET_COLORS = [
  '#00ff88', '#ff0080', '#00cfff', '#ffcc00', '#ff6600',
  '#cc44ff', '#ff4444', '#44ffcc', '#ff88aa', '#88aaff',
];

const CATEGORY_OPTIONS = [
  'อาหาร & เครื่องดื่ม', 'อุปกรณ์ IT', 'สถานที่', 'ค่าเดินทาง',
  'รางวัล & ของที่ระลึก', 'การตลาด', 'ค่าแรง', 'อื่นๆ',
];

const formatBaht = (n: number) =>
  new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(n);

// ─── Main Component ───────────────────────────────────────────────────────────

const HackatonPage: FC = () => {
  // Navigation
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [activeSession, setActiveSession] = useState<HackatonSession | null>(null);

  // List state
  const [sessions, setSessions] = useState<HackatonSession[]>([]);

  // Detail state
  const [items, setItems] = useState<(HackatonBudgetItem | BudgetItem)[]>([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [sessionTitle, setSessionTitle] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Item form
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState({ title: '', budget: '', spent: '', category: CATEGORY_OPTIONS[0], color: PRESET_COLORS[0] });

  // New session form
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionForm, setSessionForm] = useState({ title: '', description: '', totalBudget: '' });

  const sessionSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load sessions list ────────────────────────────────────────────────────
  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/hackaton');
      const data = await res.json();
      setSessions(
        (data.sessions || []).map((s: HackatonSession) => ({
          ...s,
          totalBudget: Number(s.totalBudget),
          totalSpent: Number(s.totalSpent ?? 0),
          totalAllocated: Number(s.totalAllocated ?? 0),
          itemCount: Number(s.itemCount ?? 0),
        }))
      );
    } catch (err) {
      setApiError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  // ── Open a session (drill into detail) ──────────────────────────────────
  const openSession = (categoryId: string) => {
    const category = BUDGET_CATEGORIES.find(cat => cat.id === categoryId);
    if (!category) return;

    const catTotal = category.items?.reduce((sum: number, item: BudgetItem) => sum + item.budget, 0) || 0;
    
    setActiveSession({
      id: category.id,
      title: category.name,
      description: '',
      totalBudget: catTotal.toString(),
      totalSpent: '0',
      totalAllocated: catTotal.toString(),
      itemCount: category.items?.length || 0,
    });
    
    setSessionTitle(category.name);
    setTotalBudget(catTotal);
    setItems((category.items || []).map((item: BudgetItem) => ({
      ...item,
      budget: Number(item.budget),
      spent: Number(item.budget),
    })));
    setView('detail');
  };

  const goBack = () => {
    setView('list');
    setActiveSession(null);
    setItems([]);
    loadSessions(); // refresh stats
  };

  // ── Auto-save session title / totalBudget ─────────────────────────────────
  const saveSessionMeta = useCallback((title: string, budget: number, id: string) => {
    if (sessionSaveTimer.current) clearTimeout(sessionSaveTimer.current);
    sessionSaveTimer.current = setTimeout(() => {
      fetch('/api/hackaton', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _target: 'session', sessionId: id, title, totalBudget: budget }),
      }).catch(() => {});
    }, 800);
  }, []);

  // ── Create new session ────────────────────────────────────────────────────
  const handleCreateSession = async () => {
    if (!sessionForm.title.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/hackaton', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _target: 'new-session',
          title: sessionForm.title.trim(),
          description: sessionForm.description.trim(),
          emoji: '',
          totalBudget: Number(sessionForm.totalBudget) || 0,
        }),
      });
      const data = await res.json();
      if (data.session) {
        setSessions(p => [...p, { ...data.session, itemCount: 0, totalSpent: 0, totalAllocated: 0 }]);
        setShowSessionForm(false);
        setSessionForm({ title: '', description: '', totalBudget: '' });
      }
    } catch (err) {
      setApiError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete session ─────────────────────────────────────────────────────────
  const handleDeleteSession = async (id: string, title: string) => {
    if (!window.confirm(`ลบหัวข้อ "${title}" และรายการทั้งหมดในนั้น?`)) return;
    setSessions(p => p.filter(s => s.id !== id));
    try {
      await fetch(`/api/hackaton?sessionId=${id}`, { method: 'DELETE' });
    } catch (err) {
      setApiError((err as Error).message);
      loadSessions();
    }
  };

  // ── Item CRUD ─────────────────────────────────────────────────────────────
  const openAddItem = () => {
    setEditingId(null);
    setItemForm({ title: '', budget: '', spent: '', category: CATEGORY_OPTIONS[0], color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)] });
    setShowItemForm(true);
  };

  const openEditItem = (item: HackatonBudgetItem) => {
    setEditingId(item.id);
    setItemForm({ title: item.title, budget: String(item.budget), spent: String(item.spent), category: item.category, color: item.color });
    setShowItemForm(true);
  };

  const handleSaveItem = async () => {
    if (!itemForm.title.trim() || !activeSession) return;
    setIsSaving(true);
    try {
      const payload = { title: itemForm.title.trim(), budget: Number(itemForm.budget) || 0, spent: Number(itemForm.spent) || 0, category: itemForm.category, color: itemForm.color };
      if (editingId) {
        const res = await fetch('/api/hackaton', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingId, ...payload }) });
        const data = await res.json();
        setItems(p => p.map(i => i.id === editingId ? { ...data.item, budget: Number(data.item.budget), spent: Number(data.item.spent) } : i));
      } else {
        const res = await fetch('/api/hackaton', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, sessionId: activeSession.id }) });
        const data = await res.json();
        setItems(p => [...p, { ...data.item, budget: Number(data.item.budget), spent: Number(data.item.spent) }]);
      }
      setShowItemForm(false);
      setEditingId(null);
    } catch (err) {
      setApiError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('ลบรายการนี้?')) return;
    setItems(p => p.filter(i => i.id !== id));
    try {
      await fetch(`/api/hackaton?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      setApiError((err as Error).message);
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const totalSpent = items.reduce((s, i) => s + i.spent, 0);
  const totalAllocated = items.reduce((s, i) => s + i.budget, 0);
  const remaining = totalBudget - totalSpent;
  const overallPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full bg-white  text-gray-900 px-3 sm:px-6 md:px-8 py-6 sm:py-8">

      {/* Error banner */}
      {apiError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm flex items-center justify-between">
          <span>⚠ {apiError}</span>
          <button onClick={() => setApiError(null)} className="text-red-400 hover:text-gray-900 ml-4">✕</button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-24 text-orange-500 animate-pulse">
          <Zap size={32} className="mr-3" /> กำลังโหลด...
        </div>
      )}

      {/* ══════════════════════ LIST VIEW ══════════════════════ */}
      {!isLoading && view === 'list' && (
        <>
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="p-2 bg-orange-500 rounded-lg"><Zap size={20} className="text-white" /></div>
                <span className="text-orange-600 text-xs tracking-widest uppercase font-black">ประมาณการ · หมวดงบประมาณ</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 break-words">หมวดงบประมาณทั้งหมด</h1>
              <p className="text-gray-500 text-xs mt-2 tracking-wider font-semibold">{BUDGET_CATEGORIES.length} หมวด</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <Link href="/hackathon" className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-emerald-500 text-white font-bold rounded-lg hover:shadow-lg hover:scale-105 transition-all text-xs sm:text-sm whitespace-nowrap shadow-md">
                ดูหน้าวิเคราะห์
              </Link>
              <Link href="/allocation" className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-blue-500 text-white font-bold rounded-lg hover:shadow-lg hover:scale-105 transition-all text-xs sm:text-sm whitespace-nowrap shadow-md">
                📊 สัดส่วนงบ
              </Link>
              <Link href="/anomalies" className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-red-500 text-white font-bold rounded-lg hover:shadow-lg hover:scale-105 transition-all text-xs sm:text-sm whitespace-nowrap shadow-md">
                🔴 ความผิดปกติ
              </Link>
            </div>
          </div>

          {/* Municipality Total Budget Card */}
          <div className="mb-8 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-3xl p-6 sm:p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-4xl">🏛️</div>
              <h2 className="text-xl sm:text-2xl font-black text-blue-900">งบประมาณประจำปี พ.ศ. {BUDGET_DATA.municipalityYear}</h2>
            </div>
            <p className="text-blue-700 text-sm mb-4">เทศบาลนครนครราชสีมา</p>
            <div className="flex items-baseline gap-2 mb-3">
              <p className="text-4xl sm:text-5xl font-black text-blue-600">
                {formatBaht(BUDGET_DATA.municipalityTotalBudget)}
              </p>
            </div>
            <div className="w-full h-3 bg-blue-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: '100%' }} />
            </div>
            <p className="text-xs text-blue-600 font-semibold mt-3">อ้างอิงจากเทศบัญญัติงบประมาณรายจ่าย หน้า 13</p>
          </div>

          {/* Budget Category Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {BUDGET_CATEGORIES.map(category => {
              const catTotal = (category.items || []).reduce((sum: number, item: BudgetItem) => sum + item.budget, 0);
              const totalBudgetAll = BUDGET_CATEGORIES.reduce((sum: number, c) => {
                const cTotal = (c.items || []).reduce((s: number, item: BudgetItem) => s + item.budget, 0);
                return sum + cTotal;
              }, 0);
              const percentOfTotal = (catTotal / totalBudgetAll) * 100;
              return (
                <div
                  key={category.id}
                  onClick={() => openSession(category.id)}
                  className="group relative bg-white border-2 rounded-2xl p-5 sm:p-6 hover:shadow-xl hover:scale-102 transition-all cursor-pointer shadow-md"
                  style={{ borderColor: category.color || '#f59e0b' }}
                >
                  {/* Icon and title */}
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <div className="text-3xl mb-2">{category.icon}</div>
                      <p className="font-black text-lg sm:text-xl text-gray-950 group-hover:text-orange-600 transition-colors">{category.name}</p>
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: category.color || '#f59e0b' }}
                    >
                      {percentOfTotal.toFixed(0)}%
                    </div>
                  </div>

                  {/* Budget display */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">งบประมาณ</p>
                      <p className="font-black text-xl text-gray-900">{formatBaht(catTotal)}</p>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full rounded-full h-3 background overflow-hidden" style={{ backgroundColor: '#e5e7eb' }}>
                      <div
                        className="h-3 rounded-full transition-all duration-500"
                        style={{
                          width: '100%',
                          backgroundColor: category.color || '#f59e0b',
                          boxShadow: `0 0 8px ${category.color || '#f59e0b'}80`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ══════════════════════ DETAIL VIEW ══════════════════════ */}
      {!isLoading && view === 'detail' && activeSession && (
        <>
          {/* Header */}
          <div className="mb-8">
            <button onClick={goBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm mb-4 transition-colors">
              <ArrowLeft size={16} /> กลับหัวข้อทั้งหมด
            </button>
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{activeSession.emoji || '⚡'}</span>
                  <span className="text-orange-500 text-xs tracking-widest uppercase font-bold">Budget Tracker</span>
                </div>
                <input
                  className="bg-transparent text-3xl sm:text-5xl font-black text-gray-900 outline-none border-b-2 border-dashed border-orange-500/60 w-full max-w-xl focus:border-orange-500 transition-colors placeholder-white/30"
                  value={sessionTitle}
                  onChange={e => {
                    setSessionTitle(e.target.value);
                    saveSessionMeta(e.target.value, totalBudget, activeSession.id);
                  }}
                />
                {activeSession.description && (
                  <p className="text-gray-500 text-sm mt-1">{activeSession.description}</p>
                )}
              </div>
              <button
                onClick={openAddItem}
                className="flex items-center gap-2 px-5 py-3 bg-white  text-black font-black rounded-xl hover:scale-105 transition-transform shadow-lg shadow-orange-500/40 text-sm"
              >
                <Plus size={18} /> เพิ่มรายการ
              </button>
            </div>
          </div>

          {/* Total budget row */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Target size={22} className="text-cyan-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-gray-900/50 text-xs uppercase tracking-widest mb-1">งบประมาณรวมทั้งหมด</p>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900/60 text-lg">฿</span>
                  <input
                    type="number"
                    className="bg-transparent text-2xl font-black text-cyan-300 outline-none w-40 sm:w-56 border-b border-cyan-500/40 focus:border-cyan-400 transition-colors"
                    value={totalBudget || ''}
                    onChange={e => {
                      const v = Number(e.target.value) || 0;
                      setTotalBudget(v);
                      saveSessionMeta(sessionTitle, v, activeSession.id);
                    }}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            {totalBudget > 0 && (
              <div className="flex gap-6 text-center">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">ใช้ไปแล้ว</p>
                  <p className="text-red-400 font-black text-xl">{formatBaht(totalSpent)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">คงเหลือ</p>
                  <p className={`font-black text-xl ${remaining >= 0 ? 'text-green-400' : 'text-red-500'}`}>{formatBaht(remaining)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Overall progress */}
          {totalBudget > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2 text-xs text-gray-900/50 uppercase tracking-wider">
                <span>การใช้งบประมาณรวม</span>
                <span className={overallPct >= 90 ? 'text-red-400 font-bold animate-pulse' : ''}>{overallPct.toFixed(1)}%</span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${overallPct}%`,
                    background: overallPct >= 90 ? 'linear-gradient(90deg,#ff4444,#ff0000)' : overallPct >= 70 ? 'linear-gradient(90deg,#ffcc00,#ff6600)' : 'linear-gradient(90deg,#00ff88,#00cfff)',
                  }}
                />
              </div>
            </div>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
            {[
              { label: 'รายการทั้งหมด', value: items.length, icon: <Trophy size={20} />, color: 'text-orange-500', border: 'border-orange-500/30' },
              { label: 'งบที่จัดสรร', value: formatBaht(totalAllocated), icon: <DollarSign size={20} />, color: 'text-cyan-400', border: 'border-cyan-500/30' },
              { label: 'ใช้ไปแล้ว', value: formatBaht(totalSpent), icon: <TrendingDown size={20} />, color: 'text-red-400', border: 'border-red-500/30' },
              { label: 'เกินงบ', value: items.filter(i => i.spent > i.budget).length + ' รายการ', icon: <Flame size={20} />, color: 'text-orange-400', border: 'border-orange-500/30' },
            ].map((s, idx) => (
              <div key={idx} className={`bg-gray-50 border ${s.border} rounded-xl p-4 hover:bg-gray-100 transition-colors`}>
                <div className={`${s.color} mb-2`}>{s.icon}</div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{s.label}</p>
                <p className={`${s.color} font-black text-lg sm:text-xl leading-tight`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {items.length === 0 && (
            <div className="text-center py-24 text-gray-400">
              <Zap size={64} className="mx-auto mb-4 text-orange-500/30" />
              <p className="text-2xl font-black">ยังไม่มีรายการ</p>
              <p className="text-sm mt-2 tracking-wider">กด &quot;เพิ่มรายการ&quot; เพื่อเริ่มต้น</p>
            </div>
          )}

          {/* Items list */}
          <div className="space-y-4">
            {items.map(item => {
              const pct = item.budget > 0 ? Math.min((item.spent / item.budget) * 100, 100) : 0;
              const isOver = item.spent > item.budget;
              return (
                <div
                  key={item.id}
                  className="group bg-gray-50 border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition-all cursor-pointer"
                  onClick={() => openEditItem(item)}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-4 h-4 rounded-full flex-shrink-0 mt-1 ring-2 ring-white/20" style={{ backgroundColor: item.color, boxShadow: `0 0 12px ${item.color}80` }} />
                      <div className="min-w-0">
                        <p className="font-black text-lg sm:text-xl text-gray-900 truncate">{item.title}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {item.category}
                          {isOver && <span className="ml-2 text-red-400 font-bold animate-pulse">⚠ เกินงบ!</span>}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); handleDeleteItem(item.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-500/20 text-red-400 flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="mb-3">
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: isOver ? '#ff4444' : item.color, boxShadow: `0 0 8px ${isOver ? '#ff444480' : item.color + '80'}` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-900/50">ใช้: <span className="font-bold" style={{ color: isOver ? '#ff6666' : item.color }}>{formatBaht(item.spent)}</span></span>
                    <span className="text-gray-900/30">จาก {formatBaht(item.budget)}</span>
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      {isOver ? <TrendingUp size={12} className="text-red-400" /> : <TrendingDown size={12} className="text-green-400" />}
                      {pct.toFixed(0)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Item add/edit modal */}
          {showItemForm && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
              <div className="bg-gray-900 border border-gray-300 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="font-black text-xl text-gray-900 mb-6 flex items-center gap-2">
                  <Zap size={20} className="text-orange-500" />
                  {editingId ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-900/50 text-xs uppercase tracking-wider">ชื่อรายการ *</label>
                    <input className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-bold mt-1 outline-none focus:border-orange-500/60 transition-colors" value={itemForm.title} onChange={e => setItemForm(p => ({ ...p, title: e.target.value }))} placeholder="เช่น ค่าอาหารทีม..." autoFocus />
                  </div>
                  <div>
                    <label className="text-gray-900/50 text-xs uppercase tracking-wider">หมวดหมู่</label>
                    <select className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-bold mt-1 outline-none focus:border-orange-500/60 transition-colors" value={itemForm.category} onChange={e => setItemForm(p => ({ ...p, category: e.target.value }))}>
                      {CATEGORY_OPTIONS.map(c => <option key={c} value={c} className="bg-white text-gray-900">{c}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-gray-900/50 text-xs uppercase tracking-wider">งบที่ตั้ง (฿)</label>
                      <input type="number" className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-bold mt-1 outline-none focus:border-cyan-400/60 transition-colors" value={itemForm.budget} onChange={e => setItemForm(p => ({ ...p, budget: e.target.value }))} placeholder="0" />
                    </div>
                    <div>
                      <label className="text-gray-900/50 text-xs uppercase tracking-wider">ใช้ไปแล้ว (฿)</label>
                      <input type="number" className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-bold mt-1 outline-none focus:border-red-400/60 transition-colors" value={itemForm.spent} onChange={e => setItemForm(p => ({ ...p, spent: e.target.value }))} placeholder="0" />
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-900/50 text-xs uppercase tracking-wider">สี</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {PRESET_COLORS.map(c => (
                        <button key={c} type="button" onClick={() => setItemForm(p => ({ ...p, color: c }))} className="w-7 h-7 rounded-full transition-transform hover:scale-125 focus:outline-none"
                          style={{ backgroundColor: c, boxShadow: itemForm.color === c ? `0 0 0 3px ${c}60, 0 0 10px ${c}` : 'none', transform: itemForm.color === c ? 'scale(1.2)' : '' }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowItemForm(false)} className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-900/60 font-bold hover:bg-gray-100 transition-colors">ยกเลิก</button>
                  <button onClick={handleSaveItem} disabled={!itemForm.title.trim() || isSaving} className="flex-1 py-3 rounded-xl bg-white  text-black font-black hover:scale-105 transition-transform disabled:opacity-40 disabled:scale-100">
                    {isSaving ? '...' : editingId ? 'บันทึก' : 'เพิ่ม'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HackatonPage;
