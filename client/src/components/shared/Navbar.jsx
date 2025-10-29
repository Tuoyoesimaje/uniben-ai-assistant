import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, getDisplayName, getDisplayId } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Custom SVG Logo Component
  const LogoIcon = () => (
    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
      <g clipPath="url(#clip0_6_535)">
        <path
          clipRule="evenodd"
          d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z"
          fill="#04a474"
          fillRule="evenodd"
        />
      </g>
      <defs>
        <clipPath id="clip0_6_535">
          <rect fill="white" height="48" width="48" />
        </clipPath>
      </defs>
    </svg>
  );

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm w-full overflow-x-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <LogoIcon />
            <span className="text-xl font-bold text-[#111816]">
              UNIBEN AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {/* Navigation Links */}
            <div className="flex items-center gap-1">
              {user?.role !== 'staff' && (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-200 font-medium"
                >
                  <span className="material-symbols-outlined text-lg">dashboard</span>
                  Dashboard
                </Link>
              )}
              <Link
                to="/chat"
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-200 font-medium"
              >
                <span className="material-symbols-outlined text-lg">chat</span>
                AI Chat
              </Link>
              <Link
                to="/map"
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-200 font-medium"
              >
                <span className="material-symbols-outlined text-lg">map</span>
                Campus Map
              </Link>
              <Link
                to="/quiz"
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-200 font-medium"
              >
                <span className="material-symbols-outlined text-lg">quiz</span>
                AI Quiz
              </Link>
              {user && user.role !== 'guest' && (
                <Link
                  to="/news"
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-200 font-medium"
                >
                  <span className="material-symbols-outlined text-lg">newspaper</span>
                  News
                </Link>
              )}
              {user?.role === 'staff' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-all duration-200 font-medium border border-emerald-200"
                >
                  <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                  Admin Panel
                </Link>
              )}
            </div>

            {/* User Info */}
            {user && (
              <div className="hidden xl:flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {getDisplayName().charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#111816]">
                    {getDisplayName()}
                  </span>
                  {getDisplayId() && (
                    <span className="text-xs text-slate-500 font-mono">
                      {getDisplayId()}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100"
            >
              {isMenuOpen ? (
                <span className="material-symbols-outlined">close</span>
              ) : (
                <span className="material-symbols-outlined">menu</span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4">
            <div className="flex flex-col gap-4">
              {/* Mobile Navigation Links */}
              <div className="flex flex-col gap-2">
                <Link
                  to="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                >
                  <span className="material-symbols-outlined">dashboard</span>
                  Dashboard
                </Link>
                <Link
                  to="/chat"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                >
                  <span className="material-symbols-outlined">chat</span>
                  AI Chat
                </Link>
                <Link
                  to="/map"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                >
                  <span className="material-symbols-outlined">map</span>
                  Campus Map
                </Link>
                <Link
                  to="/quiz"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                >
                  <span className="material-symbols-outlined">quiz</span>
                  AI Quiz
                </Link>
                {user && user.role !== 'guest' && (
                  <Link
                    to="/news"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                  >
                    <span className="material-symbols-outlined">newspaper</span>
                    News
                  </Link>
                )}
                {user?.role === 'staff' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors font-medium border border-emerald-200"
                  >
                    <span className="material-symbols-outlined">admin_panel_settings</span>
                    Admin Panel
                  </Link>
                )}
              </div>

              {user && (
                <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {getDisplayName().charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-[#111816]">
                      {getDisplayName()}
                    </span>
                    {getDisplayId() && (
                      <span className="text-xs text-slate-500 font-mono">
                        {getDisplayId()}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">logout</span>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}