# MeTTa Implementation for Task Scheduling

This project implements MeTTa concepts for task scheduling and optimization. The implementation includes a custom AtomSpace and algorithms based on MeTTa principles.

## 1. Graph Representation in MeTTa

The project uses a custom AtomSpace implementation to represent tasks and their dependencies as a graph structure. The main components are:

- **Atoms**: Basic units in the knowledge graph
  - Each atom has a unique ID, type, and set of values
  - Atoms can be connected to create a semantic network
  - The AtomSpace provides methods for traversing connections

- **TaskNodes**: Represent individual tasks
  - Store task properties (title, priority, deadline, etc.)
  - Can be queried by various attributes
  - Participate in spreading activation algorithms

- **DependencyLinks**: Represent relationships between tasks
  - Connect source tasks to target tasks
  - Enable path-finding and cycle detection
  - Used for topological sorting of task graphs

## 2. AtomSpace Manipulation

The MeTTa service provides comprehensive functions to:

- **Add Atoms**: Create new nodes and links in the AtomSpace
- **Remove Atoms**: Delete atoms while maintaining graph integrity
- **Query Atoms**: Find atoms by type, attributes, or relationships
- **Get Connected Atoms**: Traverse the graph to find related atoms
- **Convert Tasks to Atoms**: Transform Task objects to MeTTa atoms and back

Implementation example:
```typescript
// Creating atoms from tasks
tasksToAtoms(tasks) {
  // Clear existing atoms
  atomspace.clear();
  
  // Create task nodes
  tasks.forEach(task => {
    atomspace.addAtom({
      id: task.id,
      type: "TaskNode",
      values: {
        title: task.title,
        priority: task.priority,
        completed: task.completed,
        deadline: task.deadline,
        // Other task properties
      }
    });
  });
  
  // Create dependency links
  tasks.forEach(task => {
    if (task.dependencies && task.dependencies.length > 0) {
      task.dependencies.forEach(depId => {
        atomspace.addAtom({
          id: `dep_${depId}_${task.id}`,
          type: "DependencyLink",
          values: {
            source: depId,
            target: task.id
          }
        });
      });
    }
  });
}
```

## 3. Algorithm Implementation in MeTTa

The following algorithms are implemented using MeTTa principles:

- **Spreading Activation**:
  - Calculates task priorities by propagating "activation energy" through the dependency network
  - Tasks with more dependencies "inherit" priority from prerequisite tasks
  - Implements a configurable decay factor for activation propagation
  - Provides a mathematical model for calculating task importance

- **Topological Sorting**:
  - Orders tasks based on their dependencies to ensure proper sequencing
  - Detects and resolves circular dependencies
  - Enables optimal scheduling that respects task constraints

- **Dependency Path Resolution**:
  - Finds all paths between tasks in the dependency graph
  - Calculates the critical path for project completion
  - Identifies bottlenecks in task workflows

## 4. Scheduling Algorithms

The scheduling system uses MeTTa concepts to:

- **Optimize Task Order**: Determine the best sequence of tasks based on dependencies, priorities, and deadlines
- **Calculate Priorities**: Use spreading activation to determine which tasks should be completed first
- **Visualize AtomSpace**: Render the knowledge graph for user exploration
- **Provide Analytics**: Generate insights based on the graph structure

## Implementation Notes

The MeTTa implementation is provided as a custom TypeScript service rather than using an external package. This gives us full control over the algorithms and allows seamless integration with the existing task management system.

Key aspects of the implementation:
- Custom AtomSpace class for graph representation
- Efficient algorithms for graph traversal and querying
- Integration with React components for visualization
- TypeScript typing for all MeTTa structures

## SingularityNET Integration

This project aligns with SingularityNET's principles by:
- Using symbolic AI representation (AtomSpace)
- Implementing graph-based reasoning
- Focusing on knowledge representation and manipulation
- Following principles found in OpenCog and similar symbolic AI systems

## Future Enhancements

- External AtomSpace database integration
- More advanced reasoning algorithms based on MeTTa principles
- Integration with SingularityNET marketplace services
- Expansion to include probabilistic reasoning
- Support for more complex graph patterns beyond simple dependencies

