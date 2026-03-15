import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Sparkles } from 'lucide-react';
import { useClerk, SignedIn, SignedOut } from '@clerk/clerk-react';

export default function Navbar() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { signOut } = useClerk();
  const isLanding = location.pathname === '/';

  // Hide on authenticated inner pages (they use sidebar)
  const hiddenPaths = ['/dashboard', '/upload', '/history', '/chat', '/settings', '/voice-settings', '/document'];
  const hideNavbar = hiddenPaths.some(p => location.pathname.startsWith(p));
  if (hideNavbar) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#07020d]/80 backdrop-blur-md border-b border-[#2d1b4e]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full grid place-items-center bg-[#7c3aed]/10 border border-[#7c3aed]/30">
            <Sparkles size={16} className="text-[#c4b5fd]" />
          </div>
          <span className="text-lg font-bold text-white">
            LiveLegal <span className="text-[#9333ea]">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <SignedOut>
            <Link to="/login"
              className="text-sm font-medium text-[#a78bfa] hover:text-white transition-colors">
              Sign In
            </Link>
            {isLanding && (
              <Link to="/signup">
                <button className="text-sm font-bold text-white bg-gradient-to-r from-[#7c3aed] to-[#9333ea] px-5 py-2 rounded-full hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all">
                  Get Started
                </button>
              </Link>
            )}
          </SignedOut>

          <SignedIn>
            <Link to="/dashboard">
              <button className="text-sm font-bold text-white bg-gradient-to-r from-[#7c3aed] to-[#9333ea] px-5 py-2 rounded-full hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all">
                Dashboard
              </button>
            </Link>
            <button
              onClick={() => signOut(() => navigate('/'))}
              className="flex items-center gap-1.5 text-sm text-[#a78bfa] hover:text-[#ef4444] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#1b0b30]"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
