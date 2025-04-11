
import { Github } from 'lucide-react';
import QwixLogo from './QwixLogo';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-8 pb-4 text-center border-t pt-4 dark:border-gray-700">
      <div className="flex flex-col items-center justify-center gap-2">
        <QwixLogo size="sm" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Designed and Developed by Team QwikZen
        </p>
        <div className="flex items-center gap-4 mt-1">
          <div className="flex items-center gap-1">
            <a href="https://github.com/dspraneeth07" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-qwix-purple dark:text-gray-400 flex items-center gap-1">
              <Github size={14} />
              Dhadi Sai Praneeth Reddy
            </a>
          </div>
          <div className="flex items-center gap-1">
            <a href="https://github.com/dspraneeth07" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-qwix-purple dark:text-gray-400 flex items-center gap-1">
              <Github size={14} />
              Kasireddy Manideep Reddy
            </a>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          © {new Date().getFullYear()} QwikZen Group India. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
