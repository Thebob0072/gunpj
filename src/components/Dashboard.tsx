import { FC } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Task, DashboardData } from '@/types';
import { BarChart3, CheckCircle2, Clock, ListTodo } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
  dashboardData: DashboardData[];
}

const Dashboard: FC<DashboardProps> = ({ tasks, dashboardData }) => {
  const totalTasks = Array.isArray(tasks) ? tasks.length : 0;
  const inProgressTasks = Array.isArray(tasks) ? tasks.filter(t => t.status === 'In Progress').length : 0;
  const completedTasks = Array.isArray(tasks) ? tasks.filter(t => t.status === 'Completed').length : 0;
  const pendingTasks = Array.isArray(tasks) ? tasks.filter(t => t.status === 'To Do').length : 0;

  const StatCard: FC<{ icon: React.ReactNode; label: string; value: number; color: string; bgColor: string; borderColor: string }> = 
    ({ icon, label, value, color, bgColor, borderColor }) => (
      <div className={`${bgColor} ${borderColor} border-2 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-orange-700 text-sm font-bold mb-2 uppercase tracking-wide">{label}</p>
            <p className={`text-5xl font-black ${color}`}>{value}</p>
          </div>
          <div className={`p-4 rounded-2xl ${bgColor}`}>
            {icon}
          </div>
        </div>
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl">
          <BarChart3 size={28} className="text-orange-600" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-orange-900">แดชบอร์ด</h2>
          <p className="text-sm text-orange-700 font-semibold mt-1">สรุปสถานะโครงการและความคืบหน้า</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<ListTodo size={28} className="text-orange-600" />}
          label="งานทั้งหมด"
          value={totalTasks}
          color="text-orange-600"
          bgColor="bg-gradient-to-br from-orange-50 to-orange-100"
          borderColor="border-orange-300"
        />
        <StatCard 
          icon={<Clock size={28} className="text-amber-600" />}
          label="กำลังดำเนินการ"
          value={inProgressTasks}
          color="text-amber-600"
          bgColor="bg-gradient-to-br from-amber-50 to-amber-100"
          borderColor="border-amber-300"
        />
        <StatCard 
          icon={<CheckCircle2 size={28} className="text-green-600" />}
          label="เสร็จสิ้น"
          value={completedTasks}
          color="text-green-600"
          bgColor="bg-gradient-to-br from-green-50 to-green-100"
          borderColor="border-green-300"
        />
        <StatCard 
          icon={<ListTodo size={28} className="text-slate-600" />}
          label="ยังไม่เริ่ม"
          value={pendingTasks}
          color="text-slate-600"
          bgColor="bg-gradient-to-br from-slate-50 to-slate-100"
          borderColor="border-slate-300"
        />
      </div>

      {/* Chart */}
      <div className="bg-white border-2 border-orange-200 p-4 sm:p-8 rounded-2xl shadow-lg">
        <h3 className="text-2xl font-black text-orange-900 mb-6">งานเสร็จสิ้นรายเดือน</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart 
            data={dashboardData} 
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" strokeWidth={2} />
            <XAxis dataKey="name" stroke="#9a3412" fontWeight="bold" />
            <YAxis stroke="#9a3412" fontWeight="bold" />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff7ed',
                border: '2px solid #ea580c',
                borderRadius: '12px',
                boxShadow: '0 20px 25px rgba(234, 88, 12, 0.2)'
              }}
              labelStyle={{ color: '#7c2d12', fontWeight: 'bold' }}
            />
            <Line 
              type="monotone" 
              dataKey="งานเสร็จสิ้น" 
              stroke="#ea580c" 
              strokeWidth={4}
              dot={{ fill: '#ea580c', r: 7, strokeWidth: 2, stroke: '#fff7ed' }}
              activeDot={{ r: 9 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
