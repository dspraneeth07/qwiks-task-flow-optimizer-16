
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BrainIcon, GitMergeIcon, CalendarIcon, BoltIcon, BarChart4Icon, NetworkIcon } from 'lucide-react';

const technologies = [
  {
    name: "React",
    description: "Frontend UI library for building component-based interfaces",
    icon: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
    category: "Frontend"
  },
  {
    name: "TypeScript",
    description: "Strongly typed programming language that builds on JavaScript",
    icon: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg",
    category: "Language"
  },
  {
    name: "Tailwind CSS",
    description: "Utility-first CSS framework for rapid UI development",
    icon: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg",
    category: "Styling"
  },
  {
    name: "MeTTa",
    description: "Graph-based knowledge representation for intelligent task scheduling",
    icon: "/brain-circuit.svg",
    category: "AI Framework"
  },
  {
    name: "Recharts",
    description: "Composable charting library for data visualization",
    icon: "https://recharts.org/static/media/logo.13a5c16d.svg",
    category: "Visualization"
  },
  {
    name: "SingularityNET",
    description: "Decentralized AI marketplace principles and architecture",
    icon: "/singularitynet.svg",
    category: "AI Ecosystem"
  },
  {
    name: "shadcn/ui",
    description: "Beautifully designed components built with Radix UI and Tailwind CSS",
    icon: "https://avatars.githubusercontent.com/u/139895814?s=200&v=4",
    category: "UI Components"
  },
  {
    name: "Vite",
    description: "Next generation frontend tooling and build system",
    icon: "https://vitejs.dev/logo.svg",
    category: "Build Tool"
  }
];

const features = [
  {
    title: "MeTTa Graph Representation",
    description: "Task dependencies modeled as Atoms in a custom AtomSpace implementation",
    icon: <BrainIcon className="h-7 w-7 text-qwix-purple" />
  },
  {
    title: "Intelligent Task Scheduling",
    description: "Optimized task order based on priorities, deadlines, and dependencies",
    icon: <CalendarIcon className="h-7 w-7 text-qwix-blue" />
  },
  {
    title: "Dependency Visualization",
    description: "Interactive graph showing task relationships and dependencies",
    icon: <NetworkIcon className="h-7 w-7 text-qwix-blue-light" />
  },
  {
    title: "Spreading Activation Algorithm",
    description: "Task prioritization using graph-based activation energy propagation",
    icon: <BoltIcon className="h-7 w-7 text-amber-500" />
  },
  {
    title: "Real-time Analytics",
    description: "Comprehensive dashboards showing task statistics and progress",
    icon: <BarChart4Icon className="h-7 w-7 text-green-500" />
  },
  {
    title: "SingularityNET Integration",
    description: "Aligned with SingularityNET's principles of decentralized AI and symbolic representation",
    icon: <GitMergeIcon className="h-7 w-7 text-purple-500" />
  }
];

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 max-w-5xl mx-auto">
      <Header
        onAddTask={() => {}}
        tasksCount={0}
        completedCount={0}
      />
      
      <div className="my-8">
        <Card className="shadow-sm bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl text-center">About Qwix To Do</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center mb-8">
              <p className="text-gray-700 dark:text-gray-300">
                Qwix To Do is an intelligent task management application powered by MeTTa principles for advanced task scheduling and optimization.
              </p>
            </div>
            
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Key Features</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => (
                  <Card key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="mb-4 p-3 rounded-full bg-gray-100 dark:bg-gray-700">
                          {feature.icon}
                        </div>
                        <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">{feature.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{feature.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Technology Stack</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {technologies.map((tech, index) => (
                  <Card key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <img 
                          src={tech.icon} 
                          alt={tech.name} 
                          className="w-12 h-12 object-contain mb-4"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/128?text=" + tech.name.charAt(0);
                          }}
                        />
                        <h4 className="font-medium mb-1 text-gray-800 dark:text-gray-200">{tech.name}</h4>
                        <Badge variant="outline" className="mb-2">
                          {tech.category}
                        </Badge>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{tech.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">MeTTa Integration</h3>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Qwix To Do implements MeTTa concepts to bring intelligence to task management:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Custom <strong>AtomSpace</strong> implementation for representing tasks as a knowledge graph</li>
                  <li><strong>Spreading Activation</strong> algorithm for intelligent task prioritization</li>
                  <li><strong>Topological Sorting</strong> for dependency-aware task scheduling</li>
                  <li><strong>Graph Visualization</strong> to represent task relationships</li>
                  <li>Integration with <strong>SingularityNET</strong> principles for symbolic AI representation</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Team QwikZen</h3>
              <div className="flex flex-col md:flex-row md:justify-center gap-6">
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 w-full md:w-1/2">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Dhadi Sai Praneeth Reddy</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Lead Developer</p>
                      <a href="https://github.com/dspraneeth07" className="mt-2 text-qwix-purple hover:underline flex items-center gap-1">
                        <Github size={16} />
                        <span>dspraneeth07</span>
                      </a>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 w-full md:w-1/2">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Kasireddy Manideep Reddy</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Lead Developer</p>
                      <a href="https://github.com/dspraneeth07" className="mt-2 text-qwix-purple hover:underline flex items-center gap-1">
                        <Github size={16} />
                        <span>dspraneeth07</span>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default About;
