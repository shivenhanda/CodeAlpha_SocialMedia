import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/dashboard', label: 'Profile' },
    { to: '/posts', label: 'Posts' },
    { to: '/users', label: 'Users' }
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 md:justify-start md:space-x-8">
          <Link to="/" className="flex-shrink-0 flex items-center text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            SocialMedia
          </Link>

          <div className="hidden md:flex space-x-8 ml-10">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`py-2 px-3 text-lg font-medium rounded-xl transition-all duration-200 ${
                  location.pathname === item.to
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4 ml-auto">
            {user ? (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{user.username}</span>
                  <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-gray-200">
                    <img 
                      src={profile?.profilePic || `https://ui-avatars.com/api/?name=${user.username}`}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">Login</Link>
                <Link 
                  to="/signup"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden ml-4 flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`block py-3 px-4 rounded-lg text-base font-medium ${
                    location.pathname === item.to
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="w-full text-left py-3 px-4 text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block py-3 px-4 text-base font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg"
                    onClick={() => setMobileOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block py-3 px-4 text-base font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

