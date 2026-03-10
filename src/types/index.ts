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
  status: 'To Do' | 'In Progress' | 'Completed' | 'Edited';
}

export type NewTask = Omit<Task, 'id' | 'status'>;

export interface DashboardData {
  name: string;
  'งานเสร็จสิ้น': number;
}

// LINE Integration Types
export interface LineUser {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface LineGroup {
  groupId: string;
  groupName: string;
  iconUrl?: string;
  members: LineUser[];
  createdAt?: string;
}

export interface LineNotification {
  groupId: string;
  type: 'task_created' | 'task_updated' | 'task_completed' | 'task_deleted';
  taskId: string;
  taskTitle: string;
  assignee: string;
  message: string;
  timestamp: string;
}

// Hackaton Budget Types
export interface HackatonSession {
  id: string;
  title: string;
  description: string;
  emoji: string;
  totalBudget: string;
  createdAt?: string;
  updatedAt?: string;
  // computed stats (returned from server)
  itemCount?: number;
  totalSpent?: string;
  totalAllocated?: string;
}

export interface HackatonBudgetItem {
  id: string;
  sessionId: string;
  title: string;
  budget: number;
  spent: string;
  category: string;
  color: string;
  
  
}

export interface HackatonData {
  session: HackatonSession;
  items: HackatonBudgetItem[];
}