
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
}

export interface TaskLink {
  source: string; // Source task ID
  target: string; // Target task ID
}
