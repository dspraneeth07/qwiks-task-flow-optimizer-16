
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task, TaskStats } from "../types/task";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Progress } from "@/components/ui/progress";

interface TaskAnalyticsProps {
  tasks: Task[];
}

const TaskAnalytics = ({ tasks }: TaskAnalyticsProps) => {
  if (tasks.length === 0) {
    return (
      <Card className="p-8 flex items-center justify-center shadow-sm">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Analytics Available</h3>
          <p className="text-gray-500">Add some tasks to see analytics data</p>
        </div>
      </Card>
    );
  }
  
  // Calculate task statistics
  const completedTasks = tasks.filter(t => t.completed);
  const incompleteTasks = tasks.filter(t => !t.completed);
  const overdueTasks = tasks.filter(t => !t.completed && t.deadline && t.deadline < new Date());
  
  const totalEstimatedTime = tasks.reduce((acc, task) => acc + (task.estimatedTime || 0), 0);
  const totalActualTime = completedTasks.reduce((acc, task) => acc + (task.actualTime || task.estimatedTime || 0), 0);
  
  const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
  
  // Calculate average completion time (difference between createdAt and completedAt)
  const avgCompletionTimeHours = completedTasks.length > 0 
    ? completedTasks.reduce((acc, task) => {
        if (!task.completedAt) return acc;
        return acc + ((task.completedAt.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60));
      }, 0) / completedTasks.length
    : 0;

  // Priority distribution data for chart  
  const priorityData = [
    { name: "High", value: tasks.filter(t => t.priority === 'high').length },
    { name: "Medium", value: tasks.filter(t => t.priority === 'medium').length },
    { name: "Low", value: tasks.filter(t => t.priority === 'low').length },
  ];
  
  // Status distribution data for chart
  const statusData = [
    { name: "Completed", value: completedTasks.length },
    { name: "In Progress", value: incompleteTasks.length - overdueTasks.length },
    { name: "Overdue", value: overdueTasks.length },
  ];
  
  // Time comparison data (estimated vs actual) for completed tasks with both times
  const timeComparisonData = completedTasks
    .filter(task => task.estimatedTime && task.actualTime)
    .map(task => ({
      name: task.title.length > 15 ? task.title.substring(0, 15) + '...' : task.title,
      estimated: task.estimatedTime,
      actual: task.actualTime
    }))
    .slice(0, 5); // Only show the 5 most recent for clarity
  
  const COLORS = ['#9b87f5', '#0EA5E9', '#ea384c', '#22c55e'];
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Overview Card */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Task Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1 items-center">
                <span className="text-sm font-medium">Completion Rate</span>
                <span className="text-sm font-medium">{Math.round(completionRate)}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-qwix-purple/10 p-4 rounded-lg">
                <div className="text-2xl font-bold text-qwix-purple">{completedTasks.length}</div>
                <div className="text-sm text-gray-500">Completed Tasks</div>
              </div>
              <div className="bg-qwix-blue/10 p-4 rounded-lg">
                <div className="text-2xl font-bold text-qwix-blue">{incompleteTasks.length}</div>
                <div className="text-sm text-gray-500">Pending Tasks</div>
              </div>
              <div className="bg-red-100 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-500">{overdueTasks.length}</div>
                <div className="text-sm text-gray-500">Overdue Tasks</div>
              </div>
              <div className="bg-green-100 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {avgCompletionTimeHours > 0 ? Math.round(avgCompletionTimeHours * 10) / 10 : 0}
                </div>
                <div className="text-sm text-gray-500">Avg. Hours to Complete</div>
              </div>
            </div>
            
            <div className="pt-2">
              <h4 className="text-sm font-medium mb-1">Time Spent</h4>
              <div className="flex gap-4">
                <div className="bg-gray-100 p-3 rounded-lg flex-1">
                  <div className="text-lg font-semibold">{totalEstimatedTime} min</div>
                  <div className="text-xs text-gray-500">Estimated</div>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg flex-1">
                  <div className="text-lg font-semibold">{totalActualTime} min</div>
                  <div className="text-xs text-gray-500">Actual</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Priority Distribution */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Priority Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="w-full h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Status Distribution */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Task Status</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="w-full h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Time Comparison */}
      {timeComparisonData.length > 0 && (
        <Card className="shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle>Estimated vs Actual Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timeComparisonData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                  <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="estimated" fill="#9b87f5" name="Estimated Time" />
                  <Bar dataKey="actual" fill="#0EA5E9" name="Actual Time" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TaskAnalytics;
