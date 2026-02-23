'use client';

import { useState, FC } from 'react';
import { UserPlus, Edit2, Trash2, X, CheckCircle2, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { Assignee } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  const [isLoading, setIsLoading] = useState(false);

  const handleNewAssigneeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAssignee(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAssignee = async () => {
    if (!newAssignee.name.trim()) {
      Swal.fire('ข้อมูลไม่ครบ', 'กรุณากรอกชื่อผู้รับผิดชอบ', 'warning');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(API_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createAssignee', assignee: newAssignee }),
      });
      if (!response.ok) throw new Error('Failed to save new assignee');

      const { assignee: savedAssignee } = await response.json();
      onUpdateAssignees([...assignees, savedAssignee]);
      setNewAssignee({ name: '', position: '', role: '' });
      Swal.fire('สำเร็จ', 'เพิ่มผู้รับผิดชอบแล้ว', 'success');
    } catch (error) {
      Swal.fire('ข้อผิดพลาด', (error as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAssignee = async (id: string) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ',
      text: 'คุณต้องการลบผู้รับผิดชอบนี้หรือไม่',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ea580c',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    });

    if (!result.isConfirmed) return;

    setIsLoading(true);
    try {
      const response = await fetch(API_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteAssignee', id }),
      });
      if (!response.ok) throw new Error('Failed to delete assignee');

      onUpdateAssignees(assignees.filter(a => a.id !== id));
      Swal.fire('สำเร็จ', 'ลบผู้รับผิดชอบแล้ว', 'success');
    } catch (error) {
      Swal.fire('ข้อผิดพลาด', (error as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEdit = (assignee: Assignee) => {
    setIsEditing(assignee.id);
    setEditedAssignee({ ...assignee });
  };

  const handleEditedAssigneeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedAssignee) return;
    const { name, value } = e.target;
    setEditedAssignee(prev => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSaveEdit = async () => {
    if (!editedAssignee) return;
    if (!editedAssignee.name.trim()) {
      Swal.fire('ข้อมูลไม่ครบ', 'กรุณากรอกชื่อผู้รับผิดชอบ', 'warning');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(API_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateAssignee', assignee: editedAssignee }),
      });
      if (!response.ok) throw new Error('Failed to update assignee');

      onUpdateAssignees(assignees.map(a => (a.id === editedAssignee.id ? editedAssignee : a)));
      setIsEditing(null);
      setEditedAssignee(null);
      Swal.fire('สำเร็จ', 'อัปเดตผู้รับผิดชอบแล้ว', 'success');
    } catch (error) {
      Swal.fire('ข้อผิดพลาด', (error as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-white to-orange-50 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border-2 border-orange-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-orange-200 sticky top-0 bg-gradient-to-r from-white to-orange-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl">
              <UserPlus size={24} className="text-orange-600" />
            </div>
            <h2 className="text-2xl font-black text-orange-900">ผู้รับผิดชอบ</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-orange-600 hover:bg-orange-200 rounded-xl transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Add New Assignee Section */}
          <div className="p-5 bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-400 rounded-2xl space-y-3">
            <h3 className="font-black text-orange-900 flex items-center gap-2 uppercase tracking-wider">
              <UserPlus size={20} />
              เพิ่มผู้รับผิดชอบใหม่
            </h3>
            <div className="space-y-2.5">
              <input
                name="name"
                type="text"
                value={newAssignee.name}
                onChange={handleNewAssigneeChange}
                placeholder="ชื่อ (บังคับ)"
                className="w-full px-4 py-3 border-2 border-orange-400 rounded-xl bg-white text-orange-900 placeholder-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 font-semibold"
              />
              <input
                name="position"
                type="text"
                value={newAssignee.position}
                onChange={handleNewAssigneeChange}
                placeholder="ตำแหน่ง (ไม่บังคับ)"
                className="w-full px-4 py-3 border-2 border-orange-400 rounded-xl bg-white text-orange-900 placeholder-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 font-semibold"
              />
              <input
                name="role"
                type="text"
                value={newAssignee.role}
                onChange={handleNewAssigneeChange}
                placeholder="หน้าที่ (ไม่บังคับ)"
                className="w-full px-4 py-3 border-2 border-orange-400 rounded-xl bg-white text-orange-900 placeholder-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 font-semibold"
              />
              <button
                onClick={handleAddAssignee}
                disabled={!newAssignee.name.trim() || isLoading}
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2 font-black disabled:opacity-50 disabled:cursor-not-allowed border-2 border-orange-700 hover:shadow-lg hover:shadow-orange-500/50"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <UserPlus size={20} />}
                {isLoading ? 'กำลังเพิ่ม...' : 'เพิ่มผู้รับผิดชอบ'}
              </button>
            </div>
          </div>

          {/* Assignees List */}
          <div className="space-y-3">
            <h3 className="font-black text-orange-900 flex items-center gap-2 uppercase tracking-wider">
              <UserPlus size={20} />
              รายชื่อผู้รับผิดชอบ ({assignees.length})
            </h3>
            {assignees.length === 0 ? (
              <div className="text-center py-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl border-2 border-dashed border-orange-400">
                <p className="text-orange-800 font-bold">ยังไม่มีผู้รับผิดชอบ</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto">
                {assignees.map((assignee) => (
                  <div key={assignee.id} className="bg-gradient-to-br from-orange-100 to-orange-50 border-2 border-orange-300 p-4 rounded-2xl" data-assignee-id={assignee.id}>
                    {isEditing === assignee.id && editedAssignee ? (
                      <div className="space-y-2.5">
                        <input
                          type="text"
                          name="name"
                          placeholder="ชื่อ (บังคับ)"
                          value={editedAssignee.name}
                          onChange={handleEditedAssigneeChange}
                          className="w-full px-3 py-2.5 border-2 border-orange-400 rounded-lg text-orange-900 placeholder-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold"
                        />
                        <input
                          type="text"
                          name="position"
                          placeholder="ตำแหน่ง"
                          value={editedAssignee.position}
                          onChange={handleEditedAssigneeChange}
                          className="w-full px-3 py-2.5 border-2 border-orange-400 rounded-lg text-orange-900 placeholder-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold"
                        />
                        <input
                          type="text"
                          name="role"
                          placeholder="หน้าที่"
                          value={editedAssignee.role}
                          onChange={handleEditedAssigneeChange}
                          className="w-full px-3 py-2.5 border-2 border-orange-400 rounded-lg text-orange-900 placeholder-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            disabled={isLoading}
                            className="flex-1 px-3 py-2.5 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-1 font-bold disabled:opacity-50 border-2 border-green-700"
                          >
                            <CheckCircle2 size={18} />
                            บันทึก
                          </button>
                          <button
                            onClick={() => {
                              setIsEditing(null);
                              setEditedAssignee(null);
                            }}
                            className="flex-1 px-3 py-2.5 rounded-lg bg-gray-400 text-white hover:bg-gray-500 transition-all font-bold border-2 border-gray-600"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-black text-orange-900 text-lg">{assignee.name}</div>
                            {(assignee.position || assignee.role) && (
                              <div className="text-xs text-orange-700 mt-1.5 font-semibold">
                                {assignee.position && <span>{assignee.position}</span>}
                                {assignee.position && assignee.role && <span> • </span>}
                                {assignee.role && <span>{assignee.role}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 pt-3 border-t-2 border-orange-300">
                          <button
                            onClick={() => handleStartEdit(assignee)}
                            disabled={isLoading}
                            className="flex-1 p-2.5 text-orange-600 bg-orange-200 hover:bg-orange-300 rounded-lg transition-all flex items-center justify-center gap-1 font-bold disabled:opacity-50 border-2 border-orange-500"
                          >
                            <Edit2 size={18} />
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleDeleteAssignee(assignee.id)}
                            disabled={isLoading}
                            className="flex-1 p-2.5 text-red-600 bg-red-200 hover:bg-red-300 rounded-lg transition-all flex items-center justify-center gap-1 font-bold disabled:opacity-50 border-2 border-red-500"
                          >
                            <Trash2 size={18} />
                            ลบ
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssigneeModal;
