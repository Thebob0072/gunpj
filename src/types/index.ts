// types/index.ts

export interface Assignee {
  id: string;
  name: string;
  position?: string;
  role?: string;
}

export interface Task {
  id: string;
  title: string;
  details?: string;
  assignee: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  status: 'To Do' | 'In Progress' | 'Completed';
}

export type NewTask = Omit<Task, 'id'>;

export interface DashboardData {
  name: string;
  'งานเสร็จสิ้น': number;
}