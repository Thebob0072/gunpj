import { FC } from 'react';
import TaskItem from './TaskItem';
import { Task } from '@/types';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onComplete: (task: Task) => void;
  onSendNotification: (task: Task) => void;
}

const TaskList: FC<TaskListProps> = ({ tasks, onEdit, onDelete, onComplete, onSendNotification }) => (
  <div className="space-y-4">
    <h2 className="text-2xl font-semibold text-neutral-700">รายการงาน</h2>
    {tasks.length > 0 ? (
      tasks.map(task => <TaskItem key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onComplete={onComplete} onSendNotification={onSendNotification} />)
    ) : (
      <div className="text-center text-neutral-500 p-8 border-2 border-dashed border-neutral-300 rounded-xl">ไม่มีงานในระบบ</div>
    )}
  </div>
);

export default TaskList;
