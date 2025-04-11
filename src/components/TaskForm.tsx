
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ClockIcon, InfoCircleIcon, TagIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Task, TaskPriority } from '../types/task';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  editingTask: Task | null;
  tasks: Task[];
}

const TIME_OPTIONS = [
  { value: 5, label: "5 min" },
  { value: 10, label: "10 min" },
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
  { value: 180, label: "3 hours" },
  { value: 240, label: "4 hours" },
  { value: 300, label: "5 hours" },
  { value: 360, label: "6 hours" },
  { value: 420, label: "7 hours" },
  { value: 480, label: "8 hours" },
];

const TaskForm = ({ isOpen, onClose, onSave, editingTask, tasks }: TaskFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [estimatedTime, setEstimatedTime] = useState<number>(30);
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [customTime, setCustomTime] = useState(false);
  
  // Reset form when editing task changes
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority);
      setDeadline(editingTask.deadline);
      setEstimatedTime(editingTask.estimatedTime || 30);
      setDependencies(editingTask.dependencies || []);
      setTags(editingTask.tags || []);
      setCustomTime(false);
    } else {
      // Clear form for new task
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDeadline(undefined);
      setEstimatedTime(30);
      setDependencies([]);
      setTags([]);
      setTagInput('');
      setCustomTime(false);
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
      dependencies,
      tags: tags.length > 0 ? tags : undefined
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
  
  const addTag = () => {
    if (!tagInput.trim()) return;
    
    if (!tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
    }
    setTagInput('');
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const availableTasks = tasks.filter(task => 
    !editingTask || task.id !== editingTask.id
  );
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-qwix-purple">{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
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
            <div className="flex gap-2">
              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="deadline"
                    onClick={() => setShowCalendar(true)}
                    className="justify-start text-left font-normal flex-1 border-qwix-purple/30"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, 'PPP') : 'Choose a deadline'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-auto pointer-events-auto" align="start">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={(date) => {
                      setDeadline(date);
                      setShowCalendar(false);
                    }}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              
              {deadline && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeadline(undefined)}
                  className="text-gray-400 hover:text-red-500"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
          
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="time" className="flex items-center gap-1">
                Estimated Time
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm max-w-xs">
                        The time you expect this task to take. This helps with scheduling and 
                        will activate a timer while the task is in progress.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCustomTime(!customTime)}
                className="text-xs h-7"
              >
                {customTime ? "Choose preset" : "Custom time"}
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
              
              {customTime ? (
                <div className="flex items-center gap-2 w-full">
                  <Input
                    id="time"
                    type="number"
                    min={1}
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(parseInt(e.target.value) || 30)}
                    className="border-qwix-purple/30 focus:border-qwix-purple w-full"
                  />
                  <span className="text-sm text-gray-500 whitespace-nowrap">minutes</span>
                </div>
              ) : (
                <Select
                  value={estimatedTime.toString()}
                  onValueChange={(value) => setEstimatedTime(parseInt(value))}
                >
                  <SelectTrigger className="border-qwix-purple/30 focus:border-qwix-purple w-full">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="tags" className="flex items-center gap-1">
              Tags
              <TagIcon className="h-4 w-4 text-gray-400" />
            </Label>
            
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add tag and press Enter"
                className="border-qwix-purple/30 focus:border-qwix-purple"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={addTag}
                className="border-qwix-purple/30 hover:bg-qwix-purple/10"
              >
                Add
              </Button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 bg-qwix-purple/10 text-qwix-purple"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-qwix-purple hover:text-red-500 transition-colors"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
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
