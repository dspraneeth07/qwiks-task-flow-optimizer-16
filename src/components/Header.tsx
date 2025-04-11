
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlusIcon, InfoIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import QwixLogo from './QwixLogo';

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
  const completionRate = tasksCount > 0 
    ? Math.round((completedCount / tasksCount) * 100) 
    : 0;
  
  return (
    <header className="flex flex-col sm:flex-row items-center justify-between p-6 bg-white rounded-lg shadow-sm mb-6 animate-fade-in">
      <div className="flex items-center mb-4 sm:mb-0">
        <QwixLogo size="md" />
      </div>
      
      <div className="flex items-center justify-between w-full sm:w-auto gap-4 flex-wrap">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="stat-card text-center bg-gradient-to-br from-blue-50 to-white p-3 rounded-lg shadow-sm transform transition-all hover:scale-105 hover:shadow-md">
                <p className="text-xl font-semibold text-blue-600">{tasksCount}</p>
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
              <div className="stat-card text-center bg-gradient-to-br from-green-50 to-white p-3 rounded-lg shadow-sm transform transition-all hover:scale-105 hover:shadow-md">
                <p className="text-xl font-semibold text-green-600">{completedCount}</p>
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
                <div className="stat-card text-center bg-gradient-to-br from-red-50 to-white p-3 rounded-lg shadow-sm transform transition-all hover:scale-105 hover:shadow-md">
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
                <div className="stat-card text-center bg-gradient-to-br from-amber-50 to-white p-3 rounded-lg shadow-sm transform transition-all hover:scale-105 hover:shadow-md">
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
          className="bg-gradient-to-r from-qwix-purple to-qwix-blue hover:from-qwix-purple-dark hover:to-qwix-purple text-white shadow-md hover:shadow-lg transition-all animate-pulse"
        >
          <PlusIcon size={18} className="mr-1" /> New Task
        </Button>
      </div>
    </header>
  );
};

export default Header;
