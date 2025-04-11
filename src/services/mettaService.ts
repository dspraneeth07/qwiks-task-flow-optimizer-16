
/**
 * MeTTa Service Implementation
 * 
 * This service provides a JavaScript/TypeScript implementation of MeTTa concepts
 * for task scheduling and optimization without external dependencies.
 */

import { Task } from "@/types/task";

// AtomSpace representation for MeTTa-like graph structure
export interface Atom {
  type: string;
  value: any;
  id: string;
  outgoing: string[];
}

// Simple AtomSpace implementation
class AtomSpace {
  private atoms: Map<string, Atom> = new Map();
  
  // Add atom to the atomspace
  addAtom(atom: Atom): void {
    this.atoms.set(atom.id, atom);
  }
  
  // Get atom by id
  getAtom(id: string): Atom | undefined {
    return this.atoms.get(id);
  }
  
  // Get all atoms
  getAllAtoms(): Atom[] {
    return Array.from(this.atoms.values());
  }
  
  // Query atoms by type
  getAtomsByType(type: string): Atom[] {
    return Array.from(this.atoms.values())
      .filter(atom => atom.type === type);
  }
  
  // Get connected atoms
  getConnectedAtoms(id: string): Atom[] {
    const atom = this.getAtom(id);
    if (!atom) return [];
    
    return atom.outgoing
      .map(outId => this.getAtom(outId))
      .filter((a): a is Atom => a !== undefined);
  }
  
  // Remove atom
  removeAtom(id: string): void {
    this.atoms.delete(id);
  }
  
  // Clear atomspace
  clear(): void {
    this.atoms.clear();
  }
}

// Singleton instance of AtomSpace
const atomSpace = new AtomSpace();

// Convert tasks to MeTTa atoms
export const tasksToAtoms = (tasks: Task[]): void => {
  // Clear existing atomspace
  atomSpace.clear();
  
  // Add task atoms
  tasks.forEach(task => {
    const taskAtom: Atom = {
      type: "TaskNode",
      value: {
        title: task.title,
        priority: task.priority,
        completed: task.completed,
        estimatedTime: task.estimatedTime,
        deadline: task.deadline
      },
      id: task.id,
      outgoing: task.dependencies || []
    };
    
    atomSpace.addAtom(taskAtom);
  });
  
  // Add special relation atoms for dependencies
  tasks.forEach(task => {
    if (task.dependencies && task.dependencies.length > 0) {
      task.dependencies.forEach(depId => {
        const relationId = `rel-${depId}-${task.id}`;
        const relationAtom: Atom = {
          type: "DependencyLink",
          value: { label: "depends_on" },
          id: relationId,
          outgoing: [depId, task.id]
        };
        
        atomSpace.addAtom(relationAtom);
      });
    }
  });
};

// MeTTa-inspired algorithm for dependency resolution
export const resolveDependencyPath = (
  startTaskId: string, 
  endTaskId: string
): string[] => {
  const visited = new Set<string>();
  const path: string[] = [];
  
  const dfs = (currentId: string): boolean => {
    if (currentId === endTaskId) {
      path.push(currentId);
      return true;
    }
    
    if (visited.has(currentId)) {
      return false;
    }
    
    visited.add(currentId);
    
    const currentAtom = atomSpace.getAtom(currentId);
    if (!currentAtom) return false;
    
    const dependencyLinks = atomSpace.getAllAtoms()
      .filter(atom => 
        atom.type === "DependencyLink" && 
        atom.outgoing.includes(currentId) &&
        !atom.outgoing.every(id => id === currentId)
      );
    
    for (const link of dependencyLinks) {
      const nextId = link.outgoing.find(id => id !== currentId);
      if (!nextId) continue;
      
      if (dfs(nextId)) {
        path.unshift(currentId);
        return true;
      }
    }
    
    return false;
  };
  
  dfs(startTaskId);
  return path;
};

