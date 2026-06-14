import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  History,
  Settings,
  MessageSquare,
  Folder,
  Plus,
  X,
  Upload,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useClerk, useUser } from '@clerk/clerk-react';

const mainNavItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/upload', icon: Upload, label: 'Upload Doc' },
  { path: '/history', icon: History, label: 'Case History' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const chatNavItems = [
  { path: '/active-chat', icon: MessageSquare, label: 'Active Chat' },
  { path: '/history', icon: History, label: 'Case History' },
  { path: '/upload', icon: Upload, label: 'New Analysis' },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { user } = useUser();
  const isChatMode =
    location.pathname.includes('/active-chat') ||
    location.pathname.includes('/chat');
  const navItems = isChatMode ? chatNavItems : mainNavItems;
  const initials =
    user?.firstName?.charAt(0) || user?.lastName?.charAt(0) || 'U';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#050714]/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 h-screen w-64 flex flex-col z-50 transition-transform duration-300
        surface-frame bg-[#101224]/95 border-r border-white/10
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full grid place-items-center bg-[#00dbe9]/10 border border-[#00dbe9]/30">
              <Sparkles size={16} className="text-[#dbfcff]" />
            </div>
            <div>
              <span className="text-[#f7f4ff] font-display font-semibold leading-tight tracking-wide">
                LiveLegal <span className="text-[#00dbe9]">AI</span>
              </span>
            </div>
          </Link>
          <button
            className="lg:hidden text-[#b9cacb] hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* New Analysis button (chat mode) */}
        {isChatMode && (
          <div className="px-4 mt-5 mb-2">
            <Link
              to="/upload"
              onClick={() => setIsOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#dbfcff] px-4 py-2.5 font-semibold text-[#00363a] transition-colors hover:shadow-[0_0_20px_rgba(0,219,233,0.22)]"
            >
              <Plus size={16} /> New Analysis
            </Link>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto scrollbar-thin">
          {isChatMode && (
            <p className="px-3 text-[10px] font-semibold text-[#b9cacb] uppercase tracking-widest mb-3">
              Navigation
            </p>
          )}

          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive =
              location.pathname.startsWith(path) ||
              (label === 'Case History' && location.pathname === '/history');
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#00dbe9]/10 text-[#f7f4ff] border border-[#00dbe9]/25 shadow-[0_0_0_1px_rgba(0,219,233,0.08)]'
                    : 'text-[#b9cacb] hover:bg-white/5 hover:text-[#f7f4ff] border border-transparent'
                }`}
              >
                <Icon
                  size={17}
                  className={isActive ? 'text-[#dbfcff]' : 'text-[#849495]'}
                />
                {label}
              </Link>
            );
          })}

          {isChatMode && (
            <>
              <p className="px-3 text-[10px] font-semibold text-[#a78bfa] uppercase tracking-widest mb-3 mt-6">
                Recent Chats
              </p>
              <div className="px-3 space-y-4">
                {[
                  { title: 'YouTube Copyright Strike', time: '2 hours ago' },
                  { title: 'Eviction Notice - Flat 3B', time: 'Yesterday' },
                  {
                    title: 'Employment Termination Letter',
                    time: 'Oct 24, 2024',
                  },
                ].map((c) => (
                  <div key={c.title} className="cursor-pointer group">
                    <p className="text-sm text-[#c4b5fd] font-medium group-hover:text-white transition-colors">
                      {c.title}
                    </p>
                    <p className="text-xs text-[#6b21a8] mt-0.5">{c.time}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <Link
            to="/settings"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 hover:border-[#00dbe9]/25 hover:bg-[#00dbe9]/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-[#191a2c] flex items-center justify-center text-sm font-bold text-[#f7f4ff] shrink-0">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-[#f7f4ff] truncate">
                {user?.fullName || 'My Account'}
              </p>
              <p className="text-xs text-[#b9cacb] truncate">
                {user?.primaryEmailAddress?.emailAddress || 'Open profile'}
              </p>
            </div>
          </Link>

          <Link
            to="/upload"
            onClick={() => setIsOpen(false)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#dbfcff] px-4 py-3 font-semibold text-[#00363a] transition-colors hover:shadow-[0_0_20px_rgba(0,219,233,0.22)]"
          >
            <Plus size={16} /> New Analysis
          </Link>

          <button
            type="button"
            onClick={() => signOut(() => navigate('/'))}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-semibold text-[#e1e0fa] transition-colors hover:border-[#ffb4ab]/30 hover:bg-[#ffb4ab]/10 hover:text-[#ffb4ab]"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
