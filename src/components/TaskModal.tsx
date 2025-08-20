import { useState, useEffect, FC, FormEvent } from 'react';
import { Send, X } from 'lucide-react';
import { NewTask, Task } from '@/types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (task: NewTask | Task) => void;
  taskToEdit: Task | null;
}

const TaskModal: FC<TaskModalProps> = ({ isOpen, onClose, onSaveTask, taskToEdit }) => {
  const [formData, setFormData] = useState<NewTask | Task>({ title: '', assignee: '', startDate: '', endDate: '', status: 'To Do' });

  useEffect(() => {
    if (taskToEdit) {
      setFormData(taskToEdit);
    } else {
      setFormData({ title: '', assignee: '', startDate: '', endDate: '', status: 'To Do' });
    }
  }, [taskToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSaveTask(formData);
    onClose();
  };

  if (!isOpen) return null;
  const isEditing = taskToEdit !== null;

  return (
    <div className="fixed inset-0 bg-neutral-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4 text-neutral-800">
          <h2 className="text-2xl font-bold">{isEditing ? 'แก้ไขงาน' : 'เพิ่มงานใหม่'}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            placeholder="ชื่องาน" 
            required 
            className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-neutral-800 bg-neutral-50" 
          />
          <input 
            name="assignee" 
            value={formData.assignee} 
            onChange={handleChange} 
            placeholder="ผู้รับผิดชอบ" 
            required 
            className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-neutral-800 bg-neutral-50" 
          />
          <div className="flex space-x-4">
            <input 
              type="date" 
              name="startDate" 
              value={formData.startDate} 
              onChange={handleChange} 
              className="w-1/2 p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-neutral-800 bg-neutral-50" 
            />
            <input 
              type="date" 
              name="endDate" 
              value={formData.endDate} 
              onChange={handleChange} 
              className="w-1/2 p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-neutral-800 bg-neutral-50" 
            />
          </div>
          {isEditing && (
            <select 
              name="status" 
              value={(formData as Task).status} 
              onChange={handleChange} 
              className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-neutral-800 bg-neutral-50"
            >
              <option value="To Do">ยังไม่เริ่ม</option>
              <option value="In Progress">กำลังดำเนินงาน</option>
              <option value="Completed">เสร็จสิ้น</option>
            </select>
          )}
          <button type="submit" className="w-full bg-amber-600 text-white font-bold py-3 rounded-lg hover:bg-amber-700 transition-colors duration-200">
            <Send size={20} className="inline-block mr-2" />
            <span>{isEditing ? 'บันทึกการเปลี่ยนแปลง' : 'มอบหมายงาน'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
