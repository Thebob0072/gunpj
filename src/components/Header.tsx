import { FC } from 'react';
import { List, BarChart3, Plus, Send, CheckCircle2, Zap } from 'lucide-react';

interface HeaderProps {
  view: 'list' | 'dashboard' | 'hackaton';
  setView: (view: 'list' | 'dashboard' | 'hackaton') => void;
  onAddTask: () => void;
  onOpenLineGroupSelector: () => void;
  selectedLineGroupName?: string;
  selectedLineGroupMemberCount?: number;
}

const Header: FC<HeaderProps> = ({ view, setView, onAddTask, onOpenLineGroupSelector, selectedLineGroupName, selectedLineGroupMemberCount }) => {
  const isHackaton = view === 'hackaton';
  return (
  <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-8 pb-4 sm:pb-6 border-b-2 ${isHackaton ? 'border-yellow-500/40' : 'border-orange-200'}`}>
    <div className="flex flex-col">
      <h1 className={`text-3xl sm:text-5xl font-black tracking-tight drop-shadow-sm ${isHackaton ? 'text-yellow-400 font-mono' : 'text-orange-800'}`}>
        {isHackaton ? '⚡ HACKATON' : 'โปรแกรมจัดการงาน'}
      </h1>
      {selectedLineGroupName && (
        <div className="flex items-center gap-2 mt-2 sm:mt-3 text-xs sm:text-sm text-orange-700 font-semibold bg-orange-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full inline-fit w-fit">
          <CheckCircle2 size={14} className="text-green-600" />
          <span>{selectedLineGroupName} ({selectedLineGroupMemberCount || 0} สมาชิก)</span>
        </div>
      )}
    </div>
    <div className="flex gap-2 sm:gap-3">
      {/* View Toggle */}
      <div className="flex gap-1 sm:gap-1.5 bg-gradient-to-r from-orange-100 to-orange-50 p-1 sm:p-1.5 rounded-xl border border-orange-200">
        <button 
          onClick={() => setView('list')} 
          className={view === 'list' ? 'flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-bold transition-all duration-200 bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/50' : 'flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-bold transition-all duration-200 text-orange-700 hover:bg-orange-200/60'}
        >
          <List size={18} />
          <span className="hidden sm:inline">รายการ</span>
        </button>
        <button 
          onClick={() => setView('dashboard')} 
          className={view === 'dashboard' ? 'flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-bold transition-all duration-200 bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/50' : 'flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-bold transition-all duration-200 text-orange-700 hover:bg-orange-200/60'}
        >
          <BarChart3 size={18} />
          <span className="hidden sm:inline">แดชบอร์ด</span>
        </button>
        <button 
          onClick={() => setView('hackaton')} 
          className={view === 'hackaton' ? 'flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-bold transition-all duration-200 bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg shadow-yellow-500/50' : 'flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-bold transition-all duration-200 text-orange-700 hover:bg-orange-200/60'}
        >
          <Zap size={18} />
          <span className="hidden sm:inline">Hackaton</span>
        </button>
      </div>
      
      {/* LINE Button */}
      <button 
        onClick={onOpenLineGroupSelector}
        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-bold shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40"
      >
        <Send size={18} />
        <span className="hidden sm:inline">LINE</span>
      </button>
      
      {/* Create Task Button */}
      <button 
        onClick={onAddTask} 
        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-bold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40"
      >
        <Plus size={18} />
        <span className="hidden sm:inline">งานใหม่</span>
      </button>
    </div>
  </div>
  );
};

export default Header;
