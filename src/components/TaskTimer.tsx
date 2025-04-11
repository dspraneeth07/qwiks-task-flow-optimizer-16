
import { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";
import { Task } from '@/types/task';
import { AlarmClockIcon, BellIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface TaskTimerProps {
  task: Task;
  onTimeUp: () => void;
}

const TaskTimer = ({ task, onTimeUp }: TaskTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [percentCompleted, setPercentCompleted] = useState(100);
  const { toast } = useToast();
  
  useEffect(() => {
    // Initialize timer when task has an estimated time
    if (task.estimatedTime && !task.completed) {
      setTimeRemaining(task.estimatedTime * 60); // Convert minutes to seconds
      setPercentCompleted(100);
    } else {
      setTimeRemaining(null);
      setPercentCompleted(100);
    }
  }, [task]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeRemaining !== null && timeRemaining > 0) {
      interval = setInterval(() => {
        const newTimeRemaining = timeRemaining - 1;
        setTimeRemaining(newTimeRemaining);
        
        // Calculate percentage remaining
        const totalSeconds = task.estimatedTime! * 60;
        const newPercentCompleted = Math.round((newTimeRemaining / totalSeconds) * 100);
        setPercentCompleted(newPercentCompleted);
        
        // Alert at 10% remaining
        if (newPercentCompleted === 10) {
          playAlertSound();
          speakTaskReminder(task, 10);
          toast({
            title: "Almost out of time!",
            description: `Only 10% of time remains for task: ${task.title}`,
            variant: "destructive"
          });
        }
        
        // Time's up
        if (newTimeRemaining <= 0) {
          playAlertSound();
          speakTaskReminder(task, 0);
          onTimeUp();
          clearInterval(interval!);
        }
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsActive(false);
      if (interval) clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining, task, onTimeUp]);
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const toggleTimer = () => {
    setIsActive(!isActive);
  };
  
  // Get color based on percentage
  const getProgressColor = (): string => {
    if (percentCompleted > 50) return "bg-green-500";
    if (percentCompleted > 25) return "bg-orange-500";
    return "bg-red-500";
  };
  
  const playAlertSound = () => {
    const audio = new Audio();
    audio.src = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"; // Replace with actual sound URL
    audio.play().catch(e => console.error("Error playing sound:", e));
  };
  
  const speakTaskReminder = (task: Task, percentRemaining: number) => {
    if (!('speechSynthesis' in window)) {
      console.error("Speech synthesis not supported");
      return;
    }
    
    let message = "";
    if (percentRemaining === 0) {
      message = `Time's up for task: ${task.title}. Have you completed it?`;
      
      // Check dependencies
      if (task.dependencies && task.dependencies.length > 0) {
        message += " There are tasks depending on this. Please complete it soon.";
      }
    } else {
      message = `Only ${percentRemaining}% of time remains for task: ${task.title}. Please try to finish soon.`;
    }
    
    const speech = new SpeechSynthesisUtterance(message);
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
  };
  
  if (timeRemaining === null || task.completed) return null;
  
  return (
    <div className="flex flex-col space-y-2 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {isActive ? (
            <AlarmClockIcon className={`h-4 w-4 mr-1 ${percentCompleted <= 10 ? 'text-red-500 animate-pulse' : ''}`} />
          ) : (
            <BellIcon className="h-4 w-4 mr-1" />
          )}
          <span className="text-sm font-medium">
            {isActive ? formatTime(timeRemaining) : `${task.estimatedTime} min`}
          </span>
        </div>
        <button 
          onClick={toggleTimer}
          className="text-xs px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          {isActive ? "Pause" : "Start"}
        </button>
      </div>
      
      {isActive && (
        <Progress 
          value={percentCompleted} 
          className={`h-2 ${getProgressColor()}`}
          indicatorClassName={getProgressColor()}
        />
      )}
    </div>
  );
};

export default TaskTimer;
