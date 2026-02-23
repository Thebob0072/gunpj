'use client';

import { FC, useEffect, useState } from 'react';
import { User, Calendar, Clock, Edit2, Trash2, CheckCircle2, Send, AlertCircle } from 'lucide-react';
import { Task } from '@/types';
import { formatThaiDateTime, getTaskStatusInfo } from '@/helpers/utils';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onComplete: (task: Task) => void;
  onSendNotification: (task: Task) => void;
}

const renderTaskStatusBadge = (status: Task['status']) => {
  let bgColor = '', textColor = '', text = '';
  switch (status) {
    case 'To Do': 
      bgColor = 'bg-gradient-to-r from-slate-50 to-slate-100';
      textColor = 'text-slate-700'; 
      text = 'ยังไม่เริ่ม'; 
      break;
    case 'In Progress': 
      bgColor = 'bg-gradient-to-r from-orange-100 to-orange-150';
      textColor = 'text-orange-700'; 
      text = 'กำลังดำเนินการ'; 
      break;
    case 'Completed': 
      bgColor = 'bg-gradient-to-r from-green-100 to-emerald-100';
      textColor = 'text-green-700'; 
      text = 'เสร็จสิ้น'; 
      break;
    default: 
      bgColor = 'bg-gradient-to-r from-neutral-100 to-neutral-150';
      textColor = 'text-neutral-600'; 
      text = 'ไม่ระบุ';
  }
  return (
    <span className={`${bgColor} ${textColor} px-4 py-2 rounded-full text-sm font-bold border border-orange-200`}>
      {text}
    </span>
  );
};

const TaskItem: FC<TaskItemProps> = ({ task, onEdit, onDelete, onComplete, onSendNotification }) => {
  const [statusInfo, setStatusInfo] = useState(getTaskStatusInfo(task));
  
  useEffect(() => {
    const timer = setInterval(() => {
      setStatusInfo(getTaskStatusInfo(task));
    }, 60000);
    return () => clearInterval(timer);
  }, [task]);

  const getStatusIcon = () => {
    switch (statusInfo.state) {
      case 'overdue': return <AlertCircle size={18} className="text-red-500" />;
      case 'ongoing': return <Clock size={18} className="text-orange-500" />;
      case 'upcoming': return <Calendar size={18} className="text-blue-500" />;
      default: return null;
    }
  };

  const getStatusTextColor = () => {
    switch (statusInfo.state) {
      case 'overdue': return 'text-red-600 font-bold';
      case 'ongoing': return 'text-orange-600 font-bold';
      case 'upcoming': return 'text-blue-600 font-bold';
      default: return 'text-neutral-600';
    }
  };

  return (
    <div className="bg-white border-2 border-orange-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-orange-200/50 transition-all duration-200 group">
      {/* Header: Title and Status */}
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-black text-orange-900 mb-1">
            {task.title}
          </h3>
          {task.details && (
            <p className="text-sm text-orange-700 line-clamp-2 leading-relaxed opacity-90">
              {task.details}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          {renderTaskStatusBadge(task.status)}
        </div>
      </div>

      {/* Info Section */}
      <div className="space-y-2.5 mb-5 pb-5 border-b-2 border-orange-100">
        {/* Assignee */}
        <div className="flex items-center gap-3 text-sm">
          <div className="p-2 bg-orange-100 rounded-lg">
            <User size={18} className="text-orange-600" />
          </div>
          <span className="text-orange-900 font-semibold">{task.assignee}</span>
        </div>

        {/* Timeline */}
        <div className="flex items-center gap-3 text-sm">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Calendar size={18} className="text-orange-600" />
          </div>
          <div className="flex items-center gap-2 text-orange-900 font-medium">
            <span>{formatThaiDateTime(task.startDate, task.startTime)}</span>
            <span className="text-orange-400">→</span>
            <span>{formatThaiDateTime(task.endDate, task.endTime)}</span>
          </div>
        </div>
      </div>

      {/* Footer: Status and Actions */}
      <div className="flex justify-between items-center">
        {/* Status Info */}
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={`text-sm ${getStatusTextColor()}`}>
            {statusInfo.text}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {task.status !== 'Completed' && (
            <button 
              onClick={() => onComplete(task)} 
              className="p-2.5 text-green-600 hover:bg-green-100 rounded-lg transition-all duration-200 hover:scale-110"
              title="ทำเครื่องหมายว่าเสร็จสิ้น"
            >
              <CheckCircle2 size={22} />
            </button>
          )}
          <button 
            onClick={() => onEdit(task)} 
            className="p-2.5 text-orange-600 hover:bg-orange-100 rounded-lg transition-all duration-200 hover:scale-110"
            title="แก้ไขงาน"
          >
            <Edit2 size={22} />
          </button>
          <button 
            onClick={() => onSendNotification(task)} 
            className="p-2.5 text-purple-600 hover:bg-purple-100 rounded-lg transition-all duration-200 hover:scale-110"
            title="ส่งการแจ้งเตือน"
          >
            <Send size={22} />
          </button>
          <button 
            onClick={() => onDelete(task.id)} 
            className="p-2.5 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-110"
            title="ลบงาน"
          >
            <Trash2 size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
