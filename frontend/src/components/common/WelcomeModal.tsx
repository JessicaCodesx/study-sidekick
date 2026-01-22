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
            <h2 className="text-3xl font-extrabold mb-4">
              <span className="gradient-text">Welcome to StudySidekick!</span>
            </h2>
            
            <div className="space-y-4 text-left text-gray-700 dark:text-gray-300">
              <p className="text-lg leading-relaxed">
                This application was <span className="font-semibold text-pink-600 dark:text-pink-400">developed with love</span> to help me navigate my personal educational journey. I use it daily to manage my courses, track my progress, and stay organized.
              </p>
              
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/50">
                <p className="text-base">
                  <span className="font-semibold">💾 Local Storage:</span> All your data is stored locally in your browser or desktop app. Your information never leaves your device, ensuring complete privacy and offline functionality.
                </p>
              </div>

              <p className="text-base">
                Whether you're tracking courses, managing tasks, studying with flashcards, or monitoring your academic progress, StudySidekick is here to support your learning journey.
              </p>
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
                    Tech Stack (For Employers)
                  </span>
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Frontend</h4>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• React 18 + TypeScript</li>
                      <li>• Vite (Build Tool)</li>
                      <li>• Tailwind CSS</li>
                      <li>• Framer Motion</li>
                      <li>• React Router</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Backend & Storage</h4>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• Node.js + Express</li>
                      <li>• IndexedDB (Web)</li>
                      <li>• SQLite (Desktop)</li>
                      <li>• MongoDB (Optional Sync)</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Features: Offline-first architecture, real-time sync, responsive design, dark mode, PWA support
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
                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
              >
                View Tech Stack (For Employers) ↓
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
                Hide Tech Stack
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
            Made with ❤️ for students, by a student
          </motion.p>
        </div>
      </div>
    </Modal>
  );
};

export default WelcomeModal;
