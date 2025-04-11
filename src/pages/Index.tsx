
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Task } from '../types/task';
import Header from '../components/Header';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getDependencyLinks } from '../utils/taskScheduler';
import DependencyGraph from '../components/DependencyGraph';
import { ListIcon, NetworkIcon } from 'lucide-react';

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    // Load tasks from localStorage on initial mount
    const savedTasks = localStorage.getItem('qwixTasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        // Convert string dates back to Date objects
        return parsedTasks.map((task: any) => ({
          ...task,
          createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
          deadline: task.deadline ? new Date(task.deadline) : undefined,
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined
        }));
      } catch (e) {
        console.error('Error parsing tasks from localStorage', e);
        return [];
      }
    }
    return [];
  });
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState("list");
  const { toast } = useToast();
  
  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('qwixTasks', JSON.stringify(tasks));
  }, [tasks]);
  
  const handleAddTask = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };
  
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };
  
  const handleSaveTask = (taskData: Partial<Task>) => {
    // If editing an existing task
    if (taskData.id) {
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskData.id 
            ? { ...task, ...taskData } 
            : task
        )
      );
      
      toast({
        title: "Task Updated",
        description: "The task has been successfully updated."
      });
      return;
    }
    
    // Creating a new task
    const newTask: Task = {
      id: uuidv4(),
      title: taskData.title || 'Untitled Task',
      description: taskData.description,
      completed: false,
      priority: taskData.priority || 'medium',
      deadline: taskData.deadline,
      dependencies: taskData.dependencies || [],
      estimatedTime: taskData.estimatedTime,
      createdAt: new Date()
    };
    
    setTasks(prevTasks => [...prevTasks, newTask]);
    
    toast({
      title: "Task Created",
      description: "New task has been added to your list."
    });
  };
  
  const handleDeleteTask = (taskId: string) => {
    // Check if any other tasks depend on this one
    const dependentTasks = tasks.filter(t => 
      t.dependencies && t.dependencies.includes(taskId)
    );
    
    if (dependentTasks.length > 0) {
      // Remove this task from dependencies of other tasks
      setTasks(prevTasks => 
        prevTasks.map(task => ({
          ...task,
          dependencies: task.dependencies.filter(depId => depId !== taskId)
        }))
      );
      
      toast({
        title: "Dependencies Updated",
        description: `Removed dependencies from ${dependentTasks.length} task(s).`,
        variant: "default"
      });
    }
    
    // Delete the task
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    
    toast({
      title: "Task Deleted",
      description: "The task has been removed from your list."
    });
  };
  
  const handleToggleComplete = (taskId: string, completed: boolean) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              completed, 
              completedAt: completed ? new Date() : undefined 
            } 
          : task
      )
    );
    
    const taskTitle = tasks.find(t => t.id === taskId)?.title || 'Task';
    
    toast({
      title: completed ? "Task Completed" : "Task Reopened",
      description: completed 
        ? `"${taskTitle}" marked as complete.` 
        : `"${taskTitle}" reopened.`
    });
  };

  // Calculate tasks that have all dependencies completed
  const dependencyLinks = getDependencyLinks(tasks);
  
  return (
    <div className="min-h-screen bg-qwix-bg-light p-4 sm:p-6 max-w-5xl mx-auto">
      <Header 
        onAddTask={handleAddTask} 
        tasksCount={tasks.length} 
        completedCount={tasks.filter(t => t.completed).length} 
      />
      
      <TaskForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveTask}
        editingTask={editingTask}
        tasks={tasks}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-end mb-4">
          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-1">
              <ListIcon className="h-4 w-4" />
              <span className="hidden sm:inline">List View</span>
            </TabsTrigger>
            <TabsTrigger value="graph" className="flex items-center gap-1">
              <NetworkIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Dependency View</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list">
          <TaskList 
            tasks={tasks} 
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onToggleComplete={handleToggleComplete}
          />
        </TabsContent>

        <TabsContent value="graph">
          <Card className="p-4 h-[500px]">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No tasks to visualize</h3>
                <p className="text-gray-500 mb-4">Add some tasks to see their dependencies</p>
                <Button 
                  onClick={handleAddTask} 
                  className="bg-qwix-purple hover:bg-qwix-purple-dark"
                >
                  Add Your First Task
                </Button>
              </div>
            ) : dependencyLinks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No dependencies defined</h3>
                <p className="text-gray-500 mb-4">Create tasks with dependencies to visualize them</p>
                <Button 
                  onClick={handleAddTask} 
                  className="bg-qwix-purple hover:bg-qwix-purple-dark"
                >
                  Add Task with Dependencies
                </Button>
              </div>
            ) : (
              <DependencyGraph
                tasks={tasks}
                links={dependencyLinks}
              />
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
