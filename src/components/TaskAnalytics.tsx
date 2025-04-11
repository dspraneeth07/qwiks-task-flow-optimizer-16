
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task, TaskStats } from "../types/task";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Progress } from "@/components/ui/progress";
import { Calculator, Clock, ListChecks, TrendingUp } from "lucide-react";

interface TaskAnalyticsProps {
  tasks: Task[];
  timeEfficiency: number;
}

const TaskAnalytics = ({ tasks, timeEfficiency }: TaskAnalyticsProps) => {
  if (tasks.length === 0) {
    return (
      <Card className="p-8 flex items-center justify-center shadow-sm dark:bg-gray-800">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No Analytics Available</h3>
          <p className="text-gray-500 dark:text-gray-400">Add some tasks to see analytics data</p>
        </div>
      </Card>
    );
  }
  
  // Calculate task statistics
  const completedTasks = tasks.filter(t => t.completed);
  const incompleteTasks = tasks.filter(t => !t.completed);
  const overdueTasks = tasks.filter(t => !t.completed && t.deadline && t.deadline < new Date());
  
  // Calculate real total times
  const totalEstimatedTime = completedTasks.reduce((acc, task) => acc + (task.estimatedTime || 0), 0);
  const totalActualTime = completedTasks.reduce((acc, task) => acc + (task.actualTime || 0), 0);
  
  const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
  
  // Calculate average completion time (difference between createdAt and completedAt)
  const avgCompletionTimeHours = completedTasks.length > 0 
    ? completedTasks.reduce((acc, task) => {
        if (!task.completedAt) return acc;
        return acc + ((task.completedAt.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60));
      }, 0) / completedTasks.length
    : 0;

  // Priority distribution data for chart with improved labeling  
  const priorityData = [
    { name: "High Priority", value: tasks.filter(t => t.priority === 'high').length, color: "#ea384c", id: "high" },
    { name: "Medium Priority", value: tasks.filter(t => t.priority === 'medium').length, color: "#0EA5E9", id: "medium" },
    { name: "Low Priority", value: tasks.filter(t => t.priority === 'low').length, color: "#22c55e", id: "low" },
  ];
  
  // Status distribution data for chart with improved labeling
  const statusData = [
    { name: "Completed Tasks", value: completedTasks.length, color: "#22c55e", id: "completed" },
    { name: "In Progress", value: incompleteTasks.length - overdueTasks.length, color: "#0EA5E9", id: "inprogress" },
    { name: "Overdue Tasks", value: overdueTasks.length, color: "#ea384c", id: "overdue" },
  ];
  
  // Tags distribution
  const tagCounts: Record<string, number> = {};
  tasks.forEach(task => {
    if (task.tags && task.tags.length > 0) {
      task.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });
  
  const tagData = Object.entries(tagCounts)
    .slice(0, 5)
    .map(([tag, count], index) => ({
      name: tag,
      value: count,
      color: ["#9b87f5", "#0EA5E9", "#22c55e", "#ea384c", "#F97316"][index % 5]
    }));
  
  // Time comparison data (estimated vs actual) for completed tasks with both times
  const timeComparisonData = completedTasks
    .filter(task => task.estimatedTime && task.actualTime)
    .map(task => ({
      name: task.title.length > 10 ? task.title.substring(0, 10) + '...' : task.title,
      estimated: task.estimatedTime,
      actual: task.actualTime,
      fullTitle: task.title
    }))
    .slice(0, 5); // Only show the 5 most recent for clarity
  
  // Improved custom pie chart label renderer that avoids text overlap
  const renderCustomizedPieLabel = ({ name, percent }: any) => {
    return percent > 0.1 ? `${name}: ${(percent * 100).toFixed(0)}%` : '';
  };
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Overview Card */}
      <Card className="shadow-sm dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> Task Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1 items-center">
                <span className="text-sm font-medium dark:text-gray-300">Completion Rate</span>
                <span className="text-sm font-medium dark:text-gray-300">{Math.round(completionRate)}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-qwix-purple/10 dark:bg-qwix-purple/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-qwix-purple dark:text-qwix-purple-light">{completedTasks.length}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Completed Tasks</div>
              </div>
              <div className="bg-qwix-blue/10 dark:bg-qwix-blue/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-qwix-blue dark:text-qwix-blue-light">{incompleteTasks.length}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Pending Tasks</div>
              </div>
              <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-500 dark:text-red-400">{overdueTasks.length}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Overdue Tasks</div>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {avgCompletionTimeHours > 0 ? Math.round(avgCompletionTimeHours * 10) / 10 : 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Hours to Complete</div>
              </div>
            </div>
            
            <div className="pt-2">
              <h4 className="text-sm font-medium mb-1 dark:text-gray-300">Time Spent (Completed Tasks)</h4>
              <div className="flex gap-4">
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg flex-1">
                  <div className="text-lg font-semibold dark:text-gray-200">{totalEstimatedTime} min</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Estimated</div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg flex-1">
                  <div className="text-lg font-semibold dark:text-gray-200">{totalActualTime} min</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Actual</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Time Efficiency Card (New) */}
      <Card className="shadow-sm dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" /> Time Efficiency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[240px]">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-gray-200 dark:text-gray-700"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  className={`${timeEfficiency >= 100 ? 'text-green-500' : timeEfficiency >= 75 ? 'text-blue-500' : 'text-orange-500'}`}
                  strokeWidth="10"
                  strokeDasharray={`${Math.min(timeEfficiency, 100) * 2.51} 251`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold dark:text-white">{Math.min(timeEfficiency, 200)}%</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">Efficiency</span>
              </div>
            </div>
            <p className="text-sm text-center mt-4 text-gray-600 dark:text-gray-300 max-w-[250px]">
              {timeEfficiency >= 100 
                ? "Great job! Tasks are being completed faster than estimated."
                : "Tasks are taking longer than estimated. Consider adjusting your time estimates."}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Priority Distribution - Improved layout */}
      <Card className="shadow-sm dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" /> Priority Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="w-full h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  nameKey="name"
                  label={renderCustomizedPieLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`priority-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value} tasks`, 'Count']}
                  labelFormatter={(name) => `${name}`}
                  contentStyle={{ background: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Task Status - Improved layout */}
      <Card className="shadow-sm dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" /> Task Status
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="w-full h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  nameKey="name"
                  label={renderCustomizedPieLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`status-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value} tasks`, 'Count']}
                  labelFormatter={(name) => `${name}`}
                  contentStyle={{ background: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Tag Distribution - New chart to fill empty space */}
      {tagData.length > 0 && (
        <Card className="shadow-sm md:col-span-2 dark:bg-gray-800">
          <CardHeader>
            <CardTitle>Tag Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={tagData}
                  margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
                  barSize={40}
                >
                  <XAxis 
                    dataKey="name" 
                    scale="band" 
                    padding={{ left: 10, right: 10 }}
                    tick={{ fill: 'var(--foreground)' }}
                  />
                  <YAxis tick={{ fill: 'var(--foreground)' }} />
                  <Tooltip 
                    formatter={(value: number) => [`${value} tasks`, 'Count']}
                    labelFormatter={(name) => `Tag: ${name}`}
                    contentStyle={{ background: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="value" name="Task Count">
                    {tagData.map((entry, index) => (
                      <Cell key={`tag-cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Time Comparison - Fixed layout */}
      {timeComparisonData.length > 0 && (
        <Card className="shadow-sm md:col-span-2 dark:bg-gray-800">
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
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={70} 
                    tickMargin={10}
                    tick={{ fill: 'var(--foreground)' }}
                  />
                  <YAxis 
                    label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { fill: 'var(--foreground)' } }}
                    tick={{ fill: 'var(--foreground)' }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value} minutes`, '']}
                    labelFormatter={(name, payload) => {
                      if (payload && payload.length > 0) {
                        // @ts-ignore
                        return payload[0].payload.fullTitle;
                      }
                      return name;
                    }}
                    contentStyle={{ background: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '15px' }}/>
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
