import { NavLink } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
  const { state } = useAppContext();
  const { courses } = state;

  // Helper function to get color styles for course links
  const getCourseColorStyle = (colorTheme: string) => {
    // Define color variables based on the colorTheme
    return {
      backgroundColor: `var(--course-${colorTheme}, #3b82f6)`,
      color: ['yellow', 'lime', 'amber'].includes(colorTheme) ? '#111827' : '#ffffff'
    };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-64 h-full bg-white dark:bg-gray-800 theme-pink:bg-pink-50 border-r border-gray-200 dark:border-gray-700 theme-pink:border-pink-200 overflow-y-auto flex-shrink-0"
        >
          <nav className="p-4 h-full flex flex-col">
            <div>
              <ul className="space-y-1 mb-6">
                <li>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `flex items-center py-2 px-3 rounded-lg ${
                        isActive
                          ? 'bg-amber-100 dark:bg-amber-900 theme-pink:bg-pink-200 text-amber-800 dark:text-amber-200 theme-pink:text-pink-700'
                          : 'text-gray-700 dark:text-gray-300 theme-pink:text-pink-800 hover:bg-gray-100 dark:hover:bg-gray-700 theme-pink:hover:bg-pink-100'
                      }`
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    Dashboard
                  </NavLink>
                </li>
                
                <li>
                  <NavLink
                    to="/courses"
                    className={({ isActive }) =>
                      `flex items-center py-2 px-3 rounded-lg ${
                        isActive
                          ? 'bg-amber-100 dark:bg-amber-900 theme-pink:bg-pink-200 text-amber-800 dark:text-amber-200 theme-pink:text-pink-700'
                          : 'text-gray-700 dark:text-gray-300 theme-pink:text-pink-800 hover:bg-gray-100 dark:hover:bg-gray-700 theme-pink:hover:bg-pink-100'
                      }`
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    Courses
                  </NavLink>
                </li>
                
                <li>
                  <NavLink
                    to="/calendar"
                    className={({ isActive }) =>
                      `flex items-center py-2 px-3 rounded-lg ${
                        isActive
                          ? 'bg-amber-100 dark:bg-amber-900 theme-pink:bg-pink-200 text-amber-800 dark:text-amber-200 theme-pink:text-pink-700'
                          : 'text-gray-700 dark:text-gray-300 theme-pink:text-pink-800 hover:bg-gray-100 dark:hover:bg-gray-700 theme-pink:hover:bg-pink-100'
                      }`
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Calendar
                  </NavLink>
                </li>
                
                <li>
                  <NavLink
                    to="/academic-records"
                    className={({ isActive }) =>
                      `flex items-center py-2 px-3 rounded-lg ${
                        isActive
                          ? 'bg-amber-100 dark:bg-amber-900 theme-pink:bg-pink-200 text-amber-800 dark:text-amber-200 theme-pink:text-pink-700'
                          : 'text-gray-700 dark:text-gray-300 theme-pink:text-pink-800 hover:bg-gray-100 dark:hover:bg-gray-700 theme-pink:hover:bg-pink-100'
                      }`
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Academic Records
                  </NavLink>
                </li>
                
                <li>
                  <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                      `flex items-center py-2 px-3 rounded-lg ${
                        isActive
                          ? 'bg-amber-100 dark:bg-amber-900 theme-pink:bg-pink-200 text-amber-800 dark:text-amber-200 theme-pink:text-pink-700'
                          : 'text-gray-700 dark:text-gray-300 theme-pink:text-pink-800 hover:bg-gray-100 dark:hover:bg-gray-700 theme-pink:hover:bg-pink-100'
                      }`
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Settings
                  </NavLink>
                </li>
              </ul>
            </div>
            
            {/* My Courses Section - Moved up in the sidebar */}
            {courses.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 theme-pink:text-pink-500 uppercase tracking-wider px-3 mb-2">
                  My Courses
                </h3>
                
                <ul className="mt-2 space-y-2 overflow-y-auto max-h-96">
                  {courses
                    .filter(course => !course.isArchived)
                    .map(course => {
                      // Get course color
                      const dotColor = {
                        backgroundColor: `var(--course-${course.colorTheme}, #3b82f6)`
                      };
                      
                      // Course name color
                      const courseNameColor = {
                        color: `var(--course-${course.colorTheme}, #3b82f6)`
                      };

                      return (
                        <li key={course.id}>
                          <div className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                            <div className="flex items-center mb-1">
                              {/* Course color indicator */}
                              <div 
                                className="w-3 h-3 rounded-full mr-2"
                                style={dotColor}
                              ></div>
                              {/* Course name in course color */}
                              <div 
                                className="font-medium"
                                style={courseNameColor}
                              >
                                {course.name}
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-1 text-sm">
                              {/* Course links with proper coloring when active */}
                              <NavLink
                                to={`/courses/${course.id}/notes`}
                                className={({ isActive }) => {
                                  const baseClass = "px-2 py-1 rounded";
                                  
                                  if (isActive) {
                                    return `${baseClass} text-white`; // Will set background inline
                                  }
                                  
                                  return `${baseClass} text-gray-600 dark:text-gray-400 theme-pink:text-pink-600 hover:bg-gray-100 dark:hover:bg-gray-700 theme-pink:hover:bg-pink-100`;
                                }}
                                style={({ isActive }) => 
                                  isActive ? getCourseColorStyle(course.colorTheme) : {}
                                }
                              >
                                Notes
                              </NavLink>
                              
                              <NavLink
                                to={`/courses/${course.id}/flashcards`}
                                className={({ isActive }) => {
                                  const baseClass = "px-2 py-1 rounded";
                                  
                                  if (isActive) {
                                    return `${baseClass} text-white`; // Will set background inline
                                  }
                                  
                                  return `${baseClass} text-gray-600 dark:text-gray-400 theme-pink:text-pink-600 hover:bg-gray-100 dark:hover:bg-gray-700 theme-pink:hover:bg-pink-100`;
                                }}
                                style={({ isActive }) => 
                                  isActive ? getCourseColorStyle(course.colorTheme) : {}
                                }
                              >
                                Flashcards
                              </NavLink>
                              
                              {/* Grades Link */}
                              <NavLink
                                to={`/courses/${course.id}/grades`}
                                className={({ isActive }) => {
                                  const baseClass = "px-2 py-1 rounded";
                                  
                                  if (isActive) {
                                    return `${baseClass} text-white`; // Will set background inline
                                  }
                                  
                                  return `${baseClass} text-gray-600 dark:text-gray-400 theme-pink:text-pink-600 hover:bg-gray-100 dark:hover:bg-gray-700 theme-pink:hover:bg-pink-100`;
                                }}
                                style={({ isActive }) => 
                                  isActive ? getCourseColorStyle(course.colorTheme) : {}
                                }
                              >
                                Grades
                              </NavLink>

                              {/* Tasks Link */}
                              <NavLink
                                to={`/calendar?course=${course.id}`}
                                className={({ isActive }) => {
                                  const baseClass = "px-2 py-1 rounded";
                                  
                                  if (isActive) {
                                    return `${baseClass} text-white`; // Will set background inline
                                  }
                                  
                                  return `${baseClass} text-gray-600 dark:text-gray-400 theme-pink:text-pink-600 hover:bg-gray-100 dark:hover:bg-gray-700 theme-pink:hover:bg-pink-100`;
                                }}
                                style={({ isActive }) => 
                                  isActive ? getCourseColorStyle(course.colorTheme) : {}
                                }
                              >
                                Tasks
                              </NavLink>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                </ul>
              </div>
            )}
            
            {/* Empty flex-grow div to push content to top */}
            <div className="flex-grow"></div>
          </nav>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;