
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlusIcon, StarsIcon, InfoIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface HeaderProps {
  onAddTask: () => void;
  tasksCount: number;
  completedCount: number;
  overdueTasks?: number;
  upcomingDeadlines?: number;
}

const Header = ({ 
  onAddTask, 
  tasksCount, 
  completedCount, 
  overdueTasks = 0,
  upcomingDeadlines = 0
}: HeaderProps) => {
  const [isHovering, setIsHovering] = useState(false);
  
  const completionRate = tasksCount > 0 
    ? Math.round((completedCount / tasksCount) * 100) 
    : 0;
  
  return (
    <header className="flex flex-col sm:flex-row items-center justify-between p-6 bg-white rounded-lg shadow-sm mb-6 animate-fade-in">
      <div className="flex items-center mb-4 sm:mb-0">
        <div
          className={cn(
            "mr-3 p-2 rounded-full bg-qwix-purple/10 transition-all duration-300",
            isHovering && "rotate-12"
          )}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <StarsIcon size={28} className="text-qwix-purple" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Qwix To Do</h1>
          <p className="text-gray-500 text-sm">
            Smart scheduling for maximum productivity
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between w-full sm:w-auto gap-4 flex-wrap">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center">
                <p className="text-xl font-semibold">{tasksCount}</p>
                <p className="text-xs text-gray-500">Total Tasks</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>All tasks in your system</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center">
                <p className="text-xl font-semibold">{completedCount}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tasks you've finished ({completionRate}% completion rate)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {overdueTasks > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center">
                  <p className="text-xl font-semibold text-red-500">{overdueTasks}</p>
                  <p className="text-xs text-gray-500">Overdue</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tasks past their deadline</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {upcomingDeadlines > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center">
                  <p className="text-xl font-semibold text-amber-500">{upcomingDeadlines}</p>
                  <p className="text-xs text-gray-500">Due Soon</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tasks due in the next 48 hours</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        <Button 
          onClick={onAddTask} 
          className="bg-qwix-purple hover:bg-qwix-purple-dark"
        >
          <PlusIcon size={18} className="mr-1" /> New Task
        </Button>
      </div>
    </header>
  );
};

export default Header;
