import { Task } from "../types/task";
import { 
  tasksToAtoms, 
  calculateMettaPriority, 
  getMettaTaskSchedule 
} from "../services/mettaService";

// Check if a task can be started based on its dependencies
export const canTaskStart = (task: Task, allTasks: Task[]): boolean => {
  // If task has no dependencies, it can start immediately
  if (!task.dependencies || task.dependencies.length === 0) {
    return true;
  }

  // Check if all dependencies are completed
  return task.dependencies.every(depId => {
    const dependencyTask = allTasks.find(t => t.id === depId);
    return dependencyTask?.completed === true;
  });
};

// Calculate task priority score using MeTTa approach when available
export const calculateTaskPriority = (task: Task, allTasks?: Task[]): number => {
  // Use MeTTa service if all tasks are provided
  if (allTasks && allTasks.length > 0) {
    try {
      // Convert tasks to MeTTa representation
      tasksToAtoms(allTasks);
      // Get priorities using MeTTa algorithm
      const priorities = calculateMettaPriority(allTasks);
      // Normalize to 0-100 scale for compatibility
      const priority = priorities.get(task.id) || 0;
      return Math.round(priority * 100);
    } catch (error) {
      console.error("MeTTa priority calculation failed:", error);
      // Fall back to traditional calculation if MeTTa fails
    }
  }
  
  // Traditional calculation as fallback
  let score = 0;
  
  // Priority factor
  switch (task.priority) {
    case 'high':
      score += 30;
      break;
    case 'medium':
      score += 20;
      break;
    case 'low':
      score += 10;
      break;
  }
  
  // Deadline factor - closer deadlines get higher scores
  if (task.deadline) {
    const daysUntilDeadline = Math.max(0, Math.floor((task.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
    
    // Exponential decay for deadline importance
    // As deadline approaches, this factor increases significantly
    const deadlineFactor = Math.max(0, 50 - daysUntilDeadline * 5);
    score += deadlineFactor;
    
    // Add urgency factor for very close deadlines (within 24 hours)
    if (daysUntilDeadline < 1) {
      score += 25;
    }
  }
  
  // Estimated time factor - shorter tasks get slight priority
  if (task.estimatedTime && task.estimatedTime > 0) {
    // Normalize time factor - shorter tasks get higher scores
    const timeFactor = Math.max(0, 10 - (task.estimatedTime / 60));
    score += timeFactor;
  }
  
  // Consider "ready to start" tasks (no blocking dependencies)
  const readyBonus = task.dependencies && task.dependencies.length === 0 ? 15 : 0;
  score += readyBonus;
  
  return score;
};

// Get the optimized task order using MeTTa algorithms when available
export const getOptimizedTaskOrder = (tasks: Task[]): Task[] => {
  // Use MeTTa-based scheduling if available
  try {
    return getMettaTaskSchedule(tasks);
  } catch (error) {
    console.error("MeTTa task scheduling failed:", error);
    // Fall back to traditional scheduling if MeTTa fails
  }
  
  // Traditional implementation as fallback
  const incompleteTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  
  // First, separate tasks that can be started now
  const readyTasks: Task[] = [];
  const blockedTasks: Task[] = [];
  
  incompleteTasks.forEach(task => {
    if (canTaskStart(task, tasks)) {
      readyTasks.push(task);
    } else {
      blockedTasks.push(task);
    }
  });
  
  // Sort ready tasks by priority score
  readyTasks.sort((a, b) => calculateTaskPriority(b, tasks) - calculateTaskPriority(a, tasks));
  
  // For blocked tasks, we'll sort them by dependencies and priority
  // However, they'll be shown after ready tasks
  blockedTasks.sort((a, b) => {
    // Check if b depends on a
    if (b.dependencies.includes(a.id)) return -1;
    // Check if a depends on b
    if (a.dependencies.includes(b.id)) return 1;
    // Otherwise, sort by priority
    return calculateTaskPriority(b, tasks) - calculateTaskPriority(a, tasks);
  });
  
  // Return the optimized order: ready tasks first, then blocked tasks, then completed tasks
  return [...readyTasks, ...blockedTasks, ...completedTasks];
};

// Get recommended next task
export const getRecommendedNextTask = (tasks: Task[]): Task | undefined => {
  const optimizedTasks = getOptimizedTaskOrder(tasks);
  // The first uncompleted task is our recommendation
  return optimizedTasks.find(task => !task.completed);
};

// Get all dependency links for visualization
export const getDependencyLinks = (tasks: Task[]) => {
  const links: { source: string; target: string }[] = [];
  
  tasks.forEach(task => {
    if (task.dependencies && task.dependencies.length > 0) {
      task.dependencies.forEach(depId => {
        links.push({
          source: depId,
          target: task.id
        });
      });
    }
  });
  
  return links;
};

// Calculate current workload distribution
export const calculateWorkloadDistribution = (tasks: Task[]): Record<string, number> => {
  const workload: Record<string, number> = {
    high: 0,
    medium: 0,
    low: 0
  };
  
  const incompleteTasks = tasks.filter(task => !task.completed);
  
  incompleteTasks.forEach(task => {
    workload[task.priority] += task.estimatedTime || 30;
  });
  
  return workload;
};

// Estimate completion dates based on average completion rate
export const estimateCompletionDates = (tasks: Task[], avgTasksPerDay: number): Record<string, Date> => {
  const estimates: Record<string, Date> = {};
  const incompleteTasks = tasks.filter(task => !task.completed);
  const sortedTasks = getOptimizedTaskOrder(incompleteTasks);
  
  // Calculate how many days each task might take
  let currentDate = new Date();
  let tasksForToday = avgTasksPerDay;
  
  sortedTasks.forEach(task => {
    if (tasksForToday <= 0) {
      // Move to next day
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      tasksForToday = avgTasksPerDay;
    }
    
    estimates[task.id] = new Date(currentDate);
    tasksForToday--;
  });
  
  return estimates;
};
