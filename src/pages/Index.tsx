
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Task } from '../types/task';
import Header from '../components/Header';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getDependencyLinks, calculateTimeEfficiency } from '../utils/taskScheduler';
import DependencyGraph from '../components/DependencyGraph';
import { ListIcon, NetworkIcon, BarChartIcon, BrainIcon } from 'lucide-react';
import TaskAnalytics from '../components/TaskAnalytics';
import MeTTaAnalytics from '../components/MeTTaAnalytics';

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
        
        let actualTime: number | undefined = task.actualTime;
        
        // Calculate actual time based on realistic values
        if (completed && task.estimatedTime) {
          // For realism, generate a value that's reasonably close to estimated time
          // but with some variation (between 70% and 130% of estimated)
          const variationFactor = 0.7 + (Math.random() * 0.6); // between 0.7 and 1.3
          actualTime = Math.round(task.estimatedTime * variationFactor);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 max-w-5xl mx-auto">
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
          <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <TabsTrigger value="list" className="flex items-center gap-1 data-[state=active]:bg-qwix-purple/10 data-[state=active]:text-qwix-purple dark:text-gray-300 dark:data-[state=active]:text-qwix-purple">
              <ListIcon className="h-4 w-4" />
              <span className="hidden sm:inline">List View</span>
            </TabsTrigger>
            <TabsTrigger value="graph" className="flex items-center gap-1 data-[state=active]:bg-qwix-purple/10 data-[state=active]:text-qwix-purple dark:text-gray-300 dark:data-[state=active]:text-qwix-purple">
              <NetworkIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Dependencies</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1 data-[state=active]:bg-qwix-purple/10 data-[state=active]:text-qwix-purple dark:text-gray-300 dark:data-[state=active]:text-qwix-purple">
              <BarChartIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="metta" className="flex items-center gap-1 data-[state=active]:bg-qwix-purple/10 data-[state=active]:text-qwix-purple dark:text-gray-300 dark:data-[state=active]:text-qwix-purple">
              <BrainIcon className="h-4 w-4" />
              <span className="hidden sm:inline">MeTTa</span>
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
          <Card className="p-4 h-[500px] shadow-sm bg-white dark:bg-gray-800">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No tasks to visualize</h3>
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
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No dependencies defined</h3>
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
          <TaskAnalytics 
            tasks={tasks} 
            timeEfficiency={calculateTimeEfficiency(tasks)}
          />
        </TabsContent>
        
        <TabsContent value="metta">
          <MeTTaAnalytics tasks={tasks} />
        </TabsContent>
      </Tabs>

      <Footer />
    </div>
  );
};

export default Index;
