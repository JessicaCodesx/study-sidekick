import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeContext from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';
import { getDailyQuote } from '../../lib/utils';

interface NavigationProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Navigation = ({ isSidebarOpen, toggleSidebar }: NavigationProps) => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const { state } = useAppContext();
  const { currentUser, logOut } = useAuth();
  const navigate = useNavigate();
  const quote = getDailyQuote();

  // Function to get user's initial(s) from display name or email
  const getInitials = (user: any): string => {
    if (user.displayName) {
      return user.displayName
        .split(' ')
        .map((part: string) => part.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "?";
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      navigate('/signin');
    } catch (error) {
      console.error('Failed to sign out', error);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 theme-pink:border-pink-200 sticky top-0 z-10 w-full">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="mr-4 text-gray-600 dark:text-gray-300 theme-pink:text-pink-600 hover:text-amber-600 dark:hover:text-amber-400 theme-pink:hover:text-pink-700 focus:outline-none"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isSidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h10M4 18h16"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
          
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-amber-600 dark:text-amber-400 theme-pink:text-pink-600">
              🎓 StudySidekick
            </span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center text-sm text-gray-500 dark:text-gray-400 theme-pink:text-pink-500 italic flex-1 justify-center px-4 truncate">
          "{quote.quote}" - {quote.author}
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 theme-pink:text-pink-600 hover:bg-gray-100 dark:hover:bg-gray-700 theme-pink:hover:bg-pink-100 focus:outline-none"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
          
          {/* User Profile Dropdown */}
          <div className="relative group">
            <button 
              className="flex items-center focus:outline-none"
              aria-label="User menu"
              aria-expanded="false"
            >
              {currentUser?.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700 theme-pink:border-pink-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-800 theme-pink:bg-pink-100 flex items-center justify-center text-amber-600 dark:text-amber-200 theme-pink:text-pink-600 font-medium">
                  {currentUser ? getInitials(currentUser) : "?"}
                </div>
              )}
              <svg 
                className="w-4 h-4 ml-1 text-gray-500 dark:text-gray-400 theme-pink:text-pink-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 theme-pink:bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
              {currentUser && (
                <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 theme-pink:text-pink-700 border-b border-gray-200 dark:border-gray-700 theme-pink:border-pink-200">
                  <div className="font-medium truncate">{currentUser.displayName || currentUser.email}</div>
                  {currentUser.email && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 theme-pink:text-pink-500 truncate">
                      {currentUser.displayName ? currentUser.email : ''}
                    </div>
                  )}
                </div>
              )}
              
              <Link
                to="/settings"
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 theme-pink:text-pink-700 hover:bg-gray-100 dark:hover:bg-gray-700 theme-pink:hover:bg-pink-50"
              >
                <div className="flex items-center">
                  <svg 
                    className="w-4 h-4 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                    />
                  </svg>
                  Settings
                </div>
              </Link>
              
              {currentUser ? (
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 theme-pink:text-pink-700 hover:bg-gray-100 dark:hover:bg-gray-700 theme-pink:hover:bg-pink-50"
                >
                  <div className="flex items-center">
                    <svg 
                      className="w-4 h-4 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                      />
                    </svg>
                    Sign out
                  </div>
                </button>
              ) : (
                <Link
                  to="/signin"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 theme-pink:text-pink-700 hover:bg-gray-100 dark:hover:bg-gray-700 theme-pink:hover:bg-pink-50"
                >
                  <div className="flex items-center">
                    <svg 
                      className="w-4 h-4 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" 
                      />
                    </svg>
                    Sign in
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;