// MeTTa-inspired topological sort for scheduling
export const mettaTopologicalSort = (tasks: Task[]): Task[] => {
  // First convert tasks to atoms for processing
  tasksToAtoms(tasks);
  
  const result: Task[] = [];
  const visited = new Set<string>();
  const temp = new Set<string>();
  
  const visit = (taskId: string): boolean => {
    if (temp.has(taskId)) {
      return false; // Cyclic dependency detected
    }
    
    if (visited.has(taskId)) {
      return true;
    }
    
    temp.add(taskId);
    
    // Get atom and check outgoing dependencies
    const taskAtom = atomSpace.getAtom(taskId);
    if (!taskAtom) return true;
    
    // Visit all dependencies first
    for (const depId of taskAtom.outgoing) {
      if (!visit(depId)) {
        return false;
      }
    }
    
    temp.delete(taskId);
    visited.add(taskId);
    
    // Add to result
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      result.unshift(task);
    }
    
    return true;
  };
  
  // Process all tasks
  for (const task of tasks) {
    if (!visited.has(task.id)) {
      if (!visit(task.id)) {
        // Handle cyclic dependencies by placing incomplete tasks first
        const remainingTasks = tasks.filter(t => !visited.has(t.id));
        return [...remainingTasks, ...result];
      }
    }
  }
  
  return result;
};

// Calculate task priority using MeTTa-inspired spreading activation
export const calculateMettaPriority = (tasks: Task[]): Map<string, number> => {
  // Convert tasks to atoms
  tasksToAtoms(tasks);
  
  // Initialize activation values
  const activation = new Map<string, number>();
  tasks.forEach(task => {
    // Base activation from priority
    let initialActivation = 0;
    switch (task.priority) {
      case 'high': 
        initialActivation = 1.0;
        break;
      case 'medium': 
        initialActivation = 0.6;
        break;
      case 'low': 
        initialActivation = 0.3;
        break;
    }
    
    // Add deadline factor
    if (task.deadline) {
      const now = new Date();
      const timeUntilDeadline = task.deadline.getTime() - now.getTime();
      const daysUntilDeadline = timeUntilDeadline / (1000 * 60 * 60 * 24);
      
      if (daysUntilDeadline < 0) {
        // Overdue tasks get maximum activation
        initialActivation = Math.max(initialActivation, 1.0);
      } else if (daysUntilDeadline < 1) {
        // Due today
        initialActivation = Math.max(initialActivation, 0.9);
      } else if (daysUntilDeadline < 3) {
        // Due in next 3 days
        initialActivation = Math.max(initialActivation, 0.7);
      }
    }
    
    activation.set(task.id, initialActivation);
  });
  
  // Spreading activation algorithm (3 iterations)
  const spread = (iterations: number): void => {
    for (let i = 0; i < iterations; i++) {
      const newActivation = new Map<string, number>(activation);
      
      // For each task, spread its activation to dependent tasks
      tasks.forEach(task => {
        const taskActivation = activation.get(task.id) || 0;
        const dependencies = tasks.filter(t => 
          t.dependencies && t.dependencies.includes(task.id)
        );
        
        // Each dependent task gets activation from its dependency
        dependencies.forEach(depTask => {
          const currentDepActivation = newActivation.get(depTask.id) || 0;
          // Spread 30% of activation to dependent tasks
          newActivation.set(
            depTask.id, 
            currentDepActivation + (taskActivation * 0.3)
          );
        });
      });
      
      // Update activation values
      for (const [id, value] of newActivation.entries()) {
        activation.set(id, value);
      }
    }
  };
  
  // Run spreading activation
  spread(3);
  
  return activation;
};

// Export the atomspace for direct manipulation
export const getAtomSpace = (): AtomSpace => atomSpace;

// Function to get all dependency links as atom representations
export const getMettaDependencyLinks = (tasks: Task[]): Atom[] => {
  tasksToAtoms(tasks);
  return atomSpace.getAtomsByType("DependencyLink");
};

// Function to compute the task schedule using MeTTa algorithms
export const getMettaTaskSchedule = (tasks: Task[]): Task[] => {
  // First sort tasks topologically
  const sortedTasks = mettaTopologicalSort(tasks);
  
  // Then calculate priorities using spreading activation
  const priorities = calculateMettaPriority(tasks);
  
  // Final sort by priority (for tasks that can be done in parallel)
  return sortedTasks.sort((a, b) => {
    // First criterion: task dependencies (from topological sort)
    const aIndex = sortedTasks.findIndex(t => t.id === a.id);
    const bIndex = sortedTasks.findIndex(t => t.id === b.id);
    if (aIndex !== bIndex) return aIndex - bIndex;
    
    // Second criterion: priority values from spreading activation
    const aPriority = priorities.get(a.id) || 0;
    const bPriority = priorities.get(b.id) || 0;
    return bPriority - aPriority;
  });
};
