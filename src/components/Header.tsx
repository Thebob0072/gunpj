import { FC } from 'react';
import { List, Gauge, Plus } from 'lucide-react';

interface HeaderProps {
  view: 'list' | 'dashboard';
  setView: (view: 'list' | 'dashboard') => void;
  onAddTask: () => void;
}

const Header: FC<HeaderProps> = ({ view, setView, onAddTask }) => (
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-3xl font-bold text-neutral-800">Team Chatr Task Tracker</h1>
    <div className="flex space-x-2">
      {/* ปุ่มสำหรับแสดงรายการงาน */}
      <button 
        onClick={() => setView('list')} 
        className={`p-3 rounded-full ${view === 'list' ? 'bg-amber-600 text-white' : 'bg-neutral-200 text-neutral-600'} hover:bg-amber-500 hover:text-white transition-colors`}
      >
        <List size={24} />
      </button>
      {/* ปุ่มสำหรับแสดงแดชบอร์ด */}
      <button 
        onClick={() => setView('dashboard')} 
        className={`p-3 rounded-full ${view === 'dashboard' ? 'bg-amber-600 text-white' : 'bg-neutral-200 text-neutral-600'} hover:bg-amber-500 hover:text-white transition-colors`}
      >
        <Gauge size={24} />
      </button>
      {/* ปุ่มสำหรับเพิ่มงานใหม่ */}
      <button 
        onClick={onAddTask} 
        className="p-3 rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors"
      >
        <Plus size={24} />
      </button>
    </div>
  </div>
);

export default Header;
