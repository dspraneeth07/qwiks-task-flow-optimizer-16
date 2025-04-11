
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TaskPriority;
  deadline?: Date;
  dependencies: string[]; // Array of task IDs this task depends on
  estimatedTime?: number; // In minutes
  createdAt: Date;
  completedAt?: Date;
  tags?: string[]; // New: Added tags for categorization
  actualTime?: number; // New: Time actually spent on the task (in minutes)
}

export interface TaskLink {
  source: string; // Source task ID
  target: string; // Target task ID
}

// New: Task statistics for analytics
export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  upcomingDeadlines: number;
  avgCompletionTime: number;
}
