
import { useState, useEffect } from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { themeOptions, getInitialTheme, applyTheme, watchSystemThemeChanges } from '@/services/themeService';

const ThemeToggle = () => {
  const [theme, setTheme] = useState(getInitialTheme());

  useEffect(() => {
    // Apply theme on mount
    applyTheme(theme);
    
    // Watch for system theme changes
    const cleanup = watchSystemThemeChanges();
    
    return cleanup;
  }, [theme]);

  const changeTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const icons = {
    light: <Sun className="h-4 w-4" />,
    dark: <Moon className="h-4 w-4" />,
    system: <Laptop className="h-4 w-4" />
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
          {icons[theme]}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border dark:border-gray-700">
        <DropdownMenuItem onClick={() => changeTheme('light')} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
          <Sun className="h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeTheme('dark')} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
          <Moon className="h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeTheme('system')} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
          <Laptop className="h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;
