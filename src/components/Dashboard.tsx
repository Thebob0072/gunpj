import { FC } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Task, DashboardData } from '@/types';

interface DashboardProps {
  tasks: Task[];
  dashboardData: DashboardData[];
}

const Dashboard: FC<DashboardProps> = ({ tasks, dashboardData }) => {
  // Check if 'tasks' is an array before trying to access its properties
  const totalTasks = Array.isArray(tasks) ? tasks.length : 0;
  const inProgressTasks = Array.isArray(tasks) ? tasks.filter(t => t.status === 'In Progress').length : 0;
  const completedTasks = Array.isArray(tasks) ? tasks.filter(t => t.status === 'Completed').length : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-neutral-700">แดชบอร์ด</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="bg-amber-50 p-6 rounded-xl shadow-sm">
          <p className="text-4xl font-bold text-amber-600">{totalTasks}</p>
          <p className="text-neutral-600 mt-2">งานทั้งหมด</p>
        </div>
        <div className="bg-amber-50 p-6 rounded-xl shadow-sm">
          <p className="text-4xl font-bold text-amber-600">{inProgressTasks}</p>
          <p className="text-neutral-600 mt-2">กำลังดำเนินงาน</p>
        </div>
        <div className="bg-amber-50 p-6 rounded-xl shadow-sm">
          <p className="text-4xl font-bold text-amber-600">{completedTasks}</p>
          <p className="text-neutral-600 mt-2">เสร็จสิ้น</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold text-neutral-700 mb-4">งานเสร็จสิ้นรายเดือน</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dashboardData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="งานเสร็จสิ้น" stroke="#d97706" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
