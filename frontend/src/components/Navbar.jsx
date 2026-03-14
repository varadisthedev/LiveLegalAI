import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FileText, LogOut, Scale } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = ['/', '/login'].includes(location.pathname);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:bg-blue-700 transition-colors">
              <Scale className="w-4.5 h-4.5 text-white" size={18} />
            </div>
            <span className="text-lg font-bold text-gray-900">
              LegalDoc <span className="text-blue-600">AI</span>
            </span>
          </Link>

          {/* Nav Actions */}
          {!isAuthPage && (
            <div className="flex items-center gap-3">
              <span className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-xs">JD</span>
                </div>
                <span className="font-medium text-gray-700">Jane Doe</span>
              </span>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}

          {isAuthPage && location.pathname === '/' && (
            <Link
              to="/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors px-4 py-2 rounded-lg hover:bg-blue-50"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