## Current Algorithms

### Spreading Activation

```typescript
calculateMettaPriority(tasks) {
  // Initialize activation values
  const activationValues = new Map();
  tasks.forEach(task => {
    // Initial activation based on task priority
    let initialActivation = 0;
    switch(task.priority) {
      case 'high': initialActivation = 0.8; break;
      case 'medium': initialActivation = 0.5; break;
      case 'low': initialActivation = 0.3; break;
    }
    
    // Add deadline factor
    if (task.deadline) {
      const daysUntilDeadline = Math.max(0, 
        (task.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilDeadline < 1) initialActivation += 0.3;
      else if (daysUntilDeadline < 3) initialActivation += 0.2;
      else if (daysUntilDeadline < 7) initialActivation += 0.1;
    }
    
    activationValues.set(task.id, initialActivation);
  });
  
  // Propagate activation (multiple iterations for stability)
  const decayFactor = 0.85; // How much activation energy is preserved during propagation
  const iterations = 5;
  
  for (let i = 0; i < iterations; i++) {
    // Copy current values for this iteration
    const currentValues = new Map(activationValues);
    
    // Process each task
    tasks.forEach(task => {
      // Get dependencies (tasks that this task depends on)
      const dependencies = task.dependencies || [];
      
      // If this task has dependencies, it receives activation from them
      if (dependencies.length > 0) {
        let totalActivation = 0;
        dependencies.forEach(depId => {
          if (currentValues.has(depId)) {
            totalActivation += currentValues.get(depId) * decayFactor;
          }
        });
        
        // Add to existing activation
        const newActivation = activationValues.get(task.id) + 
          (totalActivation / Math.max(1, dependencies.length));
        
        // Normalize to 0-1 range
        activationValues.set(task.id, Math.min(1, newActivation));
      }
    });
  }
  
  return activationValues;
}
```

### Task Scheduling

```typescript
getMettaTaskSchedule(tasks) {
  // Convert to graph representation
  tasksToAtoms(tasks);
  
  // Get priorities through spreading activation
  const priorities = calculateMettaPriority(tasks);
  
  // Separate completed tasks
  const completedTasks = tasks.filter(t => t.completed);
  const incompleteTasks = tasks.filter(t => !t.completed);
  
  // Perform topological sort considering dependencies
  const visited = new Set();
  const visiting = new Set();
  const sorted = [];
  
  // DFS function for topological sort
  const visit = (taskId) => {
    if (visited.has(taskId)) return;
    if (visiting.has(taskId)) {
      // Circular dependency detected, handle appropriately
      return;
    }
    
    visiting.add(taskId);
    
    // Find the task
    const task = incompleteTasks.find(t => t.id === taskId);
    if (task && task.dependencies) {
      // Visit all dependencies first
      task.dependencies.forEach(depId => {
        visit(depId);
      });
    }
    
    visiting.delete(taskId);
    visited.add(taskId);
    
    // Add to sorted result if it's an incomplete task
    if (task) {
      sorted.unshift(task);
    }
  };
  
  // Visit all tasks
  incompleteTasks.forEach(task => {
    if (!visited.has(task.id)) {
      visit(task.id);
    }
  });
  
  // Sort tasks with same dependency level by priority
  sorted.sort((a, b) => {
    // Check if b depends on a
    if (b.dependencies && b.dependencies.includes(a.id)) return -1;
    // Check if a depends on b
    if (a.dependencies && a.dependencies.includes(b.id)) return 1;
    
    // If no direct dependency, sort by MeTTa priority
    const priorityA = priorities.get(a.id) || 0;
    const priorityB = priorities.get(b.id) || 0;
    return priorityB - priorityA;
  });
  
  // Return sorted incomplete tasks followed by completed tasks
  return [...sorted, ...completedTasks];
}
```

## Contribution by Team QwikZen

This MeTTa implementation was developed by:
- Dhadi Sai Praneeth Reddy
- Kasireddy Manideep Reddy

For the SingularityNET Hackathon
