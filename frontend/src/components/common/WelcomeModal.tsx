import { useState } from 'react';
import { motion } from 'framer-motion';
import Modal from './Modal';
import Button from './Button';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeModal = ({ isOpen, onClose }: WelcomeModalProps) => {
  const [showTechStack, setShowTechStack] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      closeOnClickOutside={false}
      showCloseButton={false}
    >
      <div className="relative">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-2xl"></div>
        
        <div className="relative p-8">
          {/* Header with animated icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-4xl">🎓</span>
            </div>
          </motion.div>

          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-extrabold mb-2">
              <span className="gradient-text">Welcome to StudySidekick!</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Your all-in-one study assistant for academic success
            </p>
            
            <div className="space-y-5 text-left text-gray-700 dark:text-gray-300">
              {/* What is StudySidekick */}
              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                  What is StudySidekick?
                </h3>
                <p className="text-base leading-relaxed">
                  StudySidekick is a comprehensive, offline-capable study management platform designed to help you organize your entire academic life in one place. From course management to flashcard studying, task tracking to grade monitoring—everything you need to succeed academically is right here.
                </p>
              </div>

              {/* Key Features */}
              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                  Key Features
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">📚</span>
                    <div>
                      <p className="font-semibold">Course Management</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Organize courses with custom color themes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">📝</span>
                    <div>
                      <p className="font-semibold">Unit-Based Notes</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Rich markdown editor organized by modules</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🎴</span>
                    <div>
                      <p className="font-semibold">Smart Flashcards</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Spaced repetition learning system</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">📅</span>
                    <div>
                      <p className="font-semibold">Task & Calendar</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Track assignments, exams, and deadlines</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">📊</span>
                    <div>
                      <p className="font-semibold">Academic Records</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Track GPA and grade history</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🔥</span>
                    <div>
                      <p className="font-semibold">Study Streaks</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Build consistent study habits</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* How It Works */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-5 border border-purple-200/50 dark:border-purple-700/50">
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                  🔒 Privacy & Offline-First Design
                </h3>
                <p className="text-base leading-relaxed">
                  <span className="font-semibold">All your data is stored locally</span> on your device using IndexedDB (web) or SQLite (desktop/mobile). Your information never leaves your device unless you explicitly choose to sync with an optional cloud account. This means you can use StudySidekick completely offline, and your academic data remains completely private and secure.
                </p>
              </div>

              {/* Getting Started */}
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                  Getting Started
                </h3>
                <p className="text-base leading-relaxed">
                  Start by creating your first course, then add notes, flashcards, and tasks. Use the dashboard to get an overview of your academic progress, and explore the calendar to stay on top of upcoming deadlines. Everything syncs automatically across your devices if you choose to enable cloud sync.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tech Stack Section */}
          {showTechStack ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/50">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Technical Architecture
                  </span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Frontend</h4>
                    <ul className="space-y-1.5 text-gray-600 dark:text-gray-400">
                      <li>• React 18 + TypeScript</li>
                      <li>• Vite (Build Tool)</li>
                      <li>• Tailwind CSS (Styling)</li>
                      <li>• Framer Motion (Animations)</li>
                      <li>• React Router (Navigation)</li>
                      <li>• Context API (State Management)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Backend & Storage</h4>
                    <ul className="space-y-1.5 text-gray-600 dark:text-gray-400">
                      <li>• Node.js + Express</li>
                      <li>• IndexedDB (Web Browser)</li>
                      <li>• SQLite (Desktop/Mobile)</li>
                      <li>• MongoDB (Optional Cloud Sync)</li>
                      <li>• Firebase (Mobile Auth)</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-blue-200 dark:border-blue-700">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Key Technical Features</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    Offline-first architecture with local-first data storage • Real-time synchronization capabilities • 
                    Fully responsive design with mobile support • Dark mode and theme customization • 
                    Progressive Web App (PWA) support • Cross-platform compatibility (Web, Desktop, iOS, Android)
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 text-center"
            >
              <button
                onClick={() => setShowTechStack(true)}
                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors underline decoration-dotted"
              >
                View Technical Architecture ↓
              </button>
            </motion.div>
          )}

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button
              variant="primary"
              onClick={onClose}
              className="flex-1 sm:flex-none"
            >
              Get Started
            </Button>
            {showTechStack && (
              <Button
                variant="outline"
                onClick={() => setShowTechStack(false)}
                className="flex-1 sm:flex-none"
              >
                Hide Technical Details
              </Button>
            )}
          </motion.div>

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6"
          >
            Built for students, by students. Your academic success is our mission.
          </motion.p>
        </div>
      </div>
    </Modal>
  );
};

export default WelcomeModal;
