
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { StarsIcon } from 'lucide-react';

interface QwixLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const QwixLogo = ({ size = 'md' }: QwixLogoProps) => {
  const [isHovering, setIsHovering] = useState(false);

  const sizeMap = {
    sm: {
      container: "p-1.5",
      icon: 20,
      title: "text-lg",
      subtitle: "text-xs",
    },
    md: {
      container: "p-2",
      icon: 28,
      title: "text-2xl",
      subtitle: "text-sm",
    },
    lg: {
      container: "p-3",
      icon: 36,
      title: "text-3xl",
      subtitle: "text-base",
    }
  };

  return (
    <div className="flex items-center">
      <div
        className={cn(
          `mr-3 ${sizeMap[size].container} rounded-full bg-gradient-to-r from-qwix-purple to-qwix-blue-light text-white transition-all duration-300`,
          isHovering && "rotate-12 scale-110"
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        style={{
          boxShadow: isHovering ? '0 0 15px rgba(155, 135, 245, 0.6)' : '0 0 5px rgba(155, 135, 245, 0.3)'
        }}
      >
        <StarsIcon size={sizeMap[size].icon} className="text-white" />
      </div>
      <div>
        <h1 className={`${sizeMap[size].title} font-bold bg-gradient-to-r from-qwix-purple to-qwix-blue-light text-transparent bg-clip-text`}>
          Qwix To Do
        </h1>
        <p className={`${sizeMap[size].subtitle} text-gray-500`}>
          Smart scheduling for maximum productivity
        </p>
      </div>
    </div>
  );
};

export default QwixLogo;
