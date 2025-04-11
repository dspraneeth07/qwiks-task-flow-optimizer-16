
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
  tags?: string[]; // Added tags for categorization
  actualTime?: number; // Time actually spent on the task (in minutes)
  startedAt?: Date; // When the task was started
  timerActive?: boolean; // Whether the timer is currently active
  timeRemaining?: number; // Time remaining in seconds
}

export interface TaskLink {
  source: string; // Source task ID
  target: string; // Target task ID
}

// Task statistics for analytics
export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  upcomingDeadlines: number;
  avgCompletionTime: number;
  estimatedVsActualRatio: number;
  priorityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  tagDistribution: Record<string, number>;
}
