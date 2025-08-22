// types/index.ts

export interface Task {
  id: string;
  title: string;
  assignee: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  details: string;

  status: 'To Do' | 'In Progress' | 'Completed';
}

export type NewTask = Omit<Task, 'id' | 'status'>;

export interface DashboardData {
  name: string;
  'งานเสร็จสิ้น': number;
}
export interface Assignee {
  id: string;
  name: string;
  position?: string;
  role?: string;
}