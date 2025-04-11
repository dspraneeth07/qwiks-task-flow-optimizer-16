
import { Task } from "@/types/task";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  tasksToAtoms, 
  getAtomSpace, 
  calculateMettaPriority 
} from "@/services/mettaService";
import { useEffect, useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from "recharts";
import { Badge } from "@/components/ui/badge";

interface MeTTaAnalyticsProps {
  tasks: Task[];
}

const MeTTaAnalytics = ({ tasks }: MeTTaAnalyticsProps) => {
  const [activationData, setActivationData] = useState<{name: string; value: number; color: string; fullTitle: string}[]>([]);
  const [atomStats, setAtomStats] = useState({
    taskNodes: 0,
    dependencyLinks: 0,
    totalAtoms: 0
  });
  
  useEffect(() => {
    if (tasks.length === 0) return;
    
    // Convert tasks to MeTTa atoms
    tasksToAtoms(tasks);
    
    // Get atom statistics
    const atomspace = getAtomSpace();
    const allAtoms = atomspace.getAllAtoms();
    const taskNodes = atomspace.getAtomsByType("TaskNode").length;
    const dependencyLinks = atomspace.getAtomsByType("DependencyLink").length;
    
    setAtomStats({
      taskNodes,
      dependencyLinks,
      totalAtoms: allAtoms.length
    });
    
    // Calculate activation values using MeTTa algorithm
    const priorities = calculateMettaPriority(tasks);
    
    // Convert to chart data format
    const chartData = tasks
      .filter(task => !task.completed)
      .map(task => {
        // Get priority from MeTTa calculation
        const value = priorities.get(task.id) || 0;
        
        // Set color based on value
        let color = "#4b5563"; // Default gray
        if (value > 0.8) color = "#ef4444"; // High (red)
        else if (value > 0.5) color = "#f97316"; // Medium (orange)
        else if (value > 0.3) color = "#3b82f6"; // Low-medium (blue)
        else color = "#22c55e"; // Low (green)
        
        return {
          name: task.title.length > 15 ? task.title.substring(0, 12) + "..." : task.title,
          value: Math.round(value * 100) / 100,
          color,
          fullTitle: task.title
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Show top 8 by activation
    
    setActivationData(chartData);
  }, [tasks]);
  
  if (tasks.length === 0) {
    return (
      <Card className="shadow-sm dark:bg-gray-800">
        <CardHeader>
          <CardTitle>MeTTa Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No Tasks Available</h3>
              <p className="text-gray-500 dark:text-gray-400">Add some tasks to see MeTTa analytics</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-sm dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>MeTTa Graph Analytics</span>
          <Badge variant="outline" className="ml-2 bg-qwix-purple/10 text-qwix-purple dark:bg-qwix-purple/20 dark:text-qwix-purple-light">
            Powered by MeTTa
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 mb-4 grid-cols-3">
          <div className="bg-qwix-purple/10 dark:bg-qwix-purple/20 p-4 rounded-lg">
            <div className="text-xl font-bold text-qwix-purple dark:text-qwix-purple-light">{atomStats.taskNodes}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Task Nodes</div>
          </div>
          <div className="bg-qwix-blue/10 dark:bg-qwix-blue/20 p-4 rounded-lg">
            <div className="text-xl font-bold text-qwix-blue dark:text-qwix-blue-light">{atomStats.dependencyLinks}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Dependency Links</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-xl font-bold text-gray-700 dark:text-gray-300">{atomStats.totalAtoms}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Atoms</div>
          </div>
        </div>
        
        <div className="pt-2">
          <h4 className="text-sm font-semibold mb-2 dark:text-gray-300">Task Activation Values (MeTTa)</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Higher values indicate tasks that should be prioritized according to MeTTa's spreading activation algorithm
          </p>
          
          {activationData.length > 0 ? (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activationData}
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
                    label={{ 
                      value: 'Activation', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fill: 'var(--foreground)' }
                    }} 
                    tick={{ fill: 'var(--foreground)' }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value} activation`, 'MeTTa Value']}
                    labelFormatter={(name, payload) => {
                      if (payload && payload.length > 0) {
                        // @ts-ignore
                        return payload[0].payload.fullTitle;
                      }
                      return name;
                    }}
                    contentStyle={{ background: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="value" name="Activation Value">
                    {activationData.map((entry, index) => (
                      <Cell key={`activation-cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No activation data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MeTTaAnalytics;
