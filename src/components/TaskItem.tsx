
import { useState } from 'react';
import { Task } from '../types/task';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PencilIcon, Trash2Icon, CheckCircleIcon, AlertTriangleIcon, ClockIcon, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { canTaskStart } from '../utils/taskScheduler';
import TaskTimer from './TaskTimer';
import { useToast } from "@/hooks/use-toast";

interface TaskItemProps {
  task: Task;
  allTasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  isRecommended: boolean;
}

const TaskItem = ({ 
  task, 
  allTasks,
  onEdit, 
  onDelete, 
  onToggleComplete,
  isRecommended
}: TaskItemProps) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const canStart = canTaskStart(task, allTasks);
  const { toast } = useToast();
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const isOverdue = task.deadline && new Date() > task.deadline && !task.completed;
  
  const daysUntilDeadline = task.deadline 
    ? Math.ceil((task.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;
  
  const getDeadlineText = () => {
    if (!task.deadline) return null;
    
    if (isOverdue) {
      return (
        <span className="flex items-center text-red-600 text-sm">
          <AlertTriangleIcon className="h-4 w-4 mr-1" />
          Overdue by {Math.abs(daysUntilDeadline!)} day{Math.abs(daysUntilDeadline!) !== 1 ? 's' : ''}
        </span>
      );
    }
    
    if (daysUntilDeadline === 0) {
      return <span className="text-amber-600 text-sm flex items-center">
        <CalendarIcon className="h-4 w-4 mr-1" />
        Due today
      </span>;
    }
    
    if (daysUntilDeadline === 1) {
      return <span className="text-amber-600 text-sm flex items-center">
        <CalendarIcon className="h-4 w-4 mr-1" />
        Due tomorrow
      </span>;
    }
    
    return <span className="text-gray-600 text-sm flex items-center">
      <CalendarIcon className="h-4 w-4 mr-1" />
      Due in {daysUntilDeadline} days
    </span>;
  };
  
  const handleTimeUp = () => {
    toast({
      title: "Time's up!",
      description: `The allocated time for "${task.title}" has ended.`,
      variant: "destructive"
    });
  };
  
  return (
    <Card className={`mb-4 task-item border-l-4 transition-all shadow-sm hover:shadow-md ${
      task.completed 
        ? 'border-l-gray-300 opacity-70' 
        : isRecommended
          ? 'border-l-qwix-purple shadow-md border-l-4 animate-pulse'
          : canStart
            ? 'border-l-qwix-blue'
            : 'border-l-gray-400'
    } ${isOverdue && !task.completed ? 'border-red-400' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            <Checkbox 
              checked={task.completed}
              onCheckedChange={(checked) => {
                onToggleComplete(task.id, checked === true);
              }}
              className={`mt-1 transform hover:scale-110 transition-transform ${task.completed ? 'bg-qwix-purple border-qwix-purple' : ''}`}
            />
            <div>
              <CardTitle className={`${task.completed ? 'line-through text-gray-500' : ''}`}>
                {task.title}
                {isRecommended && !task.completed && (
                  <Badge className="ml-2 bg-qwix-purple hover:bg-qwix-purple-dark">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Recommended
                  </Badge>
                )}
              </CardTitle>
              {task.description && (
                <CardDescription className="mt-1">
                  {task.description}
                </CardDescription>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Badge 
              variant="outline" 
              className={`capitalize ${getPriorityColor(task.priority)}`}
            >
              {task.priority}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-col sm:flex-row gap-2 justify-between text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            {task.estimatedTime && !task.completed && (
              <span className="flex items-center text-gray-600 mr-4">
                <ClockIcon className="h-4 w-4 mr-1" />
                Estimated: {task.estimatedTime} min
                <span className="ml-2 text-xs text-gray-500">(Time required to complete)</span>
              </span>
            )}
            {task.deadline && getDeadlineText()}
          </div>
          
          {!canStart && !task.completed && (
            <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200 whitespace-nowrap">
              Waiting on dependencies
            </Badge>
          )}

          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        {!task.completed && task.estimatedTime && (
          <div className="mt-3">
            <TaskTimer task={task} onTimeUp={handleTimeUp} />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex justify-end gap-2 w-full">
          {showConfirmDelete ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => onDelete(task.id)}
              >
                Confirm
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(task)}
                className="hover:border-qwix-purple hover:text-qwix-purple hover:bg-qwix-purple/10 transition-colors"
              >
                <PencilIcon className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowConfirmDelete(true)}
                className="hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2Icon className="h-4 w-4 mr-1" /> Delete
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default TaskItem;
