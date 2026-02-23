'use client';

import { useState, useEffect, useMemo, FC, FormEvent, useRef } from 'react';
import { Send, UserCog, X } from 'lucide-react';
import Calendar from 'react-calendar';

// --- CSS Imports ---
import 'react-calendar/dist/Calendar.css';
import './Calendar.css';

import { NewTask, Task, Assignee } from '@/types';
import { FcCalendar, FcClock } from 'react-icons/fc';

const formatDateForInput = (dateString: string | null) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear() + 543;
  return `${day}/${month}/${year}`;
};

const generateTimeOptions = (interval = 30) => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      times.push(`${formattedHour}:${formattedMinute}`);
    }
  }
  return times;
};

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (task: NewTask | Task) => void;
  taskToEdit: Task | null;
  assignees: Assignee[];
  onUpdateAssignees: (updatedAssignees: Assignee[]) => void;
  selectedLineGroupMembers?: any[];
}

const TaskModal: FC<TaskModalProps> = ({ isOpen, onClose, onSaveTask, taskToEdit, assignees, onUpdateAssignees, selectedLineGroupMembers = [] }) => {
  const [formData, setFormData] = useState<NewTask | Task>({ title: '', details: '', assignee: '', startDate: '', endDate: '', status: 'To Do', startTime: '09:00', endTime: '17:00' });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showDetailsInput, setShowDetailsInput] = useState(false);

  const timeOptions = useMemo(() => generateTimeOptions(), []);
  const startDateRef = useRef<HTMLDivElement>(null);
  const endDateRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<HTMLDivElement>(null);
  const endTimeRef = useRef<HTMLDivElement>(null);
  const [startDateCalendarStyle, setStartDateCalendarStyle] = useState({});
  const [endDateCalendarStyle, setEndDateCalendarStyle] = useState({});
  const [yearType, setYearType] = useState<string | null>(null);

  useEffect(() => {
    const storedYearType = localStorage.getItem('yearType');
    setYearType(storedYearType);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (startDateRef.current && !startDateRef.current.contains(event.target as Node)) setShowStartDatePicker(false);
      if (endDateRef.current && !endDateRef.current.contains(event.target as Node)) setShowEndDatePicker(false);
      if (startTimeRef.current && !startTimeRef.current.contains(event.target as Node)) setShowStartTimePicker(false);
      if (endTimeRef.current && !endTimeRef.current.contains(event.target as Node)) setShowEndTimePicker(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleToggle = (picker: 'startDate' | 'endDate' | 'startTime' | 'endTime') => {
      setShowStartDatePicker(picker === 'startDate' ? !showStartDatePicker : false);
      setShowEndDatePicker(picker === 'endDate' ? !showEndDatePicker : false);
      setShowStartTimePicker(picker === 'startTime' ? !showStartTimePicker : false);
      setShowEndTimePicker(picker === 'endTime' ? !showEndTimePicker : false);

      if (picker === 'startDate' && !showStartDatePicker && startDateRef.current) {
          const inputRect = startDateRef.current.getBoundingClientRect();
          const calendarHeight = 320;
          const spaceBelow = window.innerHeight - inputRect.bottom;
          if (spaceBelow < calendarHeight && inputRect.top > calendarHeight) setStartDateCalendarStyle({ bottom: 'calc(100% + 8px)' });
          else setStartDateCalendarStyle({ top: 'calc(100% + 8px)' });
      }
      if (picker === 'endDate' && !showEndDatePicker && endDateRef.current) {
          const inputRect = endDateRef.current.getBoundingClientRect();
          const calendarHeight = 320;
          const spaceBelow = window.innerHeight - inputRect.bottom;
          if (spaceBelow < calendarHeight && inputRect.top > calendarHeight) setEndDateCalendarStyle({ bottom: 'calc(100% + 8px)' });
          else setEndDateCalendarStyle({ top: 'calc(100% + 8px)' });
      }
  };
  
  useEffect(() => {
    if (taskToEdit) {
      setFormData(taskToEdit);
      if (taskToEdit.details) {
        setShowDetailsInput(true);
      } else {
        setShowDetailsInput(false);
      }
    } else {
      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      // --- START: อัปเดตค่าเริ่มต้น ---
      setFormData({ 
        title: '', 
        details: '', 
        assignee: '', 
        startDate: formattedDate, 
        endDate: formattedDate, // ตั้งให้ endDate เป็นวันเดียวกับ startDate
        status: 'To Do', 
        startTime: '09:00', 
        endTime: '17:00' 
      });
      // --- END: อัปเดตค่าเริ่มต้น ---
      setShowDetailsInput(false);
    }
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
    setShowStartTimePicker(false);
    setShowEndTimePicker(false);
  }, [taskToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // --- START: อัปเดต Logic การเลือกวันที่ ---
  const handleDateChange = (date: Date, name: 'startDate' | 'endDate') => {
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    
    if (name === 'startDate') {
      // เมื่อเลือกวันที่เริ่มต้น, ตั้งวันที่สิ้นสุดให้เป็นวันเดียวกันโดยอัตโนมัติ
      setFormData(prev => ({ ...prev, startDate: formattedDate, endDate: formattedDate }));
      setShowStartDatePicker(false);
    } else { // name === 'endDate'
      setFormData(prev => ({ ...prev, endDate: formattedDate }));
      setShowEndDatePicker(false);
    }
  };
  // --- END: อัปเดต Logic การเลือกวันที่ ---

  const handleTimeSelect = (time: string, name: 'startTime' | 'endTime') => {
    if (name === 'startTime') {
        if (formData.startDate === formData.endDate && time > formData.endTime) {
            setFormData(prev => ({...prev, startTime: time, endTime: ''}));
        } else {
            setFormData(prev => ({...prev, startTime: time}));
        }
        setShowStartTimePicker(false);
    } else {
        setFormData(prev => ({...prev, endTime: time}));
        setShowEndTimePicker(false);
    }
  }

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, assignee: e.target.value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSaveTask(formData);
    onClose();
  };
  
  const handleHideDetails = () => {
    setFormData(prev => ({...prev, details: ''}));
    setShowDetailsInput(false);
  };


  if (!isOpen) return null;
  const isEditing = taskToEdit !== null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-gradient-to-br from-white to-orange-50 rounded-3xl p-6 w-full max-w-md shadow-2xl border-2 border-orange-200">
          <div className="flex justify-between items-center mb-4 text-orange-900">
            <h2 className="text-2xl font-black">{isEditing ? 'แก้ไขงาน' : 'เพิ่มงานใหม่'}</h2>
            <button onClick={onClose} className="text-orange-600 hover:text-orange-900 hover:bg-orange-200 p-2 rounded-lg transition-colors"><X size={24} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className='space-y-1'>
              <input name="title" value={formData.title} onChange={handleChange} placeholder="ชื่องาน" required className="w-full p-3 border-2 border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-orange-900 bg-orange-50 placeholder-orange-600 font-semibold" />
              
              {showDetailsInput ? (
                <div className="space-y-1">
                  <textarea
                    name="details"
                    value={formData.details || ''}
                    onChange={handleChange}
                    placeholder="เพิ่มรายละเอียด (ไม่บังคับ)..."
                    className="w-full p-3 border-2 border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-orange-900 bg-orange-50 text-sm placeholder-orange-600 font-semibold"
                    rows={3}
                  />
                  <button
                    type="button"
                    onClick={handleHideDetails}
                    className="text-sm text-orange-600 hover:text-orange-900 transition-colors font-semibold"
                  >
                    - ซ่อนรายละเอียด
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDetailsInput(true)}
                  className="text-sm text-orange-600 hover:text-orange-900 transition-colors font-semibold"
                >
                  + เพิ่มรายละเอียด
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <select name="assignee" value={formData.assignee} onChange={handleAssigneeChange} required className="w-full p-3 border-2 border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-orange-900 bg-orange-50 font-semibold">
                <option value="" disabled>เลือกสมาชิกในกลุ่ม</option>
                {selectedLineGroupMembers.length > 0 
                  ? selectedLineGroupMembers.map(member => (<option key={member.userId} value={member.displayName}>{member.displayName}</option>))
                  : assignees.map(assignee => (<option key={assignee.id} value={assignee.name}>{assignee.name}</option>))
                }
              </select>
            </div>

            <div className="flex space-x-4">
              <div className="w-1/2 space-y-2">
                <div className="relative" ref={startDateRef}>
                  <label className="text-sm font-bold text-orange-900">วันที่เริ่มต้น</label>
                  <input type="text" value={formatDateForInput(formData.startDate)} onClick={() => handleToggle('startDate')} placeholder="เลือกวันที่" readOnly className="w-full p-3 border-2 border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-orange-900 bg-orange-50 cursor-pointer font-semibold placeholder-orange-600" />
                  <FcCalendar size={24} className="absolute right-3 bottom-3 pointer-events-none" />
                  {showStartDatePicker && (
                    <div style={{ position: 'absolute', zIndex: 11, ...startDateCalendarStyle }}>
                      <Calendar className={'custom-calendar'} locale="th" onChange={(value) => { if (value instanceof Date) handleDateChange(value, 'startDate'); }} value={formData.startDate ? new Date(formData.startDate) : null} minDate={new Date()} />
                    </div>
                  )}
                </div>
                <div className="relative" ref={startTimeRef}>
                  <label className="text-sm font-bold text-orange-900">เวลาเริ่มต้น</label>
                  <input type="text" value={formData.startTime} onClick={() => handleToggle('startTime')} readOnly className="w-full p-3 border-2 border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-orange-900 bg-orange-50 cursor-pointer font-semibold"/>
                  <FcClock size={24} className="absolute right-3 bottom-3 pointer-events-none" />
                  {showStartTimePicker && (
                    <div className="time-dropdown">
                      {timeOptions.map(time => (
                        <div key={time} className="time-dropdown-item" onClick={() => handleTimeSelect(time, 'startTime')}>
                          {time}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="w-1/2 space-y-2">
                 <div className="relative" ref={endDateRef}>
                    <label className="text-sm font-bold text-orange-900">วันที่สิ้นสุด</label>
                    <input type="text" value={formatDateForInput(formData.endDate)} onClick={() => handleToggle('endDate')} placeholder="เลือกวันที่" readOnly disabled={!formData.startDate} className="w-full p-3 border-2 border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-orange-900 bg-orange-50 cursor-pointer disabled:bg-orange-200 font-semibold placeholder-orange-600" />
                    <FcCalendar size={24} className="absolute right-3 bottom-3 pointer-events-none" />
                    {showEndDatePicker && (
                      <div style={{ position: 'absolute', zIndex: 11, ...endDateCalendarStyle }}>
                        <Calendar className={'custom-calendar'} locale="th" formatMonthYear={(locale, date) => `${date.toLocaleString(locale, { month: 'long' })} ${date.getFullYear() + (yearType === 'en' ? 0 : 543)}`} formatYear={(locale, date) => (date.getFullYear() + (yearType === 'en' ? 0 : 543)).toString()} onChange={(value) => { if (value instanceof Date) handleDateChange(value, 'endDate'); }} value={formData.endDate ? new Date(formData.endDate) : null} minDate={formData.startDate ? new Date(formData.startDate) : undefined} />
                      </div>
                    )}
                 </div>
                 <div className="relative" ref={endTimeRef}>
                   <label className="text-sm font-bold text-orange-900">เวลาสิ้นสุด</label>
                    <input type="text" value={formData.endTime} onClick={() => handleToggle('endTime')} readOnly disabled={!formData.startDate} className="w-full p-3 border-2 border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-orange-900 bg-orange-50 cursor-pointer disabled:bg-orange-200 font-semibold"/>
                    <FcClock size={24} className="absolute right-3 bottom-3 pointer-events-none" />
                    {showEndTimePicker && (
                      <div className="time-dropdown">
                        {timeOptions
                            .filter(time => !(formData.startDate === formData.endDate && time < formData.startTime))
                            .map(time => (
                          <div key={time} className="time-dropdown-item" onClick={() => handleTimeSelect(time, 'endTime')}>
                            {time}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
              </div>
            </div>

            {isEditing && (
              <select name="status" value={(formData as Task).status} onChange={handleChange} className="w-full p-3 border-2 border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-orange-900 bg-orange-50 font-semibold">
                <option value="To Do">ยังไม่เริ่ม</option>
                <option value="In Progress">กำลังดำเนินงาน</option>
                <option value="Completed">เสร็จสิ้น</option>
              </select>
            )}
            <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 border-2 border-orange-700 shadow-lg shadow-orange-500/30">
              <Send size={20} className="inline-block mr-2" />
              <span>{isEditing ? 'บันทึกการเปลี่ยนแปลง' : 'มอบหมายงาน'}</span>
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
export default TaskModal;