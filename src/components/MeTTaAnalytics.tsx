
import { Task } from "@/types/task";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  tasksToAtoms, 
  getAtomSpace, 
  calculateMettaPriority 
} from "@/services/mettaService";
import { useEffect, useState, useRef } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  ReferenceLine
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { BrainIcon, NetworkIcon, ZapIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MeTTaAnalyticsProps {
  tasks: Task[];
}

// Time periods for knowledge transfer simulation
const TIME_PERIODS = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];

const MeTTaAnalytics = ({ tasks }: MeTTaAnalyticsProps) => {
  const [activationData, setActivationData] = useState<{name: string; value: number; color: string; fullTitle: string}[]>([]);
  const [atomStats, setAtomStats] = useState({
    taskNodes: 0,
    dependencyLinks: 0,
    totalAtoms: 0
  });
  const [knowledgeTransferData, setKnowledgeTransferData] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const particlesRef = useRef<HTMLDivElement>(null);
  
  // Function to create knowledge transfer particle effect
  const createParticle = () => {
    if (!particlesRef.current) return;
    
    const container = particlesRef.current;
    const particle = document.createElement('div');
    particle.classList.add('knowledge-transfer-particle');
    
    // Random starting position within the container
    const startX = Math.random() * (container.clientWidth - 100);
    const startY = Math.random() * (container.clientHeight - 20);
    
    // Random ending position
    const endX = startX + (Math.random() * 200 - 100);
    const endY = startY + (Math.random() * 200 - 100);
    
    particle.style.left = `${startX}px`;
    particle.style.top = `${startY}px`;
    
    // Custom animation for this particle
    particle.animate(
      [
        { transform: `translate(0, 0)`, opacity: 0 },
        { transform: `translate(10px, -10px)`, opacity: 0.8 },
        { transform: `translate(${endX - startX}px, ${endY - startY}px)`, opacity: 0 }
      ],
      {
        duration: 2000 + Math.random() * 2000,
        easing: 'cubic-bezier(0.1, 0.7, 1.0, 0.1)'
      }
    );
    
    container.appendChild(particle);
    
    // Remove particle after animation completes
    setTimeout(() => {
      if (particle.parentNode === container) {
        container.removeChild(particle);
      }
    }, 4000);
  };
  
  // Create particles at intervals
  useEffect(() => {
    const completedTasksCount = tasks.filter(t => t.completed).length;
    if (completedTasksCount > 0) {
      const interval = setInterval(createParticle, 300);
      return () => clearInterval(interval);
    }
  }, [tasks]);
  
  const updateData = () => {
    if (tasks.length === 0) return;
    
    setIsUpdating(true);
    
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
    
    // Convert to chart data format with improved visibility
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
          name: task.title.length > 10 ? task.title.substring(0, 7) + "..." : task.title,
          value: Math.round(value * 100) / 100,
          color,
          fullTitle: task.title
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Show top 8 by activation
    
    setActivationData(chartData);
    
    // Generate knowledge transfer simulation data (SingularityNET feature)
    // This simulates how knowledge from completed tasks transfers to future tasks
    const completedTasksCount = tasks.filter(t => t.completed).length;
    const currentDate = new Date();
    const generateKnowledgeData = () => {
      return TIME_PERIODS.map((period, index) => {
        // Base efficiency starts at current efficiency and improves over time
        const baseEfficiency = 50 + (completedTasksCount * 5);
        
        // Random but trending upward improvement - made more dynamic
        const withKnowledge = baseEfficiency + 
          (index * 7) + 
          Math.random() * 10 + 
          // Add time-based factor that changes every minute
          Math.sin(currentDate.getMinutes() + index) * 3;
        
        // Without knowledge transfer would be slower improvement
        const withoutKnowledge = baseEfficiency + 
          (index * 3) + 
          Math.random() * 5;
        
        // Calculate current real-time value for today
        const currentValue = index === 0 ? 
          Math.min(Math.round(baseEfficiency + 
            Math.sin(currentDate.getSeconds() / 10) * 2 + // Small fluctuations based on seconds
            3), 100) : null;
        
        return {
          name: period,
          "With Knowledge Transfer": Math.min(Math.round(withKnowledge), 100),
          "Without Knowledge Transfer": Math.min(Math.round(withoutKnowledge), 100),
          "Current Value": currentValue
        };
      });
    };
    
    setKnowledgeTransferData(generateKnowledgeData());
    setLastUpdate(new Date());
    setIsUpdating(false);
  };
  
  // Update on task changes
  useEffect(() => {
    updateData();
    
    // Set up periodic real-time updates
    const interval = setInterval(() => {
      updateData();
    }, 30000); // Update every 30 seconds for real-time effect
    
    return () => clearInterval(interval);
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
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="shadow-sm dark:bg-gray-800 md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>MeTTa Graph Analytics</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="ml-2 bg-qwix-purple/10 text-qwix-purple dark:bg-qwix-purple/20 dark:text-qwix-purple-light">
                Powered by MeTTa
              </Badge>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={updateData} 
                className="h-8 w-8 p-0" 
                disabled={isUpdating}
              >
                <RefreshCwIcon className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
                <span className="sr-only">Refresh data</span>
              </Button>
            </div>
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
                      tick={{ fill: '#333333', fontSize: 12, fontWeight: 'bold' }}
                    />
                    <YAxis 
                      label={{ 
                        value: 'Activation', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fill: '#333333', fontWeight: 'bold' }
                      }} 
                      tick={{ fill: '#333333' }}
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
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        borderRadius: '8px', 
                        border: '1px solid #e5e5e5', 
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        color: '#333333'
                      }}
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

      {/* SingularityNET Feature: Knowledge Transfer Simulation */}
      <Card className="shadow-sm dark:bg-gray-800 md:col-span-2 relative overflow-hidden singularity-feature">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainIcon className="h-5 w-5 text-qwix-purple" />
            <span>Real-Time Knowledge Transfer Efficiency</span>
            <Badge variant="outline" className="ml-2 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
              SingularityNET Feature
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center justify-between">
            <p>
              This chart simulates how knowledge from completed tasks transfers to future tasks in real-time,
              improving overall efficiency.
            </p>
            <span className="text-xs text-gray-400">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
          
          {/* Container for knowledge transfer particles effect */}
          <div 
            ref={particlesRef} 
            className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
          ></div>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={knowledgeTransferData}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis 
                  dataKey="name"
                  tick={{ fill: '#333333', fontWeight: 500 }}
                />
                <YAxis 
                  label={{ 
                    value: 'Efficiency %', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: '#333333', fontWeight: 'bold' }
                  }}
                  domain={[0, 100]}
                  tick={{ fill: '#333333', fontWeight: 500 }}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, '']}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '8px', 
                    border: '1px solid #e5e5e5', 
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    color: '#333333'
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  formatter={(value) => <span style={{ color: '#333333', fontWeight: 'bold' }}>{value}</span>}
                />
                <Line 
                  type="monotone" 
                  dataKey="With Knowledge Transfer" 
                  stroke="#21d0b2" 
                  strokeWidth={2} 
                  dot={{ fill: '#21d0b2', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Without Knowledge Transfer" 
                  stroke="#9b87f5" 
                  strokeWidth={2}
                  dot={{ fill: '#9b87f5', r: 4 }}
                  strokeDasharray="4 4"
                />
                {/* New line for real-time current value */}
                <Line 
                  type="monotone" 
                  dataKey="Current Value" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', r: 5 }}
                  activeDot={{ r: 7, stroke: '#ef4444', strokeWidth: 2 }}
                />
                {/* Reference line showing current day */}
                <ReferenceLine x="Day 1" stroke="#333333" strokeDasharray="3 3" label={{ 
                  value: 'Now', 
                  position: 'insideTopRight',
                  fill: '#333333',
                  fontWeight: 'bold'
                }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/20 p-4 rounded-lg singularity-feature">
              <div className="flex items-center gap-2 mb-2">
                <NetworkIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h3 className="font-medium text-green-700 dark:text-green-400">Automated Knowledge Sharing</h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Tasks automatically share insights with related tasks, improving estimation accuracy and completion speed.
              </p>
            </div>
            
            <div className="bg-qwix-purple/5 dark:bg-qwix-purple/10 border border-qwix-purple/20 dark:border-qwix-purple/30 p-4 rounded-lg singularity-feature">
              <div className="flex items-center gap-2 mb-2">
                <ZapIcon className="h-5 w-5 text-qwix-purple dark:text-qwix-purple-light" />
                <h3 className="font-medium text-qwix-purple dark:text-qwix-purple-light">Real-Time Cognitive Synergy</h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Watch knowledge transfer in real-time as SingularityNET's cognitive principles activate across your task network.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeTTaAnalytics;
