import { useState, useEffect } from 'react';
import { Menu, Moon, Sun } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import ChatWidget from './ChatWidget';

export default function AppLayout({ children, title }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage or system preference on mount
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
    }
    return true; // Default dark
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    if (title) {
      document.title = `LiveLegal AI • ${title}`;
    }
  }, [title]);

  return (
    <div className="relative flex h-screen overflow-hidden theme-shell text-[#e1e0fa] font-body">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-[-8rem] top-[-8rem] h-64 w-64 rounded-full bg-[#00dbe9]/10 blur-3xl" />
        <div className="absolute right-[-6rem] top-24 h-72 w-72 rounded-full bg-[#7701d0]/12 blur-3xl" />
        <div className="absolute bottom-[-5rem] left-1/3 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      </div>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        {/* Mobile Header & Global Actions */}
        <header className="surface-frame flex items-center justify-between px-4 sm:px-6 py-3 lg:justify-end border-x-0 border-t-0 z-10">
          <button
            className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg border border-white/10 bg-white/5 text-[#b9cacb] hover:text-white hover:border-[#00dbe9]/40 hover:bg-[#00dbe9]/10 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-white/5 text-[#b9cacb] border border-white/10 hover:text-white hover:border-[#00dbe9]/40 hover:bg-[#00dbe9]/10 transition-colors"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto w-full relative">
          <div className="max-w-[1440px] mx-auto p-4 sm:p-6 md:p-8 h-full">
            {children}
          </div>
          {location.pathname !== '/dashboard' && <ChatWidget />}
        </main>
      </div>
    </div>
  );
}
