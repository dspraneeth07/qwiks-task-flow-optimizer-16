
import { useEffect, useRef, useState } from 'react';
import { Task, TaskLink } from '../types/task';
import { Button } from '@/components/ui/button';
import { ZoomInIcon, ZoomOutIcon, RefreshCwIcon } from 'lucide-react';

interface DependencyGraphProps {
  tasks: Task[];
  links: TaskLink[];
}

const DependencyGraph = ({ tasks, links }: DependencyGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Convert tasks to nodes for visualization
  const nodes = tasks.map(task => ({
    id: task.id,
    title: task.title,
    completed: task.completed,
    priority: task.priority
  }));
  
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };
  
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };
  
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  useEffect(() => {
    if (links.length === 0 || !svgRef.current) return;
    
    const svg = svgRef.current;
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    
    // Clear previous elements
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
    
    // Create a simple force-directed layout
    const nodeRadius = 45; // Increased node size for better text fit
    const nodeSpacing = 120;
    const nodePositions: Record<string, { x: number, y: number }> = {};
    
    // Position nodes in a circle
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2.5;
    
    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      nodePositions[node.id] = { x, y };
    });
    
    // Create a group for panning and zooming
    const mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    mainGroup.setAttribute('transform', `translate(${position.x}, ${position.y}) scale(${scale})`);
    svg.appendChild(mainGroup);
    
    // Draw the links (arrows) first so they're behind nodes
    links.forEach(link => {
      const sourcePos = nodePositions[link.source];
      const targetPos = nodePositions[link.target];
      
      if (!sourcePos || !targetPos) return;
      
      // Calculate the direction vector
      const dx = targetPos.x - sourcePos.x;
      const dy = targetPos.y - sourcePos.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      
      // Normalize the vector
      const ndx = dx / length;
      const ndy = dy / length;
      
      // Calculate start and end points, adjusted to node boundaries
      const startX = sourcePos.x + ndx * nodeRadius;
      const startY = sourcePos.y + ndy * nodeRadius;
      const endX = targetPos.x - ndx * nodeRadius;
      const endY = targetPos.y - ndy * nodeRadius;
      
      // Create arrow path
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M${startX},${startY} L${endX},${endY}`);
      path.classList.add('dependency-line');
      
      // Create arrowhead
      const arrowMarker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
      arrowMarker.setAttribute('id', `arrowhead-${link.source}-${link.target}`);
      arrowMarker.setAttribute('markerWidth', '10');
      arrowMarker.setAttribute('markerHeight', '7');
      arrowMarker.setAttribute('refX', '10');
      arrowMarker.setAttribute('refY', '3.5');
      arrowMarker.setAttribute('orient', 'auto');
      
      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
      polygon.setAttribute('fill', '#9b87f5');
      arrowMarker.appendChild(polygon);
      
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.appendChild(arrowMarker);
      mainGroup.appendChild(defs);
      
      path.setAttribute('marker-end', `url(#arrowhead-${link.source}-${link.target})`);
      mainGroup.appendChild(path);
    });
    
    // Draw the nodes
    nodes.forEach(node => {
      const pos = nodePositions[node.id];
      if (!pos) return;
      
      // Create node group
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);
      
      // Create node circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', String(nodeRadius));
      circle.setAttribute('fill', node.completed ? '#f1f0fb' : '#9b87f5');
      circle.setAttribute('stroke', node.completed ? '#ddd' : '#7E69AB');
      circle.setAttribute('stroke-width', '2');
      circle.classList.add('hover-scale');
      
      // Add a hover effect
      circle.addEventListener('mouseover', () => {
        circle.setAttribute('stroke-width', '4');
      });
      
      circle.addEventListener('mouseout', () => {
        circle.setAttribute('stroke-width', '2');
      });
      
      // Add task title text
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('fill', node.completed ? '#888' : 'white');
      text.setAttribute('font-size', '10px');
      text.setAttribute('font-weight', 'bold');
      
      // Process title for better fit
      const title = node.title;
      const maxLineLength = 12; // Maximum characters per line
      
      // Split title into words and build lines that fit
      const words = title.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      
      words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length <= maxLineLength) {
          currentLine = testLine;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      });
      
      // Add the last line
      if (currentLine) {
        lines.push(currentLine);
      }
      
      // If title is too long, truncate it
      const maxLines = 3;
      const displayLines = lines.slice(0, maxLines);
      if (lines.length > maxLines) {
        displayLines[maxLines - 1] = displayLines[maxLines - 1].substring(0, 8) + '...';
      }
      
      // Add the lines to the text element
      displayLines.forEach((line, index) => {
        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan.setAttribute('x', '0');
        tspan.setAttribute('dy', index === 0 ? '-1em' : '1.2em');
        tspan.textContent = line;
        text.appendChild(tspan);
      });
      
      g.appendChild(circle);
      g.appendChild(text);
      mainGroup.appendChild(g);
    });
    
  }, [tasks, links, nodes, scale, position]);
  
  return (
    <div className="w-full h-full relative">
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white" 
          onClick={handleZoomIn}
        >
          <ZoomInIcon className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white" 
          onClick={handleZoomOut}
        >
          <ZoomOutIcon className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white" 
          onClick={handleReset}
        >
          <RefreshCwIcon className="h-4 w-4" />
        </Button>
      </div>
      <svg 
        ref={svgRef} 
        className="w-full h-full cursor-grab" 
        viewBox="0 0 600 400"
        preserveAspectRatio="xMidYMid meet"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <div className="absolute bottom-2 right-2 text-xs text-gray-500">
        Developed by Team QwikZen
      </div>
    </div>
  );
};

export default DependencyGraph;
