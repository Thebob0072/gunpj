'use client';

import { useState, FC } from 'react';
import { UserPlus, UserMinus, UserCog, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { Assignee } from '@/types'; 

interface AssigneeModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignees: Assignee[]; 
  onUpdateAssignees: (updatedAssignees: Assignee[]) => void; 
}

const AssigneeModal: FC<AssigneeModalProps> = ({ isOpen, onClose, assignees, onUpdateAssignees }) => {
  const [newAssignee, setNewAssignee] = useState({ name: '', position: '', role: '' });
  const [isEditing, setIsEditing] = useState<string | null>(null); 
  const [editedAssignee, setEditedAssignee] = useState<Assignee | null>(null);

  const handleNewAssigneeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAssignee(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAssignee = () => {
    if (newAssignee.name && !assignees.some(a => a.name === newAssignee.name)) {
      const newEntry: Assignee = {
        id: Date.now().toString(), 
        ...newAssignee,
      };
      onUpdateAssignees([...assignees, newEntry]);
      setNewAssignee({ name: '', position: '', role: '' }); 
    } else {
        Swal.fire('เกิดข้อผิดพลาด', 'ชื่อผู้รับผิดชอบห้ามว่างหรือซ้ำกัน', 'error');
    }
  };

  const handleDeleteAssignee = (id: string) => {
    onUpdateAssignees(assignees.filter(a => a.id !== id));
  };

  const handleStartEdit = (assignee: Assignee) => {
    setIsEditing(assignee.id);
    setEditedAssignee({ ...assignee });
  };
  
  const handleEditedAssigneeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedAssignee) return;
    const { name, value } = e.target;
    setEditedAssignee(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSaveEdit = () => {
    if (!editedAssignee || !isEditing) return;

    const isDuplicate = assignees.some(a => a.name === editedAssignee.name && a.id !== isEditing);

    if (editedAssignee.name && !isDuplicate) {
      const updatedList = assignees.map(a => (a.id === isEditing ? editedAssignee : a));
      onUpdateAssignees(updatedList);
      setIsEditing(null);
      setEditedAssignee(null);
    } else {
      Swal.fire('เกิดข้อผิดพลาด', 'ชื่อผู้รับผิดชอบห้ามว่างหรือซ้ำกัน', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-neutral-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4 text-neutral-800">
          <h2 className="text-2xl font-bold">จัดการผู้รับผิดชอบ</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg space-y-3 bg-neutral-50">
            <h3 className="font-semibold text-neutral-700">เพิ่มผู้รับผิดชอบใหม่</h3>
            <input
              name="name"
              type="text"
              value={newAssignee.name}
              onChange={handleNewAssigneeChange}
              placeholder="ชื่อ (บังคับ)"
              className="w-full p-3 border border-neutral-300 rounded-lg text-neutral-800 placeholder-neutral-500" // <-- Added text color
            />
            <input
              name="position"
              type="text"
              value={newAssignee.position}
              onChange={handleNewAssigneeChange}
              placeholder="ตำแหน่ง (ไม่บังคับ)"
              className="w-full p-3 border border-neutral-300 rounded-lg text-neutral-800 placeholder-neutral-500" // <-- Added text color
            />
            <input
              name="role"
              type="text"
              value={newAssignee.role}
              onChange={handleNewAssigneeChange}
              placeholder="หน้าที่ (ไม่บังคับ)"
              className="w-full p-3 border border-neutral-300 rounded-lg text-neutral-800 placeholder-neutral-500" // <-- Added text color
            />
            <button
              type="button"
              onClick={handleAddAssignee}
              className="w-full p-3 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors flex items-center justify-center"
              disabled={!newAssignee.name}
            >
              <UserPlus size={20} className="mr-2" /> เพิ่มผู้รับผิดชอบ
            </button>
          </div>

          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {assignees.map((assignee) => (
              <li key={assignee.id} className="flex justify-between items-center bg-neutral-50 p-3 rounded-lg">
                {isEditing === assignee.id && editedAssignee ? (
                    <div className="flex-1 space-y-2">
                         <input 
                            type="text" 
                            name="name" 
                            placeholder="ชื่อ (บังคับ)"
                            value={editedAssignee.name} 
                            onChange={handleEditedAssigneeChange} 
                            className="w-full p-3 border border-neutral-300 rounded-lg text-neutral-800 placeholder-neutral-500" // <-- Added text color
                         />
                         <input 
                            type="text" 
                            name="position" 
                            placeholder="ตำแหน่ง" 
                            value={editedAssignee.position} 
                            onChange={handleEditedAssigneeChange} 
                            className="w-full p-3 border border-neutral-300 rounded-lg text-neutral-800 placeholder-neutral-500" // <-- Added text color
                         />
                         <input 
                            type="text" 
                            name="role" 
                            placeholder="หน้าที่" 
                            value={editedAssignee.role} 
                            onChange={handleEditedAssigneeChange} 
                            className="w-full p-3 border border-neutral-300 rounded-lg text-neutral-800 placeholder-neutral-500" // <-- Added text color
                         />
                    </div>
                ) : (
                  <div>
                    <span className="text-neutral-800 font-semibold">{assignee.name}</span>
                    <span className="text-xs text-neutral-500 block">
                        {assignee.position}{assignee.position && assignee.role ? ' - ' : ''}{assignee.role}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-2 pl-2">
                  {isEditing === assignee.id ? (
                    <button onClick={handleSaveEdit} className="p-1 text-green-500 hover:bg-green-100 rounded-full">บันทึก</button>
                  ) : (
                    <button onClick={() => handleStartEdit(assignee)} className="p-2 text-amber-500 hover:bg-amber-100 rounded-full" title="แก้ไข"><UserCog size={16} /></button>
                  )}
                  <button onClick={() => handleDeleteAssignee(assignee.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full" title="ลบ"><UserMinus size={16} /></button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AssigneeModal;
