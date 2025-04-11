import { Task } from "../types/task";

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

// Calculate task priority score (higher means should be done sooner)
export const calculateTaskPriority = (task: Task): number => {
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
  }
  
  // Estimated time factor - shorter tasks get slight priority
  if (task.estimatedTime && task.estimatedTime > 0) {
    // Normalize time factor - shorter tasks get higher scores
    const timeFactor = Math.max(0, 10 - (task.estimatedTime / 60));
    score += timeFactor;
  }
  
  return score;
};

// Get the optimized task order
export const getOptimizedTaskOrder = (tasks: Task[]): Task[] => {
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
  readyTasks.sort((a, b) => calculateTaskPriority(b) - calculateTaskPriority(a));
  
  // For blocked tasks, we'll sort them by dependencies and priority
  // However, they'll be shown after ready tasks
  blockedTasks.sort((a, b) => {
    // Check if b depends on a
    if (b.dependencies.includes(a.id)) return -1;
    // Check if a depends on b
    if (a.dependencies.includes(b.id)) return 1;
    // Otherwise, sort by priority
    return calculateTaskPriority(b) - calculateTaskPriority(a);
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
