'use client';

import { useState, useEffect, FC } from 'react';
import { Send, RefreshCw, X, Loader2, AlertCircle, Users, MessageCircle, UserCheck } from 'lucide-react';
import { LineGroup, LineUser } from '@/types';

interface LineGroupSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToGroup: (groupId: string, groupName: string, members: LineUser[]) => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

const LineGroupSelector: FC<LineGroupSelectorProps> = ({ isOpen, onClose, onSendToGroup }) => {
  const [groups, setGroups] = useState<LineGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupMembers, setGroupMembers] = useState<LineUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchLineGroups();
    }
  }, [isOpen]);

  const fetchLineGroups = async () => {
    setIsLoading(true);
    setError(null);
    setSyncResult(null);
    try {
      const response = await fetch(`${API_BASE}/line-groups-with-members`);
      if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลกลุ่มได้');
      const data = await response.json();
      setGroups(Array.isArray(data.groups) ? data.groups : data.groups || []);
      if (data.groups && data.groups.length > 0) {
        setGroupMembers(data.groups[0].members || []);
        setSelectedGroupId(data.groups[0].groupId);
      }
    } catch (err) {
      setError((err as Error).message);
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroupMembers = async (groupId: string) => {
    const group = groups.find(g => g.groupId === groupId);
    if (group) {
      setGroupMembers(group.members || []);
      setSelectedGroupId(groupId);
      setSyncResult(null);
    }
  };

  const handleFixNames = async () => {
    if (!selectedGroupId) return;
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch(`${API_BASE}/groups/${selectedGroupId}/members/fix-names`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.fixed > 0) {
        setSyncResult(`✅ แก้ไขชื่อได้ ${data.fixed} คน`);
      } else if (data.unfetchable > 0) {
        setSyncResult(`⚠️ ${data.unfetchable} คนยังไม่ได้ add bot เป็นเพื่อน`);
      } else {
        setSyncResult('✅ ชื่อทุกคนถูกต้องแล้ว');
      }
      // Refresh groups to show updated names
      await fetchLineGroups();
    } catch (err) {
      setSyncResult('❌ เกิดข้อผิดพลาด');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  const selectedGroup = groups.find(g => g.groupId === selectedGroupId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-white to-orange-50 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border-2 border-orange-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-orange-200 sticky top-0 bg-gradient-to-r from-white to-orange-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl">
              <MessageCircle size={24} className="text-orange-600" />
            </div>
            <h2 className="text-2xl font-black text-orange-900">เลือกกลุ่ม LINE</h2>
          </div>
          <button onClick={onClose} className="p-2 text-orange-600 hover:bg-orange-200 rounded-xl transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-100 border-l-4 border-red-600 rounded-xl">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-semibold">{error}</p>
            </div>
          )}

          {/* LINE friend notice */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-xl">
            <AlertCircle size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700">
              <p className="font-bold mb-1">ℹ️ วิธีให้ LINE อ่านชื่อได้</p>
              <p>สมาชิกต้อง <strong>add bot เป็นเพื่อน</strong> ก่อน หรือ bot ต้องเห็น event เข้ากลุ่ม</p>
            </div>
          </div>

          {/* Groups List */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-orange-900 mb-3 uppercase tracking-wider">กลุ่มของคุณ</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={28} className="animate-spin text-orange-600" />
                <span className="ml-3 text-orange-700 font-bold">กำลังโหลดข้อมูล...</span>
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl border-2 border-dashed border-orange-400">
                <MessageCircle size={40} className="mx-auto text-orange-600 mb-2" />
                <p className="text-sm text-orange-800 font-bold">ไม่พบกลุ่ม LINE ที่เชื่อมต่อ</p>
              </div>
            ) : (
              groups.map(group => (
                <button
                  key={group.groupId}
                  onClick={() => fetchGroupMembers(group.groupId)}
                  className={selectedGroupId === group.groupId
                    ? 'w-full p-4 rounded-2xl border-2 transition-all text-left font-semibold border-orange-600 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-900 shadow-lg shadow-orange-300/50'
                    : 'w-full p-4 rounded-2xl border-2 transition-all text-left font-semibold border-orange-200 bg-gradient-to-br from-orange-50 to-white text-orange-800 hover:border-orange-400 hover:bg-orange-100'}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-lg font-black text-orange-900">{group.groupName}</div>
                      <div className="flex items-center gap-1.5 mt-1.5 text-sm text-orange-700 font-semibold">
                        <Users size={16} />
                        {group.members?.length || 0} สมาชิก
                      </div>
                    </div>
                    {selectedGroupId === group.groupId && (
                      <div className="text-orange-600 font-black text-lg">✓</div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Sync result message */}
          {syncResult && (
            <div className={`p-3 rounded-xl text-sm font-semibold ${syncResult.startsWith('✅') ? 'bg-green-100 text-green-800' : syncResult.startsWith('⚠️') ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
              {syncResult}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 p-6 border-t-2 border-orange-200 bg-gradient-to-r from-orange-50 to-white">
          <div className="flex gap-3">
            <button
              onClick={fetchLineGroups}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-orange-200 to-orange-300 text-orange-900 rounded-xl hover:from-orange-300 hover:to-orange-400 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed border-2 border-orange-400"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              รีเฟรช
            </button>
            <button
              onClick={handleFixNames}
              disabled={!selectedGroupId || isSyncing}
              className="flex-1 flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed border-2 border-blue-700"
            >
              {isSyncing ? <Loader2 size={18} className="animate-spin" /> : <UserCheck size={18} />}
              ซิงค์ชื่อ
            </button>
          </div>
          <button
            onClick={() => {
              if (selectedGroup) {
                onSendToGroup(selectedGroupId!, selectedGroup.groupName, groupMembers);
                onClose();
              }
            }}
            disabled={!selectedGroupId || isLoading}
            className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-bold disabled:bg-neutral-400 disabled:cursor-not-allowed border-2 border-orange-700 hover:shadow-lg hover:shadow-orange-500/50"
          >
            <Send size={20} />
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
};

export default LineGroupSelector;
