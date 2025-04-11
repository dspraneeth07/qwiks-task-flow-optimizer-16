
import { Task } from '../types/task';
import TaskItem from './TaskItem';
import { getRecommendedNextTask } from '../utils/taskScheduler';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string, completed: boolean) => void;
}

const TaskList = ({ tasks, onEdit, onDelete, onToggleComplete }: TaskListProps) => {
  const incompleteTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  const recommendedTask = getRecommendedNextTask(tasks);
  
  return (
    <div className="animate-fade-in">
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Your task list is empty</h3>
          <p className="text-gray-500">Add some tasks to get started!</p>
        </div>
      ) : (
        <>
          {incompleteTasks.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Tasks To Do</h2>
              
              {recommendedTask && (
                <Alert className="mb-4 bg-qwix-purple/10 border-qwix-purple">
                  <InfoIcon className="h-4 w-4 text-qwix-purple" />
                  <AlertTitle className="text-qwix-purple-dark">Recommendation</AlertTitle>
                  <AlertDescription>
                    Based on priorities and dependencies, we suggest working on "{recommendedTask.title}" next.
                  </AlertDescription>
                </Alert>
              )}
              
              {incompleteTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  allTasks={tasks}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleComplete={onToggleComplete}
                  isRecommended={recommendedTask?.id === task.id}
                />
              ))}
            </div>
          )}
          
          {completedTasks.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-600">Completed Tasks</h2>
              {completedTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  allTasks={tasks}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleComplete={onToggleComplete}
                  isRecommended={false}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TaskList;
