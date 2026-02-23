import { FC } from 'react';
import TaskItem from './TaskItem';
import { Task } from '@/types';
import { CheckCircle2, ListTodo } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onComplete: (task: Task) => void;
  onSendNotification: (task: Task) => void;
}

const TaskList: FC<TaskListProps> = ({ tasks, onEdit, onDelete, onComplete, onSendNotification }) => {
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const pendingCount = tasks.filter(t => t.status !== 'Completed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl">
            <ListTodo size={28} className="text-orange-600" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-orange-900">รายการงาน</h2>
            <p className="text-sm text-orange-700 font-semibold mt-1">
              {pendingCount} งานที่ต้องทำ • {completedCount} งานเสร็จสิ้น
            </p>
          </div>
        </div>
      </div>

      {tasks.length > 0 ? (
        <div className="space-y-4">
          {tasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onEdit={onEdit} 
              onDelete={onDelete} 
              onComplete={onComplete} 
              onSendNotification={onSendNotification} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border-2 border-dashed border-orange-300">
          <CheckCircle2 size={64} className="mx-auto text-green-500 mb-4" />
          <p className="text-2xl font-black text-orange-900">ไม่มีงานในระบบ</p>
          <p className="text-orange-700 font-semibold mt-2">ยินดีด้วยครับ งานทั้งหมดเสร็จสิ้นแล้ว!</p>
        </div>
      )}
    </div>
  );
};

export default TaskList;
