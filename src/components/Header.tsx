
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlusIcon, StarsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onAddTask: () => void;
  tasksCount: number;
  completedCount: number;
}

const Header = ({ onAddTask, tasksCount, completedCount }: HeaderProps) => {
  const [isHovering, setIsHovering] = useState(false);
  
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
      
      <div className="flex items-center justify-between w-full sm:w-auto gap-4">
        <div className="text-center">
          <p className="text-xl font-semibold">{tasksCount}</p>
          <p className="text-xs text-gray-500">Total Tasks</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-semibold">{completedCount}</p>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
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
