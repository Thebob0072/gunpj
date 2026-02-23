import { FC } from 'react';
import { List, BarChart3, Plus, Send, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  view: 'list' | 'dashboard';
  setView: (view: 'list' | 'dashboard') => void;
  onAddTask: () => void;
  onOpenLineGroupSelector: () => void;
  selectedLineGroupName?: string;
  selectedLineGroupMemberCount?: number;
}

const Header: FC<HeaderProps> = ({ view, setView, onAddTask, onOpenLineGroupSelector, selectedLineGroupName, selectedLineGroupMemberCount }) => (
  <div className="flex justify-between items-center mb-8 pb-6 border-b-2 border-orange-200">
    <div className="flex flex-col">
      <h1 className="text-5xl font-black text-orange-800 tracking-tight drop-shadow-sm">
        โปรแกรมจัดการงาน
      </h1>
      {selectedLineGroupName && (
        <div className="flex items-center gap-2 mt-3 text-sm text-orange-700 font-semibold bg-orange-100 px-4 py-2 rounded-full inline-fit w-fit">
          <CheckCircle2 size={16} className="text-green-600" />
          <span>{selectedLineGroupName} ({selectedLineGroupMemberCount || 0} สมาชิก)</span>
        </div>
      )}
    </div>
    <div className="flex gap-3">
      {/* View Toggle */}
      <div className="flex gap-1.5 bg-gradient-to-r from-orange-100 to-orange-50 p-1.5 rounded-xl border border-orange-200">
        <button 
          onClick={() => setView('list')} 
          className={view === 'list' ? 'flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold transition-all duration-200 bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/50' : 'flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold transition-all duration-200 text-orange-700 hover:bg-orange-200/60'}
        >
          <List size={20} />
          <span className="hidden sm:inline">รายการ</span>
        </button>
        <button 
          onClick={() => setView('dashboard')} 
          className={view === 'dashboard' ? 'flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold transition-all duration-200 bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/50' : 'flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold transition-all duration-200 text-orange-700 hover:bg-orange-200/60'}
        >
          <BarChart3 size={20} />
          <span className="hidden sm:inline">แดชบอร์ด</span>
        </button>
      </div>
      
      {/* LINE Button */}
      <button 
        onClick={onOpenLineGroupSelector}
        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-bold shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40"
      >
        <Send size={20} />
        <span className="hidden sm:inline">LINE</span>
      </button>
      
      {/* Create Task Button */}
      <button 
        onClick={onAddTask} 
        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-bold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40"
      >
        <Plus size={20} />
        <span className="hidden sm:inline">งานใหม่</span>
      </button>
    </div>
  </div>
);

export default Header;
