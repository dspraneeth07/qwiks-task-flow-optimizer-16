
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ClockIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Task, TaskPriority } from '../types/task';
import { Checkbox } from '@/components/ui/checkbox';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  editingTask: Task | null;
  tasks: Task[];
}

const TaskForm = ({ isOpen, onClose, onSave, editingTask, tasks }: TaskFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [estimatedTime, setEstimatedTime] = useState<number>(30);
  const [dependencies, setDependencies] = useState<string[]>([]);
  
  // Reset form when editing task changes
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority);
      setDeadline(editingTask.deadline);
      setEstimatedTime(editingTask.estimatedTime || 30);
      setDependencies(editingTask.dependencies || []);
    } else {
      // Clear form for new task
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDeadline(undefined);
      setEstimatedTime(30);
      setDependencies([]);
    }
  }, [editingTask]);
  
  const handleSubmit = () => {
    if (!title.trim()) return;
    
    const taskData: Partial<Task> = {
      title,
      description: description || undefined,
      priority,
      deadline,
      estimatedTime,
      dependencies
    };
    
    if (editingTask) {
      taskData.id = editingTask.id;
    }
    
    onSave(taskData);
    onClose();
  };
  
  const toggleDependency = (taskId: string) => {
    setDependencies(prev => 
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };
  
  const availableTasks = tasks.filter(task => 
    !editingTask || task.id !== editingTask.id
  );
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] animate-scale-in">
        <DialogHeader>
          <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Task Title*</Label>
            <Input 
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              className="border-qwix-purple/30 focus:border-qwix-purple"
              autoFocus
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this task"
              className="min-h-[80px] border-qwix-purple/30 focus:border-qwix-purple"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={priority}
              onValueChange={(value) => setPriority(value as TaskPriority)}
            >
              <SelectTrigger id="priority" className="border-qwix-purple/30 focus:border-qwix-purple">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="deadline"
                  className="justify-start text-left font-normal border-qwix-purple/30"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, 'PP') : 'Choose a deadline'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-auto" align="start">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  initialFocus
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="time">Estimated Time (minutes)</Label>
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-gray-500" />
              <Input
                id="time"
                type="number"
                min={1}
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(parseInt(e.target.value) || 30)}
                className="border-qwix-purple/30 focus:border-qwix-purple"
              />
            </div>
          </div>
          
          {availableTasks.length > 0 && (
            <div className="grid gap-2">
              <Label>Dependencies</Label>
              <div className="border rounded-md p-3 max-h-[150px] overflow-y-auto border-qwix-purple/30">
                {availableTasks.length === 0 ? (
                  <p className="text-sm text-gray-500">No other tasks to depend on</p>
                ) : (
                  availableTasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        id={`dep-${task.id}`}
                        checked={dependencies.includes(task.id)}
                        onCheckedChange={() => toggleDependency(task.id)}
                        className="border-qwix-purple/30"
                      />
                      <Label
                        htmlFor={`dep-${task.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {task.title}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="bg-qwix-purple hover:bg-qwix-purple-dark"
          >
            {editingTask ? 'Update Task' : 'Create Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;
