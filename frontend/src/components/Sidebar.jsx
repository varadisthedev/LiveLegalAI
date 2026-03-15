import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, History, Settings, MessageSquare,
  Folder, Plus, X, Volume2, Upload, Sparkles,
} from 'lucide-react';
import { UserButton, useUser } from '@clerk/clerk-react';

const mainNavItems = [
  { path: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'     },
  { path: '/upload',        icon: Upload,          label: 'Upload Doc'    },
  { path: '/history',       icon: History,         label: 'Case History'  },
  { path: '/settings',      icon: Settings,        label: 'Settings'      },
  { path: '/voice-settings',icon: Volume2,         label: 'Voice Settings'},
];

const chatNavItems = [
  { path: '/active-chat',  icon: MessageSquare, label: 'Active Chat'  },
  { path: '/recent-cases', icon: History,       label: 'Recent Cases' },
  { path: '/case-files',   icon: Folder,        label: 'Case Files'   },
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
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen w-64 flex flex-col z-50 transition-transform duration-300
        bg-[#0d0517] border-r border-[#2d1b4e]
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#2d1b4e]">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full grid place-items-center bg-[#7c3aed]/10 border border-[#7c3aed]/30">
              <Sparkles size={16} className="text-[#c4b5fd]" />
            </div>
            <div>
              <span className="text-white font-bold leading-tight tracking-wide">
                LiveLegal <span className="text-[#9333ea]">AI</span>
              </span>
            </div>
          </Link>
          <button className="lg:hidden text-[#a78bfa] hover:text-white" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* New Analysis button (chat mode) */}
        {isChatMode && (
          <div className="px-4 mt-5 mb-2">
            <button className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Plus size={16} /> New Analysis
            </button>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto scrollbar-thin">
          {isChatMode && (
            <p className="px-3 text-[10px] font-semibold text-[#a78bfa] uppercase tracking-widest mb-3">Navigation</p>
          )}

          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(path) || (label === 'Case History' && location.pathname === '/history');
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#7c3aed]/20 text-white border border-[#7c3aed]/40'
                    : 'text-[#a78bfa] hover:bg-[#160a26] hover:text-white border border-transparent'
                }`}
              >
                <Icon size={17} className={isActive ? 'text-[#c4b5fd]' : 'text-[#6b21a8]'} />
                {label}
              </Link>
            );
          })}

          {isChatMode && (
            <>
              <p className="px-3 text-[10px] font-semibold text-[#a78bfa] uppercase tracking-widest mb-3 mt-6">Recent Chats</p>
              <div className="px-3 space-y-4">
                {[
                  { title: 'YouTube Copyright Strike', time: '2 hours ago' },
                  { title: 'Eviction Notice - Flat 3B', time: 'Yesterday' },
                  { title: 'Employment Termination Letter', time: 'Oct 24, 2024' },
                ].map(c => (
                  <div key={c.title} className="cursor-pointer group">
                    <p className="text-sm text-[#c4b5fd] font-medium group-hover:text-white transition-colors">{c.title}</p>
                    <p className="text-xs text-[#6b21a8] mt-0.5">{c.time}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-[#2d1b4e]">
          <div className="flex items-center gap-3 px-2 py-2">
            <UserButton
              afterSignOutUrl="/"
              appearance={{ elements: { userButtonAvatarBox: 'w-8 h-8 rounded-full border border-[#3e1a72]' } }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.fullName || 'My Account'}</p>
              <p className="text-xs text-[#a78bfa] truncate">{user?.primaryEmailAddress?.emailAddress || 'Manage Profile'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
