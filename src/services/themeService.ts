
// Theme management service
const themeOptions = {
  light: 'light',
  dark: 'dark',
  system: 'system'
};

type ThemeOption = 'light' | 'dark' | 'system';

const getSystemTheme = (): 'light' | 'dark' => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

// Initialize theme from localStorage or default to system
const getInitialTheme = (): ThemeOption => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('qwix-theme') as ThemeOption;
    return savedTheme || 'system';
  }
  return 'system';
};

// Apply theme to document
const applyTheme = (theme: ThemeOption) => {
  const root = window.document.documentElement;
  
  if (theme === 'system') {
    const systemTheme = getSystemTheme();
    root.classList.remove('light', 'dark');
    root.classList.add(systemTheme);
  } else {
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }
  
  localStorage.setItem('qwix-theme', theme);
};

// Watch for system theme changes
const watchSystemThemeChanges = () => {
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      const currentTheme = localStorage.getItem('qwix-theme') as ThemeOption;
      if (currentTheme === 'system') {
        applyTheme('system');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    // Cleanup function
    return () => mediaQuery.removeEventListener('change', handleChange);
  }
  
  return () => {}; // No-op if window is not defined
};

export { 
  themeOptions, 
  getInitialTheme, 
  applyTheme, 
  watchSystemThemeChanges 
};
