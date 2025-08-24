'use client';

import { FC, useEffect, useState } from 'react';
import { User, Calendar, Edit, Trash2, CheckCircle, MessageSquareWarning } from 'lucide-react';
import { Task } from '@/types';
// Import the helper functions
import { formatThaiDateTime, getTaskStatusInfo } from '@/helpers/utils';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onComplete: (task: Task) => void;
  onSendNotification: (task: Task) => void;
}

const renderTaskStatusBadge = (status: Task['status']) => {
  let colorClass = '', text = '';
  switch (status) {
    case 'To Do': colorClass = 'bg-neutral-200 text-neutral-800'; text = 'ยังไม่เริ่ม'; break;
    case 'In Progress': colorClass = 'bg-amber-200 text-amber-800'; text = 'กำลังทำ'; break;
    case 'Completed': colorClass = 'bg-green-200 text-green-800'; text = 'เสร็จสิ้น'; break;
    default: colorClass = 'bg-neutral-100 text-neutral-600'; text = 'ไม่ระบุ';
  }
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}>{text}</span>;
};

const TaskItem: FC<TaskItemProps> = ({ task, onEdit, onDelete, onComplete, onSendNotification }) => {
  const [statusInfo, setStatusInfo] = useState(getTaskStatusInfo(task));
  
  useEffect(() => {
    const timer = setInterval(() => {
      setStatusInfo(getTaskStatusInfo(task));
    }, 60000);
    return () => clearInterval(timer);
  }, [task]);

  const getStatusTextColor = () => {
    switch (statusInfo.state) {
      case 'overdue': return 'text-red-500';
      case 'ongoing': return 'text-amber-500';
      case 'upcoming': return 'text-blue-500';
      default: return 'text-neutral-500';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col gap-4 transition-transform transform hover:scale-[1.01]">
      <div className="flex justify-between items-start">
        <div className="flex flex-row flex-1">
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              ชื่องาน : <span className="font-semibold">{task.title}</span>
          </h2>
          {task.details && <p className="text-sm text-neutral-600 whitespace-pre-wrap leading-relaxed mt-1">{task.details}</p>}
        </div>
        <div className="flex items-center space-x-2 pl-4">
            {renderTaskStatusBadge(task.status)}
        </div>
      </div>

      <div className="flex flex-col space-y-2 text-sm text-neutral-500 mt-2">
        <div className="flex items-center space-x-2" title="ผู้รับผิดชอบ">
          <User size={16} className="text-neutral-400" />
          <span className="font-semibold text-neutral-700">{task.assignee}</span>
        </div>
        <div className="flex items-center space-x-2" title="ระยะเวลาของงาน">
          <Calendar size={16} className="text-neutral-400" />
          <span>
            {'วันที่เริ่มต้น : '}{formatThaiDateTime(task.startDate, task.startTime)} 
          </span>
          <span>ถึง</span>
          <span>
            {'วันที่สิ้นสุด : '}{formatThaiDateTime(task.endDate, task.endTime)}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-2">
        <div className={`text-sm font-medium ${getStatusTextColor()}`}>
          <span>{statusInfo.text}</span>
        </div>

        <div className="flex items-center space-x-1">
          {task.status !== 'Completed' && (
            <button onClick={() => onComplete(task)} className="p-10 rounded-full text-green-500 hover:bg-green-100 transition-colors" title="ทำเครื่องหมายว่าเสร็จสิ้น">
              <CheckCircle size={30} />
            </button>
          )}
          <button onClick={() => onEdit(task)} className="p-10 rounded-full text-neutral-400 hover:bg-amber-100 hover:text-amber-500 transition-colors" title="แก้ไขงาน">
            <Edit size={30} />
          </button>
          <button onClick={() => onDelete(task.id)} className="p-10 rounded-full text-neutral-400 hover:bg-red-100 hover:text-red-500 transition-colors" title="ลบงาน">
            <Trash2 size={30} />
          </button>
          <button onClick={() => onSendNotification(task)} className="p-10 rounded-full text-neutral-400 hover:bg-blue-100 hover:text-blue-500 transition-colors" title="ส่งการแจ้งเตือน">
            <MessageSquareWarning size={30} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;