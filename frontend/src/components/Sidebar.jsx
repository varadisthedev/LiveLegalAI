import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, History, FileCheck, Settings, LogOut, MessageSquare, Folder, Plus, User, X, Volume2 } from 'lucide-react';
import { UserButton, useUser } from '@clerk/clerk-react';

const mainNavItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/history', icon: History, label: 'History' },
  { path: '/settings',       icon: Settings,      label: 'Settings'       },
  { path: '/voice-settings', icon: Volume2,        label: 'Voice Settings' },
];

const chatNavItems = [
  { path: '/active-chat', icon: MessageSquare, label: 'Active Chat' },
  { path: '/recent-cases', icon: History, label: 'Recent Cases' },
  { path: '/case-files', icon: Folder, label: 'Case Files' },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const { user } = useUser();
  const isChatMode = location.pathname.includes('/active-chat') || location.pathname.includes('/chat');

  const navItems = isChatMode ? chatNavItems : mainNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen w-64 flex flex-col z-50 transition-transform duration-300
        bg-white dark:bg-[#0F111A] border-r border-gray-200 dark:border-[#1F2937]
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-transparent mt-2">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                 <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM16 11V13H8V11H16ZM16 15V17H8V15H16Z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-900 dark:text-white font-bold leading-tight text-lg tracking-wide">
                {isChatMode ? 'LegalDoc Advisor' : 'LegalDoc'}
              </span>
              <span className="text-xs text-blue-500 dark:text-blue-400 font-medium tracking-widest uppercase">
                {isChatMode ? 'Pro' : 'AI'}
              </span>
            </div>
          </Link>
          <button className="lg:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {isChatMode && (
          <div className="px-5 mt-6 mb-2">
            <button className="w-full bg-[#1C36A4] hover:bg-[#2C4599] text-white font-medium py-2.5 rounded flex items-center justify-center gap-2 transition-colors">
              <Plus size={16} /> New Analysis
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-thin">
          {isChatMode && (
            <p className="px-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 mt-2">Navigation</p>
          )}
          
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(path) || (label === 'History' && location.pathname === '/history');
            
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? isChatMode 
                      ? 'bg-blue-50 dark:bg-[#151822] text-blue-700 dark:text-white border-l-2 border-blue-500' 
                      : 'bg-blue-50 dark:bg-[#1C2132] text-blue-700 dark:text-white border-l-2 border-blue-600 dark:border-transparent'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#151822] hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-blue-600 dark:text-blue-500' : 'text-gray-400 dark:text-gray-500'} />
                {label}
              </Link>
            );
          })}
          
          {isChatMode && (
            <>
              <p className="px-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 mt-6">Recent Chats</p>
              <div className="px-3 space-y-4">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Employment Agreement V2</p>
                  <p className="text-xs text-gray-500 mt-0.5">2 hours ago</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">NDA - Tech Partners</p>
                  <p className="text-xs text-gray-500 mt-0.5">Yesterday</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Rental Dispute Form</p>
                  <p className="text-xs text-gray-500 mt-0.5">Oct 24, 2023</p>
                </div>
              </div>
            </>
          )}
        </nav>

        {/* Footer Area */}
        <div className="p-4 mt-auto border-t border-gray-200 dark:border-[#1F2937]">
          <div className="flex items-center gap-3 px-2 py-2 w-full">
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700",
                }
              }}
            />
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.fullName || 'My Account'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.primaryEmailAddress?.emailAddress || 'Manage Profile'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
