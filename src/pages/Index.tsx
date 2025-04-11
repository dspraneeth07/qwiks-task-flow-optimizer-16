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
import { ListIcon, NetworkIcon, BarChartIcon } from 'lucide-react';
import TaskAnalytics from '../components/TaskAnalytics';

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('qwixTasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
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
  
  const overdueTasks = tasks.filter(
    task => !task.completed && task.deadline && new Date() > task.deadline
  ).length;
  
  const upcomingDeadlines = tasks.filter(
    task => !task.completed && task.deadline && 
    new Date() < task.deadline && 
    new Date().getTime() + (48 * 60 * 60 * 1000) > task.deadline.getTime()
  ).length;
  
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
    
    const newTask: Task = {
      id: uuidv4(),
      title: taskData.title || 'Untitled Task',
      description: taskData.description,
      completed: false,
      priority: taskData.priority || 'medium',
      deadline: taskData.deadline,
      dependencies: taskData.dependencies || [],
      estimatedTime: taskData.estimatedTime,
      tags: taskData.tags || [],
      createdAt: new Date()
    };
    
    setTasks(prevTasks => [...prevTasks, newTask]);
    
    toast({
      title: "Task Created",
      description: "New task has been added to your list."
    });
    
    if (newTask.estimatedTime) {
      setTimeout(() => {
        toast({
          title: "Start Timer?",
          description: `Would you like to start working on "${newTask.title}" now?`,
          action: (
            <Button 
              onClick={() => playStartSound(newTask.title)}
              size="sm" 
              className="bg-qwix-purple"
            >
              Start
            </Button>
          ),
        });
      }, 1000);
    }
  };
  
  const playStartSound = (taskTitle: string) => {
    const audio = new Audio();
    audio.src = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
    audio.play().catch(e => console.error("Error playing sound:", e));
    
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(`Starting task: ${taskTitle}. Your timer has begun.`);
      speech.volume = 1;
      speech.rate = 1;
      speech.pitch = 1;
      window.speechSynthesis.speak(speech);
    }
  };
  
  const handleDeleteTask = (taskId: string) => {
    const dependentTasks = tasks.filter(t => 
      t.dependencies && t.dependencies.includes(taskId)
    );
    
    if (dependentTasks.length > 0) {
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
    
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    
    toast({
      title: "Task Deleted",
      description: "The task has been removed from your list."
    });
  };
  
  const handleToggleComplete = (taskId: string, completed: boolean) => {
    const currentTime = new Date();
    
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => {
        if (task.id !== taskId) return task;
        
        let actualTime = task.actualTime;
        if (completed && task.estimatedTime && !task.actualTime) {
          actualTime = Math.floor(task.estimatedTime * (0.7 + Math.random() * 0.6));
        }
        
        return {
          ...task,
          completed,
          completedAt: completed ? currentTime : undefined,
          actualTime: completed ? actualTime : undefined
        };
      });
      
      return updatedTasks;
    });
    
    const taskTitle = tasks.find(t => t.id === taskId)?.title || 'Task';
    
    if (completed) {
      const audio = new Audio();
      audio.src = "https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3";
      audio.play().catch(e => console.error("Error playing sound:", e));
      
      if ('speechSynthesis' in window) {
        const speech = new SpeechSynthesisUtterance(`Congratulations! You've completed the task: ${taskTitle}.`);
        window.speechSynthesis.speak(speech);
      }
    }
    
    toast({
      title: completed ? "Task Completed" : "Task Reopened",
      description: completed 
        ? `"${taskTitle}" marked as complete.` 
        : `"${taskTitle}" reopened.`
    });
  };

  const dependencyLinks = getDependencyLinks(tasks);
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 max-w-5xl mx-auto">
      <Header 
        onAddTask={handleAddTask} 
        tasksCount={tasks.length} 
        completedCount={tasks.filter(t => t.completed).length}
        overdueTasks={overdueTasks}
        upcomingDeadlines={upcomingDeadlines}
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
          <TabsList className="bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="list" className="flex items-center gap-1 data-[state=active]:bg-qwix-purple/10 data-[state=active]:text-qwix-purple">
              <ListIcon className="h-4 w-4" />
              <span className="hidden sm:inline">List View</span>
            </TabsTrigger>
            <TabsTrigger value="graph" className="flex items-center gap-1 data-[state=active]:bg-qwix-purple/10 data-[state=active]:text-qwix-purple">
              <NetworkIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Dependencies</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1 data-[state=active]:bg-qwix-purple/10 data-[state=active]:text-qwix-purple">
              <BarChartIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
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
          <Card className="p-4 h-[500px] shadow-sm bg-white">
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
        
        <TabsContent value="analytics">
          <TaskAnalytics tasks={tasks} />
        </TabsContent>
      </Tabs>

      <footer className="mt-8 pb-4 text-center">
        <p className="text-sm font-medium text-gray-700">Developed by Team QwikZen</p>
        <p className="text-xs text-gray-500 mt-1">Task Management and Scheduling Solution</p>
      </footer>
    </div>
  );
};

export default Index;
